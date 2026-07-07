import { NextRequest, NextResponse } from 'next/server'

const PROMPT = `IMPORTANT: Return ONLY a valid JSON object. No markdown, no text before or after. Start with { and end with }.

CRITICAL JSON RULES:
- All string values must be on a single line (no line breaks inside strings)
- Use \\n for line breaks within string values
- Escape all double quotes inside strings with \\"
- Do not use Arabic quotation marks
- Keep all text values concise (max 100 characters per field)

أنت خبير تربوي متخصص في تقويم المدارس السعودية وفق إطار إتقان. حلل تقرير التقويم المدرسي الخارجي واستخرج البيانات لملء ثلاثة نماذج رسمية.

━━━ قاعدة المؤشرات الضعيفة ━━━
أدرج في weak_indicators كل مؤشر يحقق الشرطين:
1. مرحلته: "تهيئة" أو "انطلاق" فقط
2. نسبته: 75% أو أقل

━━━ بيانات النماذج الثلاثة ━━━
النموذج 1 - بناء خطة التحسين: البيانات الأساسية + جدول المؤشرات الضعيفة (المجال، العنصر، وصف الاحتياج، إجراءات التحسين، الأساليب، مدة الإنجاز، التنفيذ والمسؤولية) + التوصيات
النموذج 2 - تنفيذ خطة التحسين: نفس البيانات + جدول التنفيذ
النموذج 3 - تقرير واقع المدرسة: البيانات الأساسية + نتائج التقويم + SWOT + الأولويات

أجب بهذا JSON (القيم النصية مختصرة وعلى سطر واحد):

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
  "report_type": "خارجي",
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
  "recommendations": "",
  "weak_indicators": [
    {
      "id": "",
      "name": "",
      "domain": "",
      "score": 0,
      "level": "",
      "need": "",
      "actions": "",
      "methods": "",
      "duration": "فصل دراسي",
      "responsible": "مدير المدرسة"
    }
  ]
}`

function repairJson(raw: string): string {
  // Extract the outermost JSON object
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in response')
  let s = raw.slice(start, end + 1)

  // Remove control characters that break JSON (newlines inside strings, etc.)
  // Strategy: parse char by char, track if we're inside a string
  let result = ''
  let inString = false
  let escaped = false

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (escaped) {
      result += ch
      escaped = false
      continue
    }
    if (ch === '\\') {
      escaped = true
      result += ch
      continue
    }
    if (ch === '"') {
      inString = !inString
      result += ch
      continue
    }
    if (inString) {
      // Replace raw newlines/tabs/carriage returns inside strings
      if (ch === '\n') { result += '\\n'; continue }
      if (ch === '\r') { result += '\\r'; continue }
      if (ch === '\t') { result += '\\t'; continue }
    }
    result += ch
  }

  return result
}

async function callGemini(base64: string, apiKey: string): Promise<Response> {
  return fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: 'application/pdf', data: base64 } },
          { text: PROMPT }
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

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    let response: Response | null = null
    let lastStatus = 0

    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await callGemini(base64, apiKey)
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
      return NextResponse.json({ error: `Gemini API error: ${lastStatus}`, detail: err }, { status: 500 })
    }

    const data = await response.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let parsed: any
    try {
      // First attempt: direct parse
      parsed = JSON.parse(raw)
    } catch {
      try {
        // Second attempt: repair then parse
        const repaired = repairJson(raw)
        parsed = JSON.parse(repaired)
      } catch (e2: any) {
        return NextResponse.json(
          { error: 'JSON parse failed', detail: e2.message, raw: raw.slice(0, 500) },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(parsed)

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
