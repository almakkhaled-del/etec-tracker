import { NextRequest, NextResponse } from 'next/server'
import { repairAndParseObject } from '@/lib/analyzeReportShared'

// بدون سقف صريح، Vercel يطبّق الافتراضي (أقل من الكافي لتحليل PDF عبر Gemini)
// نفس مشكلة /api/analyze-report — نضيفها هنا وقائياً لتفادي نفس خطأ 504.
export const maxDuration = 300

// ⚠️ إصلاح جذري (بعد اكتشاف إن "الخطة التشغيلية" تطلع هزيلة/فارغة أحياناً):
// هذا المسار كان معزولاً تماماً عن كل التحسينات اللي طبّقناها على بقية
// مسارات analyze-report (كان يستخدم gemini-3.5-flash المكلف وغير المستقر،
// بدون أي schema يفرض شكل الرد، بسقف توكنز ضيق 8000، وأخطر شي: عند فشل
// تحليل JSON كان "يبتلع" الخطأ بصمت ويرجع كائناً فارغاً بالكامل (200 OK)
// بدل ما يُبلّغ عن خطأ — فتطلع الواجهة الملف "ناجحاً" لكن بدون SWOT ولا
// القضايا الرئيسية ولا البرامج المخصصة، وهذا بالضبط سبب الهزالة الملحوظة.
// الإصلاح: نفس نموذج الإنتاج المستقر (gemini-3.1-flash-lite)، responseSchema
// يفرض الشكل فعلياً، سقف توكنز مطابق لبقية المسارات (32768)، وعند فشل
// التحليل نهائياً نرجّع خطأ حقيقي (500) بدل بيانات فارغة — الواجهة أصلاً
// عندها معالجة جاهزة لهذي الحالة (operationalError) تعرض تنبيهاً بدل ما
// تبني ملفاً هزيلاً بصمت.
const GEMINI_MODEL = 'gemini-3.1-flash-lite'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const PROMPT = `أنت خبير في تحليل تقارير التقويم المدرسي السعودي وفق إطار إتقان.

اقرأ تقرير التقويم الخارجي المرفق واستخرج:

1. بيانات المدرسة: اسم المدرسة، إدارة التعليم، نطاق التعليم، المرحلة الدراسية (ابتدائية أو متوسطة أو ثانوية)

2. SWOT من المؤشرات:
   - نقاط القوة: المؤشرات التي حصلت على مستوى متميز أو متقدم — اكتب اسم المؤشر فقط
   - نقاط الضعف: المؤشرات التي حصلت على مستوى انطلاق أو تهيئة — اكتب اسم المؤشر فقط
   - الفرص: استنتجها من السياق
   - التهديدات: استنتجها من السياق

3. أبرز القضايا الرئيسية: 9 قضايا مستنتجة من نقاط الضعف

4. برامج إضافية مخصصة لكل هدف من الأهداف العشرة بناءً على واقع المدرسة (يمكن أن تكون مصفوفة فارغة [] إذا لم يوجد ما يستدعي إضافة برنامج لهدف معين)

أجب بالحقول المطلوبة فقط، بدون أي نص أو تعليق إضافي خارج الحقول.`

const CUSTOM_PROGRAM_ITEM = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    indicator: { type: 'STRING' },
  },
  required: ['name', 'indicator']
}

const OPERATIONAL_SCHEMA = {
  type: 'OBJECT',
  properties: {
    school_info: {
      type: 'OBJECT',
      properties: {
        school_name: { type: 'STRING' },
        region: { type: 'STRING' },
        district: { type: 'STRING' },
        stage: { type: 'STRING' },
      },
      required: ['school_name', 'region', 'district', 'stage']
    },
    swot: {
      type: 'OBJECT',
      properties: {
        strengths: { type: 'ARRAY', items: { type: 'STRING' } },
        weaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
        opportunities: { type: 'ARRAY', items: { type: 'STRING' } },
        threats: { type: 'ARRAY', items: { type: 'STRING' } },
      },
      required: ['strengths', 'weaknesses', 'opportunities', 'threats']
    },
    main_issues: { type: 'ARRAY', items: { type: 'STRING' } },
    custom_programs: {
      type: 'OBJECT',
      properties: {
        goal1_extra: { type: 'ARRAY', items: CUSTOM_PROGRAM_ITEM },
        goal2_extra: { type: 'ARRAY', items: CUSTOM_PROGRAM_ITEM },
        goal3_extra: { type: 'ARRAY', items: CUSTOM_PROGRAM_ITEM },
        goal4_extra: { type: 'ARRAY', items: CUSTOM_PROGRAM_ITEM },
        goal5_extra: { type: 'ARRAY', items: CUSTOM_PROGRAM_ITEM },
        goal6_extra: { type: 'ARRAY', items: CUSTOM_PROGRAM_ITEM },
        goal7_extra: { type: 'ARRAY', items: CUSTOM_PROGRAM_ITEM },
        goal8_extra: { type: 'ARRAY', items: CUSTOM_PROGRAM_ITEM },
        goal9_extra: { type: 'ARRAY', items: CUSTOM_PROGRAM_ITEM },
        goal10_extra: { type: 'ARRAY', items: CUSTOM_PROGRAM_ITEM },
      },
      required: [
        'goal1_extra', 'goal2_extra', 'goal3_extra', 'goal4_extra', 'goal5_extra',
        'goal6_extra', 'goal7_extra', 'goal8_extra', 'goal9_extra', 'goal10_extra'
      ]
    }
  },
  required: ['school_info', 'swot', 'main_issues', 'custom_programs']
}

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64, principalName } = await req.json()

    if (!pdfBase64 || !principalName) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'مفتاح API غير موجود' }, { status: 500 })

    async function callGemini(): Promise<{ text: string; finishReason: string }> {
      const delays = [3000, 6000, 12000]
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
              maxOutputTokens: 32768,
              responseMimeType: 'application/json',
              responseSchema: OPERATIONAL_SCHEMA
            }
          })
        })
        if (res.ok) {
          const d = await res.json()
          const text = d.candidates?.[0]?.content?.parts?.[0]?.text || ''
          const finishReason = d.candidates?.[0]?.finishReason || 'UNKNOWN'
          return { text, finishReason }
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

    const { text: rawText, finishReason } = await callGemini()

    let aiData: any
    try {
      aiData = JSON.parse(rawText)
    } catch {
      try {
        aiData = repairAndParseObject(rawText)
      } catch {
        // لا نرجع كائناً فارغاً بصمت بعد الآن — خطأ حقيقي يظهر للمستخدم
        // (الواجهة أصلاً عندها عرض تنبيه جاهز لـoperationalError) بدل ملف
        // هزيل يبدو "ناجحاً" وهو فعلياً فاضي من كل محتوى مخصص للمدرسة.
        return NextResponse.json({
          error: 'تعذّر تحليل رد الذكاء الاصطناعي للخطة التشغيلية — جرّب مرة أخرى',
          detail: rawText.slice(0, 300),
          finishReason
        }, { status: 500 })
      }
    }

    if (finishReason === 'MAX_TOKENS') {
      console.warn('[generate-operational-plan] رد Gemini انقطع بسبب حد التوكنز — البيانات المرجعة قد تكون غير مكتملة.')
    }

    // Return JSON only - DOCX is built in browser
    return NextResponse.json(aiData)

  } catch (error: any) {
    console.error('Operational plan error:', error)
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 })
  }
}
