import { NextRequest, NextResponse } from 'next/server'
import { buildIndicatorsPrompt, callGemini, repairAndParseArray, DomainGroup, INDICATORS_SCHEMA } from '@/lib/analyzeReportShared'
import { mergeIndicatorWithTemplate } from '@/lib/improvementPlansMap'

// نسخة Gemini 3.5 Flash (النموذج الأكبر) من /api/analyze-report/indicators —
// لأغراض المقارنة والتجربة فقط، جنباً إلى جنب مع Flash-Lite الإنتاجي وClaude
// بصفحة build-plans. نفس بنية indicators/route.ts تماماً (طلب مستقل لكل
// مجال)، فرق وحيد هو تمرير modelOverride لـ callGemini.
export const maxDuration = 120

const VALID_GROUPS: DomainGroup[] = ['admin', 'teaching', 'outcomes', 'environment']

export async function POST(req: NextRequest) {
  try {
    const { base64, group } = await req.json()
    if (!VALID_GROUPS.includes(group)) {
      return NextResponse.json({ error: `group غير صالح: ${group}` }, { status: 400 })
    }
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const res = await callGemini(base64, apiKey, buildIndicatorsPrompt(group as DomainGroup), true, INDICATORS_SCHEMA, 'gemini-3.5-flash')

    let raw: any[] = []
    try { raw = repairAndParseArray(res.text) } catch {}
    const indicators = raw.map(mergeIndicatorWithTemplate)

    return NextResponse.json({
      group,
      indicators,
      finishReason: res.finishReason,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
