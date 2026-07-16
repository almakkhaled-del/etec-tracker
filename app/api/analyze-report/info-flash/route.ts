import { NextRequest, NextResponse } from 'next/server'
import { PROMPT_INFO, callGemini, repairAndParseObject, INFO_SCHEMA } from '@/lib/analyzeReportShared'

// نسخة Gemini 3.5 Flash (النموذج الأكبر) من /api/analyze-report/info —
// لأغراض المقارنة والتجربة فقط، مع الصندوقين الآخرين (Flash-Lite الإنتاجي
// وClaude) بصفحة build-plans. نفس منطق info/route.ts تماماً، فرق وحيد هو
// تمرير modelOverride لـ callGemini.
export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const res = await callGemini(base64, apiKey, PROMPT_INFO, true, INFO_SCHEMA, 'gemini-3.5-flash')

    let info: any
    try { info = JSON.parse(res.text) }
    catch { info = repairAndParseObject(res.text) }

    return NextResponse.json(info)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
