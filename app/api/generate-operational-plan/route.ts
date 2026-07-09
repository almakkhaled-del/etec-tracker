import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const PROMPT = `أنت خبير في تحليل تقارير التقويم المدرسي السعودي وبناء الخطط التشغيلية.

قرأت تقرير التقويم الخارجي المرفق لمدرسة سعودية وفق إطار إتقان لهيئة تقويم التعليم.

مهمتك:
1. استخرج من التقرير المؤشرات حسب مستوياتها:
   - المستوى "متميز" (≥90%) = نقاط قوة
   - المستوى "متقدم" (75-89%) = نقاط قوة
   - المستوى "انطلاق" (50-74%) = نقاط ضعف تحتاج علاجاً
   - المستوى "تهيئة" (<50%) = نقاط ضعف تحتاج علاجاً عاجلاً

2. استنتج من السياق:
   - الفرص المتاحة (دعم خارجي، موارد، شراكات)
   - التهديدات (تحديات بيئية، مجتمعية، مادية)

3. ابنِ 10 أهداف عامة للخطة التشغيلية مع برامج مخصصة:
   - برامج استثمار نقاط القوة وتعزيزها
   - برامج علاج نقاط الضعف مباشرة بإجراءات واقعية
   - كل برنامج مرتبط بمؤشر محدد من التقرير

أجب بـ JSON فقط بالهيكل التالي بدون أي نص خارج الـ JSON:
{
  "swot": {
    "strengths": ["نقطة قوة 1 مع ذكر المؤشر ونسبته", "..."],
    "weaknesses": ["نقطة ضعف 1 مع ذكر المؤشر ونسبته", "..."],
    "opportunities": ["فرصة 1", "فرصة 2", "..."],
    "threats": ["تهديد 1", "تهديد 2", "..."]
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
}

تأكد أن:
- البرامج واقعية ومناسبة للمدارس السعودية
- مؤشرات الإنجاز قابلة للقياس (نسب مئوية أو أعداد)
- الأهداف تغطي جميع مجالات التقويم: الإدارة المدرسية، التعليم والتعلم، نواتج التعلم، البيئة المدرسية
- برامج نقاط الضعف أكثر تفصيلاً وعلاجاً مباشراً للمؤشر المتأثر`

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64, schoolName, principalName, region, district } = await req.json()

    if (!pdfBase64 || !schoolName || !principalName) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }

    // Call Gemini with PDF
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
          { text: PROMPT }
        ]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 16000,
        responseMimeType: 'application/json'
      }
    })

    const rawText = result.response.text()
    let planData: any

    try {
      planData = JSON.parse(rawText)
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('فشل تحليل استجابة النظام')
      planData = JSON.parse(match[0])
    }

    // Build DOCX
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

  function title(text: string) {
    return new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, bold: true, size: 28, color: GREEN_DARK, font: 'Times New Roman', rightToLeft: true })] })
  }

  function sp(after = 150) { return new Paragraph({ spacing: { after } }) }
  function pb() { return new Paragraph({ children: [new PageBreak()] }) }

  // Programs table
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

  // Followup table
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

  // SWOT table
  const swot = data.swot || {}
  const strengthsText = (swot.strengths || []).join('\n')
  const weaknessesText = (swot.weaknesses || []).join('\n')
  const opportunitiesText = (swot.opportunities || []).join('\n')
  const threatsText = (swot.threats || []).join('\n')

  function swotCell(text: string, w: number, fill: string) {
    return new TableCell({
      width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.TOP,
      shading: { type: ShadingType.CLEAR, color: 'auto', fill },
      children: text.split('\n').filter(Boolean).map(line =>
        new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: `• ${line}`, color: BLACK, size: 17, font: 'Times New Roman', rightToLeft: true })] })
      )
    })
  }

  const halfW = Math.floor(PAGE_WIDTH / 2)
  const swotTable = tbl([
    new TableRow({ children: [ hC('نقاط القوة', halfW), hC('الفرص', PAGE_WIDTH - halfW) ] }),
    new TableRow({ children: [ swotCell(strengthsText, halfW, 'F0FFF4'), swotCell(opportunitiesText, PAGE_WIDTH - halfW, 'EFF6FF') ] }),
    new TableRow({ children: [ hC('نقاط الضعف', halfW), hC('التهديدات', PAGE_WIDTH - halfW) ] }),
    new TableRow({ children: [ swotCell(weaknessesText, halfW, 'FFF7F0'), swotCell(threatsText, PAGE_WIDTH - halfW, 'FFF0F0') ] }),
  ])

  // Goal sections
  const goalSections: any[] = []
  const goals = data.goals || []
  goals.forEach((goal: any, idx: number) => {
    const n = idx + 1
    goalSections.push(
      pb(),
      title(`الهدف ${n}: ${goal.general}`),
      sp(80),
      tbl([
        new TableRow({ children: [ lC('الهدف العام', 2200), dC(goal.general, PAGE_WIDTH - 2200, 1, true) ] }),
        new TableRow({ children: [ lC('الهدف التفصيلي', 2200), dC(goal.specific, PAGE_WIDTH - 2200) ] }),
      ]),
      sp(120),
      progTable(goal.programs || []),
      sp(200),
      title('جدول متابعة البرامج'),
      sp(80),
      followTable(goal.programs || []),
    )
  })

  // Members table
  const mCols = [500, 4500, 3500, 2400, PAGE_WIDTH - 10900]
  const roles = ['مدير المدرسة','وكيل الشؤون التعليمية','وكيل شؤون الطلاب','موجه طلابي','موجه طلابي','رائد النشاط','معلم','معلم','معلم']
  const positions = ['رئيساً','نائباً','عضواً','عضواً','عضواً','عضواً','عضواً','عضواً','عضواً']
  const membersTable = tbl([
    new TableRow({ tableHeader: true, children: [ hC('م', mCols[0]), hC('الاسم', mCols[1]), hC('الوظيفة', mCols[2]), hC('الصفة', mCols[3]), hC('التوقيع', mCols[4]) ] }),
    ...[1,2,3,4,5,6,7,8,9].map((n: number, i: number) => new TableRow({ children: [ dC(String(n), mCols[0]), dC(`{{member_${n}}}`, mCols[1]), dC(roles[i], mCols[2]), dC(positions[i], mCols[3]), eC(mCols[4]) ] }))
  ])

  const signW = Math.floor(PAGE_WIDTH / 3)
  const signTable = tbl([
    new TableRow({ children: [ hC('يعتمد مدير المدرسة', PAGE_WIDTH, 3) ] }),
    new TableRow({ children: [ lC('الاسم', signW), lC('التوقيع', signW), lC('التاريخ', PAGE_WIDTH - signW * 2) ] }),
    new TableRow({ children: [ dC(info.principalName, signW), eC(signW), eC(PAGE_WIDTH - signW * 2) ] }),
  ])

  // Info table
  const infoTable = tbl([
    new TableRow({ children: [ lC('اسم المدرسة', 2500), dC(info.schoolName, PAGE_WIDTH - 2500) ] }),
    new TableRow({ children: [ lC('مدير المدرسة', 2500), dC(info.principalName, 3500), lC('إدارة التعليم', 2000), dC(info.region || '', PAGE_WIDTH - 8000) ] }),
    new TableRow({ children: [ lC('مكتب التعليم', 2500), dC(info.district || '', PAGE_WIDTH - 2500) ] }),
  ])

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Times New Roman', size: 20, rightToLeft: true }, paragraph: { alignment: AlignmentType.RIGHT, bidirectional: true } } } },
    sections: [{
      properties: {
        page: { size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE }, margin: { top: 720, bottom: 720, left: 720, right: 720 } }
      },
      children: [
        // Cover
        sp(200),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 80 }, children: [new TextRun({ text: 'المملكة العربية السعودية — وزارة التعليم', bold: true, size: 24, font: 'Times New Roman', rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 80 }, children: [new TextRun({ text: `${info.region || 'إدارة التعليم'} / ${info.district || 'مكتب التعليم'}`, bold: true, size: 22, font: 'Times New Roman', rightToLeft: true })] }),
        sp(100),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { before: 100, after: 300 }, children: [new TextRun({ text: `الخطة التشغيلية لـ ${info.schoolName} — 1448هـ`, bold: true, size: 38, color: GREEN_DARK, font: 'Times New Roman', rightToLeft: true })] }),
        sp(100),
        title('بيانات المدرسة'),
        sp(80),
        infoTable,
        sp(240),

        // SWOT
        title('تشخيص واقع المدرسة (تحليل SWOT من تقرير التقويم)'),
        sp(80),
        swotTable,
        sp(240),

        // Members
        pb(),
        title('أعضاء لجنة إعداد الخطة التشغيلية'),
        sp(80),
        membersTable,
        sp(240),

        // Goals summary
        pb(),
        title('الأهداف الاستراتيجية العامة للخطة التشغيلية'),
        sp(100),
        ...goals.map((g: any, i: number) => new Paragraph({
          alignment: AlignmentType.RIGHT, bidirectional: true, spacing: { before: 60, after: 60 },
          children: [new TextRun({ text: `${i + 1}. ${g.general}`, size: 20, font: 'Times New Roman', rightToLeft: true })]
        })),

        // Goal sections
        ...goalSections,

        // Approval
        pb(),
        title('فريق إعداد الخطة التشغيلية'),
        sp(80),
        tbl([
          new TableRow({ tableHeader: true, children: [ hC('م', 500), hC('الاسم', 4500), hC('الوظيفة', 3500), hC('الصفة', 2400), hC('التوقيع', PAGE_WIDTH - 10900) ] }),
          ...[1,2,3,4,5,6,7,8,9].map((n: number) => new TableRow({ children: [ dC(String(n), 500), eC(4500), eC(3500), eC(2400), eC(PAGE_WIDTH - 10900) ] }))
        ]),
        sp(200),
        signTable,
        sp(200),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: 'والله ولي التوفيق', bold: true, size: 28, color: GREEN_DARK, font: 'Times New Roman', rightToLeft: true })] }),
      ]
    }]
  })

  return await Packer.toBuffer(doc)
}
