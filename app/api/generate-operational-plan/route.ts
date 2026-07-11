import { NextRequest, NextResponse } from 'next/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'

const PROMPT = `أنت خبير في تحليل تقارير التقويم المدرسي السعودي وفق إطار إتقان.

اقرأ تقرير التقويم الخارجي المرفق واستخرج:

1. بيانات المدرسة: اسم المدرسة، إدارة التعليم، نطاق التعليم، المرحلة الدراسية (ابتدائية أو متوسطة أو ثانوية)

2. SWOT من المؤشرات:
   - نقاط القوة: المؤشرات التي حصلت على مستوى متميز أو متقدم — اكتب اسم المؤشر فقط
   - نقاط الضعف: المؤشرات التي حصلت على مستوى انطلاق أو تهيئة — اكتب اسم المؤشر فقط
   - الفرص: استنتجها من السياق
   - التهديدات: استنتجها من السياق

3. أبرز القضايا الرئيسية: 9 قضايا مستنتجة من نقاط الضعف

4. برامج إضافية مخصصة لكل هدف من الأهداف العشرة بناءً على واقع المدرسة

أجب بـ JSON فقط:
{
  "school_info": {
    "school_name": "اسم المدرسة من التقرير",
    "region": "إدارة التعليم من التقرير",
    "district": "نطاق التعليم من التقرير",
    "stage": "ابتدائية أو متوسطة أو ثانوية"
  },
  "swot": {
    "strengths": ["اسم المؤشر", "اسم المؤشر"],
    "weaknesses": ["اسم المؤشر", "اسم المؤشر"],
    "opportunities": ["فرصة 1", "فرصة 2"],
    "threats": ["تهديد 1", "تهديد 2"]
  },
  "main_issues": ["قضية 1","قضية 2","قضية 3","قضية 4","قضية 5","قضية 6","قضية 7","قضية 8","قضية 9"],
  "custom_programs": {
    "goal1_extra": [],
    "goal2_extra": [],
    "goal3_extra": [],
    "goal4_extra": [],
    "goal5_extra": [],
    "goal6_extra": [],
    "goal7_extra": [],
    "goal8_extra": [],
    "goal9_extra": [],
    "goal10_extra": []
  }
}`

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64, principalName } = await req.json()

    if (!pdfBase64 || !principalName) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'مفتاح API غير موجود' }, { status: 500 })

    async function callGemini(): Promise<string> {
      const delays = [6000, 12000, 20000]
      let lastErr = ''
      for (let i = 0; i <= delays.length; i++) {
        const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
              { text: PROMPT }
            ]}],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 8000,
              responseMimeType: 'application/json'
            }
          })
        })
        if (res.ok) {
          const d = await res.json()
          return d.candidates?.[0]?.content?.parts?.[0]?.text || ''
        }
        lastErr = await res.text()
        const isDaily = lastErr.includes('PerDay') || lastErr.includes('limit: 20')
        if (isDaily) throw new Error('تم استنفاد الحصة اليومية من Gemini. يرجى المحاولة غداً أو التواصل مع الدعم الفني.')
        if ((res.status === 503 || res.status === 429) && i < delays.length) {
          await new Promise(r => setTimeout(r, delays[i]))
          continue
        }
        throw new Error(`خطأ في الاتصال بالنظام: ${res.status}`)
      }
      throw new Error('فشل الاتصال بعد عدة محاولات')
    }

    const rawText = await callGemini()

    let aiData: any
    try {
      aiData = JSON.parse(rawText)
    } catch {
      try {
        const match = rawText.match(/\{[\s\S]*\}/)
        if (match) aiData = JSON.parse(match[0])
      } catch {}
      if (!aiData) {
        aiData = {
          school_info: { school_name: '', region: '', district: '', stage: 'ابتدائية' },
          swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
          main_issues: [],
          custom_programs: {}
        }
      }
    }

    // Return JSON only - DOCX is built in browser
    return NextResponse.json(aiData)

  } catch (error: any) {
    console.error('Operational plan error:', error)
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 })
  }
}
