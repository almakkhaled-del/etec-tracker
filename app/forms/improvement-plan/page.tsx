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

interface WeakIndicator {
  id: string; name: string; domain: string; score: number; level: string
  need: string; actions: string; methods: string; duration: string; responsible: string
}

interface AnalysisResult {
  school_name: string; principal_name: string; grade: string; gender: string
  ministry_number: string; building_type: string; independence: string
  overall_level: string; outcomes_level: string
  domain_admin: string; domain_teaching: string; domain_outcomes: string; domain_env: string
  swot_strengths: string; swot_weaknesses: string; swot_opportunities: string; swot_challenges: string
  priorities: string; recommendations: string; weak_indicators: WeakIndicator[]
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

      setProgress('يقرأ الذكاء الاصطناعي التقرير ويحلل المؤشرات...')

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
      console.error(err)
      setError(err.message || 'حدث خطأ غير متوقع')
      setStep('error')
    }
  }

  async function generateDocuments(data: AnalysisResult) {
    const [
      { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
        WidthType, AlignmentType, BorderStyle, ShadingType, PageOrientation },
      { default: JSZip },
      { saveAs }
    ] = await Promise.all([
      import('docx'),
      import('jszip'),
      import('file-saver'),
    ])

    function allBorders() {
      const b = { style: BorderStyle.SINGLE, size: 4, color: '999999' }
      return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b }
    }

    const rtlPara = (text: string, bold = false, size = 22, color = '000000') =>
      new Paragraph({
        bidirectional: true, alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text, bold, size, color, font: 'Sakkal Majalla' })]
      })

    const greenCell = (text: string) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: 'C6EFCE' },
      borders: allBorders(),
      children: [new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, size: 20, font: 'Sakkal Majalla' })] })]
    })

    const dataCell = (text: string, bold = false) => new TableCell({
      borders: allBorders(),
      children: [new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT, children: [new TextRun({ text, bold, size: 20, font: 'Sakkal Majalla' })] })]
    })

    const headerRow = (cells: string[]) => new TableRow({
      children: cells.map(t => new TableCell({
        shading: { type: ShadingType.CLEAR, fill: '1F3864' }, borders: allBorders(),
        children: [new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, size: 20, color: 'FFFFFF', font: 'Sakkal Majalla' })] })]
      }))
    })

    const landscapeProps = {
      page: { size: { width: 15840, height: 12240, orientation: PageOrientation.LANDSCAPE }, margin: { top: 720, bottom: 720, left: 720, right: 720 } }
    }

    // ===== DOC 1: بناء خطة التحسين =====
    const doc1 = new Document({ sections: [{ properties: landscapeProps, children: [
      new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'استمارة المدرسة (1): بناء خطة التحسين في مجالات الممارسات الإشرافية', bold: true, size: 28, color: '1F3864', font: 'Sakkal Majalla' })] }),
      new Paragraph({ children: [] }),
      rtlPara('أولاً/ البيانات الأساسية:', true, 24, '1F3864'),
      new Paragraph({ children: [] }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
        new TableRow({ children: [greenCell('اسم المدرسة'), dataCell(data.school_name, true), greenCell('المرحلة'), dataCell(data.grade), greenCell('جنس المدرسة'), dataCell(data.gender)] }),
        new TableRow({ children: [greenCell('الرقم الوزاري'), dataCell(data.ministry_number), greenCell('نوع المبنى'), dataCell(data.building_type), greenCell('استقلالية المبنى'), dataCell(data.independence)] }),
        new TableRow({ children: [greenCell('مستوى الأداء العام'), dataCell(data.overall_level), greenCell('مستوى نواتج التعلم'), dataCell(data.outcomes_level), greenCell(''), dataCell('')] }),
      ]}),
      new Paragraph({ children: [] }),
      rtlPara('ثانياً/ إجراءات خطة التحسين:', true, 24, '1F3864'),
      new Paragraph({ children: [] }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [1800, 2200, 2200, 2200, 1800, 1600, 1600], rows: [
        headerRow(['المجال', 'العنصر / المكون / العملية', 'وصف الاحتياج', 'إجراءات التحسين', 'أساليب وطرق التحسين', 'مدة الإنجاز', 'التنفيذ والمسؤولية']),
        ...data.weak_indicators.map(ind => new TableRow({ children: [
          dataCell(ind.domain), dataCell(`(${ind.id}) ${ind.name} - ${ind.score}%`),
          dataCell(ind.need), dataCell(ind.actions), dataCell(ind.methods), dataCell(ind.duration), dataCell(ind.responsible)
        ]}))
      ]}),
      new Paragraph({ children: [] }),
      rtlPara('ثالثاً/ التوصيات والمقترحات:', true, 24, '1F3864'),
      new Paragraph({ children: [] }),
      rtlPara(data.recommendations),
    ]}]})

    // ===== DOC 2: تنفيذ خطة التحسين =====
    const doc2 = new Document({ sections: [{ properties: landscapeProps, children: [
      new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'استمارة المدرسة (2): تنفيذ خطة التحسين في مجالات الممارسات الإشرافية', bold: true, size: 28, color: '1F3864', font: 'Sakkal Majalla' })] }),
      new Paragraph({ children: [] }),
      rtlPara('أولاً/ البيانات الأساسية:', true, 24, '1F3864'),
      new Paragraph({ children: [] }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
        new TableRow({ children: [greenCell('اسم المدرسة'), dataCell(data.school_name, true), greenCell('المرحلة'), dataCell(data.grade), greenCell('جنس المدرسة'), dataCell(data.gender)] }),
        new TableRow({ children: [greenCell('الرقم الوزاري'), dataCell(data.ministry_number), greenCell('نوع المبنى'), dataCell(data.building_type), greenCell('استقلالية المبنى'), dataCell(data.independence)] }),
      ]}),
      new Paragraph({ children: [] }),
      rtlPara('ثانياً/ إجراءات تنفيذ خطة التحسين:', true, 24, '1F3864'),
      new Paragraph({ children: [] }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [1800, 2200, 3000, 2000, 1500, 2900], rows: [
        headerRow(['المجال', 'العنصر / المكون', 'الإجراءات المنفذة (يكتب وصف الإجراء بدقة ويوم وتاريخ تنفيذه)', 'أساليب وطرق التحسين', 'لجان المدرسة', 'المشرف التربوي']),
        ...data.weak_indicators.map(ind => new TableRow({ children: [
          dataCell(ind.domain), dataCell(`(${ind.id}) ${ind.name}`),
          dataCell(''), dataCell(ind.methods), dataCell(''), dataCell('')
        ]}))
      ]}),
      new Paragraph({ children: [] }),
      rtlPara('ثالثاً/ التوصيات والمقترحات:', true, 24, '1F3864'),
      new Paragraph({ children: [] }), rtlPara(''),
    ]}]})

    // ===== DOC 3: تقرير واقع المدرسة =====
    const doc3 = new Document({ sections: [{ properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } }, children: [
      new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'تقرير واقع المدرسة', bold: true, size: 32, color: '1F3864', font: 'Sakkal Majalla' })] }),
      new Paragraph({ children: [] }),
      rtlPara('البيانات الأساسية:', true, 24, '1F3864'),
      new Paragraph({ children: [] }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
        new TableRow({ children: [greenCell('اسم المدرسة'), dataCell(data.school_name, true), greenCell('الرقم الوزاري'), dataCell(data.ministry_number)] }),
        new TableRow({ children: [greenCell('المرحلة الدراسية'), dataCell(data.grade), greenCell('الجنس'), dataCell(data.gender)] }),
        new TableRow({ children: [greenCell('اسم مدير المدرسة'), dataCell(data.principal_name || ''), greenCell('نوع المبنى'), dataCell(data.building_type)] }),
      ]}),
      new Paragraph({ children: [] }),
      rtlPara('نتائج التقويم المدرسي:', true, 24, '1F3864'),
      new Paragraph({ children: [] }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
        new TableRow({ children: [greenCell('متوسط الأداء العام'), dataCell(data.overall_level), greenCell('مستوى نواتج التعلم'), dataCell(data.outcomes_level)] }),
        new TableRow({ children: [greenCell('الإدارة المدرسية'), dataCell(data.domain_admin), greenCell('التعليم والتعلم'), dataCell(data.domain_teaching)] }),
        new TableRow({ children: [greenCell('نواتج التعلم'), dataCell(data.domain_outcomes), greenCell('البيئة المدرسية'), dataCell(data.domain_env)] }),
      ]}),
      new Paragraph({ children: [] }),
      rtlPara('تحليل الواقع (SWOT):', true, 24, '1F3864'),
      new Paragraph({ children: [] }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
        new TableRow({ children: [greenCell('نقاط القوة'), dataCell(data.swot_strengths), greenCell('الفرص'), dataCell(data.swot_opportunities)] }),
        new TableRow({ children: [greenCell('نقاط الضعف'), dataCell(data.swot_weaknesses), greenCell('التحديات'), dataCell(data.swot_challenges)] }),
      ]}),
      new Paragraph({ children: [] }),
      rtlPara('المؤشرات الضعيفة (أقل من 75%):', true, 24, '1F3864'),
      new Paragraph({ children: [] }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [1500, 4500, 2000, 1500, 2740], rows: [
        headerRow(['رقم المؤشر', 'اسم المؤشر', 'المجال', 'النسبة', 'المستوى']),
        ...data.weak_indicators.map(ind => new TableRow({ children: [
          dataCell(ind.id), dataCell(ind.name), dataCell(ind.domain), dataCell(`${ind.score}%`, true),
          new TableCell({ shading: { type: ShadingType.CLEAR, fill: ind.score < 50 ? 'FFCCCC' : 'FFF2CC' }, borders: allBorders(),
            children: [new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, children: [new TextRun({ text: ind.level, bold: true, size: 20, font: 'Sakkal Majalla' })] })]
          })
        ]}))
      ]}),
    ]}]})

    const zip = new JSZip()
    const [buf1, buf2, buf3] = await Promise.all([Packer.toBlob(doc1), Packer.toBlob(doc2), Packer.toBlob(doc3)])
    zip.file(`(1) بناء خطة التحسين - ${data.school_name}.docx`, buf1)
    zip.file(`(2) تنفيذ خطة التحسين - ${data.school_name}.docx`, buf2)
    zip.file(`(3) تقرير واقع المدرسة - ${data.school_name}.docx`, buf3)
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `خطة التحسين - ${data.school_name}.zip`)
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
              <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>ارفع تقرير ETEC — يولّد الذكاء 3 ملفات جاهزة</p>
            </div>
          </header>

          <main style={{ padding: '24px 28px', maxWidth: 700, margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg, #0B1F3A, #14284a)', borderRadius: 16, padding: '18px 22px', marginBottom: 24, color: '#fff' }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 10px' }}>📄 سيتم توليد 3 ملفات تلقائياً:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[{n:'1',t:'بناء خطة التحسين',d:'الاستمارة الرسمية مملوءة بالمؤشرات الضعيفة'},{n:'2',t:'تنفيذ خطة التحسين',d:'جدول المتابعة والإجراءات المنفذة'},{n:'3',t:'تقرير واقع المدرسة',d:'SWOT + الأولويات + المؤشرات'}].map(item => (
                  <div key={item.n} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>📋</div>
                    <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>({item.n}) {item.t}</p>
                    <p className="body-font" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{item.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '1.5rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)' }}>

              {(step === 'upload' || step === 'error') && (<>
                {/* شرح الملفات الثلاثة */}
                <div style={{ background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1E40AF', margin: '0 0 10px' }}>📌 لبناء خطة التحسين والتنفيذ وتقرير واقع المدرسة</p>
                  <p className="body-font" style={{ fontSize: 13, color: '#1E3A8A', margin: '0 0 8px', lineHeight: 1.8 }}>
                    قم برفع آخر تقويم خارجي للمدرسة الصادر من هيئة تقويم التعليم والتدريب (إتقان)، وسيقوم الذكاء الاصطناعي تلقائياً بـ:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { n: '1', t: 'بناء خطة التحسين', d: 'استمارة رسمية مملوءة بالمؤشرات الضعيفة وإجراءات التحسين' },
                      { n: '2', t: 'تنفيذ خطة التحسين', d: 'جدول متابعة الإجراءات المنفذة جاهز للتوثيق' },
                      { n: '3', t: 'تقرير واقع المدرسة', d: 'تحليل SWOT والأولويات العاجلة ومؤشرات الأداء' },
                    ].map(item => (
                      <div key={item.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ background: '#1E40AF', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{item.n}</span>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A' }}>{item.t}: </span>
                          <span className="body-font" style={{ fontSize: 12, color: '#3B82F6' }}>{item.d}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <SectionHeader icon="📤" title="ارفع تقرير التقويم الخارجي" />
                <div className="upload-zone" onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop} onClick={()=>fileRef.current?.click()}
                  style={{ border:`2px dashed ${dragOver?GOLD:file?'#86EFAC':'rgba(11,31,58,0.15)'}`, borderRadius:14, padding:'40px 20px', textAlign:'center', cursor:'pointer', background:dragOver?'#FFF8EC':file?'#F0FDF4':'#FAFAF7', transition:'all 0.2s', marginBottom:16 }}>
                  <input ref={fileRef} type="file" accept=".pdf" style={{display:'none'}} onChange={handleFileChange} />
                  <div style={{fontSize:40,marginBottom:10}}>{file?'✅':'📁'}</div>
                  {file ? (<>
                    <p style={{fontSize:15,fontWeight:700,color:GREEN,margin:'0 0 4px'}}>{file.name}</p>
                    <p className="body-font" style={{fontSize:12,color:'#166534',margin:0}}>{(file.size/1024/1024).toFixed(2)} MB · اضغط لتغيير الملف</p>
                  </>) : (<>
                    <p style={{fontSize:15,fontWeight:600,color:NAVY,margin:'0 0 6px'}}>اسحب ملف PDF هنا أو اضغط للاختيار</p>
                    <p className="body-font" style={{fontSize:13,color:'#8A8270',margin:0}}>تقرير التقويم الخارجي من هيئة تقويم التعليم والتدريب</p>
                  </>)}
                </div>
                {error && <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:10,padding:'12px 16px',marginBottom:16}}><p className="body-font" style={{fontSize:13,color:'#DC2626',margin:0}}>⚠️ {error}</p></div>}
                <button onClick={handleAnalyze} disabled={!file} className="gen-btn"
                  style={{ width:'100%',padding:'16px',fontSize:17,fontWeight:800,background:!file?'#9CA3AF':`linear-gradient(135deg,#D9A441,${GOLD})`,color:!file?'#fff':NAVY,border:'none',borderRadius:14,cursor:!file?'not-allowed':'pointer',fontFamily:'Tajawal,sans-serif',boxShadow:!file?'none':'0 6px 20px rgba(194,138,31,0.30)',transition:'all 0.2s' }}>
                  🤖 تحليل التقرير وتوليد الملفات ←
                </button>
              </>)}

              {step === 'analyzing' && (
                <div style={{textAlign:'center',padding:'40px 20px'}}>
                  <div style={{fontSize:56,marginBottom:16,animation:'pulse 1.5s infinite'}}>🤖</div>
                  <p style={{fontSize:17,fontWeight:700,color:NAVY,margin:'0 0 8px'}}>{progress}</p>
                  <p className="body-font" style={{fontSize:13,color:'#8A8270',margin:'0 0 24px'}}>يقرأ الذكاء الاصطناعي التقرير ويستخرج المؤشرات الضعيفة تلقائياً</p>
                  <div style={{background:'rgba(11,31,58,0.05)',borderRadius:10,padding:'12px 16px'}}>
                    <p className="body-font" style={{fontSize:12,color:'#8A8270',margin:0}}>هذا قد يستغرق 30-60 ثانية حسب حجم التقرير</p>
                  </div>
                </div>
              )}

              {step === 'done' && result && (
                <div>
                  <div style={{background:'#F0FDF4',border:'1.5px solid #86EFAC',borderRadius:14,padding:'20px',marginBottom:20,textAlign:'center'}}>
                    <p style={{fontSize:18,fontWeight:800,color:GREEN,margin:'0 0 6px'}}>✅ تم التوليد بنجاح!</p>
                    <p className="body-font" style={{fontSize:13,color:'#166534',margin:'0 0 4px'}}>تم تحميل ملف ZIP يحتوي على 3 ملفات Word جاهزة</p>
                    <p className="body-font" style={{fontSize:12,color:'#8A8270',margin:0}}>خطة التحسين - {result.school_name}.zip</p>
                  </div>
                  <SectionHeader icon="📊" title="ملخص التحليل" />
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                    {[{label:'الأداء العام',value:result.overall_level},{label:'الإدارة المدرسية',value:result.domain_admin},{label:'التعليم والتعلم',value:result.domain_teaching},{label:'نواتج التعلم',value:result.domain_outcomes},{label:'البيئة المدرسية',value:result.domain_env},{label:'مؤشرات تحتاج تحسين',value:`${result.weak_indicators.length} مؤشر`}].map(item=>(
                      <div key={item.label} style={{background:'#F8F7F4',borderRadius:10,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span className="body-font" style={{fontSize:12,color:'#8A8270'}}>{item.label}</span>
                        <span style={{fontSize:13,fontWeight:700,color:NAVY}}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <SectionHeader icon="⚠️" title={`المؤشرات الضعيفة (${result.weak_indicators.length} مؤشر)`} />
                  <div style={{maxHeight:300,overflowY:'auto',border:'1px solid rgba(11,31,58,0.08)',borderRadius:10}}>
                    {result.weak_indicators.map((ind,i)=>(
                      <div key={i} style={{padding:'10px 14px',borderBottom:'1px solid rgba(11,31,58,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center',background:i%2===0?'#fff':'#FAFAF7'}}>
                        <div>
                          <span className="body-font" style={{fontSize:11,color:'#8A8270',display:'block'}}>{ind.id} · {ind.domain}</span>
                          <span style={{fontSize:13,color:NAVY}}>{ind.name}</span>
                        </div>
                        <span style={{fontSize:13,fontWeight:800,color:ind.score<50?'#DC2626':'#D97706',background:ind.score<50?'#FEF2F2':'#FFFBEB',padding:'2px 10px',borderRadius:20}}>{ind.score}%</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{setStep('upload');setFile(null);setResult(null)}}
                    style={{marginTop:20,width:'100%',padding:'14px',fontSize:14,fontWeight:700,background:'rgba(11,31,58,0.06)',color:NAVY,border:'none',borderRadius:12,cursor:'pointer',fontFamily:'Tajawal,sans-serif'}}>
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
