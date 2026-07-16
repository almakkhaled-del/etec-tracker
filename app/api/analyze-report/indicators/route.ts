import { NextRequest, NextResponse } from 'next/server'
import { buildIndicatorsPrompt, callGemini, repairAndParseArray, DomainGroup, INDICATORS_SCHEMA, filterQualifyingIndicators } from '@/lib/analyzeReportShared'
import { mergeIndicatorWithTemplate } from '@/lib/improvementPlansMap'

// طلب مستقل بذاته لكل مجال (ميزانية 60 ثانية خاصة به عند Vercel) — العميل
// يستدعي هذا المسار 4 مرات بالتوازي (admin/teaching/outcomes/environment).
// جُرّب تصغيرها لمجموعتين فقط لتقليل تكلفة التوكن، لكن اختبار حقيقي أثبت
// انتهاء مهلة فعلي (504) لأن كل استدعاء صار يولّد محتوى مفصلاً لمجالين
// دفعة وحدة. رجعنا لمجال واحد لكل استدعاء (أخف حملاً وأسرع توليداً) —
// مُثبتة بالتجربة أنها تعمل، رغم زيادة عدد استدعاءات Gemini (وبالتالي
// التوكن) — الاستقرار له الأولوية هنا.
export const maxDuration = 60

const VALID_GROUPS: DomainGroup[] = ['admin', 'teaching', 'outcomes', 'environment']

export async function POST(req: NextRequest) {
  try {
    const { base64, group } = await req.json()
    if (!VALID_GROUPS.includes(group)) {
      return NextResponse.json({ error: `group غير صالح: ${group}` }, { status: 400 })
    }
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const res = await callGemini(base64, apiKey, buildIndicatorsPrompt(group as DomainGroup), true, INDICATORS_SCHEMA)

    let raw: any[] = []
    try { raw = repairAndParseArray(res.text) } catch {}
    // النموذج الآن يرجع حكماً لكل مؤشر رسمي (id/score/level/include/
    // need_from_report) — نفلتر أولاً include=true (مع حزام أمان برمجي
    // بـfilterQualifyingIndicators يتحقق من score/level فعلياً، لا يعتمد على
    // التزام النموذج فقط)، ثم نكمّل بقية الحقول من القالب الثابت بـ
    // lib/improvementPlansMap.ts قبل ما نرجّع النتيجة للعميل.
    const qualifying = filterQualifyingIndicators(raw)
    const indicators = qualifying.map(mergeIndicatorWithTemplate)

    return NextResponse.json({
      group,
      indicators,
      finishReason: res.finishReason,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
