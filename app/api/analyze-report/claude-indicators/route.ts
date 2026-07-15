import { NextRequest, NextResponse } from 'next/server'
import {
  buildIndicatorsPrompt, callClaude, DomainGroup,
  CLAUDE_INDICATORS_TOOL, CLAUDE_INDICATORS_SCHEMA
} from '@/lib/analyzeReportClaude'

// نسخة Claude من /api/analyze-report/indicators — لأغراض المقارنة والتجربة فقط.
// طلب مستقل لكل مجال (مجال واحد لكل استدعاء)، نفس بنية مسار Gemini.
export const maxDuration = 60

const VALID_GROUPS: DomainGroup[] = ['admin', 'teaching', 'outcomes', 'environment']

export async function POST(req: NextRequest) {
  try {
    const { base64, group } = await req.json()
    if (!VALID_GROUPS.includes(group)) {
      return NextResponse.json({ error: `group غير صالح: ${group}` }, { status: 400 })
    }
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const res = await callClaude(
      base64, apiKey, buildIndicatorsPrompt(group as DomainGroup),
      CLAUDE_INDICATORS_TOOL, CLAUDE_INDICATORS_SCHEMA
    )

    return NextResponse.json({
      group,
      indicators: res.input?.indicators || [],
      stopReason: res.stopReason,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
