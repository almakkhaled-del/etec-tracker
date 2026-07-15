import { NextRequest, NextResponse } from 'next/server'
import { PROMPT_INFO, callClaude, CLAUDE_INFO_TOOL, CLAUDE_INFO_SCHEMA } from '@/lib/analyzeReportClaude'

// نسخة Claude من /api/analyze-report/info — لأغراض المقارنة والتجربة فقط.
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json()
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const res = await callClaude(base64, apiKey, PROMPT_INFO, CLAUDE_INFO_TOOL, CLAUDE_INFO_SCHEMA)
    return NextResponse.json(res.input)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
