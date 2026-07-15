'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const CREAM = '#F5F8FA'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [form, setForm] = useState({
    school_name: '', school_number: '', region: '', school_type: 'government',
    program: 'general', inclusion_pattern: '',
    principal_name: '', phone: '', email: '', password: '', confirm_password: '',
  })

  const regions = ['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'القصيم', 'المنطقة الشرقية', 'عسير', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة', 'الجوف']

  const programs = [
    { value: 'general', label: 'التعليم العام' },
    { value: 'early_childhood', label: 'الطفولة المبكرة ورياض الأطفال' },
    { value: 'special_education', label: 'التربية الخاصة' },
  ]
  const inclusionPatterns = [
    { value: 'full_inclusion', label: 'الدمج الكلي (فصول تعليم عام)' },
    { value: 'spatial_inclusion', label: 'الدمج المكاني (فصول ملحقة)' },
    { value: 'independent', label: 'مدرسة/مركز مستقل' },
  ]
  const needsInclusionPattern = form.program === 'early_childhood' || form.program === 'special_education'

  function handleChange(e: any) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSubmit() {
    setError('')
    if (!form.school_name || !form.email || !form.password || !form.principal_name) {
      setError('يرجى تعبئة جميع الحقول المطلوبة'); return
    }
    if (form.password !== form.confirm_password) { setError('كلمة المرور غير متطابقة'); return }
    if (form.password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }
    if (!agreed) { setError('يجب الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة'); return }
    if (needsInclusionPattern && !form.inclusion_pattern) { setError('يرجى اختيار نمط الدمج المناسب لمدرستك'); return }

    setLoading(true)
    try {
      // فحص تكرار البيانات قبل التسجيل
      const orConds: string[] = [`email.eq.${form.email}`]
      if (form.school_number) orConds.push(`school_number.eq.${form.school_number}`)
      if (form.phone) orConds.push(`phone.eq.${form.phone}`)

      const { data: existing } = await supabase
        .from('schools')
        .select('email, school_number, phone')
        .or(orConds.join(','))

      if (existing && existing.length > 0) {
        const dupEmail = existing.some(s => s.email === form.email)
        const dupNumber = form.school_number && existing.some(s => s.school_number === form.school_number)
        const dupPhone = form.phone && existing.some(s => s.phone === form.phone)
        if (dupEmail) { setError('البريد الإلكتروني مسجّل مسبقاً. جرّب تسجيل الدخول.'); setLoading(false); return }
        if (dupNumber) { setError('الرقم الوزاري مسجّل مسبقاً لمدرسة أخرى.'); setLoading(false); return }
        if (dupPhone) { setError('رقم الجوال مسجّل مسبقاً لمدرسة أخرى.'); setLoading(false); return }
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password })

      let session = authData?.session

      // حالتان تحتاجان معالجة خاصة هنا:
      // 1) signUp رجع خطأ (غالباً "already registered") — قد يكون هذا الإيميل
      //    عالقاً من محاولة سابقة أنشأت حساب دخول لكن فشلت قبل إنشاء صف المدرسة.
      // 2) signUp نجح لكن ما رجعت جلسة فورية.
      // في الحالتين نحاول تسجيل الدخول بنفس البيانات المُدخلة الآن؛ لو نجح
      // نكون فعلياً "أكملنا" التسجيل المعلّق بدل ما نعلّق المستخدم بخطأ بلا حل.
      if (authError || !session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email, password: form.password,
        })

        if (signInError || !signInData.session) {
          if (authError && /already registered|already exists/i.test(authError.message)) {
            throw new Error('هذا البريد الإلكتروني مسجّل مسبقاً بكلمة مرور مختلفة عن التي أدخلتها الآن. إذا كانت هذه محاولتك الأولى ونسيت كلمة المرور، استخدم "نسيت كلمة المرور" من صفحة تسجيل الدخول، أو تواصل معنا للمساعدة.')
          }
          throw authError || new Error('تعذّر تفعيل الجلسة بعد إنشاء الحساب. يرجى المحاولة مرة أخرى أو تسجيل الدخول يدوياً من صفحة الدخول.')
        }

        session = signInData.session
      }

      // إنشاء المدرسة وربطها بالمستخدم عبر دالة واحدة على الخادم (RPC)
      // بدل إدراجين منفصلين من العميل — يتفادى مشاكل توقيت الجلسة مع RLS
      // ويضمن أن العمليتين تتمّان معاً أو لا تتمّان (transaction واحدة).
      // ملاحظة: نفس الدالة تُستخدم هنا سواء كانت هذه محاولة جديدة أو محاولة
      // إكمال لتسجيل عالق (auth موجود بلا مدرسة مرتبطة) — الدالة نفسها تتحقق
      // من عدم وجود ربط سابق وتمنع التكرار الحقيقي.
      const { error: schoolError } = await supabase.rpc('register_school', {
        p_name: form.school_name,
        p_school_number: form.school_number || '',
        p_region: form.region || '',
        p_school_type: form.school_type,
        p_principal_name: form.principal_name,
        p_phone: form.phone || '',
        p_email: form.email,
        p_program: form.program,
        p_inclusion_pattern: needsInclusionPattern ? form.inclusion_pattern : null,
      })

      if (schoolError) {
        if (/مرتبط بمدرسة مسبقاً/.test(schoolError.message)) {
          throw new Error('هذا الحساب مسجّل بالفعل بمدرسة. يرجى تسجيل الدخول من صفحة الدخول.')
        }
        throw schoolError
      }

      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء التسجيل')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', border: '1px solid rgba(10,59,88,0.15)',
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
          <p style={{ fontSize: 14, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>تجربة مجانية 7 أيام — لا يلزم بطاقة ائتمان</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, padding: '2.2rem 2rem', border: '1px solid rgba(10,59,88,0.06)', boxShadow: '0 12px 36px rgba(10,59,88,0.08)' }}>

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

          <label style={labelStyle}>البرنامج التعليمي</label>
          <select name="program" value={form.program} onChange={handleChange} style={inputStyle}>
            {programs.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          {needsInclusionPattern && (
            <>
              <label style={labelStyle}>نمط الدمج</label>
              <select name="inclusion_pattern" value={form.inclusion_pattern} onChange={handleChange} style={inputStyle}>
                <option value="">اختر النمط</option>
                {inclusionPatterns.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </>
          )}

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

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 18, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: GOLD, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 12.5, color: '#4C5A66', lineHeight: 1.9, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              أوافق على{' '}
              <Link href="/terms" target="_blank" style={{ color: GOLD, fontWeight: 700, textDecoration: 'none' }}>الشروط والأحكام</Link>
              {' '}و{' '}
              <Link href="/privacy" target="_blank" style={{ color: GOLD, fontWeight: 700, textDecoration: 'none' }}>سياسة الخصوصية</Link>
            </span>
          </label>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 16px', marginBottom: 18, fontSize: 13, color: '#DC2626', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || !agreed} style={{
            width: '100%', padding: '14px', fontSize: 16, fontWeight: 700,
            background: (loading || !agreed) ? '#9ca3af' : `linear-gradient(135deg, #3E8AB0, ${GOLD})`,
            color: NAVY, border: 'none', borderRadius: 11, cursor: (loading || !agreed) ? 'not-allowed' : 'pointer',
            fontFamily: 'Tajawal, sans-serif', boxShadow: (loading || !agreed) ? 'none' : '0 6px 18px rgba(31,110,150,0.3)'
          }}>
            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب — ابدأ التجربة المجانية ←'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#7A8896', marginTop: 18, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            عندك حساب؟{' '}
            <Link href="/login" style={{ color: GOLD, textDecoration: 'none', fontWeight: 700 }}>سجّل دخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
