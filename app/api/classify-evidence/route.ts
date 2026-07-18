import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60

// نموذج التصنيف (نفس فئة الموديل المعتمد بالمنصة) وسعره لكل مليون توكن.
const MODEL = 'gemini-3.1-flash-lite'
const PRICE_IN = 0.25 / 1_000_000   // $ لكل توكن إدخال
const PRICE_OUT = 1.5 / 1_000_000   // $ لكل توكن إخراج

// أداة قياس/تصنيف: تستقبل ملفاً واحداً (صورة أو PDF) وتقترح أنسب مؤشر
// اعتماد، وتُرجع استهلاك التوكنات الفعلي والتكلفة التقديرية — لقياس الجدوى
// قبل بناء الميزة الكاملة.
export async function POST(req: Request) {
  try {
    const { fileBase64, mimeType, fileName } = await req.json()
    if (!fileBase64 || !mimeType) {
      return NextResponse.json({ error: 'الملف أو نوعه مفقود' }, { status: 400 })
    }
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY غير مُعرّف على الخادم' }, { status: 500 })

    // قائمة المؤشرات الرسمية (مصدر واحد للحقيقة من قاعدة البيانات)
    const { data: inds } = await supabase.from('indicators').select('code, name_ar').order('order_num')
    const list = (inds || []).map((i: any) => `${i.code}: ${i.name_ar}`).join('\n')

    const prompt = `أنت مساعد لتصنيف "شواهد" اعتماد المدارس وفق إطار هيئة تقويم التعليم والتدريب (إتقان).
الملف المرفق شاهد (صورة نشاط/مستند/سجل مدرسي). اسم الملف: "${fileName || 'غير معروف'}".
حلّل محتوى الملف (وليس اسمه فقط)، وحدّد أنسب المؤشرات التي يصلح هذا الشاهد دليلاً عليها.
اختر من القائمة الرسمية التالية حصراً (لا تخترع رموزاً غير موجودة):
${list}

أرجع JSON فقط بهذا الشكل (أعلى 3 اقتراحات مرتبة تنازلياً بالثقة):
{"suggestions":[{"code":"1-2-1-4","confidence":92,"reason":"سبب موجز"}]}
- confidence رقم 0-100.
- reason جملة عربية قصيرة جداً.
- لو الملف غير واضح أو لا يصلح كشاهد، أرجع suggestions فارغة [].`

    const started = Date.now()
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: mimeType, data: fileBase64 } },
            { text: prompt },
          ] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: 'application/json' },
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `Gemini ${res.status}: ${errText.slice(0, 200)}` }, { status: 502 })
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const usage = data.usageMetadata || {}
    const inTok = usage.promptTokenCount || 0
    const outTok = usage.candidatesTokenCount || 0
    const totalTok = usage.totalTokenCount || (inTok + outTok)
    const costUSD = inTok * PRICE_IN + outTok * PRICE_OUT

    let suggestions: any[] = []
    try { suggestions = (JSON.parse(text).suggestions) || [] } catch { suggestions = [] }

    // إثراء الاقتراحات باسم المؤشر
    const byCode: Record<string, string> = {}
    ;(inds || []).forEach((i: any) => { byCode[i.code] = i.name_ar })
    suggestions = suggestions.map(s => ({ ...s, name: byCode[s.code] || '' }))

    return NextResponse.json({
      suggestions,
      usage: { inTok, outTok, totalTok },
      costUSD,
      ms: Date.now() - started,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ غير متوقع' }, { status: 500 })
  }
}
