'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const CREAM = '#F5F8FA'

// صفحة الرجوع بعد إتمام الدفع لدى جيديا (returnUrl).
// مهم: هذه الصفحة للعرض فقط — التفعيل الفعلي يتم عبر الـ webhook (خادم-لخادم).
// إشعار جيديا قد يتأخر ثواني عن رجوع المستخدم، لذلك نفحص حالة الاشتراك
// من قاعدة البيانات على دفعات (كل 3 ثوانٍ حتى 30 ثانية) قبل ما نستسلم.
export default function SubscribeSuccessPage() {
  const [state, setState] = useState<'checking' | 'active' | 'pending'>('checking')

  useEffect(() => {
    let attempts = 0
    let stopped = false

    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setState('pending'); return }
      const { data: schoolUser } = await supabase
        .from('school_users').select('school_id').eq('auth_id', user.id).single()
      if (!schoolUser) { setState('pending'); return }
      const { data: school } = await supabase
        .from('schools').select('subscription_status').eq('id', schoolUser.school_id).single()

      if (stopped) return
      if (school?.subscription_status === 'active') { setState('active'); return }

      attempts++
      if (attempts >= 10) { setState('pending'); return }
      setTimeout(check, 3000)
    }
    check()
    return () => { stopped = true }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 460, textAlign: 'center' }}>
        <img src="/logo.png" alt="شواهدي" style={{ height: 48, marginBottom: 24 }} />

        <div style={{ background: '#fff', borderRadius: 22, padding: '2.6rem 2rem', border: '1px solid rgba(10,59,88,0.07)', boxShadow: '0 12px 36px rgba(10,59,88,0.08)' }}>

          {state === 'checking' && (
            <>
              <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(10,59,88,0.08)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray="55 110" style={{ transformOrigin: '32px 32px', animation: 'spin 1.2s linear infinite' }} />
                </svg>
                <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 10 }}>جاري تأكيد عملية الدفع...</h1>
              <p style={{ fontSize: 13.5, color: '#7A8896', lineHeight: 2, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
                نستقبل الآن تأكيد البنك — عادة يكتمل خلال ثوانٍ قليلة. لا تغلق الصفحة.
              </p>
            </>
          )}

          {state === 'active' && (
            <>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🎉</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#15803D', marginBottom: 10 }}>تم تفعيل اشتراكك بنجاح!</h1>
              <p style={{ fontSize: 14, color: '#7A8896', lineHeight: 2, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 26 }}>
                أهلاً بك في الباقة المتكاملة — جميع المجالات الأربعة، بناء الخطط الذكية،
                ومكتبة النماذج كلها مفتوحة لمدرستك الآن لعام دراسي كامل.
              </p>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '15px', fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, #3E8AB0, ${GOLD})`, color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                  ابدأ الاستخدام ←
                </button>
              </Link>
            </>
          )}

          {state === 'pending' && (
            <>
              <div style={{ fontSize: 52, marginBottom: 14 }}>⏳</div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 10 }}>الدفع قيد التأكيد</h1>
              <p style={{ fontSize: 13.5, color: '#7A8896', lineHeight: 2, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 22 }}>
                إذا اكتمل الدفع من جهتك فاشتراكك سيتفعّل تلقائياً خلال دقائق.
                حدّث الصفحة بعد قليل، وإذا لم يتفعّل تواصل معنا ومعك رقم العملية — نفعّله فوراً.
              </p>
              <button onClick={() => window.location.reload()} style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 700, background: NAVY, color: '#fff', border: 'none', borderRadius: 11, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', marginBottom: 10 }}>
                🔄 تحديث الحالة
              </button>
              <a href="https://wa.me/966555826838?text=أكملت الدفع ولم يتفعل اشتراكي بعد" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '12px', fontSize: 13.5, fontWeight: 700, background: '#25D366', color: '#fff', border: 'none', borderRadius: 11, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                  💬 تواصل عبر واتساب
                </button>
              </a>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
