'use client'
import { useSchool } from '@/lib/useSchool'
import { supabase } from '@/lib/supabase'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const GOLD_LIGHT = '#E8C275'
const CREAM = '#FBF8F2'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(11,31,58,0.06)' }}>
      <span style={{ fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: NAVY, fontFamily: 'IBM Plex Sans Arabic, sans-serif', textAlign: 'left' }}>{value || '—'}</span>
    </div>
  )
}

export default function AccountPage() {
  const { school, role, loading, isTrial } = useSchool()
  const router = useRouter()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREAM, fontFamily: 'Tajawal, sans-serif' }}>
      <p style={{ color: '#8A8270' }}>جاري التحميل...</p>
    </div>
  )

  const daysLeft = school ? Math.max(0, Math.ceil((new Date(school.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
  const endDate = school ? new Date(school.subscription_end).toLocaleDateString('ar-SA') : '—'
  const startDate = school?.subscription_start ? new Date(school.subscription_start).toLocaleDateString('ar-SA') : '—'
  const planName = isTrial ? 'تجريبي (مجاني)' : 'مشترك'
  const planColor = isTrial ? '#A6730F' : '#16a34a'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>

          <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← اللوحة</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>حسابي</p>
              <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>بيانات المدرسة والاشتراك</p>
            </div>
          </header>

          <main style={{ padding: '28px', maxWidth: 620, margin: '0 auto' }}>

            {/* بطاقة الاشتراك */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, #14284a)`, borderRadius: 20, padding: '24px 26px', marginBottom: 20, color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px' }}>نوع الاشتراك</p>
                  <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{planName}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, background: isTrial ? 'rgba(230,194,117,0.2)' : 'rgba(134,239,172,0.2)', color: isTrial ? GOLD_LIGHT : '#86EFAC', padding: '6px 14px', borderRadius: 20, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                  {daysLeft} يوم متبقٍ
                </span>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 3px' }}>تاريخ البداية</p>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{startDate}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 3px' }}>تاريخ الانتهاء</p>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{endDate}</p>
                </div>
              </div>
              {isTrial && (
                <a href="https://wa.me/966555826838" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', marginTop: 18, padding: '13px', fontSize: 14, fontWeight: 800, background: `linear-gradient(135deg, #D9A441, ${GOLD})`, color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                    ⭐ ترقية للاشتراك الكامل
                  </button>
                </a>
              )}
            </div>

            {/* بيانات المدرسة */}
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '8px 22px', marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: '16px 0 6px' }}>بيانات المدرسة</p>
              <Row label="اسم المدرسة" value={school?.name || ''} />
              <Row label="اسم المدير" value={school?.principal_name || ''} />
              <Row label="الرقم الوزاري" value={school?.school_number || ''} />
              <Row label="المنطقة" value={school?.region || ''} />
              <Row label="المدينة" value={school?.city || ''} />
              <Row label="نوع المدرسة" value={school?.school_type || ''} />
              <Row label="البريد الإلكتروني" value={school?.email || ''} />
              <Row label="الجوال" value={school?.phone || ''} />
            </div>

            {role === 'admin' && (
              <Link href="/admin" style={{ textDecoration: 'none' }}>
                <div style={{ background: NAVY, borderRadius: 16, padding: '18px 22px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>🛡️ لوحة تحكم الأدمن</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>إدارة الحسابات والاشتراكات</p>
                  </div>
                  <span style={{ fontSize: 18, color: GOLD_LIGHT }}>←</span>
                </div>
              </Link>
            )}

            <button onClick={handleLogout} style={{ width: '100%', padding: '14px', fontSize: 14, fontWeight: 700, background: '#fff', color: '#DC2626', border: '1.5px solid #FCA5A5', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
              تسجيل الخروج
            </button>

          </main>
        </div>
      </div>
    </div>
  )
}
