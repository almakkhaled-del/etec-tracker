// طبقة استدعاء Claude (Anthropic) — نسخة موازية لـlib/analyzeReportShared.ts (Gemini)
// لأغراض التجربة والمقارنة قبل اعتماد أي مزود نهائياً. نعيد استخدام نفس نصوص
// البرومبت (PROMPT_INFO و buildIndicatorsPrompt) من analyzeReportShared.ts
// حتى لا نكرر ~200 سطر نص، ونضيف فقط طبقة اتصال مختلفة تناسب Claude.
//
// الفرق الجوهري عن Gemini: Claude يفرض شكل الإخراج عبر "tool use" (نلزمه
// باستدعاء أداة بمدخلات مطابقة لمخطط JSON محدد) بدل "responseSchema" —
// النتيجة (tool_use.input) تكون كائن JSON جاهز مباشرة، بدون أي حاجة لدوال
// إصلاح/تحليل نص يدوية زي اللي احتجناها مع Gemini.

import { PROMPT_INFO, buildIndicatorsPrompt, DomainGroup } from './analyzeReportShared'

export { PROMPT_INFO, buildIndicatorsPrompt }
export type { DomainGroup }

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

export const CLAUDE_INFO_TOOL = 'extract_school_info'
export const CLAUDE_INFO_SCHEMA = {
  type: 'object',
  properties: {
    school_name: { type: 'string' }, principal_name: { type: 'string' },
    grade: { type: 'string' }, gender: { type: 'string' },
    ministry_number: { type: 'string' }, building_type: { type: 'string' },
    building_independence: { type: 'string' }, period: { type: 'string' },
    admin_independence: { type: 'string' }, shared_school: { type: 'string' },
    overall_level: { type: 'string' }, outcomes_level: { type: 'string' },
    report_date: { type: 'string' }, overall_avg: { type: 'string' },
    domain_admin: { type: 'string' }, domain_teaching: { type: 'string' },
    domain_outcomes: { type: 'string' }, domain_env: { type: 'string' },
    scope: { type: 'string' }, phone: { type: 'string' },
    swot_strengths: { type: 'array', items: { type: 'string' } },
    swot_weaknesses: { type: 'array', items: { type: 'string' } },
    swot_opportunities: { type: 'array', items: { type: 'string' } },
    swot_challenges: { type: 'array', items: { type: 'string' } },
    swot_solutions: { type: 'array', items: { type: 'string' } },
    priority_admin: { type: 'object', properties: { level: { type: 'string' }, justification: { type: 'string' } } },
    priority_guidance: { type: 'object', properties: { level: { type: 'string' }, justification: { type: 'string' } } },
    priority_activities: { type: 'object', properties: { level: { type: 'string' }, justification: { type: 'string' } } },
    priority_outcomes: { type: 'object', properties: { level: { type: 'string' }, justification: { type: 'string' } } },
    priority_teaching: { type: 'object', properties: { level: { type: 'string' }, justification: { type: 'string' } } },
    priority_env: { type: 'object', properties: { level: { type: 'string' }, justification: { type: 'string' } } },
    recommendations: { type: 'string' },
  },
  // نفس إصلاح سكيمة Gemini بالضبط (analyzeReportShared.ts) — كل حقول
  // البيانات الأساسية إلزامية الآن بدل school_name فقط.
  required: [
    'school_name', 'principal_name', 'grade', 'gender', 'ministry_number',
    'building_type', 'building_independence', 'period', 'admin_independence',
    'shared_school', 'overall_level', 'outcomes_level', 'report_date',
    'overall_avg', 'domain_admin', 'domain_teaching', 'domain_outcomes',
    'domain_env', 'scope', 'phone', 'swot_strengths', 'swot_weaknesses',
    'swot_opportunities', 'swot_challenges', 'swot_solutions',
    'priority_admin', 'priority_guidance', 'priority_activities',
    'priority_outcomes', 'priority_teaching', 'priority_env', 'recommendations',
  ]
}

export const CLAUDE_INDICATORS_TOOL = 'extract_weak_indicators'
export const CLAUDE_INDICATORS_SCHEMA = {
  type: 'object',
  properties: {
    indicators: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' }, name: { type: 'string' }, domain: { type: 'string' },
          score: { type: 'number' }, level: { type: 'string' }, need: { type: 'string' },
          actions: { type: 'string' }, methods: { type: 'string' }, duration: { type: 'string' },
          responsible: { type: 'string' }, executed_actions: { type: 'string' },
          school_committee: { type: 'string' },
        },
        // نفس الإصلاح المطبّق بسكيمة Gemini — الحقول السردية إلزامية الآن
        // عشان ما تطلع فارغة بالمستند النهائي حتى لو المؤشر نفسه صحيح.
        required: ['id', 'name', 'domain', 'score', 'level', 'need', 'actions', 'methods', 'duration', 'responsible', 'executed_actions', 'school_committee']
      }
    }
  },
  required: ['indicators']
}

// يرجع الكائن الجاهز مباشرة (tool_use.input) + سبب التوقف، لنفس أسلوب
// callGemini بحيث نقدر نكتشف القطع (truncation) بدل ما يضيع بصمت.
export async function callClaude(
  b64: string, apiKey: string, prompt: string, toolName: string, toolSchema: any
): Promise<{ input: any; stopReason: string }> {
  const delays = [3000, 6000]
  let lastStatus = 0
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        // Haiku 4.5 يدعم فعلياً حتى 64,000 توكن إخراج — كنا واقفين عند 8192
        // بالغلط (نفس الافتراضي القديم لـHaiku 3.5)، وهذا كان يقطع قائمة
        // المؤشرات بصمت (بدون خطأ) بالمجالات اللي فيها عدد كبير من المؤشرات
        // المؤهلة. رفعناها لتطابق سقف Gemini (32768) ونعطي هامش كافي.
        max_tokens: 32768,
        temperature: 0.1,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } },
            { type: 'text', text: prompt },
          ],
        }],
        tools: [{ name: toolName, description: 'استخرج البيانات المطلوبة بالشكل المحدد', input_schema: toolSchema }],
        tool_choice: { type: 'tool', name: toolName },
      }),
    })
    lastStatus = res.status
    if (res.ok) {
      const data = await res.json()
      const toolBlock = (data.content || []).find((c: any) => c.type === 'tool_use')
      if (!toolBlock) throw new Error('Claude لم يرجع tool_use — لا يوجد إخراج منظم')
      return { input: toolBlock.input, stopReason: data.stop_reason || 'unknown' }
    }
    // 429 = تجاوز حد المعدل، 529 = الخادم مزدحم — نفس منطق إعادة المحاولة عند Gemini
    if ((res.status === 429 || res.status === 529) && attempt < delays.length) {
      await new Promise(r => setTimeout(r, delays[attempt]))
      continue
    }
    const errText = await res.text()
    throw new Error(`Claude error ${lastStatus}: ${errText.slice(0, 300)}`)
  }
  throw new Error(`Claude failed after retries: ${lastStatus}`)
}
