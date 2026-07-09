import { NextRequest, NextResponse } from 'next/server'

const PROMPT_INFO = `Return ONLY valid JSON object. No markdown. No text before or after. Start with { end with }.

Extract from this Saudi school external evaluation report:

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
  "recommendations": ""
}

Rules: all string values single line only, max 80 chars per field.`

// Professional prompt template — called twice with different domain groups
function buildIndicatorsPrompt(domainGroup: 'group1' | 'group2'): string {
  const domainFilter = domainGroup === 'group1'
    ? 'الإدارة المدرسية والتعليم والتعلم'
    : 'نواتج التعلم والبيئة المدرسية وأي مجالات أخرى'

  return `أنت خبير تربوي متخصص في تطوير خطط التحسين المدرسية وفق إطار إتقان السعودي.

مهمتك: استخرج فقط مؤشرات مجالات: ${domainGroup === 'group1' ? 'الإدارة المدرسية + التعليم والتعلم' : 'نواتج التعلم + البيئة المدرسية + أي مجال آخر'} التي تحقق الشرطين:
1. المرحلة = "تهيئة" أو "انطلاق"
2. النسبة = 75% أو أقل

لكل مؤشر، أنتج محتوى احترافياً مفصلاً يصلح مباشرة للوثيقة الرسمية، مستوحى من هذه الأمثلة:

مثال على "الإجراءات المنفذة" الاحترافية — هذا هو المستوى المطلوب بالضبط:
- "دورة استراتيجيات التدريس الحديثة – الأسبوع 5 | زيارات تبادلية مجدولة أسبوعياً من الأسبوع 6 | مجتمعات تعلم مهنية كل يوم ثالثاء | قائمة استراتيجيات موزعة على المعلمين – الأسبوع 2"
- "تشكيل فريق التقويم الذاتي – الأسبوع 3 | تعبئة الاستمارات وفق المعايير – الأسبوع 10 | جمع الشواهد لكل مؤشر مستمر | مراجعة مع المشرف نهاية كل فصل"
- "تحليل نتائج نافس – الأسبوع 3 | أوراق عمل ومهام تطبيقية متدرجة مستمرة | اختبارات تجريبية محاكاة نافس – الأسبوع 15 | إثراءات إلكترونية عبر مدرستي مستمرة"
- "تفعيل منصة مدرستي – منذ الأسبوع 1 | دورة استخدام أجهزة العرض – الأسبوع 4 | مهام إلكترونية أسبوعية للطلاب مستمرة | تقرير متابعة شهري نهاية كل شهر"
- "إطلاق نوادي العلوم والقراءة والبرمجة – الأسبوع 3 | تأهيل الطلاب للمسابقات المحلية مستمر | ركن الموهوبين أسبوعياً كل يوم خميس | معرض مواهب الطلاب نهاية كل فصل"

⚠️ تنبيه مهم: حقل executed_actions يجب أن يكون بنفس مستوى التفصيل تماماً — 4 إجراءات على الأقل مع أرقام أسابيع محددة. هذا الحقل هو قلب نموذج التنفيذ ويجب أن يكون احترافياً ومفيداً للمدير.

مثال على "أساليب وطرق التحسين" الاحترافية المتنوعة:
- "الدورات التدريبية | القراءات الموجهة | الزيارات التبادلية | مجتمعات التعلم المهنية"
- "التقويم الذاتي المنهجي | الشواهد والأدلة | المراجعة الإشرافية | الاستبانات الدورية"
- "التحليل الرقمي | المهام التطبيقية | الاختبارات التجريبية | الإثراءات الإلكترونية"

مثال على "لجان المدرسة" المتنوعة حسب المجال:
- إدارة مدرسية: "لجنة التميز + مدير المدرسة + مشرف دعم التميز"
- تعليم وتعلم: "لجنة التميز + المعلمون + وكيل الشؤون التعليمية"
- نواتج التعلم: "لجنة التميز + لجنة التوجيه + معلمو المادة"
- أنشطة: "لجنة التميز + اللجنة الإدارية + رائد النشاط"
- توجيه: "لجنة التميز + المعلمون + الموجه الطلابي"
- بيئة: "وكالء المدرسة + لجنة المرافق + مسؤول الأمن والسلامة"

أخرج JSON array فقط. ابدأ بـ [ وانتهِ بـ ]. بدون markdown.

لكل مؤشر هذا الهيكل (كل object في سطر واحد):
{"id":"X-X-X-X","name":"اسم المؤشر كامل","domain":"المجال","score":65.5,"level":"تهيئة","need":"وصف الاحتياج الحقيقي من التقرير","actions":"إجراء 1 مع أسبوع | إجراء 2 مع أسبوع | إجراء 3 | إجراء 4","methods":"أسلوب 1 | أسلوب 2 | أسلوب 3 | أسلوب 4","duration":"فصل دراسي","responsible":"الجهة المناسبة للمؤشر","executed_actions":"الإجراء التفصيلي الأول – الأسبوع X | الإجراء التفصيلي الثاني – أسبوعياً من الأسبوع Y | الإجراء الثالث مستمر | الإجراء الرابع – نهاية كل فصل","school_committee":"لجنة التميز + اللجنة المناسبة للمجال + الجهة التنفيذية"}

قواعد صارمة:
- score رقم وليس نص
- لا أسطر جديدة داخل أي قيمة نصية — استخدم | للفصل
- استخرج كل المؤشرات المؤهلة في المجالات المطلوبة دون استثناء
- executed_actions: 4 إجراءات تفصيلية على الأقل مع أرقام أسابيع — هذا أهم حقل في النموذج
- actions: 3-4 إجراءات تخطيطية مرتبة منطقياً
- methods: 4 أساليب متنوعة ومختلفة عن بعضها
- school_committee: مناسبة لطبيعة كل مجال وتتضمن 2-3 جهات محددة
- responsible: شخص أو جهة محددة وليس عاماً`
}



function repairAndParseArray(raw: string): any[] {
  // Find array boundaries
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start === -1 || end === -1) {
    // Try wrapping in array if it looks like objects
    const objStart = raw.indexOf('{')
    if (objStart !== -1) {
      return repairAndParseArray('[' + raw.slice(objStart) + ']')
    }
    throw new Error('No JSON array found in response')
  }

  let s = raw.slice(start, end + 1)

  // Fix raw newlines/tabs inside strings
  let result = ''
  let inString = false
  let escaped = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (escaped) { result += ch; escaped = false; continue }
    if (ch === '\\') { escaped = true; result += ch; continue }
    if (ch === '"') { inString = !inString; result += ch; continue }
    if (inString) {
      if (ch === '\n') { result += ' '; continue }
      if (ch === '\r') { continue }
      if (ch === '\t') { result += ' '; continue }
    }
    result += ch
  }

  // Try direct parse first
  try { return JSON.parse(result) } catch {}

  // Fallback: extract individual objects with regex
  const objects: any[] = []
  const objRegex = /\{[^{}]+\}/g
  let match
  while ((match = objRegex.exec(result)) !== null) {
    try {
      const obj = JSON.parse(match[0])
      if (obj.id && obj.name) objects.push(obj)
    } catch {}
  }
  if (objects.length > 0) return objects

  throw new Error('Could not parse indicators array')
}

function repairAndParseObject(raw: string): any {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found')
  let s = raw.slice(start, end + 1)
  let result = ''
  let inString = false
  let escaped = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (escaped) { result += ch; escaped = false; continue }
    if (ch === '\\') { escaped = true; result += ch; continue }
    if (ch === '"') { inString = !inString; result += ch; continue }
    if (inString) {
      if (ch === '\n') { result += ' '; continue }
      if (ch === '\r') { continue }
      if (ch === '\t') { result += ' '; continue }
    }
    result += ch
  }
  return JSON.parse(result)
}

async function callGemini(b64: string, apiKey: string, prompt: string, jsonMode: boolean): Promise<string> {
  const genConfig: any = { temperature: 0.1, maxOutputTokens: 16000 }
  if (jsonMode) genConfig.responseMimeType = 'application/json'

  let lastStatus = 0
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-latest:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: 'application/pdf', data: b64 } },
            { text: prompt }
          ]}],
          generationConfig: genConfig
        })
      }
    )
    lastStatus = res.status
    if (res.ok) {
      const data = await res.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }
    if ((res.status === 503 || res.status === 429) && attempt < 3) {
      await new Promise(r => setTimeout(r, attempt * 2000))
      continue
    }
    const errText = await res.text()
    throw new Error(`Gemini error ${lastStatus}: ${errText.slice(0, 200)}`)
  }
  throw new Error(`Gemini failed after retries: ${lastStatus}`)
}

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    // 3 parallel calls: info + indicators group1 (admin+teaching) + group2 (outcomes+env+others)
    const [rawInfo, rawInd1, rawInd2] = await Promise.all([
      callGemini(base64, apiKey, PROMPT_INFO, true),
      callGemini(base64, apiKey, buildIndicatorsPrompt('group1'), false),
      callGemini(base64, apiKey, buildIndicatorsPrompt('group2'), false),
    ])

    // Parse info object
    let info: any
    try { info = JSON.parse(rawInfo) }
    catch { info = repairAndParseObject(rawInfo) }

    // Parse both indicator arrays and merge
    let indicators1: any[] = []
    let indicators2: any[] = []
    try { indicators1 = repairAndParseArray(rawInd1) } catch {}
    try { indicators2 = repairAndParseArray(rawInd2) } catch {}

    // Merge and deduplicate by id
    const allIndicators = [...indicators1, ...indicators2]
    const seen = new Set<string>()
    const indicators = allIndicators.filter(ind => {
      if (!ind.id || seen.has(ind.id)) return false
      seen.add(ind.id)
      return true
    })

    if (indicators.length === 0) {
      return NextResponse.json({
        error: 'JSON parse failed (indicators)',
        detail: 'Both groups returned empty',
        raw1: rawInd1.slice(0, 300),
        raw2: rawInd2.slice(0, 300)
      }, { status: 500 })
    }

    return NextResponse.json({ ...info, weak_indicators: indicators })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
