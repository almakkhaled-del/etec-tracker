import { NextRequest, NextResponse } from 'next/server'

const PROMPT = `IMPORTANT: Return ONLY a valid JSON object. No markdown, no text before or after. Start with { and end with }.

أنت خبير تربوي متخصص في تقويم المدارس السعودية وفق إطار إتقان. مهمتك تحليل تقرير التقويم المدرسي الخارجي واستخراج بيانات دقيقة لملء ثلاثة نماذج رسمية.

━━━ قاعدة المؤشرات الضعيفة (مهمة جداً) ━━━
أدرج في weak_indicators كل مؤشر يحقق الشرطين التاليين معاً:
1. مرحلته: "تهيئة" أو "انطلاق" (وليس "تطور" أو "ريادة")
2. نسبته: 75% أو أقل

━━━ النموذج الأول: استمارة (1) بناء خطة التحسين ━━━
يحتوي على:
أولاً - البيانات الأساسية:
  • اسم المدرسة، المرحلة، جنس المدرسة (بنين/بنات)
  • الرقم الوزاري، نوع المبنى (حكومي/مستأجر)، استقلالية المبنى (مستقل/مشترك)
  • الفترة (صباحي/مسائي)، استقلالية الإدارة (مستقلة/مشتركة)
  • مستوى الأداء العام للمدرسة (من آخر تقرير)
  • مستوى المدرسة في نواتج التعلم (من آخر تقرير)

ثانياً - جدول إجراءات خطة التحسين (صف لكل مؤشر ضعيف):
  • المجال | العنصر/المكون/العملية المراد تحسينها | وصف الاحتياج | إجراءات التحسين | أساليب وطرق التحسين | مدة الإنجاز | التنفيذ والمسؤولية

ثالثاً - التوصيات والمقترحات (نص مكثف)

━━━ النموذج الثاني: استمارة (2) تنفيذ خطة التحسين ━━━
يحتوي على:
أولاً - نفس البيانات الأساسية

ثانياً - جدول التنفيذ (نفس المؤشرات الضعيفة):
  • المجال | العنصر/المكون/العملية | الإجراءات المنفذة (يُكتب وصف الإجراء بدقة ويوم وتاريخ تنفيذه) | أساليب وطرق التحسين | مقدم خدمات دعم التميز (لجان المدرسة / المشرف التربوي)

━━━ النموذج الثالث: تقرير واقع المدرسة ━━━
يحتوي على:
- البيانات الأساسية: اسم المدرسة، الرقم الوزاري، المرحلة الدراسية، الجنس، النطاق، مبنى المدرسة (مستقل/مشترك)، اسم مدير المدرسة، رقم الجوال
- نتائج التقويم: نوع التقرير (خارجي)، تاريخ التقرير، متوسط الأداء العام
- أداء المجالات الأربعة: الإدارة المدرسية، التعليم والتعلم، نواتج التعلم، البيئة المدرسية
- تحليل الواقع SWOT مرتبط بالمجالات (الإدارة المدرسية، التوجيه الطلابي، الأنشطة المدرسية، نواتج التعلم، التدريس):
  • نقاط القوة | نقاط الضعف | الفرص | التحديات | آلية معالجة نقاط الضعف
- الأولويات العاجلة للتحسين (6 مجالات): الإدارة المدرسية، التوجيه الطلابي، الأنشطة المدرسية، نواتج التعلم، التدريس، البيئة المدرسية
  لكل مجال: مستوى الأولوية (عالي/متوسط/منخفض/لا يوجد احتياج) + مبررات تحديد المستوى

أجب بهذا JSON بالضبط (لا تغير أسماء المفاتيح):

{
  "school_name": "",
  "principal_name": "",
  "grade": "",
  "gender": "",
  "ministry_number": "",
  "building_type": "",
  "building_independence": "",
  "period": "صباحي",
  "admin_independence": "مستقلة",
  "shared_school": "",
  "overall_level": "",
  "outcomes_level": "",
  "report_type": "خارجي",
  "report_date": "",
  "overall_avg": "",
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
  "priority_admin": { "level": "عالي", "justification": "" },
  "priority_guidance": { "level": "متوسط", "justification": "" },
  "priority_activities": { "level": "متوسط", "justification": "" },
  "priority_outcomes": { "level": "عالي", "justification": "" },
  "priority_teaching": { "level": "عالي", "justification": "" },
  "priority_env": { "level": "منخفض", "justification": "" },
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
      "responsible": "",
      "executed_actions": "",
      "school_committee": "",
      "supervisor": ""
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
