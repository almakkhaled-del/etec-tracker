'use client'
import { useState, useEffect } from 'react'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'
// FIXED_GOALS/STAGE_GOALS/buildOperationalPlanDocx انتقلت لملف مشترك
// lib/operationalPlanDocx.ts حتى تُستخدم أيضاً من صفحة "بناء الخطط" الموحّدة
// بدون تكرار — نفس المنطق والمخرجات تماماً، لا تغيير سلوكي هنا.
import { buildOperationalPlanDocx } from '@/lib/operationalPlanDocx'

const NAVY = '#0A3B58'
const GREEN = '#1F5C2E'
const CREAM = '#F5F8FA'

type Step = 'idle' | 'analyzing' | 'building' | 'done' | 'error'

export default function OperationalPlanPage() {
  const { school, isTrial, loading: schoolLoading } = useSchool()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [principalName, setPrincipalName] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState('')

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
    setStep('analyzing'); setError('')

    try {
      // Convert PDF to base64
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res((r.result as string).split(',')[1])
        r.onerror = () => rej(new Error('فشل قراءة الملف'))
        r.readAsDataURL(pdfFile)
      })

      // Call API - returns JSON only
      const response = await fetch('/api/generate-operational-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, principalName })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'خطأ غير معروف' }))
        throw new Error(err.error || 'فشل التحليل')
      }

      const aiData = await response.json()
      const si = aiData.school_info || {}

      const info = {
        schoolName: si.school_name || 'المدرسة',
        principalName,
        region: si.region || '',
        district: si.district || '',
        stage: si.stage || 'ابتدائية'
      }

      setStep('building')
      await buildDocxInBrowser(aiData, info)
      setStep('done')

    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
      setStep('error')
    }
  }

  async function buildDocxInBrowser(aiData: any, info: any) {
    await buildOperationalPlanDocx(aiData, info)
  }

  const statusMap: Record<Step, { msg: string; color: string }> = {
    idle: { msg: '', color: '' },
    analyzing: { msg: '⏳ يحلل النظام التقرير ويستخرج البيانات...', color: GREEN },
    building: { msg: '📄 جاري بناء ملف الخطة التشغيلية...', color: GREEN },
    done: { msg: '✅ تم توليد الخطة التشغيلية بنجاح!', color: GREEN },
    error: { msg: '', color: '' },
  }

  // قفل الباقة المجانية: مولّد الخطة التشغيلية متاح بالاشتراك المدفوع فقط،
  // وبدون هذا الفحص يقدر أي حساب تجريبي يدخل مباشرة برابط الصفحة ويولّدها.
  if (!schoolLoading && isTrial) {
    return (
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <AppSidebar />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 22, maxWidth: 440, width: '100%', padding: '38px 30px', textAlign: 'center', boxShadow: '0 8px 30px rgba(10,59,88,0.08)' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🔒</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>مولّد الخطة التشغيلية يتطلب الاشتراك</p>
              <p style={{ fontSize: 13.5, color: '#7A8896', margin: '0 0 24px', lineHeight: 2, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                هذه الميزة متاحة في الاشتراك المدفوع فقط. اشترك الآن للوصول الكامل.
              </p>
              <a href="https://wa.me/966555826838" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '15px', fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, #3E8AB0, #1F6E96)`, color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', marginBottom: 12 }}>💬 تواصل للاشتراك</button>
              </a>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '12px', fontSize: 13, fontWeight: 600, background: 'rgba(10,59,88,0.06)', color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>← رجوع للوحة</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <header style={{ background: '#fff', borderBottom: '1px solid rgba(10,59,88,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/forms" style={{ textDecoration: 'none', background: 'rgba(10,59,88,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#7A8896' }}>← النماذج</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>الخطة التشغيلية الذكية</p>
              <p style={{ fontSize: 12, color: '#7A8896', margin: 0, fontFamily: 'IBM Plex Sans Arabic' }}>ارفع تقرير التقويم — النظام يبني الخطة كاملة تلقائياً</p>
            </div>
          </header>
          <main style={{ padding: '28px', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ background: `linear-gradient(135deg, ${GREEN}, #2d7a3f)`, borderRadius: 16, padding: '18px 20px', marginBottom: 24, color: '#fff' }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>📊 ما يتضمنه الملف المولّد:</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.88)', lineHeight: 1.9, margin: 0, fontFamily: 'IBM Plex Sans Arabic' }}>
                غلاف رسمي · مقدمة · معلومات عامة · رؤية ورسالة وقيم · الأهداف الاستراتيجية · أهداف المرحلة · لجنة التميز · مصادر الخطة · تحليل SWOT من التقرير · أبرز القضايا · التعريفات · 10 أهداف + 64 برنامج + جداول متابعة · اللجنة الإدارية · الاعتماد · الختام
              </p>
            </div>
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(10,59,88,0.07)', padding: '1.6rem 1.8rem', boxShadow: '0 4px 16px rgba(10,59,88,0.06)' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>📄 تقرير التقويم الخارجي *</label>
                <div onClick={() => document.getElementById('pdf-in')?.click()} style={{ border: `2px dashed ${pdfFile ? GREEN : 'rgba(10,59,88,0.2)'}`, borderRadius: 12, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: pdfFile ? '#f0fdf4' : '#F7F9FA' }}>
                  <input id="pdf-in" type="file" accept=".pdf" onChange={handleFile} style={{ display: 'none' }} />
                  {pdfFile
                    ? <><p style={{ fontSize: 24, margin: '0 0 6px' }}>✅</p><p style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: 0 }}>{pdfFile.name}</p><p style={{ fontSize: 11, color: '#7A8896', margin: '4px 0 0' }}>اضغط للتغيير</p></>
                    : <><p style={{ fontSize: 32, margin: '0 0 6px' }}>📥</p><p style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: '0 0 4px' }}>ارفع تقرير التقويم الخارجي</p><p style={{ fontSize: 12, color: '#7A8896', margin: 0 }}>PDF فقط — تقرير هيئة تقويم التعليم (إتقان)</p></>
                  }
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>👤 اسم مدير المدرسة *</label>
                <input type="text" value={principalName} onChange={e => setPrincipalName(e.target.value)} placeholder="الاسم الكامل"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(10,59,88,0.12)', borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic', boxSizing: 'border-box', background: '#F7F9FA', color: NAVY, direction: 'rtl', outline: 'none' }} />
              </div>
              {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}><p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>⚠️ {error}</p></div>}
              {step !== 'idle' && step !== 'error' && (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: GREEN, margin: 0, fontWeight: 600 }}>{statusMap[step].msg}</p>
                </div>
              )}
              {step === 'done' && (
                <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ fontSize: 12.5, color: '#92400E', margin: 0, fontFamily: 'IBM Plex Sans Arabic', lineHeight: 1.8 }}>
                    ⚠️ بعد التعديل والتأكد من الملف، يرجى حفظه بصيغة PDF (حفظ باسم ← PDF) قبل رفعه كشاهد.
                  </p>
                </div>
              )}
              <button onClick={handleGenerate} disabled={step === 'analyzing' || step === 'building'}
                style={{ width: '100%', padding: 16, fontSize: 16, fontWeight: 800, background: (step === 'analyzing' || step === 'building') ? '#9CA3AF' : `linear-gradient(135deg, #2d7a3f, ${GREEN})`, color: '#fff', border: 'none', borderRadius: 14, cursor: (step === 'analyzing' || step === 'building') ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal', boxShadow: (step === 'analyzing' || step === 'building') ? 'none' : '0 6px 20px rgba(31,92,46,0.30)', transition: 'all 0.2s' }}>
                {(step === 'analyzing' || step === 'building') ? '⏳ جاري بناء الخطة...' : '📊 توليد الخطة التشغيلية ←'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
