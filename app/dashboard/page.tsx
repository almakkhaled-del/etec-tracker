'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const GOLD_LIGHT = '#E8C275'
const CREAM = '#FBF8F2'

const DOMAIN_ICONS: Record<string, string> = { '1': '🏫', '2': '📚', '3': '📊', '4': '🏢' }
const DOMAIN_COLORS: Record<string, string> = { '1': '#1d4ed8', '2': '#16a34a', '3': '#C28A1F', '4': '#7c3aed' }

type Domain = {
  id: number; code: string; name_ar: string; order_num: number;
  total_indicators?: number; completed?: number; total_evidences?: number
}

function CircleProgress({ percent, color, size = 92 }: { percent: number; color: string; size?: number }) {
  const stroke = 8
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (percent / 100) * circumference
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#EDEAE0" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const { school, loading: schoolLoading } = useSchool()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, completed: 0, evidences: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!school) return
    async function load() {
      const { data: domainsData } = await supabase.from('domains').select('*').order('order_num')
      const { data: standards } = await supabase.from('standards').select('id, domain_id')
      const { data: indicators } = await supabase.from('indicators').select('id, standard_id')
      const { data: evidences } = await supabase
        .from('evidences').select('id, indicator_id').eq('school_id', school!.id)

      if (domainsData && standards && indicators) {
        const evByIndicator: Record<number, number> = {}
        evidences?.forEach(e => { evByIndicator[e.indicator_id] = (evByIndicator[e.indicator_id] || 0) + 1 })

        const stdByDomain: Record<number, number[]> = {}
        standards.forEach(s => { if (!stdByDomain[s.domain_id]) stdByDomain[s.domain_id] = []; stdByDomain[s.domain_id].push(s.id) })

        const indByStd: Record<number, number[]> = {}
        indicators.forEach(i => { if (!indByStd[i.standard_id]) indByStd[i.standard_id] = []; indByStd[i.standard_id].push(i.id) })

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
        const totalIndicators = enriched.reduce((s, d) => s + (d.total_indicators || 0), 0)
        setStats({ total: totalIndicators, completed: totalCompleted, evidences: totalEv })
      }
      setLoading(false)
    }
    load()
  }, [school])

  const completion = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const trialDaysLeft = school ? Math.max(0, Math.ceil((new Date(school.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null
  const isTrial = school?.subscription_status === 'trial'

  const navItems = [
    { href: '/dashboard', icon: '🏠', label: 'الرئيسية' },
    { href: '/print', icon: '🖨️', label: 'التقرير الكامل' },
  ]

  if (schoolLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', background: CREAM }}>
      <p style={{ color: '#8A8270' }}>جاري التحميل...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif; }
        .sidebar-link:hover { background: rgba(255,255,255,0.06) !important; }
        .domain-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(11,31,58,0.08); }
        @media (max-width: 860px) {
          .sidebar-desktop { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (min-width: 861px) {
          .mobile-toggle { display: none !important; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ============ SIDEBAR ============ */}
        <aside className="sidebar-desktop" style={{
          width: 248, background: NAVY, flexShrink: 0, display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', padding: '28px 0'
        }}>
          <div style={{ padding: '0 24px', marginBottom: 36 }}>
            <img src="/logo.png" alt="شواهدي" style={{ height: 38, filter: 'brightness(0) invert(1)' }} />
          </div>

          <nav style={{ flex: 1, padding: '0 14px' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="sidebar-link" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
                textDecoration: 'none', marginBottom: 4, transition: 'background 0.15s',
                background: pathname === item.href ? 'rgba(232,194,117,0.14)' : 'transparent',
                color: pathname === item.href ? GOLD_LIGHT : 'rgba(255,255,255,0.78)'
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div style={{ padding: '0 14px' }}>
            <button onClick={handleLogout} className="sidebar-link body-font" style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 14px',
              borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)', fontSize: 14, fontFamily: 'Tajawal, sans-serif'
            }}>
              <span style={{ fontSize: 16 }}>🚪</span>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* ============ MAIN CONTENT ============ */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Top header */}
          <header style={{
            background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)',
            padding: '0 28px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 50
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0 }}>{school?.name}</p>
              <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>
                معايير التقويم والاعتماد المدرسي — 1446هـ
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {isTrial && trialDaysLeft !== null && (
                <span className="body-font" style={{
                  fontSize: 12, fontWeight: 600, background: 'rgba(194,138,31,0.1)', color: '#A6730F',
                  padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(194,138,31,0.25)'
                }}>
                  {trialDaysLeft} أيام متبقية من التجربة
                </span>
              )}
              <div style={{
                width: 38, height: 38, borderRadius: '50%', background: NAVY,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: GOLD_LIGHT, fontSize: 14, fontWeight: 700
              }}>
                {school?.principal_name?.[0] || 'م'}
              </div>
            </div>
          </header>

          {/* Content */}
          <main style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
              <div style={{ background: NAVY, borderRadius: 16, padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
                <p className="body-font" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 8px' }}>نسبة الاكتمال الكلية</p>
                <p style={{ fontSize: 34, fontWeight: 800, color: '#fff', margin: 0 }}>{loading ? '—' : `${completion}%`}</p>
                <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 99, marginTop: 14 }}>
                  <div style={{ width: `${completion || 2}%`, height: '100%', background: GOLD_LIGHT, borderRadius: 99, transition: 'width 0.6s' }} />
                </div>
              </div>
              {[
                { label: 'إجمالي المؤشرات', value: stats.total, color: '#1d4ed8' },
                { label: 'مؤشرات مكتملة', value: stats.completed, color: '#16a34a' },
                { label: 'إجمالي الشواهد', value: stats.evidences, color: '#C28A1F' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '22px 20px' }}>
                  <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: '0 0 8px' }}>{s.label}</p>
                  <p style={{ fontSize: 30, fontWeight: 800, color: s.color, margin: 0 }}>{loading ? '—' : s.value}</p>
                </div>
              ))}
            </div>

            {/* Domain cards with circular progress */}
            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 16 }}>المجالات الأربعة</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
              {loading ? [1,2,3,4].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 24, height: 140, opacity: 0.4 }} />
              )) : domains.map(domain => {
                const pct = domain.total_indicators ? Math.round(((domain.completed || 0) / domain.total_indicators) * 100) : 0
                const color = DOMAIN_COLORS[domain.code] || '#6b7280'
                return (
                  <Link key={domain.id} href={`/domain/${domain.id}`} className="domain-card" style={{
                    textDecoration: 'none', color: 'inherit', background: '#fff', borderRadius: 16,
                    border: '1px solid rgba(11,31,58,0.07)', padding: '22px 24px',
                    display: 'flex', alignItems: 'center', gap: 20, transition: 'all 0.2s'
                  }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <CircleProgress percent={pct} color={color} />
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column'
                      }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{DOMAIN_ICONS[domain.code]}</span>
                        <p style={{ fontWeight: 700, fontSize: 15, color: NAVY, margin: 0 }}>{domain.name_ar}</p>
                      </div>
                      <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>
                        {domain.completed} من {domain.total_indicators} مؤشراً مكتمل
                      </p>
                      <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: '2px 0 0' }}>
                        {domain.total_evidences} شاهد مرفوع
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Print CTA */}
            <Link href="/print" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #C28A1F, #A6730F)', borderRadius: 16,
              padding: '22px 28px', textDecoration: 'none', marginBottom: 20
            }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>التقرير الكامل جاهز للطباعة</p>
                <p className="body-font" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                  اطبع ملف شواهد مدرستك كاملاً ومرتباً حسب المجالات والمعايير
                </p>
              </div>
              <span style={{ fontSize: 22 }}>←</span>
            </Link>

            {!loading && stats.completed < stats.total && (
              <div style={{ background: '#fff', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <p className="body-font" style={{ fontSize: 13, color: '#991B1B', margin: 0 }}>
                  {stats.total - stats.completed} مؤشراً بدون شواهد — أضف شاهداً لكل منها لرفع تصنيفك
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
