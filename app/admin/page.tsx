'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const CREAM = '#FBF8F2'

type SchoolRow = {
  id: string
  name: string
  principal_name: string | null
  email: string | null
  phone: string | null
  subscription_status: string
  subscription_end: string
  allowed_domain_id: number | null
}

export default function AdminPage() {
  const { role, loading: schoolLoading } = useSchool()
  const router = useRouter()
  const [schools, setSchools] = useState<SchoolRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // حماية: فقط الأدمن
  useEffect(() => {
    if (!schoolLoading && role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [role, schoolLoading, router])

  async function loadSchools() {
    const { data } = await supabase.from('schools').select('*').order('created_at', { ascending: false })
    setSchools(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (role === 'admin') loadSchools()
  }, [role])

  // تفعيل: اشتراك مدفوع لمدة سنة
  async function activate(id: string) {
    setBusy(id)
    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)
    await supabase.from('schools').update({
      subscription_status: 'active',
      subscription_start: new Date().toISOString(),
      subscription_end: end.toISOString(),
    }).eq('id', id)
    await loadSchools()
    setBusy(null)
  }

  // تمديد 30 يوم
  async function extend(id: string, currentEnd: string) {
    setBusy(id)
    const base = new Date(currentEnd) > new Date() ? new Date(currentEnd) : new Date()
    base.setDate(base.getDate() + 30)
    await supabase.from('schools').update({ subscription_end: base.toISOString() }).eq('id', id)
    await loadSchools()
    setBusy(null)
  }

  // تعطيل
  async function deactivate(id: string) {
    setBusy(id)
    await supabase.from('schools').update({
      subscription_status: 'expired',
      subscription_end: new Date().toISOString(),
    }).eq('id', id)
    await loadSchools()
    setBusy(null)
  }

  if (schoolLoading || role !== 'admin') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREAM, fontFamily: 'Tajawal, sans-serif' }}>
      <p style={{ color: '#8A8270' }}>جاري التحميل...</p>
    </div>
  )

  const filtered = schools.filter(s => !search || s.name?.includes(search) || s.email?.includes(search) || s.principal_name?.includes(search))
  const activeCount = schools.filter(s => s.subscription_status === 'active').length
  const trialCount = schools.filter(s => s.subscription_status === 'trial').length
  const expiredCount = schools.filter(s => s.subscription_status === 'expired' || new Date(s.subscription_end) < new Date()).length

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>

          <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← اللوحة</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>🛡️ لوحة تحكم الأدمن</p>
              <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>إدارة المدارس والاشتراكات</p>
            </div>
          </header>

          <main style={{ padding: '28px', maxWidth: 900, margin: '0 auto' }}>

            {/* إحصائيات */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '18px 20px' }}>
                <p style={{ fontSize: 11, color: '#8A8270', margin: '0 0 4px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>مشتركون</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', margin: 0 }}>{activeCount}</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '18px 20px' }}>
                <p style={{ fontSize: 11, color: '#8A8270', margin: '0 0 4px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>تجريبي</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: GOLD, margin: 0 }}>{trialCount}</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '18px 20px' }}>
                <p style={{ fontSize: 11, color: '#8A8270', margin: '0 0 4px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>منتهٍ</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#DC2626', margin: 0 }}>{expiredCount}</p>
              </div>
            </div>

            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم المدرسة أو المدير أو البريد..."
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(11,31,58,0.12)', borderRadius: 12, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif', boxSizing: 'border-box', background: '#fff', color: NAVY, direction: 'rtl', marginBottom: 18 }} />

            {loading ? (
              <p style={{ textAlign: 'center', color: '#8A8270', padding: '3rem' }}>جاري التحميل...</p>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {filtered.map(s => {
                  const expired = s.subscription_status === 'expired' || new Date(s.subscription_end) < new Date()
                  const daysLeft = Math.max(0, Math.ceil((new Date(s.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                  const statusColor = expired ? '#DC2626' : s.subscription_status === 'active' ? '#16a34a' : GOLD
                  const statusText = expired ? 'منتهٍ' : s.subscription_status === 'active' ? 'مشترك' : 'تجريبي'
                  return (
                    <div key={s.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(11,31,58,0.07)', padding: '18px 20px', boxShadow: '0 2px 8px rgba(11,31,58,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>{s.name}</p>
                          <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                            {s.principal_name || '—'} · {s.email || '—'} · {s.phone || '—'}
                          </p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, background: `${statusColor}18`, color: statusColor, padding: '5px 12px', borderRadius: 20, fontFamily: 'IBM Plex Sans Arabic, sans-serif', whiteSpace: 'nowrap' }}>
                          {statusText} · {daysLeft} يوم
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => activate(s.id)} disabled={busy === s.id} style={{ flex: 1, minWidth: 100, padding: '9px', fontSize: 12, fontWeight: 700, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: busy === s.id ? 0.5 : 1 }}>
                          ✓ تفعيل سنة
                        </button>
                        <button onClick={() => extend(s.id, s.subscription_end)} disabled={busy === s.id} style={{ flex: 1, minWidth: 100, padding: '9px', fontSize: 12, fontWeight: 700, background: `${GOLD}18`, color: '#A6730F', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: busy === s.id ? 0.5 : 1 }}>
                          + تمديد 30 يوم
                        </button>
                        <button onClick={() => deactivate(s.id)} disabled={busy === s.id} style={{ flex: 1, minWidth: 100, padding: '9px', fontSize: 12, fontWeight: 700, background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: busy === s.id ? 0.5 : 1 }}>
                          ✕ تعطيل
                        </button>
                      </div>
                    </div>
                  )
                })}
                {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#8A8270', padding: '2rem' }}>لا توجد نتائج</p>}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}
