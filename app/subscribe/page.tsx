'use client'
import { useState } from 'react'
import { useSchool } from '@/lib/useSchool'
import { supabase } from '@/lib/supabase'
import { ANNUAL_PLAN } from '@/lib/payment'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const GOLD_LIGHT = '#7FB3CB'
const CREAM = '#F5F8FA'

export default function SubscribePage() {
  const { school, loading: schoolLoading } = useSchool()
  const [busy, setBusy] = useState(false)
  const [notConfigured, setNotConfigured] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    setBusy(true)
    setError('')
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) { setError('يجب تسجيل الدخول أولاً'); setBusy(false); return }

      const res = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.configured && data.url) {
        window.location.href = data.url
        return
      }
      setNotConfigured(true)
    } catch (e: any) {
      setError('تعذّر بدء عملية الدفع. حاول مجدداً أو تواصل معنا مباشرة.')
    }
    setBusy(false)
  }

  if (schoolLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREAM, fontFamily: 'Tajawal, sans-serif' }}>
      <p style={{ color: '#7A8896' }}>جاري التحميل...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>

          <header style={{ background: '#fff', borderBottom: '1px solid rgba(10,59,88,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/account" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(10,59,88,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← حسابي</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>الاشتراك والفوترة</p>
              <p style={{ fontSize: 12, color: '#7A8896', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{school?.name}</p>
            </div>
          </header>

          <main style={{ padding: '28px', maxWidth: 520, margin: '0 auto' }}>

            <div style={{
              background: NAVY, borderRadius: 22, padding: '32px 28px', color: '#fff',
              boxShadow: '0 16px 40px rgba(10,59,88,0.18)', marginBottom: 20
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 10 }}>👑 الباقة {ANNUAL_PLAN.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 44, fontWeight: 900, margin: 0, lineHeight: 1 }}>{ANNUAL_PLAN.amount}</p>
                <p className="body-font" style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{ANNUAL_PLAN.label}</p>
              </div>
              <p className="body-font" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '10px 0 26px', lineHeight: 1.9, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                جميع المجالات الأربعة، رفع ملفات غير محدود، التحليل الذكي لتقرير التقويم الخارجي، ومولّد النماذج الكامل.
              </p>

              <button onClick={handleSubscribe} disabled={busy} style={{
                width: '100%', padding: '15px', fontSize: 15, fontWeight: 800,
                background: busy ? '#9ca3af' : `linear-gradient(135deg, #3E8AB0, ${GOLD})`,
                color: NAVY, border: 'none', borderRadius: 12, cursor: busy ? 'not-allowed' : 'pointer',
                fontFamily: 'Tajawal, sans-serif'
              }}>
                {busy ? 'جاري التحضير...' : '💳 ادفع الآن'}
              </button>

              {error && (
                <p className="body-font" style={{ fontSize: 12.5, color: '#FCA5A5', marginTop: 12, textAlign: 'center' }}>{error}</p>
              )}
            </div>

            {notConfigured && (
              <div style={{ background: '#fff', border: '1px solid rgba(10,59,88,0.08)', borderRadius: 18, padding: '22px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>الدفع الإلكتروني قيد التفعيل حالياً</p>
                <p className="body-font" style={{ fontSize: 13, color: '#7A8896', margin: '0 0 18px', lineHeight: 1.9, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                  نشتغل حالياً على تفعيل بوابة الدفع الإلكتروني. تواصل معنا مباشرة الآن ونفعّل اشتراكك فوراً.
                </p>
                <a href={`https://wa.me/966555826838?text=${encodeURIComponent(`أبي أشترك بالباقة المتكاملة — مدرسة ${school?.name || ''}`)}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 700, background: '#25D366', color: '#fff', border: 'none', borderRadius: 11, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                    💬 تواصل عبر واتساب
                  </button>
                </a>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}
