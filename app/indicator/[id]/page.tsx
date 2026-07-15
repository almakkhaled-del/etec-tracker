'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { getEvidenceGuide } from '@/lib/indicatorEvidenceGuide'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const GOLD_LIGHT = '#7FB3CB'
const CREAM = '#F5F8FA'

type Evidence = {
  id: string; title: string; description: string; evidence_type: string
  file_url: string; file_name: string; evidence_date: string; pdf_pages: string[] | null
}

function IndicatorPageInner() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const isProgram = searchParams.get('src') === 'program'
  const evField = isProgram ? 'program_indicator_id' : 'indicator_id'
  const indicatorsTable = isProgram ? 'program_indicators' : 'indicators'
  const standardsTable = isProgram ? 'program_standards' : 'standards'
  const domainsTable = isProgram ? 'program_domains' : 'domains'
  const linkSuffix = isProgram ? '?src=program' : ''
  const { school, loading: schoolLoading, isTrial, allowedDomains } = useSchool()
  const [indicator, setIndicator] = useState<any>(null)
  const [standard, setStandard] = useState<any>(null)
  const [domain, setDomain] = useState<any>(null)
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pdfJsReady, setPdfJsReady] = useState(false)

  useEffect(() => {
    if ((window as any).pdfjsLib) { setPdfJsReady(true); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      setPdfJsReady(true)
    }
    document.body.appendChild(script)
  }, [])

  async function loadEvidences(schoolId: string) {
    const { data: evs } = await supabase.from('evidences').select('*').eq(evField, Number(id)).eq('school_id', schoolId).order('created_at', { ascending: false })
    setEvidences(evs || [])
  }

  useEffect(() => {
    async function load() {
      const { data: ind } = await supabase.from(indicatorsTable).select('*').eq('id', id).single()
      if (ind) {
        setIndicator(ind)
        const { data: std } = await supabase.from(standardsTable).select('*').eq('id', ind.standard_id).single()
        if (std) {
          setStandard(std)
          const { data: dom } = await supabase.from(domainsTable).select('*').eq('id', std.domain_id).single()
          setDomain(dom)
        }
      }
      setLoading(false)
    }
    load()
  }, [id, isProgram])

  useEffect(() => { if (school) loadEvidences(school.id) }, [school, id, isProgram])

  async function convertPdfToImages(pdfFile: File): Promise<Blob[]> {
    const pdfjsLib = (window as any).pdfjsLib
    const arrayBuffer = await pdfFile.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const images: Blob[] = []
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      setUploadStatus(`جاري تحويل صفحة ${pageNum} من ${pdf.numPages}...`)
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: context, viewport }).promise
      const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.85))
      images.push(blob)
    }
    return images
  }

  function handleFileSelect(selectedFile: File) {
    setFile(selectedFile)
    if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
    setShowForm(true)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) handleFileSelect(dropped)
  }

  async function uploadEvidence() {
    if (!title) { alert('أدخل عنوان الشاهد'); return }
    if (!school) return
    setUploading(true)
    setUploadStatus('جاري التحضير...')
    try {
      let file_url = ''
      let file_name = ''
      let evidence_type = 'text'
      let pdf_pages: string[] | null = null

      if (file) {
        const isPdf = file.type === 'application/pdf'
        if (isPdf && pdfJsReady) {
          const images = await convertPdfToImages(file)
          const uploadedUrls: string[] = []
          for (let i = 0; i < images.length; i++) {
            setUploadStatus(`رفع صفحة ${i + 1} من ${images.length}...`)
            const path = `${school.id}/${id}/${Date.now()}_page${i + 1}.jpg`
            const { error: upErr } = await supabase.storage.from('school-evidences').upload(path, images[i])
            if (upErr) throw upErr
            const { data: urlData } = supabase.storage.from('school-evidences').getPublicUrl(path)
            uploadedUrls.push(urlData.publicUrl)
          }
          pdf_pages = uploadedUrls
          file_url = uploadedUrls[0]
          file_name = file.name
          evidence_type = 'pdf'
        } else {
          const ext = file.name.split('.').pop()
          const path = `${school.id}/${id}/${Date.now()}.${ext}`
          const { error: uploadError } = await supabase.storage.from('school-evidences').upload(path, file)
          if (uploadError) throw uploadError
          const { data: urlData } = supabase.storage.from('school-evidences').getPublicUrl(path)
          file_url = urlData.publicUrl
          file_name = file.name
          evidence_type = file.type.startsWith('image/') ? 'image' : 'pdf'
        }
      }

      setUploadStatus('جاري الحفظ...')
      await supabase.from('evidences').insert({
        school_id: school.id, [evField]: Number(id), title, description, evidence_type,
        file_url, file_name, pdf_pages, evidence_date: date || null,
      })

      setTitle(''); setDescription(''); setDate(''); setFile(null); setShowForm(false)
      if (fileRef.current) fileRef.current.value = ''
      await loadEvidences(school.id)
    } catch (e: any) {
      alert('حدث خطأ: ' + e.message)
    }
    setUploading(false)
    setUploadStatus('')
  }

  async function deleteEvidence(evId: string) {
    if (!confirm('حذف هذا الشاهد؟')) return
    await supabase.from('evidences').delete().eq('id', evId)
    if (school) await loadEvidences(school.id)
  }

  const evidenceGuide = indicator ? getEvidenceGuide(indicator.name_ar) : null

  const status = evidences.length === 0 ? 'فارغ' : evidences.length < 3 ? 'بدأ' : evidences.length < 5 ? 'جيد' : 'ممتاز'
  const statusColor = evidences.length === 0 ? '#DC2626' : evidences.length < 3 ? '#D97706' : evidences.length < 5 ? '#1d4ed8' : '#16a34a'
  const statusBg = evidences.length === 0 ? '#FEF2F2' : evidences.length < 3 ? '#FFFBEB' : evidences.length < 5 ? '#EFF6FF' : '#F0FDF4'

  if (schoolLoading || loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', background: CREAM }}>
      <p style={{ color: '#7A8896' }}>جاري التحميل...</p>
    </div>
  )

  // حماية فعلية ضد تجاوز قفل المجالات بالحساب المجاني: لوحة التحكم تمنع
  // الدخول لمجال مقفول عبر الواجهة فقط، لكن بدون هذا الفحص هنا كان أي حساب
  // تجريبي يقدر يدخل مباشرة برابط /indicator/<id> من مجال غير المسموح
  // ويرفع شواهد بحرية تامة رغم القفل. هذا الفحص يمنع الوصول فعلياً.
  const domainLocked = isTrial && domain && (
    isProgram ? domain.code !== '4' : (allowedDomains != null && !allowedDomains.includes(domain.id))
  )
  if (domainLocked) return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar activeDomainId={domain?.id} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 22, maxWidth: 440, width: '100%', padding: '38px 30px', textAlign: 'center', boxShadow: '0 8px 30px rgba(10,59,88,0.08)' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🔒</div>
            <p style={{ fontSize: 20, fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>هذا المجال يتطلب الاشتراك</p>
            <p style={{ fontSize: 13.5, color: '#7A8896', margin: '0 0 24px', lineHeight: 2, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              الحساب المجاني يتيح مجال "البيئة المدرسية" فقط. اشترك للوصول لبقية المجالات ورفع الشواهد فيها.
            </p>
            <a href="https://wa.me/966555826838" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '15px', fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, #3E8AB0, ${GOLD})`, color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', marginBottom: 12 }}>💬 تواصل للاشتراك</button>
            </a>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '12px', fontSize: 13, fontWeight: 600, background: 'rgba(10,59,88,0.06)', color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>← رجوع للوحة</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif; }
        .ev-card:hover { box-shadow: 0 6px 18px rgba(10,59,88,0.08); }
        .drop-zone { transition: all 0.2s; }
        .drop-zone.over { background: rgba(31,110,150,0.06); border-color: #1F6E96 !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar activeDomainId={domain?.id} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <header style={{
            background: '#fff', borderBottom: '1px solid rgba(10,59,88,0.08)',
            padding: '0 28px', height: 80, display: 'flex', alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 50
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif', flexWrap: 'wrap' }}>
                <Link href="/dashboard" style={{ color: '#7A8896', textDecoration: 'none' }}>الرئيسية</Link>
                <span>←</span>
                <Link href={`/domain/${domain?.id}${linkSuffix}`} style={{ color: '#7A8896', textDecoration: 'none' }}>{domain?.name_ar}</Link>
                <span>←</span>
                <Link href={`/standard/${standard?.id}${linkSuffix}`} style={{ color: '#7A8896', textDecoration: 'none' }}>{standard?.name_ar}</Link>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '4px 0 0', lineHeight: 1.4, maxWidth: 600 }}>{indicator?.name_ar}</p>
            </div>
          </header>

          <main style={{ padding: '32px 28px', maxWidth: 760, margin: '0 auto' }}>

            {/* حالة المؤشر */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <span style={{ fontSize: 11, background: 'rgba(10,59,88,0.06)', color: NAVY, padding: '4px 12px', borderRadius: 8, fontWeight: 600 }}>
                مؤشر {indicator?.code}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: statusBg, color: statusColor }}>
                {status} — {evidences.length} شواهد
              </span>
            </div>

            {/* الشواهد المتوقعة لهذا المؤشر — من دليل هيئة تقويم التعليم والتدريب لأخصائي التقويم المدرسي */}
            {evidenceGuide ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>📋</span>
                  <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0 }}>الشواهد المتوقعة لهذا المؤشر</p>
                </div>
                <p className="body-font" style={{ fontSize: 12, color: '#7A8896', margin: '0 0 14px' }}>
                  وفق الدليل الاسترشادي لأخصائي التقويم المدرسي الصادر عن هيئة تقويم التعليم والتدريب — يوضح ما الذي يفحصه الأخصائي وما الملفات المتوقع رفعها.
                </p>
                <div style={{ display: 'grid', gap: 12 }}>
                  {evidenceGuide.map(para => (
                    <div key={para.n} style={{
                      background: '#fff', border: '1px solid rgba(10,59,88,0.1)', borderRadius: 14,
                      padding: '16px 18px'
                    }}>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, margin: '0 0 10px', lineHeight: 1.7 }}>{para.text}</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div style={{ background: CREAM, borderRadius: 10, padding: '9px 12px' }}>
                          <p className="body-font" style={{ fontSize: 11, fontWeight: 700, color: GOLD, margin: '0 0 3px' }}>المصدر</p>
                          <p className="body-font" style={{ fontSize: 12.5, color: NAVY, margin: 0, lineHeight: 1.6 }}>{para.source}</p>
                        </div>
                        <div style={{ background: CREAM, borderRadius: 10, padding: '9px 12px' }}>
                          <p className="body-font" style={{ fontSize: 11, fontWeight: 700, color: GOLD, margin: '0 0 3px' }}>الوثائق المطلوبة</p>
                          <p className="body-font" style={{ fontSize: 12.5, color: NAVY, margin: 0, lineHeight: 1.6 }}>{para.docs}</p>
                        </div>
                      </div>

                      <p className="body-font" style={{ fontSize: 11, fontWeight: 700, color: GOLD, margin: '0 0 6px' }}>الشواهد المتوقع رفعها</p>
                      <ul style={{ margin: '0 0 10px', paddingRight: 18 }}>
                        {para.evidence.map((ev, i) => (
                          <li key={i} className="body-font" style={{ fontSize: 12.5, color: '#3B4A57', lineHeight: 1.9 }}>{ev}</li>
                        ))}
                      </ul>

                      <div style={{ background: 'rgba(31,110,150,0.06)', borderRadius: 10, padding: '9px 12px' }}>
                        <p className="body-font" style={{ fontSize: 11, fontWeight: 700, color: GOLD, margin: '0 0 3px' }}>معيار التقييم</p>
                        <p className="body-font" style={{ fontSize: 12, color: '#3B4A57', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{para.rubric}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px dashed rgba(10,59,88,0.15)', borderRadius: 14, padding: '14px 18px', marginBottom: 24 }}>
                <p className="body-font" style={{ fontSize: 12.5, color: '#7A8896', margin: 0, lineHeight: 1.8 }}>
                  لا يتوفر حالياً دليل شواهد تفصيلي لهذا المؤشر من هيئة تقويم التعليم والتدريب. ارفع شواهد متنوعة توثّق تحقق المؤشر وفق ممارسات مدرستكم.
                </p>
              </div>
            )}

            {/* منطقة الرفع - Drag & Drop */}
            <div
              className={`drop-zone ${dragOver ? 'over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed rgba(10,59,88,0.18)', borderRadius: 18, padding: '40px 24px',
                textAlign: 'center', cursor: 'pointer', background: '#fff', marginBottom: 24
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 16, background: 'rgba(31,110,150,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28
              }}>
                📎
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 6px' }}>
                اسحب الملف هنا أو اضغط للاختيار
              </p>
              <p className="body-font" style={{ fontSize: 13, color: '#7A8896', margin: 0 }}>
                صورة (JPG, PNG) أو ملف PDF — يدعم الرفع التلقائي بدون ضغط
              </p>
              <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            </div>

            {/* نموذج تفاصيل الشاهد - يظهر بعد اختيار ملف */}
            {showForm && (
              <div style={{ background: '#fff', border: `1.5px solid ${GOLD}`, borderRadius: 16, padding: '20px 22px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '10px 14px', background: 'rgba(31,110,150,0.06)', borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{file?.type === 'application/pdf' ? '📄' : '🖼️'}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: NAVY, margin: 0, flex: 1, wordBreak: 'break-all' }}>{file?.name}</p>
                  <button onClick={() => { setFile(null); setShowForm(false) }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 13, fontFamily: 'Tajawal, sans-serif'
                  }}>إزالة</button>
                </div>

                <label style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6, display: 'block' }}>عنوان الشاهد *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(10,59,88,0.15)', borderRadius: 9, fontSize: 14, marginBottom: 12, fontFamily: 'IBM Plex Sans Arabic, sans-serif', boxSizing: 'border-box' }} />

                <label style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6, display: 'block' }}>وصف مختصر (اختياري)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(10,59,88,0.15)', borderRadius: 9, fontSize: 14, marginBottom: 12, fontFamily: 'IBM Plex Sans Arabic, sans-serif', resize: 'none', boxSizing: 'border-box' }} />

                <label style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6, display: 'block' }}>التاريخ</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(10,59,88,0.15)', borderRadius: 9, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />

                {uploadStatus && (
                  <p className="body-font" style={{ fontSize: 12, color: GOLD, textAlign: 'center', marginBottom: 12 }}>{uploadStatus}</p>
                )}

                <button onClick={uploadEvidence} disabled={uploading} style={{
                  width: '100%', padding: '13px', background: uploading ? '#9ca3af' : `linear-gradient(135deg, #3E8AB0, ${GOLD})`,
                  color: NAVY, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                  cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif'
                }}>
                  {uploading ? 'جاري الرفع...' : 'حفظ الشاهد ✓'}
                </button>
              </div>
            )}

            {/* الشواهد المرفوعة - بطاقات */}
            {evidences.length > 0 && (
              <>
                <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 14 }}>الشواهد المرفوعة ({evidences.length})</p>
                <div style={{ display: 'grid', gap: 12 }}>
                  {evidences.map(ev => (
                    <div key={ev.id} className="ev-card" style={{
                      background: '#fff', border: '1px solid rgba(10,59,88,0.08)', borderRadius: 14,
                      padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow 0.2s'
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: ev.evidence_type === 'image' ? '#F0FDF4' : '#EFF6FF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                      }}>
                        {ev.evidence_type === 'image' ? '🖼️' : ev.evidence_type === 'pdf' ? '📄' : '📝'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: '0 0 2px' }}>{ev.title}</p>
                        <p className="body-font" style={{ fontSize: 12, color: '#7A8896', margin: 0 }}>
                          {ev.pdf_pages?.length ? `${ev.pdf_pages.length} صفحة محوّلة` : ''}
                          {ev.evidence_date ? ` · ${ev.evidence_date}` : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {ev.file_url && (
                          <a href={ev.file_url} target="_blank" rel="noreferrer" style={{
                            fontSize: 12, padding: '7px 14px', background: 'rgba(10,59,88,0.05)', color: NAVY,
                            borderRadius: 8, textDecoration: 'none', fontWeight: 600
                          }}>عرض</a>
                        )}
                        <button onClick={() => deleteEvidence(ev.id)} style={{
                          fontSize: 12, padding: '7px 14px', background: '#FEF2F2', color: '#DC2626',
                          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontFamily: 'Tajawal, sans-serif'
                        }}>حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function IndicatorPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F8FA', fontFamily: 'Tajawal, sans-serif' }}>
        <p style={{ color: '#7A8896' }}>جاري التحميل...</p>
      </div>
    }>
      <IndicatorPageInner />
    </Suspense>
  )
}
