'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const CREAM = '#F5F8FA'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin() {
    setError('')
    if (!email || !password) { setError('يرجى تعبئة البريد الإلكتروني وكلمة المرور'); return }

    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const { data: user } = await supabase.auth.getUser()
      const { data: schoolUser } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('auth_id', user.user?.id)
        .single()

      if (schoolUser) {
        const { data: school } = await supabase
          .from('schools')
          .select('subscription_status, subscription_end')
          .eq('id', schoolUser.school_id)
          .single()

        if (school) {
          const isExpired = new Date(school.subscription_end) < new Date()
          if (isExpired || school.subscription_status === 'expired') {
            router.push('/expired')
            return
          }
        }
      }

      // دعم ?next=: لو وصل المستخدم من صفحة تتطلب دخولاً (مثل /subscribe من
      // الصفحة الرئيسية) نرجعه لها بدل اللوحة. نقرأ من window مباشرة بدل
      // useSearchParams لتفادي اشتراط Suspense عند البناء. نقبل فقط مسارات
      // داخلية تبدأ بـ / (حماية من open redirect).
      const next = new URLSearchParams(window.location.search).get('next')
      router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard')
    } catch (e: any) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px', border: '1px solid rgba(10,59,88,0.15)',
    borderRadius: 10, fontSize: 14, fontFamily: 'IBM Plex Sans Arabic, Tajawal, sans-serif',
    boxSizing: 'border-box' as const, marginBottom: 18, background: '#fff', color: NAVY
  }
  const labelStyle = { fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 8, display: 'block', fontFamily: 'Tajawal, sans-serif' }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/">
            <img src="/logo.png" alt="شواهدي" style={{ height: 52, marginBottom: 20 }} />
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: NAVY, marginBottom: 8 }}>تسجيل الدخول</h1>
          <p style={{ fontSize: 14, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>أدخل بيانات مدرستك للمتابعة</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, padding: '2.2rem 2rem', border: '1px solid rgba(10,59,88,0.06)', boxShadow: '0 12px 36px rgba(10,59,88,0.08)' }}>
          <label style={labelStyle}>البريد الإلكتروني</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="example@school.edu.sa"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={inputStyle}
          />

          <label style={labelStyle}>كلمة المرور</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ ...inputStyle, marginBottom: 24 }}
          />

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 16px', marginBottom: 18, fontSize: 13, color: '#DC2626', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading} style={{
            width: '100%', padding: '14px', fontSize: 16, fontWeight: 700,
            background: loading ? '#9ca3af' : NAVY, color: '#fff',
            border: 'none', borderRadius: 11, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Tajawal, sans-serif', marginBottom: 18, transition: 'background 0.2s'
          }}>
            {loading ? 'جاري الدخول...' : 'دخول ←'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            ليس لديك حساب؟{' '}
            <Link href="/register" style={{ color: GOLD, textDecoration: 'none', fontWeight: 700 }}>
              سجّل مدرستك مجاناً
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
