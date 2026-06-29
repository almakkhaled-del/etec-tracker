'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

      // تحقق من حالة الاشتراك
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

      router.push('/dashboard')
    } catch (e: any) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Tajawal, sans-serif', direction: 'rtl', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 50, marginBottom: 16 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>تسجيل الدخول</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>أدخل بيانات مدرستك للمتابعة</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
            البريد الإلكتروني
          </label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="example@school.edu.sa"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'Tajawal, sans-serif', boxSizing: 'border-box', marginBottom: 16 }}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
            كلمة المرور
          </label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'Tajawal, sans-serif', boxSizing: 'border-box', marginBottom: 20 }}
          />

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading} style={{
            width: '100%', padding: '13px', fontSize: 16, fontWeight: 700,
            background: loading ? '#93c5fd' : '#1d4ed8', color: '#fff',
            border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Tajawal, sans-serif', marginBottom: 16
          }}>
            {loading ? 'جاري الدخول...' : 'دخول ←'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
            ليس لديك حساب؟ <Link href="/register" style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 600 }}>سجّل مدرستك مجاناً</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
