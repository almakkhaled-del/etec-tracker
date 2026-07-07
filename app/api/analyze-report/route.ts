import { NextRequest, NextResponse } from 'next/server'

// PROMPT 1: Extract school info + SWOT + priorities (portrait data)
const PROMPT_INFO = `Return ONLY valid JSON. No markdown. No text before or after.

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
  "swot_strengths": "",
  "swot_weaknesses": "",
  "swot_opportunities": "",
  "swot_challenges": "",
  "swot_solutions": "",
  "priority_admin": { "level": "عالي", "justification": "" },
  "priority_guidance": { "level": "متوسط", "justification": "" },
  "priority_activities": { "level": "متوسط", "justification": "" },
  "priority_outcomes": { "level": "عالي", "justification": "" },
  "priority_teaching": { "level": "عالي", "justification": "" },
  "priority_env": { "level": "منخفض", "justification": "" },
  "recommendations": ""
}

Rules:
- All string values on a single line only
- No line breaks inside string values
- Keep values concise (max 80 chars per field)`

// PROMPT 2: Extract ALL weak indicators
const PROMPT_INDICATORS = `Return ONLY valid JSON array. No markdown. No text before or after.

From this Saudi school external evaluation report, extract EVERY indicator that meets BOTH conditions:
1. Stage (مرحلة) is "تهيئة" OR "انطلاق" (NOT تطور or ريادة)  
2. Score (نسبة) is 75% or less

Return ALL matching indicators without exception. Do not stop early.

Return this exact structure:
[
  {
    "id": "indicator code e.g. 1-1-1-1",
    "name": "indicator name in Arabic",
    "domain": "domain name in Arabic",
    "score": 65.5,
    "level": "تهيئة or انطلاق",
    "need": "brief description of the improvement need in Arabic (max 60 chars)",
    "actions": "improvement actions in Arabic (max 80 chars)",
    "methods": "improvement methods in Arabic (max 60 chars)",
    "duration": "فصل دراسي",
    "responsible": "مدير المدرسة"
  }
]

Rules:
- score must be a number (not a string)
- All text values on a single line only
- No line breaks inside any string value
- Include ALL qualifying indicators, even if there are 20+`

function repairJson(raw: string): string {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found')
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
      if (ch === '\n') { result += '\\n'; continue }
      if (ch === '\r') { result += '\\r'; continue }
      if (ch === '\t') { result += '\\t'; continue }
    }
    result += ch
  }
  return result
}

function repairJsonArray(raw: string): string {
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('No JSON array found')
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
      if (ch === '\n') { result += '\\n'; continue }
      if (ch === '\r') { result += '\\r'; continue }
      if (ch === '\t') { result += '\\t'; continue }
    }
    result += ch
  }
  return result
}

async function callGemini(base64: string, apiKey: string, prompt: string): Promise<Response> {
  return fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: 'application/pdf', data: base64 } },
          { text: prompt }
        ]}],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8000,
          responseMimeType: 'application/json'
        }
      })
    }
  )
}

async function callWithRetry(base64: string, apiKey: string, prompt: string): Promise<any> {
  let response: Response | null = null
  let lastStatus = 0
  for (let attempt = 1; attempt <= 3; attempt++) {
    response = await callGemini(base64, apiKey, prompt)
    lastStatus = response.status
    if (response.ok) break
    if ((response.status === 503 || response.status === 429) && attempt < 3) {
      await new Promise(r => setTimeout(r, attempt * 2000))
      continue
    }
    break
  }
  if (!response || !response.ok) {
    const err = await response!.text()
    throw new Error(`Gemini API error: ${lastStatus} - ${err.slice(0, 200)}`)
  }
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    // Run both calls in parallel
    const [rawInfo, rawIndicators] = await Promise.all([
      callWithRetry(base64, apiKey, PROMPT_INFO),
      callWithRetry(base64, apiKey, PROMPT_INDICATORS)
    ])

    // Parse info
    let info: any
    try {
      info = JSON.parse(rawInfo)
    } catch {
      try { info = JSON.parse(repairJson(rawInfo)) }
      catch (e: any) {
        return NextResponse.json({ error: 'JSON parse failed (info)', detail: e.message, raw: rawInfo.slice(0, 300) }, { status: 500 })
      }
    }

    // Parse indicators
    let indicators: any[]
    try {
      indicators = JSON.parse(rawIndicators)
    } catch {
      try { indicators = JSON.parse(repairJsonArray(rawIndicators)) }
      catch (e: any) {
        return NextResponse.json({ error: 'JSON parse failed (indicators)', detail: e.message, raw: rawIndicators.slice(0, 300) }, { status: 500 })
      }
    }

    if (!Array.isArray(indicators)) indicators = []

    return NextResponse.json({ ...info, weak_indicators: indicators })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
