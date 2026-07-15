import { NextRequest, NextResponse } from 'next/server'
import { PROMPT_INFO, callGemini, repairAndParseObject, INFO_SCHEMA } from '@/lib/analyzeReportShared'

// طلب مستقل بذاته (ميزانية 60 ثانية خاصة به عند Vercel) — يستخرج فقط بيانات
// المدرسة الأساسية + SWOT + الأولويات. منفصل عن استخراج المؤشرات (أثقل بكثير)
// حتى لا يشترك الاثنان بنفس ميزانية الوقت داخل استدعاء دالة واحد.
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const res = await callGemini(base64, apiKey, PROMPT_INFO, true, INFO_SCHEMA)

    let info: any
    try { info = JSON.parse(res.text) }
    catch { info = repairAndParseObject(res.text) }

    return NextResponse.json(info)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
