'use client'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const GOLD_LIGHT = '#7FB3CB'
const CREAM = '#F5F8FA'

export default function ExpiredPage() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: 'Tajawal, sans-serif', direction: 'rtl', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 460, textAlign: 'center' }}>
        <img src="/logo.png" alt="شواهدي" style={{ height: 50, marginBottom: 24 }} />

        <div style={{ background: '#fff', borderRadius: 22, padding: '2.5rem 2rem', border: '1px solid rgba(10,59,88,0.07)', boxShadow: '0 12px 36px rgba(10,59,88,0.08)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 12 }}>
            انتهت فترة التجربة المجانية
          </h1>
          <p style={{ fontSize: 15, color: '#7A8896', lineHeight: 1.7, marginBottom: 8, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            شكراً لاستخدامك شواهدي!
          </p>
          <p style={{ fontSize: 14, color: '#7A8896', lineHeight: 1.9, marginBottom: 26, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            بياناتك وشواهدك <strong style={{ color: NAVY }}>محفوظة بالكامل</strong> — لن تُحذف.
            لمتابعة استخدام المنصة، اشترك بالباقة المتكاملة.
          </p>

          {/* السعر: عرض التدشين 599 بجانب السعر الأصلي 699 مشطوباً */}
          <div style={{ background: NAVY, borderRadius: 16, padding: '1.4rem 1.25rem', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, marginBottom: 6 }}>
              <p style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>599</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.45)', margin: 0, textDecoration: 'line-through' }}>699</p>
              <p style={{ fontSize: 14, color: GOLD_LIGHT, margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>ريال / عام دراسي</p>
            </div>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              🎉 عرض تدشين المنصة — جميع المجالات + بناء الخطط الذكية + مكتبة النماذج
            </p>
          </div>

          <Link href="/subscribe" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '15px', fontSize: 16, fontWeight: 800,
              background: `linear-gradient(135deg, #3E8AB0, ${GOLD})`, color: NAVY,
              border: 'none', borderRadius: 12, cursor: 'pointer',
              fontFamily: 'Tajawal, sans-serif', marginBottom: 12,
              boxShadow: '0 6px 18px rgba(31,110,150,0.3)'
            }}>
              اشترك الآن ←
            </button>
          </Link>

          <a href="https://wa.me/966555826838?text=انتهت تجربتي المجانية وأبي أشترك بالباقة المتكاملة" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '12px', fontSize: 14, fontWeight: 700,
              background: '#25D366', color: '#fff', border: 'none', borderRadius: 12,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', marginBottom: 20
            }}>
              💬 تواصل معنا عبر واتساب
            </button>
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
