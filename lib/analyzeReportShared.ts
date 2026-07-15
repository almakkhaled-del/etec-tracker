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
  "swot_solutions": ["آلية معالجة 1", "آلية معالجة 2"],
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
- swot_strengths, swot_weaknesses, swot_opportunities, swot_challenges, swot_solutions يجب أن تكون مصفوفة (array) من نقاط منفصلة قصيرة، كل نقطة عنصر مستقل بالمصفوفة (سطر واحد لكل نقطة، بدون ترقيم أو رموز نقطية داخل النص نفسه)
- swot_strengths و swot_weaknesses: استخرجها مباشرة من نص التقرير (المؤشرات والملاحظات الصريحة)
- swot_opportunities و swot_challenges: تقارير التقويم الخارجي غالباً لا تذكر "الفرص" أو "التحديات" بالاسم صراحةً — لذلك استنتجها من سياق التقرير (نوع المدرسة، الموقع، النطاق، الإدارة، البيئة المحيطة، الشراكات المحتملة، المخاطر البيئية أو المجتمعية المحتملة) حتى لو لم تُذكر حرفياً. لا ترجعها فارغة إلا في حالة استحالة الاستنتاج التام
- swot_solutions: لكل نقطة في swot_weaknesses اقترح آلية معالجة عملية ومحددة مقابلة لها — يجب أن يكون عدد عناصر swot_solutions قريباً من عدد عناصر swot_weaknesses، ولا تتركها فارغة طالما توجد نقاط ضعف
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

// المدارس بالسعودية مقسّمة بنين/بنات، وحقل "gender" مستخرج أصلاً من تقرير
// التقويم نفسه ضمن PROMPT_INFO. لكن بصفحة improvement-plan، طلب /info وطلبات
// /indicators (لكل مجال) تنطلق كلها بالتوازي (Promise.all + stagger بسيط) —
// نتيجة /info ما توصل قبل ما تبدأ طلبات المؤشرات، فما نقدر نمرر "gender"
// جاهزاً من هناك بدون ما نكسر التوازي (اللي هو أصلاً حل مقصود لمشكلة rate
// limit سابقة، موثقة بتعليق page.tsx). الحل: كل طلب indicators أصلاً يستقبل
// نفس ملف التقرير (base64) كامل، فنطلب من النموذج نفسه يتعرف على الجنس من
// التقرير مباشرة أثناء التوليد — بدون أي تمرير قيمة أو تعديل بالـroute أو
// بالـpage. لو تحصل حالة مستقبلية نعرف فيها الجنس مسبقاً (مثلاً من عمود
// schools.gender)، تقدر تمرره صراحة كـgender وتتجاوز خطوة الاستنتاج.
function genderInstruction(gender?: string): string {
  const g = (gender || '').trim()
  const isGirls = /بنات|إناث|اناث|طالبات/.test(g)
  const isBoys = /بنين|ذكور|طلاب(?!ات)/.test(g)

  if (!isGirls && !isBoys) {
    // ما فيه جنس معروف مسبقاً — النموذج يستنتجه بنفسه من نص التقرير المرفق
    // بنفس الطلب (عادة مذكور صراحة به: "بنين"/"بنات").
    return `

⚠️ صياغة الجنس: حدّد أولاً من نص التقرير المرفق ما إذا كانت المدرسة "بنين" أو "بنات" (عادة مذكورة صراحة)، ثم التزم بالصيغة المطابقة (مذكر لبنين، مؤنث لبنات) حصراً في جميع النصوص المولّدة (need, actions, methods, responsible, executed_actions, school_committee) — بالأسماء والألقاب الوظيفية (بنات: الطالبات، المعلمات، مديرة المدرسة، وكيلة المدرسة، الموجهة الطلابية، رائدة النشاط، منسقة الموهوبين | بنين: الطلاب، المعلمون، مدير المدرسة، وكيل المدرسة، الموجه الطلابي، رائد النشاط، منسق الموهوبين) وبالأفعال والصفات المرتبطة بها. لا تخلط بين الصيغتين داخل النص نفسه.`
  }

  const label = isGirls ? 'بنات' : 'بنين'
  const forms = isGirls
    ? 'الطالبات (بدل الطلاب) | المعلمات (بدل المعلمون/المعلمين) | مديرة المدرسة (بدل مدير المدرسة) | وكيلة المدرسة (بدل وكيل المدرسة) | الموجهة الطلابية (بدل الموجه الطلابي) | رائدة النشاط (بدل رائد النشاط) | منسقة الموهوبين (بدل منسق الموهوبين)'
    : 'الطلاب | المعلمون | مدير المدرسة | وكيل المدرسة | الموجه الطلابي | رائد النشاط | منسق الموهوبين'
  return `

⚠️ صياغة الجنس: هذه مدرسة ${label} (معروفة مسبقاً). يجب أن تكون جميع النصوص المولّدة (need, actions, methods, responsible, executed_actions, school_committee) بصيغة ${isGirls ? 'المؤنث' : 'المذكر'} حصراً — سواء بالأسماء والألقاب الوظيفية (مثال: ${forms}) أو بالأفعال والصفات المرتبطة بها (مثال: ${isGirls ? '"تفعّل المعلمات"، "تتابع الموجهة"' : '"يفعّل المعلمون"، "يتابع الموجه"'}). لا تخلط بين الصيغتين داخل النص نفسه.`
}

export function buildIndicatorsPrompt(domainGroup: DomainGroup, gender?: string): string {
  const domainFilter = DOMAIN_GROUP_LABELS[domainGroup]

  return `أنت خبير تربوي متخصص في تطوير خطط التحسين المدرسية وفق إطار إتقان السعودي.
${genderInstruction(gender)}

مهمتك: استخرج فقط مؤشرات مجال: ${domainFilter} التي تحقق الشرطين:
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
    swot_solutions: { type: 'ARRAY', items: { type: 'STRING' } },
    priority_admin: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    priority_guidance: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    priority_activities: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    priority_outcomes: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    priority_teaching: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    priority_env: { type: 'OBJECT', properties: { level: { type: 'STRING' }, justification: { type: 'STRING' } } },
    recommendations: { type: 'STRING' },
  }
}

export const INDICATORS_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      id: { type: 'STRING' }, name: { type: 'STRING' }, domain: { type: 'STRING' },
      score: { type: 'NUMBER' }, level: { type: 'STRING' }, need: { type: 'STRING' },
      actions: { type: 'STRING' }, methods: { type: 'STRING' }, duration: { type: 'STRING' },
      responsible: { type: 'STRING' }, executed_actions: { type: 'STRING' },
      school_committee: { type: 'STRING' },
    },
    required: ['id', 'name', 'domain', 'score', 'level']
  }
}

// اختبار تشخيصي: بدّلنا مؤقتاً من gemini-3.5-flash (نموذج جديد، احتمال
// عنده حدود معدل/طاقة محافظة فترة الإطلاق بغض النظر عن الفوترة) إلى
// gemini-3.1-flash-lite (جيل أقدم وأثبت استقراراً، ومُحسّن أصلاً للاستخدام
// عالي الحجم). لو استقر السلوك مع هذا النموذج، يثبت إن المشكلة كانت
// بطاقة/حدود gemini-3.5-flash تحديداً، لا بكودنا. غيّر القيمة هنا للرجوع.
const GEMINI_MODEL = 'gemini-3.1-flash-lite'

// يرجع النص + finishReason عشان نقدر نكتشف القطع (truncation) بدل ما يضيع بصمت
export async function callGemini(b64: string, apiKey: string, prompt: string, jsonMode: boolean, schema?: any): Promise<{ text: string; finishReason: string }> {
  const genConfig: any = { temperature: 0.1, maxOutputTokens: 32768, responseMimeType: 'application/json' }
  if (schema) genConfig.responseSchema = schema

  let lastStatus = 0
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
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
