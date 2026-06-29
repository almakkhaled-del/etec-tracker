'use client'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ExpiredPage() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Tajawal, sans-serif', direction: 'rtl', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: 460, textAlign: 'center' }}>
        <img src="/logo.png" alt="شواهدي" style={{ height: 50, marginBottom: 24 }} />

        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem 2rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            انتهت فترة التجربة المجانية
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 8 }}>
            شكراً لاستخدامك شواهدي!
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>
            بياناتك وشواهدك <strong style={{ color: '#111827' }}>محفوظة بالكامل</strong> — لن تُحذف.
            لمتابعة استخدام النظام، جدّد اشتراكك السنوي.
          </p>

          <div style={{ background: '#eff6ff', borderRadius: 12, padding: '1.25rem', marginBottom: 24, border: '1px solid #bfdbfe' }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>999 ريال / سنة</p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>وصول كامل + تخزين غير محدود + تقارير PDF</p>
          </div>

          <a
            href="https://store.shawahede.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block', padding: '14px', fontSize: 16, fontWeight: 700,
              background: '#1d4ed8', color: '#fff', borderRadius: 10,
              textDecoration: 'none', marginBottom: 12
            }}
          >
            جدّد اشتراكك الآن ←
          </a>

          <a
            href="https://wa.me/966500000000"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block', padding: '12px', fontSize: 14,
              background: '#dcfce7', color: '#16a34a', borderRadius: 10,
              textDecoration: 'none', marginBottom: 20, fontWeight: 600
            }}
          >
            💬 تواصل معنا عبر واتساب
          </a>

          <button onClick={handleLogout} style={{
            background: 'none', border: 'none', color: '#9ca3af',
            fontSize: 13, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif'
          }}>
            تسجيل خروج
          </button>
        </div>
      </div>
    </div>
  )
}
