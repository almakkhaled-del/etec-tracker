'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const DOMAIN_ICONS: Record<string, string> = {
  '1': '🏫', '2': '📚', '3': '📊', '4': '🏢'
}
const DOMAIN_COLORS: Record<string, string> = {
  '1': '#2563eb', '2': '#16a34a', '3': '#d97706', '4': '#7c3aed'
}

type Domain = {
  id: number; code: string; name_ar: string; order_num: number;
  total_indicators?: number; completed?: number; total_evidences?: number
}

export default function Dashboard() {
  const router = useRouter()
  const { school, loading: schoolLoading } = useSchool()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 38, completed: 0, evidences: 0 })

  useEffect(() => {
    if (!school) return
    async function load() {
      const { data: domainsData } = await supabase.from('domains').select('*').order('order_num')
      const { data: standards } = await supabase.from('standards').select('id, domain_id')
      const { data: indicators } = await supabase.from('indicators').select('id, standard_id')
      // فلترة الشواهد بـ school_id الخاص بالمدرسة الحالية فقط
      const { data: evidences } = await supabase
        .from('evidences')
        .select('id, indicator_id')
        .eq('school_id', school!.id)

      if (domainsData && standards && indicators) {
        const evByIndicator: Record<number, number> = {}
        evidences?.forEach(e => {
          evByIndicator[e.indicator_id] = (evByIndicator[e.indicator_id] || 0) + 1
        })

        const stdByDomain: Record<number, number[]> = {}
        standards.forEach(s => {
          if (!stdByDomain[s.domain_id]) stdByDomain[s.domain_id] = []
          stdByDomain[s.domain_id].push(s.id)
        })

        const indByStd: Record<number, number[]> = {}
        indicators.forEach(i => {
          if (!indByStd[i.standard_id]) indByStd[i.standard_id] = []
          indByStd[i.standard_id].push(i.id)
        })

        const enriched = domainsData.map(d => {
          const stdIds = stdByDomain[d.id] || []
          const indIds = stdIds.flatMap(sid => indByStd[sid] || [])
          const completed = indIds.filter(id => (evByIndicator[id] || 0) > 0).length
          const totalEv = indIds.reduce((sum, id) => sum + (evByIndicator[id] || 0), 0)
          return { ...d, total_indicators: indIds.length, completed, total_evidences: totalEv }
        })

        setDomains(enriched)
        const totalCompleted = enriched.reduce((s, d) => s + (d.completed || 0), 0)
        const totalEv = enriched.reduce((s, d) => s + (d.total_evidences || 0), 0)
        setStats({ total: 38, completed: totalCompleted, evidences: totalEv })
      }
      setLoading(false)
    }
    load()
  }, [school])

  const completion = Math.round((stats.completed / stats.total) * 100)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const trialDaysLeft = school ? Math.max(0, Math.ceil((new Date(school.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null
  const isTrial = school?.subscription_status === 'trial'

  if (schoolLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif' }}>
      <p style={{ color: '#6b7280' }}>جاري التحميل...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />

      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <img src="/logo.png" alt="شواهدي" style={{ height: 36 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isTrial && trialDaysLeft !== null && (
            <span style={{ fontSize: 12, background: '#fffbeb', color: '#92400e', padding: '4px 10px', borderRadius: 20, border: '1px solid #fcd34d' }}>
              {trialDaysLeft} أيام متبقية من التجربة
            </span>
          )}
          <span style={{ fontSize: 13, color: '#6b7280' }}>{school?.name}</span>
          <button onClick={handleLogout} style={{ fontSize: 12, color: '#6b7280', background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
            خروج
          </button>
        </div>
      </nav>

      <div style={{ padding: '24px 16px', maxWidth: 720, margin: '0 auto' }}>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {school?.name}
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>معايير التقويم والاعتماد المدرسي — 1446هـ</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'إجمالي المؤشرات', value: stats.total, color: '#2563eb' },
            { label: 'مكتمل بشواهد', value: stats.completed, color: '#16a34a' },
            { label: 'إجمالي الشواهد', value: stats.evidences, color: '#2563eb' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 6px' }}>{s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0 }}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>نسبة الاكتمال الكلية</p>
            <p style={{ fontSize: 20, fontWeight: 700, margin: 0, color: completion >= 75 ? '#16a34a' : completion >= 50 ? '#d97706' : '#dc2626' }}>
              {loading ? '—' : `${completion}%`}
            </p>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: 99, height: 8 }}>
            <div style={{ background: completion >= 75 ? '#16a34a' : completion >= 50 ? '#d97706' : '#dc2626', width: `${completion || 1}%`, height: '100%', borderRadius: 99, transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {['تهيئة', 'انطلاق', 'تقدم', 'تميز'].map(level => (
              <p key={level} style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{level}</p>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {loading ? [1,2,3,4].map(i => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, height: 100, opacity: 0.4 }} />
          )) : domains.map(domain => {
            const pct = domain.total_indicators ? Math.round(((domain.completed || 0) / domain.total_indicators) * 100) : 0
            const color = DOMAIN_COLORS[domain.code] || '#6b7280'
            return (
              <Link key={domain.id} href={`/domain/${domain.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                        {DOMAIN_ICONS[domain.code]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, color: '#111827' }}>{domain.name_ar}</p>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{domain.total_indicators} مؤشراً · {domain.total_evidences} شاهد</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 22, fontWeight: 700, color, margin: 0 }}>{pct}%</p>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{domain.completed} / {domain.total_indicators}</p>
                    </div>
                  </div>
                  <div style={{ background: '#f3f4f6', borderRadius: 99, height: 6 }}>
                    <div style={{ background: color, width: `${pct || 1}%`, height: '100%', borderRadius: 99 }} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {!loading && stats.completed < stats.total && (
          <div style={{ marginTop: 16, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>⚠️</span>
            <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>
              {stats.total - stats.completed} مؤشراً بدون شواهد — أضف شاهداً لكل منها لرفع تصنيفك
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
