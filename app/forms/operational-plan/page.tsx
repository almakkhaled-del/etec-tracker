'use client'
import { useState } from 'react'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const CREAM = '#FBF8F2'
const GREEN_DARK = '#1F5C2E'
const GREEN_LIGHT = '#D9EAD3'

export default function OperationalPlanPage() {
  const { school } = useSchool()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [schoolName, setSchoolName] = useState('')
  const [principalName, setPrincipalName] = useState('')
  const [region, setRegion] = useState('')
  const [district, setDistrict] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState('')

  // Auto-fill from school data
  useState(() => {
    if (school) {
      setSchoolName(school.name || '')
      setPrincipalName(school.principal_name || '')
    }
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setError('')
    } else {
      setError('يرجى رفع ملف PDF فقط')
    }
  }

  async function handleGenerate() {
    if (!pdfFile) { setError('يرجى رفع تقرير التقويم الخارجي PDF'); return }
    if (!schoolName) { setError('يرجى إدخال اسم المدرسة'); return }
    if (!principalName) { setError('يرجى إدخال اسم المدير'); return }

    setLoading(true)
    setError('')
    setStatusMsg('جاري قراءة تقرير التقويم...')

    try {
      // Convert PDF to base64
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res((r.result as string).split(',')[1])
        r.onerror = () => rej(new Error('فشل قراءة الملف'))
        r.readAsDataURL(pdfFile)
      })

      setStatusMsg('يحلل النظام التقرير ويستخرج نقاط القوة والضعف...')

      const response = await fetch('/api/generate-operational-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, schoolName, principalName, region, district })
      })

      if (!response.ok) throw new Error('فشل توليد الخطة')

      setStatusMsg('جاري بناء ملف Word الخطة التشغيلية...')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `الخطة التشغيلية - ${schoolName}.docx`
      a.click()
      URL.revokeObjectURL(url)
      setStatusMsg('✅ تم توليد الخطة التشغيلية بنجاح!')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التوليد')
      setStatusMsg('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <header style={{
            background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)',
            padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14,
            position: 'sticky', top: 0, zIndex: 50
          }}>
            <Link href="/forms" style={{
              display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
              background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px',
              fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif'
            }}>← النماذج</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>الخطة التشغيلية الذكية</p>
              <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                يحلل تقرير التقويم ويبني خطة تشغيلية كاملة تلقائياً
              </p>
            </div>
          </header>

          <main style={{ padding: '28px', maxWidth: 700, margin: '0 auto' }}>

            {/* Description box */}
            <div style={{
              background: `linear-gradient(135deg, ${GREEN_DARK}, #2d7a3f)`,
              borderRadius: 16, padding: '20px 22px', marginBottom: 24, color: '#fff'
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>📊 كيف تعمل الخطة الذكية؟</p>
              <div style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 2 }}>
                <p style={{ margin: '0 0 4px' }}>📥 ارفع تقرير التقويم الخارجي PDF من هيئة تقويم التعليم</p>
                <p style={{ margin: '0 0 4px' }}>🔍 يحلل النظام المؤشرات تلقائياً ويستخرج:</p>
                <p style={{ margin: '0 0 4px', paddingRight: 16 }}>• <strong>نقاط القوة</strong> — المؤشرات التي حصلت على مستوى متميز</p>
                <p style={{ margin: '0 0 4px', paddingRight: 16 }}>• <strong>نقاط الضعف</strong> — المؤشرات في مستوى تهيئة أو انطلاق</p>
                <p style={{ margin: '0 0 4px' }}>📋 يبني خطة تشغيلية كاملة بـ 10 أهداف وبرامج مخصصة لواقع مدرستك</p>
                <p style={{ margin: 0 }}>📄 ينتج ملف Word عرضي جاهز للطباعة والاعتماد</p>
              </div>
            </div>

            {/* Form */}
            <div style={{
              background: '#fff', borderRadius: 18,
              border: '1px solid rgba(11,31,58,0.07)',
              padding: '1.6rem 1.8rem',
              boxShadow: '0 4px 16px rgba(11,31,58,0.06)'
            }}>

              {/* PDF Upload */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
                  📄 تقرير التقويم الخارجي *
                </label>
                <div
                  onClick={() => document.getElementById('pdf-input')?.click()}
                  style={{
                    border: `2px dashed ${pdfFile ? GREEN_DARK : 'rgba(11,31,58,0.2)'}`,
                    borderRadius: 12, padding: '24px 20px', textAlign: 'center',
                    cursor: 'pointer', background: pdfFile ? '#f0fdf4' : '#FAFAF7',
                    transition: 'all 0.2s'
                  }}
                >
                  <input id="pdf-input" type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                  {pdfFile ? (
                    <>
                      <p style={{ fontSize: 24, margin: '0 0 8px' }}>✅</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: GREEN_DARK, margin: '0 0 4px' }}>{pdfFile.name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>اضغط للتغيير</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 32, margin: '0 0 8px' }}>📥</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: '0 0 4px' }}>ارفع تقرير التقويم الخارجي</p>
                      <p style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>PDF فقط • تقرير هيئة تقويم التعليم (إتقان)</p>
                    </>
                  )}
                </div>
              </div>

              {/* School info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <Field label="اسم المدرسة *" value={schoolName} onChange={setSchoolName} placeholder="ابتدائية ..." />
                <Field label="اسم مدير المدرسة *" value={principalName} onChange={setPrincipalName} placeholder="الاسم الكامل" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <Field label="إدارة التعليم" value={region} onChange={setRegion} placeholder="إدارة تعليم الرياض" />
                <Field label="مكتب التعليم" value={district} onChange={setDistrict} placeholder="مكتب تعليم ..." />
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>⚠️ {error}</p>
                </div>
              )}

              {/* Status */}
              {statusMsg && !error && (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: GREEN_DARK, margin: 0, fontWeight: 600 }}>
                    {statusMsg.startsWith('✅') ? statusMsg : `⏳ ${statusMsg}`}
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  width: '100%', padding: '16px', fontSize: 16, fontWeight: 800,
                  background: loading ? '#9CA3AF' : `linear-gradient(135deg, #2d7a3f, ${GREEN_DARK})`,
                  color: '#fff', border: 'none', borderRadius: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Tajawal, sans-serif',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(31,92,46,0.30)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? '⏳ جاري بناء الخطة...' : '📊 توليد الخطة التشغيلية ←'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0B1F3A', marginBottom: 5, fontFamily: 'Tajawal, sans-serif' }}>
        {label}
      </label>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px', border: '1.5px solid rgba(11,31,58,0.12)',
          borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          boxSizing: 'border-box', background: '#FAFAF7', color: '#0B1F3A', direction: 'rtl',
          outline: 'none'
        }}
      />
    </div>
  )
}
