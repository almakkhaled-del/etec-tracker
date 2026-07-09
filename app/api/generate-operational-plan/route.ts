// v2
import { NextRequest, NextResponse } from 'next/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const PROMPT = `أنت خبير في تحليل تقارير التقويم المدرسي السعودي وبناء الخطط التشغيلية.

قرأت تقرير التقويم الخارجي المرفق لمدرسة سعودية وفق إطار إتقان لهيئة تقويم التعليم.

مهمتك:
1. استخرج من التقرير المؤشرات حسب مستوياتها:
   - المستوى متميز أو متقدم (75% وأعلى) = نقاط قوة
   - المستوى انطلاق أو تهيئة (أقل من 75%) = نقاط ضعف تحتاج علاجاً

2. استنتج من السياق:
   - الفرص المتاحة (دعم خارجي، موارد، شراكات مجتمعية)
   - التهديدات (تحديات بيئية، مجتمعية، مادية)

3. ابنِ 10 أهداف عامة للخطة التشغيلية مع برامج مخصصة:
   - برامج استثمار نقاط القوة وتعزيزها
   - برامج علاج نقاط الضعف مباشرة بإجراءات واقعية مرتبطة بالمؤشر الضعيف
   - كل برنامج مرتبط بواقع المدرسة الفعلي من التقرير

أجب بـ JSON فقط بالهيكل التالي بدون أي نص خارج الـ JSON:
{
  "swot": {
    "strengths": ["المؤشر واسمه ونسبته"],
    "weaknesses": ["المؤشر واسمه ونسبته"],
    "opportunities": ["فرصة 1"],
    "threats": ["تهديد 1"]
  },
  "goals": [
    {
      "general": "الهدف العام",
      "specific": "الهدف التفصيلي",
      "programs": [
        {
          "name": "اسم البرنامج",
          "term": "1 أو 2 أو 1-2 أو مستمر",
          "week": "الأسبوع أو مستمر",
          "target": "المستهدفون",
          "req": "المتطلبات",
          "head": "رئيس التنفيذ",
          "support": "الجهة المساندة",
          "indicator": "مؤشر الإنجاز القابل للقياس"
        }
      ]
    }
  ]
}`

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64, schoolName, principalName, region, district } = await req.json()

    if (!pdfBase64 || !schoolName || !principalName) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'مفتاح API غير موجود' }, { status: 500 })

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
            { text: PROMPT }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 16000,
          responseMimeType: 'application/json'
        }
      })
    })

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      throw new Error(`Gemini error: ${err}`)
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let planData: any
    try {
      planData = JSON.parse(rawText)
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('فشل تحليل استجابة النظام')
      planData = JSON.parse(match[0])
    }

    const docxBuffer = await buildDocx(planData, { schoolName, principalName, region, district })

    return new NextResponse(docxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="operational-plan.docx"`
      }
    })

  } catch (error: any) {
    console.error('Operational plan error:', error)
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 })
  }
}

async function buildDocx(data: any, info: any): Promise<Buffer> {
  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
    WidthType, BorderStyle, ShadingType, AlignmentType, PageOrientation,
    PageBreak, VerticalAlign, TableLayoutType
  } = await import('docx')

  const GREEN_DARK = '1F5C2E'
  const GREEN_LIGHT = 'D9EAD3'
  const WHITE = 'FFFFFF'
  const BLACK = '000000'
  const GRAY = 'AAAAAA'
  const PAGE_WIDTH = 14400

  const BORDERS = {
    top: { style: BorderStyle.SINGLE, size: 4, color: GRAY },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY },
    left: { style: BorderStyle.SINGLE, size: 4, color: GRAY },
    right: { style: BorderStyle.SINGLE, size: 4, color: GRAY },
    insideH: { style: BorderStyle.SINGLE, size: 2, color: GRAY },
    insideV: { style: BorderStyle.SINGLE, size: 2, color: GRAY },
  }

  function tbl(rows: any[], w = PAGE_WIDTH) {
    return new Table({ width: { size: w, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: BORDERS, rows, visuallyRightToLeft: true })
  }

  function hC(text: string, w: number, cs = 1) {
    return new TableCell({
      width: { size: w, type: WidthType.DXA }, columnSpan: cs, verticalAlign: VerticalAlign.CENTER,
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: GREEN_DARK },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text, bold: true, color: WHITE, size: 18, font: 'Times New Roman', rightToLeft: true })] })]
    })
  }

  function lC(text: string, w: number, cs = 1) {
    return new TableCell({
      width: { size: w, type: WidthType.DXA }, columnSpan: cs, verticalAlign: VerticalAlign.CENTER,
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: GREEN_LIGHT },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text, bold: true, color: BLACK, size: 18, font: 'Times New Roman', rightToLeft: true })] })]
    })
  }

  function dC(text: string, w: number, cs = 1, bold = false) {
    return new TableCell({
      width: { size: w, type: WidthType.DXA }, columnSpan: cs, verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: text || '', bold, color: BLACK, size: 17, font: 'Times New Roman', rightToLeft: true })] })]
    })
  }

  function eC(w: number, cs = 1) { return dC('', w, cs) }
  function sp(after = 150) { return new Paragraph({ spacing: { after } }) }
  function pb() { return new Paragraph({ children: [new PageBreak()] }) }

  function ttl(text: string) {
    return new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, bold: true, size: 28, color: GREEN_DARK, font: 'Times New Roman', rightToLeft: true })] })
  }

  function progTable(programs: any[]) {
    const cols = [380, 2800, 750, 850, 1350, 1350, 1400, 1400, 4120]
    const hRow = new TableRow({ tableHeader: true, children: [
      hC('م', cols[0]), hC('اسم البرنامج', cols[1]), hC('الفصل', cols[2]),
      hC('الأسبوع', cols[3]), hC('المستهدفون', cols[4]), hC('المتطلبات', cols[5]),
      hC('رئيس التنفيذ', cols[6]), hC('الجهة المساندة', cols[7]), hC('مؤشر الإنجاز', cols[8]),
    ]})
    const dRows = programs.map((p: any, i: number) => new TableRow({ children: [
      dC(String(i + 1), cols[0]), dC(p.name, cols[1]), dC(p.term, cols[2]),
      dC(p.week, cols[3]), dC(p.target, cols[4]), dC(p.req, cols[5]),
      dC(p.head, cols[6]), dC(p.support, cols[7]), dC(p.indicator, cols[8]),
    ]}))
    return tbl([hRow, ...dRows])
  }

  function followTable(programs: any[]) {
    const cols = [380, 3500, 1200, 1200, 2000, 6120]
    const hRow = new TableRow({ tableHeader: true, children: [
      hC('م', cols[0]), hC('اسم البرنامج', cols[1]), hC('نعم', cols[2]),
      hC('لا', cols[3]), hC('تاريخ المتابعة', cols[4]), hC('إجراءات التحسين', cols[5]),
    ]})
    const dRows = programs.map((p: any, i: number) => new TableRow({ children: [
      dC(String(i + 1), cols[0]), dC(p.name, cols[1]), eC(cols[2]), eC(cols[3]), eC(cols[4]), eC(cols[5]),
    ]}))
    return tbl([hRow, ...dRows])
  }

  const swot = data.swot || {}
  const halfW = Math.floor(PAGE_WIDTH / 2)

  function swotCell(items: string[], w: number, fill: string) {
    return new TableCell({
      width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.TOP,
      shading: { type: ShadingType.CLEAR, color: 'auto', fill },
      children: (items || []).map((line: string) =>
        new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: `• ${line}`, color: BLACK, size: 17, font: 'Times New Roman', rightToLeft: true })] })
      )
    })
  }

  const swotTbl = tbl([
    new TableRow({ children: [ hC('نقاط القوة', halfW), hC('الفرص', PAGE_WIDTH - halfW) ] }),
    new TableRow({ children: [ swotCell(swot.strengths || [], halfW, 'F0FFF4'), swotCell(swot.opportunities || [], PAGE_WIDTH - halfW, 'EFF6FF') ] }),
    new TableRow({ children: [ hC('نقاط الضعف', halfW), hC('التهديدات', PAGE_WIDTH - halfW) ] }),
    new TableRow({ children: [ swotCell(swot.weaknesses || [], halfW, 'FFF7F0'), swotCell(swot.threats || [], PAGE_WIDTH - halfW, 'FFF0F0') ] }),
  ])

  const goals = data.goals || []
  const goalSections: any[] = []
  goals.forEach((goal: any, idx: number) => {
    goalSections.push(
      pb(), ttl(`الهدف ${idx + 1}: ${goal.general}`), sp(80),
      tbl([
        new TableRow({ children: [ lC('الهدف العام', 2200), dC(goal.general, PAGE_WIDTH - 2200, 1, true) ] }),
        new TableRow({ children: [ lC('الهدف التفصيلي', 2200), dC(goal.specific, PAGE_WIDTH - 2200) ] }),
      ]),
      sp(120), progTable(goal.programs || []),
      sp(200), ttl('جدول متابعة البرامج'), sp(80), followTable(goal.programs || []),
    )
  })

  const mCols = [500, 4500, 3500, 2400, PAGE_WIDTH - 10900]
  const roles = ['مدير المدرسة','وكيل الشؤون التعليمية','وكيل شؤون الطلاب','موجه طلابي','موجه طلابي','رائد النشاط','معلم','معلم','معلم']
  const positions = ['رئيساً','نائباً','عضواً','عضواً','عضواً','عضواً','عضواً','عضواً','عضواً']
  const signW = Math.floor(PAGE_WIDTH / 3)

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Times New Roman', size: 20, rightToLeft: true }, paragraph: { alignment: AlignmentType.RIGHT, bidirectional: true } } } },
    sections: [{
      properties: {
        page: { size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE }, margin: { top: 720, bottom: 720, left: 720, right: 720 } }
      },
      children: [
        sp(200),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 80 }, children: [new TextRun({ text: 'المملكة العربية السعودية — وزارة التعليم', bold: true, size: 24, font: 'Times New Roman', rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 200 }, children: [new TextRun({ text: `${info.region || 'إدارة التعليم'} / ${info.district || 'مكتب التعليم'}`, bold: true, size: 22, font: 'Times New Roman', rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { before: 100, after: 300 }, children: [new TextRun({ text: `الخطة التشغيلية لـ ${info.schoolName} — 1448هـ`, bold: true, size: 38, color: GREEN_DARK, font: 'Times New Roman', rightToLeft: true })] }),
        sp(100),
        ttl('بيانات المدرسة'), sp(80),
        tbl([
          new TableRow({ children: [ lC('اسم المدرسة', 2500), dC(info.schoolName, PAGE_WIDTH - 2500) ] }),
          new TableRow({ children: [ lC('مدير المدرسة', 2500), dC(info.principalName, 3500), lC('إدارة التعليم', 2500), dC(info.region || '', PAGE_WIDTH - 8500) ] }),
        ]),
        sp(240),
        ttl('تشخيص واقع المدرسة من تقرير التقويم الخارجي'), sp(80),
        swotTbl,
        sp(240),
        pb(),
        ttl('أعضاء لجنة إعداد الخطة التشغيلية'), sp(80),
        tbl([
          new TableRow({ tableHeader: true, children: [ hC('م', mCols[0]), hC('الاسم', mCols[1]), hC('الوظيفة', mCols[2]), hC('الصفة', mCols[3]), hC('التوقيع', mCols[4]) ] }),
          ...[1,2,3,4,5,6,7,8,9].map((n: number, i: number) => new TableRow({ children: [ dC(String(n), mCols[0]), eC(mCols[1]), dC(roles[i], mCols[2]), dC(positions[i], mCols[3]), eC(mCols[4]) ] }))
        ]),
        sp(240),
        pb(),
        ttl('الأهداف الاستراتيجية العامة للخطة التشغيلية'), sp(100),
        ...goals.map((g: any, i: number) => new Paragraph({
          alignment: AlignmentType.RIGHT, bidirectional: true, spacing: { before: 60, after: 60 },
          children: [new TextRun({ text: `${i + 1}. ${g.general}`, size: 20, font: 'Times New Roman', rightToLeft: true })]
        })),
        ...goalSections,
        pb(),
        ttl('فريق إعداد الخطة التشغيلية'), sp(80),
        tbl([
          new TableRow({ tableHeader: true, children: [ hC('م', 500), hC('الاسم', 4500), hC('الوظيفة', 3500), hC('الصفة', 2400), hC('التوقيع', PAGE_WIDTH - 10900) ] }),
          ...[1,2,3,4,5,6,7,8,9].map((n: number) => new TableRow({ children: [ dC(String(n), 500), eC(4500), eC(3500), eC(2400), eC(PAGE_WIDTH - 10900) ] }))
        ]),
        sp(200),
        tbl([
          new TableRow({ children: [ hC('يعتمد مدير المدرسة', PAGE_WIDTH, 3) ] }),
          new TableRow({ children: [ lC('الاسم', signW), lC('التوقيع', signW), lC('التاريخ', PAGE_WIDTH - signW * 2) ] }),
          new TableRow({ children: [ dC(info.principalName, signW), eC(signW), eC(PAGE_WIDTH - signW * 2) ] }),
        ]),
        sp(200),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: 'والله ولي التوفيق', bold: true, size: 28, color: GREEN_DARK, font: 'Times New Roman', rightToLeft: true })] }),
      ]
    }]
  })

  return await Packer.toBuffer(doc)
}
