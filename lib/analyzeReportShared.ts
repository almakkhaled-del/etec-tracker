// منطق مشترك بين مسارات تحليل التقرير (info + indicators لكل مجال).
// انفصل هذا عن route.ts الأصلي عشان كل مسار يصير طلب HTTP مستقل بميزانية
// 60 ثانية خاصة به عند Vercel، بدل ما تتشارك كل الطلبات بميزانية واحدة
// داخل نفس استدعاء الدالة (كان هذا سبب انتهاء المهلة على تقارير أطول).

import { IMPROVEMENT_PLANS_MAP } from './improvementPlansMap'

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

// بادئة رمز المؤشر الرسمي حسب المجال (نفس ترقيم إطار إتقان: 1=إدارة،
// 2=تعليم وتعلم، 3=نواتج تعلم، 4=بيئة مدرسية) — تُستخدم لفلترة القائمة
// الرسمية أدناه من lib/improvementPlansMap.ts حسب كل مجال.
const DOMAIN_GROUP_PREFIX: Record<DomainGroup, string> = {
  admin: '1-', teaching: '2-', outcomes: '3-', environment: '4-',
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
// أول تشغيل حقيقي للبرومبت المُصغّر (بعد إعادة الهندسة) أظهر مشكلة: النماذج
// الثلاثة أحياناً "تخترع" رمز مؤشر غير موجود فعلياً بإطار إتقان (تشابه
// بالترقيم يوقعها بالخلط، مثل افتراض 1-1-1-3 مع إن معيار "التخطيط" فيه
// مؤشران فقط) — فيفشل الدمج مع القالب الثابت ويظهر "مؤشر غير معروف" رغم
// إن المؤشر الحقيقي المقصود موجود ومغطى بالقالب. الحل: بدل ما نعتمد على
// معرفة النموذج الداخلية بالترقيم، نزوّده صراحة بقائمة الرموز والأسماء
// الصحيحة لهذا المجال تحديداً (من نفس القالب الثابت الذي سيُدمج معه لاحقاً
// — مصدر واحد للحقيقة)، ونطلب منه الاختيار منها حصراً لا اختراع غيرها.
function officialIndicatorsListFor(domainGroup: DomainGroup): string {
  const prefix = DOMAIN_GROUP_PREFIX[domainGroup]
  return Object.entries(IMPROVEMENT_PLANS_MAP)
    .filter(([id]) => id.startsWith(prefix))
    .map(([id, t]) => `${id}: ${t.name}`)
    .join('\n')
}

// إعادة هندسة ثانية (بعد اختبار حقيقي على 3 نماذج): اكتشفنا مؤشرين (1-2-1-5
// بنسبة 72.75%، و2-1-1-1 بنسبة 65.25%) فاتوا على Gemini Lite وFlash معاً رغم
// إنهم يستوفون الشرط بوضوح تام — وكلود (الوحيد اللي التقطهم) زاد بالمقابل
// مؤشراً وهمياً (4-2-1-1 بمستوى "تقدم" ونسبة 76.5%) لا يستوفي أي شرط إطلاقاً.
// الاستنتاج: المشكلة مو بقدرة نموذج عن نموذج — المشكلة إن "الاستخراج الحر"
// (النموذج يقرر بنفسه أي مؤشر "يستحق" الذكر) يعتمد على انتباه النموذج
// العشوائي بدل فحص منهجي. الحل: بدل ما نطلب "استخرج المؤهل فقط"، نلزم
// النموذج يمر على كل مؤشر بالقائمة الرسمية واحداً تلو الآخر ويحدد include
// صراحة (true/false) لكل واحد بدون استثناء — هذا يمنع "التخطي الصامت" لمؤشر
// حقيقي (يحل مشكلة الفوات)، ومع تحذير صريح ضد حالة "تقدم+نسبة قريبة من 75"
// (يحل مشكلة الإضافة الوهمية). كخط دفاع ثانٍ برمجي (وليس فقط اعتماداً على
// التزام النموذج بالتعليمات)، أضفنا filterQualifyingIndicators أدناه اللي
// تتحقق فعلياً من score/level بعد الاستلام وتستبعد أي مؤشر لا يستوفي الشرط
// حتى لو أخطأ النموذج وحدد له include=true.
export function buildIndicatorsPrompt(domainGroup: DomainGroup): string {
  const domainFilter = DOMAIN_GROUP_LABELS[domainGroup]
  const officialList = officialIndicatorsListFor(domainGroup)

  return `أنت محلل بيانات جودة تعليمية. مهمتك قراءة تقرير التقويم الخارجي المرفق فقط، والتحقق من حالة كل مؤشر رسمي في مجال: ${domainFilter} كما وردت فعلياً بالتقرير — وليس فقط استخراج ما يلفت انتباهك.

⚠️ القائمة الرسمية الكاملة لمؤشرات هذا المجال — يجب أن تفحص كل واحد منها بالتقرير المرفق وتُخرج له سطراً واحداً بالنتيجة، بدون استثناء أي مؤشر منها، وبدون إضافة أي مؤشر من خارجها (اختر id حصراً كما هو مكتوب بالضبط):
${officialList}

لكل مؤشر أعلاه، ابحث بدقة بالتقرير عن الدرجة (score) والمرحلة (level) الفعليتين المذكورتين له تحديداً، ثم حدد include حسب القاعدة التالية بالضبط (يكفي تحقق شرط واحد ليكون include=true):
- include=true إذا: المرحلة = "تهيئة" أو "انطلاق" فقط — أو — النسبة ≤ 75% بالضبط
- include=false في أي حالة أخرى — تحذير: مرحلة "تقدم" أو "ممارسة" مع نسبة أعلى من 75% تعني include=false حتماً، حتى لو كانت النسبة قريبة من 75 (مثل 76%) — لا تُقرّبها ولا تخمّن، انقل الرقم الفعلي المذكور بالتقرير فقط
- ⚠️ إذا كان المؤشر غير مقاس أصلاً بالتقرير (لا توجد له درجة أو مرحلة مذكورة إطلاقاً — مثل مؤشرات "التقدم مقارنة بعام سابق" في مدرسة ليس لها بيانات سابقة)، فهذا لا يعني ضعفاً: اكتب level="غير متوفر" وinclude=false دائماً، ولا تكتب score=0 كتخمين افتراضي — عدم توفر البيانات ليس نفس معنى الدرجة الصفرية

أخرج JSON array فقط يغطي كل مؤشر بالقائمة الرسمية أعلاه (سطر واحد لكل مؤشر، سواء include=true أو false — لا تحذف أي واحد من الرد). ابدأ بـ [ وانتهِ بـ ]. بدون markdown ولا أي نص قبله أو بعده.

الهيكل لكل مؤشر (كل object في سطر واحد):
{"id":"X-X-X-X","score":65.5,"level":"تهيئة","include":true,"need_from_report":"اقتباس أو تلخيص قصير جداً (15 كلمة كحد أقصى) لسبب الضعف كما ورد بالتقرير — اتركه فارغاً "" عند include=false"}

قواعد صارمة:
- score رقم وليس نص، ويعكس الرقم الفعلي المذكور بالتقرير لهذا المؤشر تحديداً — لا تخترعه ولا تقرّبه
- id يجب أن يكون طبق الأصل (نسخ حرفي) من القائمة الرسمية أعلاه — لا فراغات إضافية ولا حروف مختلفة
- يجب إخراج سطر واحد بالضبط لكل مؤشر من القائمة الرسمية أعلاه — لا أقل ولا أكثر
- need_from_report: فقط عند include=true، اقتباس/تلخيص من نص التقرير نفسه — لا تؤلف أو تفترض، بحد أقصى 15 كلمة
- لا تُخرج أي حقل آخر غير id/score/level/include/need_from_report — لا actions ولا methods ولا أي محتوى سردي إضافي`
}

// حزام أمان برمجي (لا يعتمد على التزام النموذج فقط): حتى لو حدد النموذج
// include=true بالخطأ لمؤشر لا يستوفي الشرط فعلياً (كما حصل مع كلود ومؤشر
// 4-2-1-1: مرحلة "تقدم" ونسبة 76.5%)، هذا الفلتر يتحقق مباشرة من score/level
// المُستلمين ويستبعده. المطابقة على level بـ includes() بدل === عشان تتحمل
// صيغاً مثل "الانطلاق" (بأل التعريف) بدل "انطلاق" فقط.
const QUALIFYING_LEVEL_SUBSTRINGS = ['تهيئة', 'انطلاق']

// اكتشفنا بأول تشغيل حقيقي للبروميت المُصغّر إن Gemini Lite رجّع لمؤشرات
// "التقدم مقارنة بعام سابق" (3-1-1-4/5/6) مستوى "غير متوفر" مع score=0 —
// وبما إن 0 ≤ 75، كان الفلتر (قبل هذا التعديل) يعتبرها "ضعيفة" تلقائياً
// ويدرجها بخطة التحسين، رغم إنها أصلاً غير مقاسة بالتقرير (لا بيانات سابقة
// للمقارنة)، مو ضعيفة فعلياً. أي مستوى يحتوي هذي العبارات يُستبعد فوراً
// بغض النظر عن الرقم — قبل حتى فحص score.
const NOT_MEASURED_LEVEL_SUBSTRINGS = ['غير متوفر', 'غير مقاس', 'لا يوجد', 'غير محدد']

export function isQualifyingWeak(level: any, score: any): boolean {
  const lvl = String(level ?? '')
  if (NOT_MEASURED_LEVEL_SUBSTRINGS.some(s => lvl.includes(s))) return false
  const levelQualifies = QUALIFYING_LEVEL_SUBSTRINGS.some(s => lvl.includes(s))
  const numScore = typeof score === 'number' ? score : parseFloat(score)
  const scoreQualifies = !isNaN(numScore) && numScore <= 75
  return levelQualifies || scoreQualifies
}

export function filterQualifyingIndicators(raw: any[]): any[] {
  return (Array.isArray(raw) ? raw : []).filter(ind => {
    if (!ind || !ind.id) return false
    if (ind.include === false) return false
    return isQualifyingWeak(ind.level, ind.score)
  })
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
      include: { type: 'BOOLEAN' }, need_from_report: { type: 'STRING' },
    },
    required: ['id', 'score', 'level', 'include', 'need_from_report']
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
