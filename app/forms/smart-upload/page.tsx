'use client'
import { useState, useEffect } from 'react'
import { useSchool } from '@/lib/useSchool'
import { supabase } from '@/lib/supabase'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const CREAM = '#F5F8FA'

type Ind = { id: number; code: string; name_ar: string }
type Row = {
  file: File
  name: string
  status: 'pending' | 'classifying' | 'ready' | 'error' | 'uploading' | 'uploaded' | 'failed'
  indicatorId?: number
  suggestedCode?: string
  confidence?: number
  error?: string
}

function fileToBase64(file: File): Promise<{ b64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ b64: (reader.result as string).split(',')[1] || '', mime: file.type || 'application/octet-stream' })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function SmartUploadPage() {
  const { school, isTrial, loading } = useSchool()
  const [indicators, setIndicators] = useState<Ind[]>([])
  const [codeToId, setCodeToId] = useState<Record<string, number>>({})
  const [rows, setRows] = useState<Row[]>([])
  const [phase, setPhase] = useState<'idle' | 'classifying' | 'review' | 'uploading' | 'done'>('idle')
  const [uploadedCount, setUploadedCount] = useState(0)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('indicators').select('id, code, name_ar').order('order_num')
      const inds = (data || []) as Ind[]
      setIndicators(inds)
      const map: Record<string, number> = {}
      inds.forEach(i => { map[i.code] = i.id })
      setCodeToId(map)
    }
    load()
  }, [])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const list = Array.from(files)
    const initial: Row[] = list.map(f => ({ file: f, name: f.name, status: 'pending' }))
    setRows(initial)
    setPhase('classifying')

    for (let i = 0; i < list.length; i++) {
      setRows(prev => prev.map((r, j) => j === i ? { ...r, status: 'classifying' } : r))
      try {
        const { b64, mime } = await fileToBase64(list[i])
        const resp = await fetch('/api/classify-evidence', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileBase64: b64, mimeType: mime, fileName: list[i].name }),
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || 'فشل التصنيف')
        const top = data.suggestions?.[0]
        setRows(prev => prev.map((r, j) => j === i ? {
          ...r, status: 'ready',
          suggestedCode: top?.code, confidence: top?.confidence,
          indicatorId: top?.code ? codeToId[top.code] : undefined,
        } : r))
      } catch (e: any) {
        setRows(prev => prev.map((r, j) => j === i ? { ...r, status: 'error', error: e?.message || 'خطأ' } : r))
      }
    }
    setPhase('review')
  }

  function setRowIndicator(i: number, indicatorId: number) {
    setRows(prev => prev.map((r, j) => j === i ? { ...r, indicatorId } : r))
  }
  function removeRow(i: number) {
    setRows(prev => prev.filter((_, j) => j !== i))
  }

  async function handleUploadAll() {
    if (!school) return
    setPhase('uploading')
    let ok = 0
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      if (!r.indicatorId || r.status === 'uploaded') continue
      setRows(prev => prev.map((x, j) => j === i ? { ...x, status: 'uploading' } : x))
      try {
        const ext = (r.file.name.split('.').pop() || 'bin').toLowerCase()
        const rand = Math.random().toString(36).slice(2, 8)
        const path = `${school.id}/${r.indicatorId}/${Date.now()}-${rand}.${ext}`
        const { error: upErr } = await supabase.storage.from('school-evidences').upload(path, r.file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('school-evidences').getPublicUrl(path)
        const evidence_type = r.file.type.startsWith('image/') ? 'image' : 'pdf'
        const { error: insErr } = await supabase.from('evidences').insert({
          school_id: school.id,
          indicator_id: r.indicatorId,
          title: r.file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          evidence_type,
          file_url: urlData.publicUrl,
          file_name: r.file.name,
          pdf_pages: null,
          evidence_date: null,
        })
        if (insErr) throw insErr
        ok++
        setRows(prev => prev.map((x, j) => j === i ? { ...x, status: 'uploaded' } : x))
      } catch (e: any) {
        setRows(prev => prev.map((x, j) => j === i ? { ...x, status: 'failed', error: e?.message || 'فشل الرفع' } : x))
      }
    }
    setUploadedCount(ok)
    setPhase('done')
  }

  if (!loading && isTrial) {
    return (
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <AppSidebar />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 22, maxWidth: 440, width: '100%', padding: '38px 30px', textAlign: 'center', boxShadow: '0 8px 30px rgba(10,59,88,0.08)' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🔒</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>الرفع الذكي يتطلب الاشتراك</p>
              <p style={{ fontSize: 13.5, color: '#7A8896', margin: '0 0 24px', lineHeight: 2, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>اشترك الآن للوصول الكامل لأدوات المنصة.</p>
              <a href="/subscribe" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '15px', fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, #3E8AB0, ${GOLD})`, color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>⭐ اشترك الآن</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const readyCount = rows.filter(r => r.indicatorId && r.status !== 'uploaded').length
  const cell: React.CSSProperties = { padding: '10px 12px', fontSize: 12.5, borderBottom: '1px solid rgba(10,59,88,0.07)', fontFamily: 'IBM Plex Sans Arabic, sans-serif', verticalAlign: 'middle' }
  const th: React.CSSProperties = { ...cell, fontWeight: 800, color: NAVY, background: '#F1F5F7', textAlign: 'right' }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <header className="page-header" style={{ background: '#fff', borderBottom: '1px solid rgba(10,59,88,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(10,59,88,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← اللوحة</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>الرفع الذكي للشواهد</p>
              <p style={{ fontSize: 12, color: '#7A8896', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>ارفع ملفاتك دفعة واحدة، والنظام يقترح المؤشر المناسب لكل ملف — راجع ثم اعتمد</p>
            </div>
          </header>

          <main className="page-main" style={{ padding: '24px 28px', maxWidth: 1000, margin: '0 auto' }}>

            {(phase === 'idle' || phase === 'classifying') && (
              <div style={{ background: '#fff', border: '2px dashed rgba(31,110,150,0.35)', borderRadius: 16, padding: '32px 22px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📤</div>
                <p style={{ fontSize: 15, fontWeight: 800, color: NAVY, margin: '0 0 6px' }}>اسحب شواهدك هنا أو اخترها (صور / PDF)</p>
                <p style={{ fontSize: 12.5, color: '#7A8896', margin: '0 0 16px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>تقدر ترفع عشرات الملفات دفعة واحدة — النظام يوزّعها على المؤشرات تلقائياً</p>
                <input type="file" multiple accept="image/*,application/pdf" disabled={phase === 'classifying'} onChange={e => handleFiles(e.target.files)} style={{ fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }} />
                {phase === 'classifying' && (
                  <p style={{ fontSize: 13, color: GOLD, margin: '16px 0 0', fontWeight: 700 }}>
                    ⏳ جاري تصنيف الملفات... ({rows.filter(r => r.status === 'ready' || r.status === 'error').length}/{rows.length})
                  </p>
                )}
              </div>
            )}

            {(phase === 'review' || phase === 'uploading' || phase === 'done') && rows.length > 0 && (
              <>
                {phase === 'done' && (
                  <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 14, padding: '16px 18px', marginBottom: 18, textAlign: 'center' }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#15803D', margin: 0 }}>✅ تم رفع {uploadedCount} شاهداً وتوزيعها على مؤشراتها</p>
                    <p style={{ fontSize: 12.5, color: '#166534', margin: '6px 0 0', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>افتح أي مؤشر لرؤية شواهده. تقدر ترفع دفعة جديدة بإعادة تحميل الصفحة.</p>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: NAVY, margin: 0 }}>مراجعة التصنيف ({rows.length} ملف)</p>
                  {phase === 'review' && (
                    <button onClick={handleUploadAll} disabled={readyCount === 0} style={{ padding: '11px 24px', fontSize: 14, fontWeight: 800, background: readyCount === 0 ? '#9CA3AF' : `linear-gradient(135deg, #3E8AB0, ${GOLD})`, color: readyCount === 0 ? '#fff' : NAVY, border: 'none', borderRadius: 10, cursor: readyCount === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                      ✓ اعتماد ورفع ({readyCount})
                    </button>
                  )}
                  {phase === 'uploading' && <span style={{ fontSize: 13, color: GOLD, fontWeight: 700 }}>⏳ جاري الرفع...</span>}
                </div>

                <div style={{ background: '#fff', border: '1px solid rgba(10,59,88,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr><th style={th}>الملف</th><th style={th}>المؤشر (قابل للتعديل)</th><th style={th}>الثقة</th><th style={{ ...th, width: 90 }}>الحالة</th></tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ ...cell, maxWidth: 260 }}>
                            <span title={r.name} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.file.type.startsWith('image/') ? '🖼️ ' : '📄 '}{r.name}
                            </span>
                            {r.error && <span style={{ color: '#DC2626', fontSize: 11 }}>{r.error}</span>}
                          </td>
                          <td style={cell}>
                            {r.status === 'classifying' ? <span style={{ color: GOLD }}>⏳ تصنيف...</span> : (
                              <select value={r.indicatorId ?? ''} onChange={e => setRowIndicator(i, Number(e.target.value))}
                                disabled={phase !== 'review'}
                                style={{ width: '100%', maxWidth: 380, padding: '7px 10px', border: '1.5px solid rgba(10,59,88,0.15)', borderRadius: 8, fontSize: 12, fontFamily: 'IBM Plex Sans Arabic, sans-serif', background: '#F7F9FA', color: NAVY, direction: 'rtl' }}>
                                <option value="">— اختر مؤشراً —</option>
                                {indicators.map(ind => <option key={ind.id} value={ind.id}>{ind.code} — {ind.name_ar.slice(0, 45)}</option>)}
                              </select>
                            )}
                          </td>
                          <td style={cell}>{r.confidence != null ? <span style={{ fontWeight: 700, color: r.confidence >= 90 ? '#16a34a' : r.confidence >= 70 ? '#D97706' : '#DC2626' }}>{r.confidence}%</span> : '—'}</td>
                          <td style={cell}>
                            {r.status === 'uploaded' ? <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ رُفع</span>
                              : r.status === 'uploading' ? <span style={{ color: GOLD }}>⏳</span>
                              : r.status === 'failed' ? <span style={{ color: '#DC2626' }}>✗ فشل</span>
                              : phase === 'review' ? <button onClick={() => removeRow(i)} style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontSize: 12, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>إزالة</button>
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
