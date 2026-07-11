'use client'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'
import FormsGeneratorPage from '@/components/forms-generator/FormsGeneratorPage'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const CREAM = '#FBF8F2'

export default function Page() {
  const { school, isTrial, loading } = useSchool()

  // شاشة قفل المولّد للحساب المجاني
  if (!loading && isTrial) {
    return (
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <AppSidebar />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 22, maxWidth: 440, width: '100%', padding: '38px 30px', textAlign: 'center', boxShadow: '0 8px 30px rgba(11,31,58,0.08)' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🔒</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>مولّد النماذج يتطلب الاشتراك</p>
              <p style={{ fontSize: 13.5, color: '#8A8270', margin: '0 0 24px', lineHeight: 2, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                مولّد الخطة التشغيلية والنماذج التلقائية متاح في الاشتراك المدفوع فقط. اشترك الآن للوصول الكامل.
              </p>
              <a href="https://wa.me/966555826838" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '15px', fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, #D9A441, ${GOLD})`, color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', marginBottom: 12 }}>💬 تواصل للاشتراك</button>
              </a>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '12px', fontSize: 13, fontWeight: 600, background: 'rgba(11,31,58,0.06)', color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>← رجوع للوحة</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FBF8F2', fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>

          <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/forms" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← النماذج</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0B1F3A', margin: '0 0 1px' }}>مولّد النماذج</p>
              <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>اختر النموذج وعبّي بياناته — الملف جاهز بالكامل</p>
            </div>
          </header>

          <FormsGeneratorPage schoolName={school?.name || ''} schoolPrincipalName={school?.principal_name || ''} />

        </div>
      </div>
    </div>
  )
}
