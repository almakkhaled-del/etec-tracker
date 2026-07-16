import { NextRequest, NextResponse } from 'next/server'
import {
  PROMPT_INFO, buildIndicatorsPrompt, callGemini,
  repairAndParseArray, repairAndParseObject, DomainGroup,
  INFO_SCHEMA, INDICATORS_SCHEMA
} from '@/lib/analyzeReportShared'
import { mergeIndicatorWithTemplate } from '@/lib/improvementPlansMap'

// ⚠️ هذا المسار (الكل بطلب واحد) أصبح احتياطياً فقط — الواجهة الفعلية
// (app/forms/improvement-plan/page.tsx) تستخدم الآن المسارين المنفصلين
// /api/analyze-report/info و /api/analyze-report/indicators (5 طلبات
// متوازية من العميل، كل واحد بميزانية 60 ثانية خاصة به)، لأن تجميع كل
// شيء بطلب واحد يعني اشتراك 5 استدعاءات Gemini بنفس ميزانية الوقت
// عند Vercel — وهذا كان يسبب انتهاء المهلة على التقارير الطويلة رغم كل
// تحسينات السرعة الممكنة. أبقينا هذا الملف يشتغل احتياطياً لأي استخدام مستقبلي.
export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const domainGroups: DomainGroup[] = ['admin', 'teaching', 'outcomes', 'environment']
    const [info1, ...groupResults] = await Promise.all([
      callGemini(base64, apiKey, PROMPT_INFO, true, INFO_SCHEMA),
      ...domainGroups.map(g => callGemini(base64, apiKey, buildIndicatorsPrompt(g), true, INDICATORS_SCHEMA)),
    ])
    const rawInfo = info1.text

    let info: any
    try { info = JSON.parse(rawInfo) }
    catch { info = repairAndParseObject(rawInfo) }

    const parsedGroups = groupResults.map(r => {
      try { return repairAndParseArray(r.text) } catch { return [] }
    })

    // النموذج يرجع تصنيفاً فقط (id/score/level/need_from_report) — ندمج مع
    // القالب الثابت أولاً (عشان name/domain تصير متوفرة)، وبعدها نفرز
    // التكرار بالاعتماد على id (أوثق من الاعتماد على name، خصوصاً إن id
    // مضمون الوجود دائماً من السكيمة، بعكس name اللي لم يعد يُطلب أصلاً).
    const allIndicators = parsedGroups.flat()
      .filter(ind => ind && ind.id)
      .map(mergeIndicatorWithTemplate)
    const seen = new Set<string>()
    const indicators = allIndicators.filter(ind => {
      if (seen.has(ind.id)) return false
      seen.add(ind.id)
      return true
    })

    const truncatedGroups = domainGroups.filter((g, i) => groupResults[i].finishReason === 'MAX_TOKENS')
    const truncationWarning = truncatedGroups.length > 0
      ? `تحذير: رد Gemini انقطع بسبب حد التوكنز (MAX_TOKENS) في مجموعات: ${truncatedGroups.join(', ')} — من المحتمل أن بعض المؤشرات لم تكتمل. راجع اللوقز.`
      : undefined

    if (indicators.length === 0) {
      return NextResponse.json({
        error: 'JSON parse failed (indicators)',
        detail: 'All domain groups returned empty',
        raws: groupResults.map(r => r.text.slice(0, 300)),
        finishReasons: groupResults.map(r => r.finishReason)
      }, { status: 500 })
    }

    return NextResponse.json({
      ...info,
      weak_indicators: indicators,
      _debug: { finishReasons: groupResults.map(r => r.finishReason), truncationWarning }
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
