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

type Step = 'upload' | 'analyzing' | 'done' | 'error'

interface Priority { level: string; justification: string }
interface WeakIndicator {
  id: string; name: string; domain: string; score: number; level: string
  need: string; actions: string; methods: string; duration: string; responsible: string
}
interface AnalysisResult {
  school_name: string; principal_name: string; grade: string; gender: string
  ministry_number: string; building_type: string; independence: string
  period: string; admin_independence: string; scope: string; phone: string
  overall_level: string; outcomes_level: string; report_date: string
  domain_admin: string; domain_teaching: string; domain_outcomes: string; domain_env: string
  swot_strengths: string; swot_weaknesses: string; swot_opportunities: string
  swot_challenges: string; swot_solutions: string
  priority_admin: Priority; priority_guidance: Priority; priority_activities: Priority
  priority_outcomes: Priority; priority_teaching: Priority
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
      setProgress('يحلل الذكاء الاصطناعي التقرير...')
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
      setProgress('جاري توليد الملفات...')
      await generateDocuments(parsed)
      setStep('done')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع')
      setStep('error')
    }
  }

  async function generateDocuments(d: AnalysisResult) {
    const [
      { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
        WidthType, AlignmentType, BorderStyle, ShadingType, PageOrientation },
      { default: JSZip },
      { saveAs }
    ] = await Promise.all([import('docx'), import('jszip'), import('file-saver')])

    const B = { style: BorderStyle.SINGLE, size: 4, color: '999999' }
    const borders = { top: B, bottom: B, left: B, right: B, insideHorizontal: B, insideVertical: B }

    const p = (text: string, bold = false, size = 22, color = '000000', center = false) =>
      new Paragraph({
        bidirectional: true,
        alignment: center ? AlignmentType.CENTER : AlignmentType.RIGHT,
        children: [new TextRun({ text, bold, size, color, font: 'Sakkal Majalla' })]
      })

    const hCell = (text: string) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: '1F3864' }, borders,
      children: [p(text, true, 20, 'FFFFFF', true)]
    })

    const gCell = (text: string) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: 'E2EFDA' }, borders,
      children: [p(text, true, 20, '1F3864')]
    })

    const dCell = (text: string, bold = false) => new TableCell({
      borders, children: [p(text || '—', bold, 20)]
    })

    const title = (text: string) => new Paragraph({
      bidirectional: true, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 30, color: '1F3864', font: 'Sakkal Majalla' })]
    })

    const section = (text: string) => new Paragraph({
      bidirectional: true, alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text, bold: true, size: 24, color: '1F3864', font: 'Sakkal Majalla' })]
    })

    const gap = () => new Paragraph({ children: [] })

    const landscapeProps = {
      page: {
        size: { width: 15840, height: 12240, orientation: PageOrientation.LANDSCAPE },
        margin: { top: 720, bottom: 720, left: 900, right: 900 },
        textDirection: 'rtl' as const
      }
    }

    const portraitProps = {
      page: {
        margin: { top: 900, bottom: 900, left: 900, right: 900 },
        textDirection: 'rtl' as const
      }
    }

    // ======= SHARED: Basic Info Table =======
    const basicInfoTable = () => new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [gCell('اسم المدرسة'), dCell(d.school_name, true), gCell('المرحلة'), dCell(d.grade), gCell('جنس المدرسة'), dCell(d.gender)] }),
        new TableRow({ children: [gCell('الرقم الوزاري'), dCell(d.ministry_number), gCell('نوع المبنى'), dCell(d.building_type), gCell('استقلالية المبنى'), dCell(d.independence)] }),
        new TableRow({ children: [gCell('الفترة'), dCell(d.period || 'صباحي'), gCell('استقلالية الإدارة'), dCell(d.admin_independence || 'مستقلة'), gCell('المدرسة المشتركة في الإدارة'), dCell('—')] }),
      ]
    })

    const levelTable = () => new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [gCell('مستوى الأداء العام للمدرسة في التقويم المدرسي'), dCell(d.overall_level), gCell('مستوى المدرسة في نواتج التعلم'), dCell(d.outcomes_level)] })
      ]
    })

    // ======= DOC 1: بناء خطة التحسين =======
    const doc1 = new Document({ sections: [{ properties: landscapeProps, children: [
      title('استمارة المدرسة (1): بناء خطة التحسين في مجالات الممارسات الإشرافية'),
      gap(),
      section('أولاً/ البيانات الأساسية:'),
      gap(),
      basicInfoTable(),
      gap(),
      levelTable(),
      gap(),
      section('ثانياً/ إجراءات خطة التحسين في مجالات الممارسات الإشرافية:'),
      gap(),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [1700, 2000, 2000, 2200, 1800, 1600, 2100],
        rows: [
          new TableRow({ children: [
            hCell('المجال'),
            hCell('العنصر / المكون / العملية المراد تحسينها'),
            hCell('وصف الاحتياج'),
            hCell('إجراءات التحسين'),
            hCell('أساليب وطرق التحسين'),
            hCell('مدة الإنجاز'),
            hCell('التنفيذ والمسؤولية'),
          ]}),
          ...d.weak_indicators.map(ind => new TableRow({ children: [
            dCell(ind.domain),
            dCell(`(${ind.id}) ${ind.name}\n${ind.score}%`),
            dCell(ind.need),
            dCell(ind.actions),
            dCell(ind.methods),
            dCell(ind.duration),
            dCell(ind.responsible),
          ]}))
        ]
      }),
      gap(),
      section('ثالثاً/ التوصيات والمقترحات:'),
      gap(),
      p(d.recommendations),
      gap(), gap(),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [
          gCell('مدير/ة المدرسة'), dCell(d.principal_name || d.school_name),
          gCell('التوقيع'), dCell(''),
          gCell('مقدم/ة خدمات دعم التميز المدرسي'), dCell(''),
          gCell('التوقيع'), dCell(''),
          gCell('الختم'), dCell(''),
        ]})]
      })
    ]}]})

    // ======= DOC 2: تنفيذ خطة التحسين =======
    const doc2 = new Document({ sections: [{ properties: landscapeProps, children: [
      title('استمارة المدرسة (2): تنفيذ خطة التحسين في مجالات الممارسات الإشرافية'),
      gap(),
      section('أولاً/ البيانات الأساسية:'),
      gap(),
      basicInfoTable(),
      gap(),
      section('ثانياً/ إجراءات تنفيذ خطة التحسين في مجالات الممارسات الإشرافية:'),
      gap(),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [1700, 2000, 3500, 2000, 1800, 2400],
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
            dCell(`(${ind.id}) ${ind.name}`),
            dCell(''),
            dCell(ind.methods),
            dCell(''),
            dCell(''),
          ]}))
        ]
      }),
      gap(),
      section('ثالثاً/ التوصيات والمقترحات:'),
      gap(),
      p(''),
      gap(), gap(),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [
          gCell('مدير/ة المدرسة'), dCell(d.principal_name || d.school_name),
          gCell('التوقيع'), dCell(''),
          gCell('مقدم/ة خدمات دعم التميز المدرسي'), dCell(''),
          gCell('التوقيع'), dCell(''),
          gCell('الختم'), dCell(''),
        ]})]
      })
    ]}]})

    // ======= DOC 3: تقرير واقع المدرسة =======
    const doc3 = new Document({ sections: [{ properties: portraitProps, children: [
      title('تقرير واقع المدرسة'),
      gap(),
      section('البيانات الأساسية:'),
      gap(),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [gCell('اسم المدرسة'), dCell(d.school_name, true), gCell('الرقم الوزاري'), dCell(d.ministry_number)] }),
          new TableRow({ children: [gCell('المرحلة الدراسية'), dCell(d.grade), gCell('الجنس'), dCell(d.gender)] }),
          new TableRow({ children: [gCell('النطاق'), dCell(d.scope || ''), gCell('مبنى المدرسة'), dCell(`${d.building_type} / ${d.independence}`)] }),
          new TableRow({ children: [gCell('اسم مدير المدرسة'), dCell(d.principal_name || ''), gCell('رقم الجوال'), dCell(d.phone || '')] }),
        ]
      }),
      gap(),
      section('نتائج التقويم المدرسي (حسب أحدث تقرير صدر للمدرسة في منصة تميز الرقمية):'),
      gap(),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [gCell('نوع تقرير التقويم المدرسي'), dCell('خارجي ✓'), gCell('تاريخ التقرير'), dCell(d.report_date || '')] }),
          new TableRow({ children: [gCell('متوسط الأداء العام'), dCell(d.overall_level), gCell(''), dCell('')] }),
          new TableRow({ children: [gCell('الإدارة المدرسية'), dCell(d.domain_admin), gCell('التعليم والتعلم'), dCell(d.domain_teaching)] }),
          new TableRow({ children: [gCell('نواتج التعلم'), dCell(d.domain_outcomes), gCell('البيئة المدرسية'), dCell(d.domain_env)] }),
        ]
      }),
      gap(),
      section('تحليل الواقع للمدرسة المرتبط بالمجالات الأساسية:'),
      gap(),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [gCell('نقاط القوة'), dCell(d.swot_strengths)] }),
          new TableRow({ children: [gCell('نقاط الضعف'), dCell(d.swot_weaknesses)] }),
          new TableRow({ children: [gCell('الفرص'), dCell(d.swot_opportunities)] }),
          new TableRow({ children: [gCell('التحديات'), dCell(d.swot_challenges)] }),
          new TableRow({ children: [gCell('آلية معالجة نقاط الضعف'), dCell(d.swot_solutions)] }),
        ]
      }),
      gap(),
      section('الأولويات العاجلة للتحسين في المدرسة وفق المجالات الأساسية:'),
      gap(),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [2500, 2000, 7740],
        rows: [
          new TableRow({ children: [hCell('المجال'), hCell('الأولوية'), hCell('مبررات تحديد مستوى الأولوية')] }),
          ...[
            { label: 'الإدارة المدرسية', p: d.priority_admin },
            { label: 'التوجيه الطلابي', p: d.priority_guidance },
            { label: 'الأنشطة المدرسية', p: d.priority_activities },
            { label: 'نواتج التعلم', p: d.priority_outcomes },
            { label: 'التدريس', p: d.priority_teaching },
          ].map(item => new TableRow({ children: [
            dCell(item.label),
            dCell(item.p?.level || '', true),
            dCell(item.p?.justification || ''),
          ]}))
        ]
      }),
    ]}]})

    const zip = new JSZip()
    const [b1, b2, b3] = await Promise.all([Packer.toBlob(doc1), Packer.toBlob(doc2), Packer.toBlob(doc3)])
    zip.file(`(1) بناء خطة التحسين - ${d.school_name}.docx`, b1)
    zip.file(`(2) تنفيذ خطة التحسين - ${d.school_name}.docx`, b2)
    zip.file(`(3) تقرير واقع المدرسة - ${d.school_name}.docx`, b3)
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `خطة التحسين - ${d.school_name}.zip`)
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`.body-font{font-family:'IBM Plex Sans Arabic','Tajawal',sans-serif}.upload-zone:hover{border-color:#C28A1F!important;background:#FFF8EC!important}.gen-btn:hover{filter:brightness(1.05)}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/forms" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← النماذج</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>🤖 المساعد الذكي — خطة التحسين</p>
              <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>ارفع تقرير ETEC — يولّد 3 ملفات رسمية جاهزة</p>
            </div>
          </header>

          <main style={{ padding: '24px 28px', maxWidth: 700, margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg, #0B1F3A, #14284a)', borderRadius: 16, padding: '18px 22px', marginBottom: 24, color: '#fff' }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 10px' }}>📄 سيتم توليد 3 ملفات رسمية تلقائياً:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { n: '1', t: 'بناء خطة التحسين', d: 'استمارة رسمية حسب نموذج الهيئة' },
                  { n: '2', t: 'تنفيذ خطة التحسين', d: 'جدول المتابعة والإجراءات المنفذة' },
                  { n: '3', t: 'تقرير واقع المدرسة', d: 'SWOT + الأولويات + النتائج' },
                ].map(item => (
                  <div key={item.n} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>({item.n}) {item.t}</p>
                    <p className="body-font" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{item.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '1.5rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)' }}>

              {(step === 'upload' || step === 'error') && (<>
                <div style={{ background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1E40AF', margin: '0 0 8px' }}>📌 لبناء خطة التحسين والتنفيذ وتقرير واقع المدرسة</p>
                  <p className="body-font" style={{ fontSize: 13, color: '#1E3A8A', margin: 0, lineHeight: 1.8 }}>
                    قم برفع آخر تقويم خارجي للمدرسة الصادر من هيئة تقويم التعليم والتدريب — سيقوم الذكاء الاصطناعي بتحليله وملء النماذج الرسمية الثلاثة تلقائياً.
                  </p>
                </div>

                <SectionHeader icon="📤" title="ارفع تقرير التقويم الخارجي" />
                <div className="upload-zone" onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()}
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
                {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}><p className="body-font" style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>⚠️ {error}</p></div>}
                <button onClick={handleAnalyze} disabled={!file} className="gen-btn"
                  style={{ width: '100%', padding: '16px', fontSize: 17, fontWeight: 800, background: !file ? '#9CA3AF' : `linear-gradient(135deg, #D9A441, ${GOLD})`, color: !file ? '#fff' : NAVY, border: 'none', borderRadius: 14, cursor: !file ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif', boxShadow: !file ? 'none' : '0 6px 20px rgba(194,138,31,0.30)', transition: 'all 0.2s' }}>
                  🤖 تحليل التقرير وتوليد الملفات ←
                </button>
              </>)}

              {step === 'analyzing' && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 56, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>🤖</div>
                  <p style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>{progress}</p>
                  <p className="body-font" style={{ fontSize: 13, color: '#8A8270', margin: '0 0 24px' }}>يقرأ الذكاء الاصطناعي التقرير ويملأ النماذج الرسمية</p>
                  <div style={{ background: 'rgba(11,31,58,0.05)', borderRadius: 10, padding: '12px 16px' }}>
                    <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>قد يستغرق 30-60 ثانية</p>
                  </div>
                </div>
              )}

              {step === 'done' && result && (
                <div>
                  <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 14, padding: '20px', marginBottom: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: GREEN, margin: '0 0 6px' }}>✅ تم التوليد بنجاح!</p>
                    <p className="body-font" style={{ fontSize: 13, color: '#166534', margin: '0 0 4px' }}>تم تحميل 3 ملفات Word رسمية في ملف ZIP</p>
                    <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>خطة التحسين - {result.school_name}.zip</p>
                  </div>

                  <SectionHeader icon="📊" title="ملخص التحليل" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {[
                      { label: 'الأداء العام', value: result.overall_level },
                      { label: 'الإدارة المدرسية', value: result.domain_admin },
                      { label: 'التعليم والتعلم', value: result.domain_teaching },
                      { label: 'نواتج التعلم', value: result.domain_outcomes },
                      { label: 'البيئة المدرسية', value: result.domain_env },
                      { label: 'مؤشرات تحتاج تحسين', value: `${result.weak_indicators.length} مؤشر` },
                    ].map(item => (
                      <div key={item.label} style={{ background: '#F8F7F4', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="body-font" style={{ fontSize: 12, color: '#8A8270' }}>{item.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <SectionHeader icon="⚠️" title={`المؤشرات الضعيفة (${result.weak_indicators.length} مؤشر)`} />
                  <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid rgba(11,31,58,0.08)', borderRadius: 10 }}>
                    {result.weak_indicators.map((ind, i) => (
                      <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(11,31,58,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: i % 2 === 0 ? '#fff' : '#FAFAF7' }}>
                        <div>
                          <span className="body-font" style={{ fontSize: 11, color: '#8A8270', display: 'block' }}>{ind.id} · {ind.domain}</span>
                          <span style={{ fontSize: 13, color: NAVY }}>{ind.name}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: ind.score < 50 ? '#DC2626' : '#D97706', background: ind.score < 50 ? '#FEF2F2' : '#FFFBEB', padding: '2px 10px', borderRadius: 20 }}>{ind.score}%</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => { setStep('upload'); setFile(null); setResult(null) }}
                    style={{ marginTop: 20, width: '100%', padding: '14px', fontSize: 14, fontWeight: 700, background: 'rgba(11,31,58,0.06)', color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                    🔄 تحليل تقرير آخر
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
