'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    school_name: '',
    school_number: '',
    region: '',
    school_type: 'government',
    principal_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
  })

  const regions = [
    'الرياض', 'مكة المكرمة', 'المدينة المنورة', 'القصيم', 'المنطقة الشرقية',
    'عسير', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة', 'الجوف'
  ]

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setError('')
    if (!form.school_name || !form.email || !form.password || !form.principal_name) {
      setError('يرجى تعبئة جميع الحقول المطلوبة')
      return
    }
    if (form.password !== form.confirm_password) {
      setError('كلمة المرور غير متطابقة')
      return
    }
    if (form.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }

    setLoading(true)
    try {
      // إنشاء حساب في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (authError) throw authError

      // إنشاء سجل المدرسة
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 7)

      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: form.school_name,
          school_number: form.school_number || null,
          region: form.region || null,
          school_type: form.school_type,
          principal_name: form.principal_name,
          phone: form.phone || null,
          email: form.email,
          subscription_status: 'trial',
          subscription_start: new Date().toISOString(),
          subscription_end: trialEnd.toISOString(),
        })
        .select()
        .single()

      if (schoolError) throw schoolError

      // ربط المستخدم بالمدرسة
      await supabase.from('school_users').insert({
        school_id: school.id,
        auth_id: authData.user?.id,
        full_name: form.principal_name,
        role: 'principal',
      })

      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء التسجيل')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 14, fontFamily: 'Tajawal, sans-serif',
    boxSizing: 'border-box' as const, marginBottom: 12, background: '#fff'
  }
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Tajawal, sans-serif', direction: 'rtl', padding: '2rem 1rem' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 50, marginBottom: 16 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>تسجيل مدرسة جديدة</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>تجربة مجانية 7 أيام — لا يلزم بطاقة ائتمان</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

          {/* بيانات المدرسة */}
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', letterSpacing: 1, marginBottom: 16 }}>بيانات المدرسة</p>

          <label style={labelStyle}>اسم المدرسة *</label>
          <input name="school_name" value={form.school_name} onChange={handleChange} placeholder="مدرسة ..." style={inputStyle} />

          <label style={labelStyle}>رقم المدرسة</label>
          <input name="school_number" value={form.school_number} onChange={handleChange} placeholder="الرقم الرسمي من الوزارة" style={inputStyle} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>المنطقة التعليمية</label>
              <select name="region" value={form.region} onChange={handleChange} style={{ ...inputStyle, marginBottom: 12 }}>
                <option value="">اختر المنطقة</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>نوع المدرسة</label>
              <select name="school_type" value={form.school_type} onChange={handleChange} style={{ ...inputStyle, marginBottom: 12 }}>
                <option value="government">حكومية</option>
                <option value="private">أهلية</option>
                <option value="international">عالمية</option>
              </select>
            </div>
          </div>

          {/* بيانات المدير */}
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', letterSpacing: 1, marginBottom: 16, marginTop: 8 }}>بيانات مدير المدرسة</p>

          <label style={labelStyle}>اسم المدير *</label>
          <input name="principal_name" value={form.principal_name} onChange={handleChange} placeholder="الاسم الكامل" style={inputStyle} />

          <label style={labelStyle}>رقم الجوال</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="05XXXXXXXX" style={inputStyle} />

          <label style={labelStyle}>البريد الإلكتروني *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@school.edu.sa" style={inputStyle} />

          <label style={labelStyle}>كلمة المرور *</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="8 أحرف على الأقل" style={inputStyle} />

          <label style={labelStyle}>تأكيد كلمة المرور *</label>
          <input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} placeholder="أعد كتابة كلمة المرور" style={{ ...inputStyle, marginBottom: 20 }} />

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '13px', fontSize: 16, fontWeight: 700,
            background: loading ? '#93c5fd' : '#1d4ed8', color: '#fff',
            border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Tajawal, sans-serif'
          }}>
            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب — ابدأ التجربة المجانية ←'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 16 }}>
            عندك حساب؟ <Link href="/login" style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 600 }}>سجّل دخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
