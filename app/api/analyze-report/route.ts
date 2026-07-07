import { NextRequest, NextResponse } from 'next/server'

const PROMPT_INFO = `Return ONLY valid JSON object. No markdown. No text before or after. Start with { end with }.

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

Rules: all string values single line only, max 80 chars per field.`

const PROMPT_INDICATORS = `You are analyzing a Saudi school external evaluation report.

Your task: extract EVERY indicator where BOTH conditions are true:
1. مرحلة (stage) = "تهيئة" OR "انطلاق"
2. نسبة (score) <= 75%

Output a JSON array. Start with [ and end with ]. No markdown, no extra text.

For each indicator output exactly this structure (all on one line per object):
{"id":"X-X-X-X","name":"...","domain":"...","score":65.5,"level":"تهيئة","need":"...","actions":"...","methods":"...","duration":"فصل دراسي","responsible":"مدير المدرسة"}

Rules:
- score is a NUMBER not a string
- Keep all Arabic text values SHORT (max 60 chars) and on one line
- No newlines inside any string value
- Do NOT stop early — include ALL qualifying indicators
- If there are 20 indicators, output all 20`

function repairAndParseArray(raw: string): any[] {
  // Find array boundaries
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start === -1 || end === -1) {
    // Try wrapping in array if it looks like objects
    const objStart = raw.indexOf('{')
    if (objStart !== -1) {
      return repairAndParseArray('[' + raw.slice(objStart) + ']')
    }
    throw new Error('No JSON array found in response')
  }

  let s = raw.slice(start, end + 1)

  // Fix raw newlines/tabs inside strings
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

  // Try direct parse first
  try { return JSON.parse(result) } catch {}

  // Fallback: extract individual objects with regex
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

function repairAndParseObject(raw: string): any {
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
      if (ch === '\n') { result += ' '; continue }
      if (ch === '\r') { continue }
      if (ch === '\t') { result += ' '; continue }
    }
    result += ch
  }
  return JSON.parse(result)
}

async function callGemini(b64: string, apiKey: string, prompt: string, jsonMode: boolean): Promise<string> {
  const genConfig: any = { temperature: 0.1, maxOutputTokens: 16000 }
  if (jsonMode) genConfig.responseMimeType = 'application/json'

  let lastStatus = 0
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
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
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }
    if ((res.status === 503 || res.status === 429) && attempt < 3) {
      await new Promise(r => setTimeout(r, attempt * 2000))
      continue
    }
    const errText = await res.text()
    throw new Error(`Gemini error ${lastStatus}: ${errText.slice(0, 200)}`)
  }
  throw new Error(`Gemini failed after retries: ${lastStatus}`)
}

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    // Run both in parallel — info uses JSON mode, indicators uses plain text mode
    const [rawInfo, rawIndicators] = await Promise.all([
      callGemini(base64, apiKey, PROMPT_INFO, true),
      callGemini(base64, apiKey, PROMPT_INDICATORS, false)
    ])

    // Parse info object
    let info: any
    try { info = JSON.parse(rawInfo) }
    catch { info = repairAndParseObject(rawInfo) }

    // Parse indicators array — with multiple fallback strategies
    let indicators: any[] = []
    try { indicators = repairAndParseArray(rawIndicators) }
    catch (e: any) {
      return NextResponse.json({
        error: 'JSON parse failed (indicators)',
        detail: e.message,
        raw: rawIndicators.slice(0, 400)
      }, { status: 500 })
    }

    if (!Array.isArray(indicators)) indicators = []

    return NextResponse.json({ ...info, weak_indicators: indicators })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
