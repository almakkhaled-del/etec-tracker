'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const CREAM = '#FBF8F2'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    school_name: '', school_number: '', region: '', school_type: 'government',
    principal_name: '', phone: '', email: '', password: '', confirm_password: '',
  })

  const regions = ['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'القصيم', 'المنطقة الشرقية', 'عسير', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة', 'الجوف']

  function handleChange(e: any) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSubmit() {
    setError('')
    if (!form.school_name || !form.email || !form.password || !form.principal_name) {
      setError('يرجى تعبئة جميع الحقول المطلوبة'); return
    }
    if (form.password !== form.confirm_password) { setError('كلمة المرور غير متطابقة'); return }
    if (form.password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password })
      if (authError) throw authError

      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 7)

      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: form.school_name, school_number: form.school_number || null, region: form.region || null,
          school_type: form.school_type, principal_name: form.principal_name, phone: form.phone || null,
          email: form.email, subscription_status: 'trial',
          subscription_start: new Date().toISOString(), subscription_end: trialEnd.toISOString(),
        })
        .select().single()

      if (schoolError) throw schoolError

      await supabase.from('school_users').insert({
        school_id: school.id, auth_id: authData.user?.id, full_name: form.principal_name, role: 'principal',
      })

      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء التسجيل')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', border: '1px solid rgba(11,31,58,0.15)',
    borderRadius: 10, fontSize: 14, fontFamily: 'IBM Plex Sans Arabic, Tajawal, sans-serif',
    boxSizing: 'border-box' as const, marginBottom: 14, background: '#fff', color: NAVY
  }
  const labelStyle = { fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 7, display: 'block', fontFamily: 'Tajawal, sans-serif' }
  const sectionLabel = { fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: 1, marginBottom: 16, marginTop: 4 }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl', padding: '2.5rem 1rem' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/">
            <img src="/logo.png" alt="شواهدي" style={{ height: 50, marginBottom: 18 }} />
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: NAVY, marginBottom: 8 }}>تسجيل مدرسة جديدة</h1>
          <p style={{ fontSize: 14, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>تجربة مجانية 7 أيام — لا يلزم بطاقة ائتمان</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, padding: '2.2rem 2rem', border: '1px solid rgba(11,31,58,0.06)', boxShadow: '0 12px 36px rgba(11,31,58,0.08)' }}>

          <p style={sectionLabel}>بيانات المدرسة</p>

          <label style={labelStyle}>اسم المدرسة *</label>
          <input name="school_name" value={form.school_name} onChange={handleChange} placeholder="مدرسة ..." style={inputStyle} />

          <label style={labelStyle}>رقم المدرسة</label>
          <input name="school_number" value={form.school_number} onChange={handleChange} placeholder="الرقم الرسمي من الوزارة" style={inputStyle} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>المنطقة التعليمية</label>
              <select name="region" value={form.region} onChange={handleChange} style={{ ...inputStyle, marginBottom: 14 }}>
                <option value="">اختر المنطقة</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>نوع المدرسة</label>
              <select name="school_type" value={form.school_type} onChange={handleChange} style={{ ...inputStyle, marginBottom: 14 }}>
                <option value="government">حكومية</option>
                <option value="private">أهلية</option>
                <option value="international">عالمية</option>
              </select>
            </div>
          </div>

          <p style={sectionLabel}>بيانات مدير المدرسة</p>

          <label style={labelStyle}>اسم المدير *</label>
          <input name="principal_name" value={form.principal_name} onChange={handleChange} placeholder="الاسم الكامل" style={inputStyle} />

          <label style={labelStyle}>رقم الجوال</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="05XXXXXXXX" style={inputStyle} />

          <label style={labelStyle}>البريد الإلكتروني *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@school.edu.sa" style={inputStyle} />

          <label style={labelStyle}>كلمة المرور *</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="8 أحرف على الأقل" style={inputStyle} />

          <label style={labelStyle}>تأكيد كلمة المرور *</label>
          <input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} placeholder="أعد كتابة كلمة المرور" style={{ ...inputStyle, marginBottom: 22 }} />

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 16px', marginBottom: 18, fontSize: 13, color: '#DC2626', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '14px', fontSize: 16, fontWeight: 700,
            background: loading ? '#9ca3af' : `linear-gradient(135deg, #D9A441, ${GOLD})`,
            color: NAVY, border: 'none', borderRadius: 11, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Tajawal, sans-serif', boxShadow: loading ? 'none' : '0 6px 18px rgba(194,138,31,0.3)'
          }}>
            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب — ابدأ التجربة المجانية ←'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#8A8270', marginTop: 18, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            عندك حساب؟{' '}
            <Link href="/login" style={{ color: GOLD, textDecoration: 'none', fontWeight: 700 }}>سجّل دخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
