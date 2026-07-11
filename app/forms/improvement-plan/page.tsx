'use client'
import { useState, useRef } from 'react'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const CREAM = '#FBF8F2'
const GREEN = '#15803D'

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '2px solid rgba(194,138,31,0.2)', paddingBottom: 10, marginTop: 28 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0 }}>{title}</h3>
    </div>
  )
}

type Step = 'upload' | 'analyzing' | 'ready' | 'error'
type DocStatus = 'idle' | 'generating' | 'done'

interface Priority { level: string; justification: string }
interface WeakIndicator {
  id: string; name: string; domain: string; score: number; level: string
  need: string; actions: string; methods: string; duration: string; responsible: string
  executed_actions?: string; school_committee?: string
}
interface AnalysisResult {
  school_name: string; principal_name: string; grade: string; gender: string
  ministry_number: string; building_type: string; building_independence: string
  period: string; admin_independence: string; shared_school: string; scope: string; phone: string
  overall_level: string; outcomes_level: string; report_date: string; overall_avg: string
  domain_admin: string; domain_teaching: string; domain_outcomes: string; domain_env: string
  swot_strengths: string[]; swot_weaknesses: string[]; swot_opportunities: string[]
  swot_challenges: string[]; swot_solutions: string[]
  priority_admin: Priority; priority_guidance: Priority; priority_activities: Priority
  priority_outcomes: Priority; priority_teaching: Priority; priority_env: Priority
  recommendations: string; weak_indicators: WeakIndicator[]
}

export default function ImprovementPlanPage() {
  const { school } = useSchool()
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [docStatus, setDocStatus] = useState<Record<string, DocStatus>>({ doc1: 'idle', doc2: 'idle', doc3: 'idle' })
  const fileRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') { setFile(f); setError('') }
    else setError('يرجى رفع ملف PDF فقط')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f?.type === 'application/pdf') { setFile(f); setError('') }
    else setError('يرجى رفع ملف PDF فقط')
  }

  async function handleAnalyze() {
    if (!file) return
    setStep('analyzing'); setProgress('جاري قراءة التقرير...'); setError('')
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res((reader.result as string).split(',')[1])
        reader.onerror = () => rej(new Error('فشل قراءة الملف'))
        reader.readAsDataURL(file)
      })
      setProgress('يحلل النظام التقرير ويستخرج البيانات...')
      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64 })
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `Server error: ${response.status}`)
      }
      const parsed: AnalysisResult = await response.json()
      setResult(parsed)
      setStep('ready')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع')
      setStep('error')
    }
  }

  async function buildDocxHelpers() {
    const [
      { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
        WidthType, AlignmentType, BorderStyle, ShadingType, PageOrientation,
        VerticalAlign },
      { saveAs }
    ] = await Promise.all([import('docx'), import('file-saver')])

    // Exact values from official ETEC template
    const HEADER_COLOR = '00A890'
    const LABEL_COLOR  = 'E7F9E9'
    const HEADER_TEXT  = 'FFFFFF'
    const DARK_TEXT    = '000000'

    const B = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
    const borders = { top: B, bottom: B, left: B, right: B, insideHorizontal: B, insideVertical: B }

    const p = (text: string, bold = false, size = 24, color = DARK_TEXT, center = false) =>
      new Paragraph({
        bidirectional: true,
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: text || '', bold, size, color, font: 'Sakkal Majalla' })]
      })

    // Header cell — تركوازي + نص أبيض + محاذاة وسط عمودية
    const hCell = (text: string, w?: number | null) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: HEADER_COLOR }, borders,
      verticalAlign: VerticalAlign.CENTER,
      width: w ? { size: w as number, type: WidthType.DXA } : undefined,
      children: [p(text, true, 24, HEADER_TEXT, true)]
    })
    // Label cell — أخضر فاتح + نص عريض + محاذاة وسط عمودية
    const gCell = (text: string, w?: number | null) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: LABEL_COLOR }, borders,
      verticalAlign: VerticalAlign.CENTER,
      width: w ? { size: w as number, type: WidthType.DXA } : undefined,
      children: [p(text, true, 24, DARK_TEXT)]
    })
    // Data cell — أبيض + محاذاة وسط عمودية
    const dCell = (text: string, w?: number | null, bold = false) => new TableCell({
      borders,
      verticalAlign: VerticalAlign.CENTER,
      width: w ? { size: w as number, type: WidthType.DXA } : undefined,
      children: [p(text || '', bold, 24, DARK_TEXT)]
    })
    // Bullet cell — كل عنصر بالمصفوفة بسطر مستقل بدل سرد الكل بسطر واحد
    // (نفس معكوس RIGHT<->LEFT مع bidi، ونستخدم LEFT هنا للسبب نفسه)
    const bulletCell = (items: string[] | string | undefined, w?: number | null) => {
      const list = Array.isArray(items) ? items : (items ? [items] : [])
      return new TableCell({
        borders,
        verticalAlign: VerticalAlign.TOP,
        width: w ? { size: w as number, type: WidthType.DXA } : undefined,
        children: list.length > 0
          ? list.map(line => new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.LEFT,
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: `• ${line}`, size: 24, color: DARK_TEXT, font: 'Sakkal Majalla' })]
            }))
          : [p('', false, 24, DARK_TEXT)]
      })
    }
    const title = (text: string) => new Paragraph({
      bidirectional: true, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 32, color: DARK_TEXT, font: 'Sakkal Majalla' })]
    })
    // AlignmentType.LEFT هنا مقصودة وليست خطأ: مع bidirectional:true ينعكس
    // المعنى البصري لـ jc (نفس خلل تم اكتشافه وتأكيده بالخطة التشغيلية RIGHT<->LEFT)
    const section = (text: string) => new Paragraph({
      bidirectional: true, alignment: AlignmentType.LEFT,
      children: [new TextRun({ text, bold: true, size: 28, color: DARK_TEXT, font: 'Sakkal Majalla' })]
    })
    const gap = () => new Paragraph({ children: [] })

    return { Document, Packer, Table, TableRow, TableCell, WidthType, PageOrientation,
             p, hCell, gCell, dCell, bulletCell, title, section, gap, saveAs, VerticalAlign }
  }

  async function downloadDoc1() {
    if (!result) return
    setDocStatus(s => ({ ...s, doc1: 'generating' }))
    try {
      const { Document, Packer, Table, TableRow, WidthType, PageOrientation,
              hCell, gCell, dCell, title, section, gap, saveAs } = await buildDocxHelpers()

      const d = result
      // Exact page size from official template (A3 landscape DXA)
      const landscapeProps = {
        page: {
          size: { width: 16838, height: 11906 },
          margin: { top: 720, bottom: 720, left: 720, right: 720 }
        }
      }

      // Table 0: Basic info — 6 cols: 2562×5 + 2564 = 15374 total
      const basicInfoTable = () => new Table({ visuallyRightToLeft: true,
        width: { size: 15374, type: WidthType.DXA },
        columnWidths: [2562, 2562, 2562, 2562, 2562, 2564],
        rows: [
          new TableRow({ children: [
            gCell('اسم المدرسة', 2562), dCell(d.school_name, 2562, true),
            gCell('المرحلة', 2562), dCell(d.grade, 2562),
            gCell('جنس المدرسة', 2562), dCell(d.gender, 2564),
          ]}),
          new TableRow({ children: [
            gCell('الرقم الوزاري', 2562), dCell(d.ministry_number, 2562),
            gCell('نوع المبنى', 2562), dCell(d.building_type, 2562),
            gCell('استقلالية المبنى', 2562), dCell(d.building_independence || 'مشترك', 2564),
          ]}),
          new TableRow({ children: [
            gCell('الفترة', 2562), dCell(d.period || 'صباحي', 2562),
            gCell('استقلالية الإدارة', 2562), dCell(d.admin_independence || 'مستقلة', 2562),
            gCell('المدرسة المشتركة في الإدارة', 2562), dCell(d.shared_school || '', 2564),
          ]}),
        ]
      })

      // Table 1: Performance levels — 5482+2220+5293+2409 = 15404
      const levelTable = () => new Table({ visuallyRightToLeft: true,
        width: { size: 15374, type: WidthType.DXA },
        columnWidths: [5482, 2220, 5293, 2409],
        rows: [
          new TableRow({ children: [
            gCell('مستوى الأداء العام للمدرسة في التقويم المدرسي ( آخر تقرير)', 5482),
            dCell(d.overall_level, 2220, true),
            gCell('مستوى المدرسة في نواتج التعلم في التقويم المدرسي ( آخر تقرير)', 5293),
            dCell(d.outcomes_level, 2409, true),
          ]})
        ]
      })

      const doc = new Document({ styles: { default: { document: { run: { font: 'Sakkal Majalla', size: 24 } } } }, sections: [{ properties: landscapeProps, children: [
        title('استمارة المدرسة (1) : بناء خطة التحسين في مجالات الممارسات الإشرافية'),
        gap(),
        section('أولاً/ البيانات الأساسية:'),
        gap(),
        basicInfoTable(),
        gap(),
        levelTable(),
        gap(),
        section('ثانياً/ إجراءات خطة التحسين في مجالات الممارسات الإشرافية:'),
        gap(),
        // Table 2: Indicators — 7 cols: 2198×6 + 2199 = 15387
        new Table({ visuallyRightToLeft: true,
          width: { size: 15374, type: WidthType.DXA },
          columnWidths: [2198, 2198, 2198, 2198, 2198, 2199, 2199],
          rows: [
            new TableRow({ children: [
              hCell('المجال', 2198),
              hCell('العنصر / المكون/ العملية المراد تحسينها', 2198),
              hCell('وصف الاحتياج', 2198),
              hCell('إجراءات التحسين', 2198),
              hCell('أساليب وطرق التحسين', 2198),
              hCell('مدة الإنجاز', 2199),
              hCell('التنفيذ والمسؤولية', 2199),
            ]}),
            ...d.weak_indicators.map(ind => new TableRow({ children: [
              dCell(ind.domain, 2198),
              dCell(`${ind.name} - ${ind.score}%`, 2198),
              dCell(ind.need, 2198),
              dCell(ind.actions, 2198),
              dCell(ind.methods, 2198),
              dCell(ind.duration, 2199),
              dCell(ind.responsible, 2199),
            ]}))
          ]
        }),
        gap(),
        section('ثالثاً/ التوصيات والمقترحات:'),
        gap(),
        new Table({ visuallyRightToLeft: true,
          width: { size: 15374, type: WidthType.DXA },
          columnWidths: [15374],
          rows: [new TableRow({ children: [dCell(d.recommendations, 15374)] })]
        }),
        gap(), gap(),
        // Table 3: Signatures — 3592+2329+3125+3125+3217 = 15388
        new Table({ visuallyRightToLeft: true,
          width: { size: 15374, type: WidthType.DXA },
          columnWidths: [3592, 2329, 3125, 3125, 3217],
          rows: [
            new TableRow({ children: [
              gCell('مدير/ة المدرسة', 3592),
              dCell(d.principal_name || '', 2329),
              gCell('التوقيع', 3125),
              gCell('مقدم/ة خدمات دعم التميز المدرسي', 3125),
              gCell('الختم', 3217),
            ]}),
            new TableRow({ children: [
              dCell('', 3592),
              dCell('', 2329),
              dCell('', 3125),
              dCell('', 3125),
              dCell('', 3217),
            ]}),
          ]
        })
      ]}]})

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `(1) بناء خطة التحسين - ${d.school_name}.docx`)
      setDocStatus(s => ({ ...s, doc1: 'done' }))
    } catch (e: any) {
      alert('خطأ في توليد الملف: ' + e.message)
      setDocStatus(s => ({ ...s, doc1: 'idle' }))
    }
  }

  async function downloadDoc2() {
    if (!result) return
    setDocStatus(s => ({ ...s, doc2: 'generating' }))
    try {
      const { Document, Packer, Table, TableRow, WidthType, PageOrientation,
              hCell, gCell, dCell, title, section, gap, saveAs } = await buildDocxHelpers()

      const d = result
      const landscapeProps = {
        page: {
          size: { width: 16838, height: 11906 },
          margin: { top: 720, bottom: 720, left: 720, right: 720 }
        }
      }

      const basicInfoTable = () => new Table({ visuallyRightToLeft: true,
        width: { size: 15374, type: WidthType.DXA },
        columnWidths: [2562, 2562, 2562, 2562, 2562, 2564],
        rows: [
          new TableRow({ children: [gCell('اسم المدرسة', 2562), dCell(d.school_name, 2562, true), gCell('المرحلة', 2562), dCell(d.grade, 2562), gCell('جنس المدرسة', 2562), dCell(d.gender, 2564)] }),
          new TableRow({ children: [gCell('الرقم الوزاري', 2562), dCell(d.ministry_number, 2562), gCell('نوع المبنى', 2562), dCell(d.building_type, 2562), gCell('استقلالية المبنى', 2562), dCell(d.building_independence || '', 2564)] }),
          new TableRow({ children: [gCell('الفترة', 2562), dCell(d.period || 'صباحي', 2562), gCell('استقلالية الإدارة', 2562), dCell(d.admin_independence || 'مستقلة', 2562), gCell('المدرسة المشتركة في الإدارة', 2562), dCell(d.shared_school || '', 2564)] }),
        ]
      })

      const doc = new Document({ sections: [{ properties: landscapeProps, children: [
        title('استمارة المدرسة (2): تنفيذ خطة التحسين في مجالات الممارسات الإشرافية'),
        gap(),
        section('أولاً/ البيانات الأساسية:'),
        gap(),
        basicInfoTable(),
        gap(),
        section('ثانياً/ إجراءات تنفيذ خطة التحسين في مجالات الممارسات الإشرافية:'),
        gap(),
        new Table({ visuallyRightToLeft: true,
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: [1700, 2200, 3500, 2000, 1800, 2200],
          rows: [
            new TableRow({ children: [
              hCell('المجال'),
              hCell('العنصر / المكون / العملية المراد تحسينها'),
              hCell('الإجراءات المنفذة\n(يكتب وصف الإجراء بدقة ويوم وتاريخ تنفيذه)'),
              hCell('أساليب وطرق التحسين'),
              hCell('لجان المدرسة'),
              hCell('المشرف التربوي'),
            ]}),
            ...d.weak_indicators.map(ind => new TableRow({ children: [
              dCell(ind.domain),
              dCell(ind.name),
              dCell(ind.executed_actions || ''),
              dCell(ind.methods),
              dCell(ind.school_committee || ''),
              dCell(''),
            ]}))
          ]
        }),
        gap(),
        section('ثالثاً/ التوصيات والمقترحات:'),
        gap(),
        new Table({ visuallyRightToLeft: true,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({ children: [dCell('')] })]
        }),
        gap(), gap(),
        new Table({ visuallyRightToLeft: true,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({ children: [
            gCell('مدير/ة المدرسة'), dCell(d.principal_name || ''),
            gCell('التوقيع'), dCell(''),
            gCell('مقدم/ة خدمات دعم التميز المدرسي'), dCell(''),
            gCell('التوقيع'), dCell(''),
            gCell('الختم'), dCell(''),
          ]})]
        })
      ]}]})

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `(2) تنفيذ خطة التحسين - ${d.school_name}.docx`)
      setDocStatus(s => ({ ...s, doc2: 'done' }))
    } catch (e: any) {
      alert('خطأ في توليد الملف: ' + e.message)
      setDocStatus(s => ({ ...s, doc2: 'idle' }))
    }
  }

  async function downloadDoc3() {
    if (!result) return
    setDocStatus(s => ({ ...s, doc3: 'generating' }))
    try {
      const { Document, Packer, Table, TableRow, WidthType, PageOrientation,
              hCell, gCell, dCell, bulletCell, title, section, gap, saveAs } = await buildDocxHelpers()

      const d = result
      // طولية (Portrait A4) بدل العرضية اللي كانت بالغلط
      const portraitProps3 = { page: { size: { width: 11906, height: 16838 }, margin: { top: 720, bottom: 720, left: 720, right: 720 } } }

      const doc = new Document({ sections: [{ properties: portraitProps3, children: [
        title('تقرير واقع المدرسة'),
        gap(),
        section('البيانات الأساسية:'),
        gap(),
        new Table({ visuallyRightToLeft: true,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [gCell('اسم المدرسة'), dCell(d.school_name, undefined, true), gCell('الرقم الوزاري'), dCell(d.ministry_number)] }),
            new TableRow({ children: [gCell('المرحلة الدراسية'), dCell(d.grade), gCell('الجنس'), dCell(d.gender)] }),
            new TableRow({ children: [gCell('النطاق'), dCell(d.scope || ''), gCell('مبنى المدرسة'), dCell(d.building_independence || '')] }),
            new TableRow({ children: [gCell('اسم مدير المدرسة'), dCell(d.principal_name || ''), gCell('رقم الجوال'), dCell(d.phone || '')] }),
          ]
        }),
        gap(),
        section('نتائج التقويم المدرسي (حسب أحدث تقرير صدر للمدرسة في منصة تميز الرقمية):'),
        gap(),
        new Table({ visuallyRightToLeft: true,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [gCell('نوع تقرير التقويم المدرسي'), dCell('خارجي ✓'), gCell('تاريخ التقرير'), dCell(d.report_date || '')] }),
            new TableRow({ children: [gCell('متوسط الأداء العام'), dCell(d.overall_avg || d.overall_level), gCell(''), dCell('')] }),
            new TableRow({ children: [gCell('الإدارة المدرسية'), dCell(d.domain_admin), gCell('التعليم والتعلم'), dCell(d.domain_teaching)] }),
            new TableRow({ children: [gCell('نواتج التعلم'), dCell(d.domain_outcomes), gCell('البيئة المدرسية'), dCell(d.domain_env)] }),
          ]
        }),
        gap(),
        section('تحليل الواقع للمدرسة المرتبط بالمجالات الأساسية:'),
        gap(),
        new Table({ visuallyRightToLeft: true,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [gCell('نقاط القوة'), bulletCell(d.swot_strengths)] }),
            new TableRow({ children: [gCell('نقاط الضعف'), bulletCell(d.swot_weaknesses)] }),
            new TableRow({ children: [gCell('الفرص'), bulletCell(d.swot_opportunities)] }),
            new TableRow({ children: [gCell('التحديات'), bulletCell(d.swot_challenges)] }),
            new TableRow({ children: [gCell('آلية معالجة نقاط الضعف'), bulletCell(d.swot_solutions)] }),
          ]
        }),
        gap(),
        section('الأولويات العاجلة للتحسين في المدرسة وفق المجالات الأساسية:'),
        gap(),
        new Table({ visuallyRightToLeft: true,
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: [2500, 2000, 7740],
          rows: [
            new TableRow({ children: [hCell('المجال'), hCell('الأولوية'), hCell('مبررات تحديد مستوى الأولوية')] }),
            ...[
              { label: 'الإدارة المدرسية', pr: d.priority_admin },
              { label: 'التوجيه الطلابي', pr: d.priority_guidance },
              { label: 'الأنشطة المدرسية', pr: d.priority_activities },
              { label: 'نواتج التعلم', pr: d.priority_outcomes },
              { label: 'التدريس', pr: d.priority_teaching },
              { label: 'البيئة المدرسية', pr: d.priority_env },
            ].map(item => new TableRow({ children: [
              dCell(item.label),
              dCell(item.pr?.level || '', undefined, true),
              dCell(item.pr?.justification || ''),
            ]}))
          ]
        }),
        gap(), gap(),
        new Table({ visuallyRightToLeft: true,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({ children: [
            gCell('مدير/ة المدرسة'), dCell(d.principal_name || ''),
            gCell('التوقيع'), dCell(''),
            gCell('الختم'), dCell(''),
          ]})]
        })
      ]}]})

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `(3) تقرير واقع المدرسة - ${d.school_name}.docx`)
      setDocStatus(s => ({ ...s, doc3: 'done' }))
    } catch (e: any) {
      alert('خطأ في توليد الملف: ' + e.message)
      setDocStatus(s => ({ ...s, doc3: 'idle' }))
    }
  }

  const DOCS = [
    {
      key: 'doc1', num: '1', icon: '📋',
      title: 'بناء خطة التحسين',
      desc: 'استمارة رسمية مملوءة بالمؤشرات الضعيفة وإجراءات التحسين',
      fn: downloadDoc1,
    },
    {
      key: 'doc2', num: '2', icon: '📝',
      title: 'تنفيذ خطة التحسين',
      desc: 'جدول متابعة الإجراءات المنفذة جاهز للتوثيق',
      fn: downloadDoc2,
    },
    {
      key: 'doc3', num: '3', icon: '📊',
      title: 'تقرير واقع المدرسة',
      desc: 'تحليل SWOT والأولويات العاجلة ومؤشرات الأداء',
      fn: downloadDoc3,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`.body-font{font-family:'IBM Plex Sans Arabic','Tajawal',sans-serif}.upload-zone:hover{border-color:#C28A1F!important;background:#FFF8EC!important}.doc-btn:hover{filter:brightness(1.04)}.doc-btn:disabled{opacity:0.6;cursor:not-allowed}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/forms" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← النماذج</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>بناء خطة التحسين والتنفيذ وواقع المدرسة</p>
              <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>ارفع تقرير التقويم الخارجي — يولّد 3 ملفات رسمية مستقلة</p>
            </div>
          </header>

          <main style={{ padding: '24px 28px', maxWidth: 700, margin: '0 auto' }}>

            {/* Upload / Error step */}
            {(step === 'upload' || step === 'error') && (
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '1.5rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)' }}>
                <div style={{ background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1E40AF', margin: '0 0 8px' }}>📌 لبناء خطة التحسين والتنفيذ وتقرير واقع المدرسة</p>
                  <p className="body-font" style={{ fontSize: 13, color: '#1E3A8A', margin: 0, lineHeight: 1.8 }}>
                    قم برفع آخر تقويم خارجي للمدرسة الصادر من هيئة تقويم التعليم والتدريب، وسيقوم النظام تلقائياً بـ:
                  </p>
                  <ul style={{ margin: '8px 0 0', padding: '0 18px', fontFamily: 'IBM Plex Sans Arabic, sans-serif', fontSize: 13, color: '#1E3A8A', lineHeight: 2 }}>
                    <li>بناء خطة التحسين: استمارة رسمية مملوءة بالمؤشرات الضعيفة وإجراءات التحسين</li>
                    <li>تنفيذ خطة التحسين: جدول متابعة الإجراءات المنفذة جاهز للتوثيق</li>
                    <li>تقرير واقع المدرسة: تحليل SWOT والأولويات العاجلة ومؤشرات الأداء</li>
                  </ul>
                </div>

                <SectionHeader icon="📤" title="ارفع تقرير التقويم الخارجي" />
                <div className="upload-zone"
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${dragOver ? GOLD : file ? '#86EFAC' : 'rgba(11,31,58,0.15)'}`, borderRadius: 14, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#FFF8EC' : file ? '#F0FDF4' : '#FAFAF7', transition: 'all 0.2s', marginBottom: 16 }}>
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                  <div style={{ fontSize: 40, marginBottom: 10 }}>{file ? '✅' : '📁'}</div>
                  {file ? (<>
                    <p style={{ fontSize: 15, fontWeight: 700, color: GREEN, margin: '0 0 4px' }}>{file.name}</p>
                    <p className="body-font" style={{ fontSize: 12, color: '#166534', margin: 0 }}>{(file.size / 1024 / 1024).toFixed(2)} MB · اضغط لتغيير الملف</p>
                  </>) : (<>
                    <p style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: '0 0 6px' }}>اسحب ملف PDF هنا أو اضغط للاختيار</p>
                    <p className="body-font" style={{ fontSize: 13, color: '#8A8270', margin: 0 }}>تقرير التقويم الخارجي من هيئة تقويم التعليم والتدريب</p>
                  </>)}
                </div>

                {error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                    <p className="body-font" style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>⚠️ {error}</p>
                  </div>
                )}

                <button onClick={handleAnalyze} disabled={!file} className="doc-btn"
                  style={{ width: '100%', padding: '16px', fontSize: 17, fontWeight: 800, background: !file ? '#9CA3AF' : `linear-gradient(135deg, #D9A441, ${GOLD})`, color: !file ? '#fff' : NAVY, border: 'none', borderRadius: 14, cursor: !file ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif', boxShadow: !file ? 'none' : '0 6px 20px rgba(194,138,31,0.30)', transition: 'all 0.2s' }}>
                  📄 تحليل التقرير واستخراج البيانات ←
                </button>
              </div>
            )}

            {/* Analyzing step */}
            {step === 'analyzing' && (
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '3rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)', textAlign: 'center' }}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(11,31,58,0.08)" strokeWidth="7" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke={GOLD} strokeWidth="7"
                      strokeLinecap="round" strokeDasharray="70 145"
                      style={{ transformOrigin: '40px 40px', animation: 'spin 1.2s linear infinite' }} />
                    <text x="40" y="47" textAnchor="middle" fontSize="24" fill={NAVY}>📄</text>
                  </svg>
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>{progress}</p>
                <p className="body-font" style={{ fontSize: 13, color: '#8A8270', margin: '0 0 20px' }}>يعالج النظام التقرير ويستخرج البيانات</p>
                <div style={{ background: 'rgba(11,31,58,0.04)', borderRadius: 10, padding: '12px 16px' }}>
                  <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>قد يستغرق 30-60 ثانية</p>
                </div>
              </div>
            )}

            {/* Ready step - show indicators summary + 3 separate download buttons */}
            {step === 'ready' && result && (
              <>
                {/* Summary */}
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '1.5rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)', marginBottom: 16 }}>
                  <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 12, padding: '14px 18px', marginBottom: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: GREEN, margin: '0 0 4px' }}>✅ اكتمل التحليل — {result.school_name}</p>
                    <p className="body-font" style={{ fontSize: 13, color: '#166534', margin: 0 }}>تم اكتشاف {result.weak_indicators.length} مؤشر يحتاج تحسين · حمّل كل ملف بشكل مستقل</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                    {[
                      { label: 'الأداء العام', value: result.overall_level },
                      { label: 'الإدارة', value: result.domain_admin },
                      { label: 'التعليم والتعلم', value: result.domain_teaching },
                      { label: 'نواتج التعلم', value: result.domain_outcomes },
                      { label: 'البيئة المدرسية', value: result.domain_env },
                      { label: 'مؤشرات ضعيفة', value: `${result.weak_indicators.length}` },
                    ].map(item => (
                      <div key={item.label} style={{ background: '#F8F7F4', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                        <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: '0 0 3px' }}>{item.label}</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: 0 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <SectionHeader icon="⚠️" title={`المؤشرات الضعيفة (${result.weak_indicators.length} مؤشر)`} />
                  <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid rgba(11,31,58,0.08)', borderRadius: 10 }}>
                    {result.weak_indicators.map((ind, i) => (
                      <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(11,31,58,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: i % 2 === 0 ? '#fff' : '#FAFAF7' }}>
                        <div>
                          <span className="body-font" style={{ fontSize: 11, color: '#8A8270', display: 'block' }}>{ind.id} · {ind.domain}</span>
                          <span style={{ fontSize: 13, color: NAVY }}>{ind.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="body-font" style={{ fontSize: 11, color: '#8A8270' }}>{ind.level}</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: ind.score < 50 ? '#DC2626' : '#D97706', background: ind.score < 50 ? '#FEF2F2' : '#FFFBEB', padding: '2px 10px', borderRadius: 20 }}>{ind.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 separate download cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {DOCS.map(doc => {
                    const st = docStatus[doc.key]
                    return (
                      <div key={doc.key} style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${st === 'done' ? '#86EFAC' : 'rgba(11,31,58,0.08)'}`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(11,31,58,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: st === 'done' ? '#F0FDF4' : 'rgba(11,31,58,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                            {st === 'done' ? '✅' : doc.icon}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: '0 0 3px' }}>({doc.num}) {doc.title}</p>
                            <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>{doc.desc}</p>
                          </div>
                        </div>
                        <button onClick={doc.fn} disabled={st === 'generating'} className="doc-btn"
                          style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, background: st === 'done' ? '#F0FDF4' : st === 'generating' ? '#F3F4F6' : `linear-gradient(135deg, #D9A441, ${GOLD})`, color: st === 'done' ? GREEN : st === 'generating' ? '#9CA3AF' : NAVY, border: st === 'done' ? `1.5px solid #86EFAC` : 'none', borderRadius: 10, cursor: st === 'generating' ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, boxShadow: st === 'idle' ? '0 3px 10px rgba(194,138,31,0.25)' : 'none', transition: 'all 0.2s' }}>
                          {st === 'generating' && (
                            <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 1s linear infinite' }}>
                              <circle cx="8" cy="8" r="6" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="12 26" />
                            </svg>
                          )}
                          {st === 'done' ? 'تم التحميل ✓' : st === 'generating' ? 'جاري التوليد...' : '⬇️ تحميل'}
                        </button>
                      </div>
                    )
                  })}
                </div>

                <button onClick={() => { setStep('upload'); setFile(null); setResult(null); setDocStatus({ doc1: 'idle', doc2: 'idle', doc3: 'idle' }) }}
                  style={{ width: '100%', padding: '14px', fontSize: 14, fontWeight: 700, background: 'rgba(11,31,58,0.06)', color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                  🔄 تحليل تقرير آخر
                </button>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
