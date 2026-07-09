'use client'
import { useState, useEffect } from 'react'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0B1F3A'
const GREEN = '#1F5C2E'
const CREAM = '#FBF8F2'

export default function OperationalPlanPage() {
  const { school } = useSchool()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [principalName, setPrincipalName] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (school?.principal_name) setPrincipalName(school.principal_name)
  }, [school])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f?.type === 'application/pdf') { setPdfFile(f); setError('') }
    else setError('يرجى رفع ملف PDF فقط')
  }

  async function handleGenerate() {
    if (!pdfFile) { setError('يرجى رفع تقرير التقويم الخارجي PDF'); return }
    if (!principalName) { setError('يرجى إدخال اسم مدير المدرسة'); return }
    setLoading(true); setError(''); setDone(false)
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res((r.result as string).split(',')[1])
        r.onerror = () => rej(new Error('فشل قراءة الملف'))
        r.readAsDataURL(pdfFile)
      })
      setStatusMsg('يحلل النظام التقرير ويستخرج البيانات...')
      const response = await fetch('/api/generate-operational-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, principalName })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'خطأ غير معروف' }))
        throw new Error(err.error || 'فشل التوليد')
      }
      setStatusMsg('جاري بناء ملف الخطة التشغيلية...')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'الخطة_التشغيلية.docx'; a.click()
      URL.revokeObjectURL(url)
      setDone(true); setStatusMsg('')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التوليد')
      setStatusMsg('')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/forms" style={{ textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270' }}>← النماذج</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>الخطة التشغيلية الذكية</p>
              <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic' }}>ارفع تقرير التقويم — النظام يبني الخطة كاملة تلقائياً</p>
            </div>
          </header>
          <main style={{ padding: '28px', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ background: `linear-gradient(135deg, ${GREEN}, #2d7a3f)`, borderRadius: 16, padding: '18px 20px', marginBottom: 24, color: '#fff' }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>📊 ما يتضمنه الملف المولّد:</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.88)', lineHeight: 1.9, margin: 0, fontFamily: 'IBM Plex Sans Arabic' }}>
                غلاف رسمي · مقدمة · معلومات عامة · رؤية ورسالة وقيم · الأهداف الاستراتيجية · أهداف المرحلة · لجنة التميز · مصادر الخطة · تحليل SWOT من التقرير · أبرز القضايا · التعريفات · 10 أهداف بـ 64 برنامج + جداول متابعة · اللجنة الإدارية · الاعتماد · الختام
              </p>
            </div>
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '1.6rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>📄 تقرير التقويم الخارجي *</label>
                <div onClick={() => document.getElementById('pdf-in')?.click()} style={{ border: `2px dashed ${pdfFile ? GREEN : 'rgba(11,31,58,0.2)'}`, borderRadius: 12, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: pdfFile ? '#f0fdf4' : '#FAFAF7' }}>
                  <input id="pdf-in" type="file" accept=".pdf" onChange={handleFile} style={{ display: 'none' }} />
                  {pdfFile ? (
                    <><p style={{ fontSize: 24, margin: '0 0 6px' }}>✅</p><p style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: 0 }}>{pdfFile.name}</p><p style={{ fontSize: 11, color: '#8A8270', margin: '4px 0 0' }}>اضغط للتغيير</p></>
                  ) : (
                    <><p style={{ fontSize: 32, margin: '0 0 6px' }}>📥</p><p style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: '0 0 4px' }}>ارفع تقرير التقويم الخارجي</p><p style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>PDF فقط — تقرير هيئة تقويم التعليم (إتقان)</p></>
                  )}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>👤 اسم مدير المدرسة *</label>
                <input type="text" value={principalName} onChange={e => setPrincipalName(e.target.value)} placeholder="الاسم الكامل" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(11,31,58,0.12)', borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic', boxSizing: 'border-box', background: '#FAFAF7', color: NAVY, direction: 'rtl', outline: 'none' }} />
              </div>
              {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}><p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>⚠️ {error}</p></div>}
              {statusMsg && <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}><p style={{ fontSize: 13, color: GREEN, margin: 0, fontWeight: 600 }}>⏳ {statusMsg}</p></div>}
              {done && <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '16px', marginBottom: 16, textAlign: 'center' }}><p style={{ fontSize: 15, fontWeight: 700, color: GREEN, margin: 0 }}>✅ تم توليد الخطة التشغيلية بنجاح!</p></div>}
              <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 16, fontSize: 16, fontWeight: 800, background: loading ? '#9CA3AF' : `linear-gradient(135deg, #2d7a3f, ${GREEN})`, color: '#fff', border: 'none', borderRadius: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal', boxShadow: loading ? 'none' : '0 6px 20px rgba(31,92,46,0.30)', transition: 'all 0.2s' }}>
                {loading ? '⏳ جاري بناء الخطة...' : '📊 توليد الخطة التشغيلية ←'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
