import { NextRequest, NextResponse } from 'next/server'

const PROMPT = `IMPORTANT: Return ONLY a valid JSON object. No text before or after. Start with { end with }.

أنت خبير تربوي. حلل تقرير التقويم المدرسي واستخرج البيانات بدقة لملء النماذج الثلاثة التالية.

النموذج الأول: استمارة بناء خطة التحسين
- البيانات الأساسية: اسم المدرسة، المرحلة، الجنس، الرقم الوزاري، نوع المبنى، استقلالية المبنى، الفترة، استقلالية الإدارة
- مستوى الأداء العام، مستوى نواتج التعلم
- جدول المؤشرات الضعيفة: أدرج كل مؤشر نسبته أقل من 75% بغض النظر عن مستواه (تهيئة أو انطلاق) — يحتوي الجدول: المجال، العنصر/المكون، وصف الاحتياج، إجراءات التحسين، أساليب وطرق التحسين، مدة الإنجاز، التنفيذ والمسؤولية
- توصيات ومقترحات

النموذج الثاني: استمارة تنفيذ خطة التحسين
- نفس البيانات الأساسية
- جدول التنفيذ: المجال، العنصر/المكون، الإجراءات المنفذة، أساليب وطرق التحسين، مقدم خدمات دعم التميز (لجان المدرسة / المشرف التربوي)

النموذج الثالث: تقرير واقع المدرسة
- البيانات الأساسية: اسم المدرسة، الرقم الوزاري، المرحلة الدراسية، الجنس، النطاق، نوع المبنى، اسم مدير المدرسة، رقم الجوال
- نتائج التقويم: نوع التقرير (خارجي)، تاريخ التقرير، متوسط الأداء العام، أداء المجالات الأربعة
- تحليل الواقع SWOT: نقاط القوة، نقاط الضعف، الفرص، التحديات، آلية معالجة نقاط الضعف
- الأولويات العاجلة وفق المجالات: الإدارة المدرسية، التوجيه الطلابي، الأنشطة المدرسية، نواتج التعلم، التدريس — مع تحديد مستوى الأولوية (عالي/متوسط/منخفض/لا يوجد احتياج) ومبررات لكل مجال

أجب بهذا الـ JSON بالضبط:

{
  "school_name": "",
  "principal_name": "",
  "grade": "",
  "gender": "",
  "ministry_number": "",
  "building_type": "",
  "independence": "",
  "period": "صباحي",
  "admin_independence": "مستقلة",
  "overall_level": "",
  "outcomes_level": "",
  "report_date": "",
  "domain_admin": "",
  "domain_teaching": "",
  "domain_outcomes": "",
  "domain_env": "",
  "scope": "",
  "phone": "",
  "swot_strengths": "",
  "swot_weaknesses": "",
  "swot_opportunities": "",
  "swot_challenges": "",
  "swot_solutions": "",
  "priority_admin": {"level": "عالي", "justification": ""},
  "priority_guidance": {"level": "متوسط", "justification": ""},
  "priority_activities": {"level": "متوسط", "justification": ""},
  "priority_outcomes": {"level": "عالي", "justification": ""},
  "priority_teaching": {"level": "عالي", "justification": ""},
  "recommendations": "",
  "weak_indicators": [
    {
      "id": "",
      "name": "",
      "domain": "",
      "score": 0,
      "level": "",
      "need": "",
      "actions": "",
      "methods": "",
      "duration": "",
      "responsible": ""
    }
  ]
}`

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
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8000,
          responseMimeType: 'application/json'
        }
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

    let response: Response | null = null
    let lastStatus = 0

    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await callGemini(base64, apiKey)
      lastStatus = response.status
      if (response.ok) break
      if ((response.status === 503 || response.status === 429) && attempt < 3) {
        await new Promise(r => setTimeout(r, attempt * 2000))
        continue
      }
      break
    }

    if (!response || !response.ok) {
      const err = await response!.text()
      return NextResponse.json({ error: `Gemini API error: ${lastStatus}`, detail: err }, { status: 500 })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const clean = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
