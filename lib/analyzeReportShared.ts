// منطق مشترك بين مسارات تحليل التقرير (info + indicators لكل مجال).
// انفصل هذا عن route.ts الأصلي عشان كل مسار يصير طلب HTTP مستقل بميزانية
// 60 ثانية خاصة به عند Vercel، بدل ما تتشارك كل الطلبات بميزانية واحدة
// داخل نفس استدعاء الدالة (كان هذا سبب انتهاء المهلة على تقارير أطول).

export const PROMPT_INFO = `Return ONLY valid JSON object. No markdown. No text before or after. Start with { end with }.

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
  "swot_strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "swot_weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2"],
  "swot_opportunities": ["فرصة 1", "فرصة 2"],
  "swot_challenges": ["تحدٍ 1", "تحدٍ 2"],
  "priority_admin": { "level": "عالي", "justification": "" },
  "priority_guidance": { "level": "متوسط", "justification": "" },
  "priority_activities": { "level": "متوسط", "justification": "" },
  "priority_outcomes": { "level": "عالي", "justification": "" },
  "priority_teaching": { "level": "عالي", "justification": "" },
  "priority_env": { "level": "منخفض", "justification": "" },
  "recommendations": ""
}

Rules:
- all string values single line only, max 80 chars per field (except the swot_* arrays below)
- كل الحقول النصية الأساسية (school_name, principal_name, grade, gender, ministry_number, building_type, building_independence, period, admin_independence, shared_school, overall_level, outcomes_level, report_date, overall_avg, domain_admin, domain_teaching, domain_outcomes, domain_env, scope, phone) إلزامية بالرد — إذا فعلاً غير مذكورة صراحة بالتقرير المرفق، اكتب القيمة "غير مذكور بالتقرير" بدل ترك الحقل فارغاً أو حذفه
- swot_strengths, swot_weaknesses, swot_opportunities, swot_challenges يجب أن تكون مصفوفة (array) من نقاط منفصلة قصيرة، كل نقطة عنصر مستقل بالمصفوفة (سطر واحد لكل نقطة، بدون ترقيم أو رموز نقطية داخل النص نفسه)
- swot_strengths و swot_weaknesses: استخرجها مباشرة من نص التقرير (المؤشرات والملاحظات الصريحة)
- swot_opportunities و swot_challenges: تقارير التقويم الخارجي غالباً لا تذكر "الفرص" أو "التحديات" بالاسم صراحةً — لذلك استنتجها من سياق التقرير (نوع المدرسة، الموقع، النطاق، الإدارة، البيئة المحيطة، الشراكات المحتملة، المخاطر البيئية أو المجتمعية المحتملة) حتى لو لم تُذكر حرفياً. لا ترجعها فارغة إلا في حالة استحالة الاستنتاج التام
- priority_* → justification: لا تختلق نص تبرير إذا لم يكن مذكوراً صراحة أو ضمنياً بالتقرير — اتركه نصاً فارغاً "" واكتفِ بتحديد level (عالي/متوسط/منخفض) المستنتج من الدرجات والنسب الفعلية بالتقرير
- أرجع مصفوفة فارغة [] فقط إذا لم يوجد أي أساس منطقي للاستنتاج (نادر الحدوث)`

// رجعنا لأربع مجموعات (مجال واحد لكل طلب) بعد اختبار حقيقي: مجموعتين كانت
// تنتهي مهلتها فعلياً (504) على تقرير حقيقي، لأن كل استدعاء صار يولّد محتوى
// مفصّل لمجالين دفعة وحدة (وقت توليد أطول من 60 ثانية أحياناً)، رغم إن كل
// طلب مستقل بميزانيته الخاصة. تصغير حمل كل استدعاء (مجال واحد فقط) هو الحل
// المُثبت فعلياً بالتجربة — نقبل زيادة تكلفة التوكن (5 استدعاءات بدل 3) مقابل
// الاستقرار، حسب أولوية طلبها صاحب المشروع صراحة (الاستقرار أهم من التكلفة).
export type DomainGroup = 'admin' | 'teaching' | 'outcomes' | 'environment'

const DOMAIN_GROUP_LABELS: Record<DomainGroup, string> = {
  admin: 'الإدارة المدرسية (القيادة)',
  teaching: 'التعليم والتعلم',
  outcomes: 'نواتج التعلم',
  environment: 'البيئة المدرسية',
}

// ═══════════════════════════════════════════════════════════════════════
// إعادة هندسة جذرية (بطلب صاحب المشروع بعد تجربة حقيقية أظهرت تفاوتاً كبيراً
// بالجودة والتكلفة بين النماذج): بدل ما نطلب من النموذج "تأليف" محتوى كامل
// لكل مؤشر (need/actions/methods/duration/responsible/executed_actions/
// school_committee — مئات الكلمات لكل مؤشر)، صار عمل الذكاء الاصطناعي هنا
// "تصنيف" بحت: يحدد أي المؤشرات ضعيفة (المرحلة أو النسبة) ويقتبس جملة قصيرة
// (need_from_report) توضح سبب الضعف كما ورد بالتقرير — لا أكثر. بقية
// المحتوى (actions/methods/duration/responsible/executed_actions/
// school_committee) صار يُسحب من قالب ثابت مُراجَع مسبقاً بملف
// lib/improvementPlansMap.ts (انظر mergeIndicatorWithTemplate أدناه)، بدل ما
// يُعاد اختراعه بكل استدعاء. النتيجة: استهلاك توكنز مخرجة أقل بكثير (~20
// كلمة بدل ~500 كلمة لكل مؤشر)، سرعة أعلى، وجودة ثابتة 100% لأن المحتوى
// معتمد يدوياً وليس عرضة لتفاوت النماذج.
export function buildIndicatorsPrompt(domainGroup: DomainGroup): string {
  const domainFilter = DOMAIN_GROUP_LABELS[domainGroup]

  return `أنت محلل بيانات جودة تعليمية. مهمتك قراءة تقرير التقويم الخارجي المرفق فقط، واستخراج (بدون أي تأليف أو صياغة إضافية) المؤشرات في مجال: ${domainFilter} التي تحقق الشرطين:
1. المرحلة = "تهيئة" أو "انطلاق"
2. النسبة = 75% أو أقل

أخرج JSON array فقط. ابدأ بـ [ وانتهِ بـ ]. بدون markdown ولا أي نص قبله أو بعده.

لكل مؤشر مؤهل هذا الهيكل فقط (كل object في سطر واحد):
{"id":"X-X-X-X","score":65.5,"level":"تهيئة","need_from_report":"اقتباس أو تلخيص قصير جداً (15 كلمة كحد أقصى) لسبب الضعف كما ورد بالتقرير"}

قواعد صارمة:
- score رقم وليس نص
- id يجب أن يطابق تماماً رمز المؤشر الرسمي بإطار إتقان (مثال: 1-1-1-1)
- need_from_report: اقتباس/تلخيص من نص التقرير نفسه فقط — لا تؤلف أو تفترض، بحد أقصى 15 كلمة
- استخرج كل المؤشرات المؤهلة في هذا المجال دون استثناء
- لا تُخرج أي حقل آخر غير id/score/level/need_from_report — لا actions ولا methods ولا أي محتوى سردي إضافي`
}

// يلقى القوس المُطابق الفعلي (بعمق الأقواس، متجاهلاً ما بداخل النصوص) بدل
// الاعتماد على "آخر قوس بالنص" — لأن Gemini أحياناً يضيف محتوى زائد بعد
// الـ JSON الصحيح (تعليق، محاولة ثانية، إلخ)، و lastIndexOf كان يبلع هذا
// المحتوى الزائد بالغلط ويطيح JSON.parse بخطأ "Unexpected non-whitespace
// character after JSON".
function findMatchingClose(s: string, start: number, open: string, close: string): number {
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (escaped) { escaped = false; continue }
    if (ch === '\\') { escaped = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === open) depth++
    else if (ch === close) {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

export function repairAndParseArray(raw: string): any[] {
  const start = raw.indexOf('[')
  if (start === -1) {
    const objStart = raw.indexOf('{')
    if (objStart !== -1) {
      return repairAndParseArray('[' + raw.slice(objStart) + ']')
    }
    throw new Error('No JSON array found in response')
  }
  // لو الرد اكتمل بشكل سليم نستخدم القوس المطابق الفعلي؛ لو انقطع الرد (JSON
  // غير مكتمل بسبب MAX_TOKENS) نرجع للسلوك القديم (آخر قوس بالنص) كمحاولة أخيرة.
  const balancedEnd = findMatchingClose(raw, start, '[', ']')
  const end = balancedEnd !== -1 ? balancedEnd : raw.lastIndexOf(']')
  if (end === -1) {
    const objStart = raw.indexOf('{')
    if (objStart !== -1) {
      return repairAndParseArray('[' + raw.slice(objStart) + ']')
    }
    throw new Error('No JSON array found in response')
  }

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

  try { return JSON.parse(result) } catch {}

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

export function repairAndParseObject(raw: string): any {
  const start = raw.indexOf('{')
  if (start === -1) throw new Error('No JSON object found')
  const balancedEnd = findMatchingClose(raw, start, '{', '}')
  const end = balancedEnd !== -1 ? balancedEnd : raw.lastIndexOf('}')
  if (end === -1) throw new Error('No JSON object found')
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

// يفرض شكل الـ JSON فعلياً على مستوى القواعد النحوية للتوليد نفسه (structured
// output)، لا مجرد "تفضيل" مثل responseMimeType وحده — هذا يمنع أخطاء مثل
// "Unexpected non-whitespace character" أو "Expected ',' or '}'" اللي كانت
// تحصل أحياناً مع نصوص عربية طويلة فيها علامات اقتباس أو رموز خاصة.
export const INFO_SCHEMA = {
  type: 'OBJECT',
  properties: {
    school_name: { type: 'STRING' }, principal_name: { type: 'STRING' },
    grade: { type: 'STRING' }, gender: { type: 'STRING' },
    ministry_number: { type: 'STRING' }, building_type: { type: 'STRING' },
    building_independence: { type: 'STRING' }, period: { type: 'STRING' },
    admin_independence: { type: 'STRING' }, shared_school: { type: 'STRING' },
    overall_level: { type: 'STRING' }, outcomes_level: { type: 'STRING' },
    report_date: { type: 'STRING' }, overall_avg: { type: 'STRING' },
    domain_admin: { type: 'STRING' }, domain_teaching: { type: 'STRING' },
    domain_outcomes: { type: 'STRING' }, domain_env: { type: 'STRING' },
    scope: { type: 'STRING' }, phone: { type: 'STRING' },
    swot_strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    swot_weaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
    swot_opportunities: { type: 'ARRAY', items: { type: 'STRING' } },
    swot_challenges: { type: 'ARRAY', items: { type: 'STRING' } },
    priority_admin: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    priority_guidance: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    priority_activities: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    priority_outcomes: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    priority_teaching: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    priority_env: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    recommendations: { type: 'STRING' },
  },
  // ما كان فيه أي required بهذي السكيمة سابقاً — يعني النموذج كان حراً
  // يتجاهل أي حقل بيانات أساسية (رقم وزاري، جوال، اسم مدير...) فيطلع فارغاً
  // بالمستند النهائي (تقرير واقع المدرسة) رغم إنه غالباً مذكور بالتقرير
  // المرفق. الآن كل حقل نصي/مصفوفة/كائن إلزامي — مع تعليمة بالبرومبت (أدناه)
  // تلزم النموذج يكتب "غير مذكور بالتقرير" بدل ترك القيمة فارغة إذا فعلاً
  // ما لقى المعلومة، بدل ما يحذف الحقل كلياً من الرد.
  required: [
    'school_name', 'principal_name', 'grade', 'gender', 'ministry_number',
    'building_type', 'building_independence', 'period', 'admin_independence',
    'shared_school', 'overall_level', 'outcomes_level', 'report_date',
    'overall_avg', 'domain_admin', 'domain_teaching', 'domain_outcomes',
    'domain_env', 'scope', 'phone', 'swot_strengths', 'swot_weaknesses',
    'swot_opportunities', 'swot_challenges',
    'priority_admin', 'priority_guidance', 'priority_activities',
    'priority_outcomes', 'priority_teaching', 'priority_env', 'recommendations',
  ]
}

// سكيمة تصنيف فقط — انظر التعليق أعلى buildIndicatorsPrompt لشرح إعادة
// الهندسة. لم يعد النموذج يُنتج name/domain/actions/methods/duration/
// responsible/executed_actions/school_committee إطلاقاً؛ هذي كلها تُستكمل
// بالكود من lib/improvementPlansMap.ts عبر mergeIndicatorWithTemplate.
export const INDICATORS_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      id: { type: 'STRING' }, score: { type: 'NUMBER' }, level: { type: 'STRING' },
      need_from_report: { type: 'STRING' },
    },
    required: ['id', 'score', 'level', 'need_from_report']
  }
}

// اختبار تشخيصي: بدّلنا مؤقتاً من gemini-3.5-flash (نموذج جديد، احتمال
// عنده حدود معدل/طاقة محافظة فترة الإطلاق بغض النظر عن الفوترة) إلى
// gemini-3.1-flash-lite (جيل أقدم وأثبت استقراراً، ومُحسّن أصلاً للاستخدام
// عالي الحجم). لو استقر السلوك مع هذا النموذج، يثبت إن المشكلة كانت
// بطاقة/حدود gemini-3.5-flash تحديداً، لا بكودنا. غيّر القيمة هنا للرجوع.
const GEMINI_MODEL = 'gemini-3.1-flash-lite'

// يرجع النص + finishReason عشان نقدر نكتشف القطع (truncation) بدل ما يضيع بصمت
// modelOverride: لأغراض مقارنة النماذج الثلاثة (Gemini Flash-Lite / Gemini Flash
// / Claude) بصفحة build-plans — يسمح لمسار مثل indicators-flash يستدعي
// gemini-3.5-flash بدل النموذج الافتراضي، بدون التأثير على المسار الأساسي.
export async function callGemini(b64: string, apiKey: string, prompt: string, jsonMode: boolean, schema?: any, modelOverride?: string): Promise<{ text: string; finishReason: string }> {
  const model = modelOverride || GEMINI_MODEL
  const genConfig: any = { temperature: 0.1, maxOutputTokens: 32768, responseMimeType: 'application/json' }
  if (schema) genConfig.responseSchema = schema

  let lastStatus = 0
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const finishReason = data.candidates?.[0]?.finishReason || 'UNKNOWN'
      if (finishReason === 'MAX_TOKENS') {
        console.warn('[analyze-report] Gemini response truncated (MAX_TOKENS) — some indicators may be cut off. Prompt head:', prompt.slice(0, 60))
      }
      return { text, finishReason }
    }
    if ((res.status === 503 || res.status === 429) && attempt < 3) {
      await new Promise(r => setTimeout(r, attempt * 3000))
      continue
    }
    const errText = await res.text()
    const isDaily = errText.includes('PerDay') || errText.includes('limit: 20')
    if (isDaily) throw new Error('تم استنفاد الحصة اليومية من Gemini. يرجى المحاولة غداً.')
    throw new Error(`Gemini error ${lastStatus}: ${errText.slice(0, 200)}`)
  }
  throw new Error(`Gemini failed after retries: ${lastStatus}`)
}
