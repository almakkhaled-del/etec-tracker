import { NextRequest, NextResponse } from 'next/server'

const PROMPT = `IMPORTANT: Your response must be ONLY a valid JSON object. No text before or after. No markdown. No explanation. Start with { and end with }.

أنت خبير تربوي متخصص في تحليل تقارير التقويم المدرسي لهيئة تقويم التعليم والتدريب (إتقان).

استخرج من هذا التقرير المعلومات التالية. أجب بـ JSON فقط — ابدأ مباشرة بـ { وانته بـ } بدون أي نص قبله أو بعده:

{
  "school_name": "اسم المدرسة",
  "principal_name": "اسم مدير المدرسة إن وجد وإلا اتركه فارغاً",
  "grade": "المرحلة الدراسية",
  "gender": "بنين أو بنات",
  "ministry_number": "الرقم الوزاري",
  "building_type": "حكومي أو مستأجر",
  "independence": "مستقل أو مشترك",
  "overall_level": "مستوى الأداء العام مع النسبة مثال: انطلاق - 71%",
  "outcomes_level": "مستوى نواتج التعلم مع النسبة",
  "domain_admin": "نسبة الإدارة المدرسية مثال: 73.50%",
  "domain_teaching": "نسبة التعليم والتعلم مثال: 63.00%",
  "domain_outcomes": "نسبة نواتج التعلم مثال: 71.50%",
  "domain_env": "نسبة البيئة المدرسية مثال: 80.00%",
  "swot_strengths": "نقاط القوة من التقرير مفصولة بفاصلة",
  "swot_weaknesses": "نقاط الضعف الرئيسية مفصولة بفاصلة",
  "swot_opportunities": "الفرص المتاحة مفصولة بفاصلة",
  "swot_challenges": "التحديات والتهديدات مفصولة بفاصلة",
  "priorities": "أبرز الأولويات العاجلة للتحسين",
  "recommendations": "التوصيات العامة المستخرجة من التقرير",
  "weak_indicators": [
    {
      "id": "رقم المؤشر مثال: 4-1-4-1",
      "name": "اسم المؤشر",
      "domain": "المجال: الإدارة المدرسية أو التعليم والتعلم أو نواتج التعلم أو البيئة المدرسية",
      "score": 48.5,
      "level": "مستوى الأداء: تهيئة أو انطلاق",
      "need": "وصف الاحتياج بناءً على ما ذكره التقرير",
      "actions": "إجراءات التحسين المقترحة من التقرير (3-4 إجراءات مفصولة بفاصلة منقوطة)",
      "methods": "أساليب وطرق التحسين المناسبة (2-3 أساليب)",
      "duration": "الفصل الدراسي الأول أو الثاني أو طوال العام",
      "responsible": "مدير المدرسة ووكيل الشؤون التعليمية"
    }
  ]
}

قواعد مهمة:
- أدرج في weak_indicators كل مؤشر نسبته أقل من 75%
- اجعل need وصفاً دقيقاً مبنياً على نص التقرير
- اجعل actions إجراءات عملية قابلة للتنفيذ
- رتّب المؤشرات من الأضعف للأقوى
- أجب بـ JSON صالح فقط
- لا تكتب أي نص قبل { أو بعد }
- لا تستخدم markdown أو backticks`

async function callGemini(base64: string, apiKey: string): Promise<Response> {
  return fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: 'application/pdf', data: base64 } },
          { text: PROMPT }
        ]}],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8000, responseMimeType: 'application/json' }
      })
    }
  )
}

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    // Retry up to 3 times on 503/429
    let response: Response | null = null
    let lastStatus = 0

    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await callGemini(base64, apiKey)
      lastStatus = response.status

      if (response.ok) break

      if (response.status === 503 || response.status === 429) {
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, attempt * 2000)) // 2s, 4s
          continue
        }
      }
      break
    }

    if (!response || !response.ok) {
      const err = await response!.text()
      return NextResponse.json(
        { error: `Gemini API error: ${lastStatus}`, detail: err },
        { status: 500 }
      )
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    // Extract JSON robustly — handle markdown fences and extra text
    let clean = text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      clean = jsonMatch[0]
    } else {
      clean = text.replace(/```json|```/g, '').trim()
    }
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
