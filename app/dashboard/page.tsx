'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const GOLD_LIGHT = '#E8C275'
const CREAM = '#FBF8F2'

const DOMAIN_COLORS: Record<string, string> = {
  '1': '#1d4ed8', '2': '#16a34a', '3': '#C28A1F', '4': '#7c3aed'
}
const DOMAIN_ICONS: Record<string, string> = {
  '1': '🏫', '2': '📚', '3': '📊', '4': '🏢'
}

type Indicator = { id: number; code: string; name_ar: string; order_num: number; evidence_count: number }
type Standard = { id: number; code: string; name_ar: string; order_num: number; indicators: Indicator[]; completed: number }
type Domain = { id: number; code: string; name_ar: string; order_num: number; standards: Standard[]; total_indicators: number; completed: number }

function CircleProgress({ percent, color, size = 72 }: { percent: number; color: string; size?: number }) {
  const stroke = 6; const r = (size - stroke) / 2; const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#EDEAE0" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
    </svg>
  )
}

export default function Dashboard() {
  const { school, loading: schoolLoading } = useSchool()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDomain, setActiveDomain] = useState<number | null>(null)
  const [activeStandard, setActiveStandard] = useState<number | null>(null)
  const [stats, setStats] = useState({ total: 0, completed: 0, evidences: 0 })

  useEffect(() => {
    if (!school) return
    async function load() {
      const { data: domainsData } = await supabase.from('domains').select('*').order('order_num')
      const { data: standardsData } = await supabase.from('standards').select('*').order('order_num')
      const { data: indicatorsData } = await supabase.from('indicators').select('*').order('order_num')
      const { data: evidencesData } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', school!.id)

      if (domainsData && standardsData && indicatorsData) {
        const evByInd: Record<number, number> = {}
        evidencesData?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })
        const built: Domain[] = domainsData.map(d => {
          const stds: Standard[] = standardsData.filter(s => s.domain_id === d.id).map(s => {
            const inds: Indicator[] = indicatorsData.filter(i => i.standard_id === s.id).map(i => ({ ...i, evidence_count: evByInd[i.id] || 0 }))
            return { ...s, indicators: inds, completed: inds.filter(i => i.evidence_count > 0).length }
          })
          const total_indicators = stds.reduce((s, st) => s + st.indicators.length, 0)
          const completed = stds.reduce((s, st) => s + st.completed, 0)
          return { ...d, standards: stds, total_indicators, completed }
        })
        setDomains(built)
        setStats({
          total: built.reduce((s, d) => s + d.total_indicators, 0),
          completed: built.reduce((s, d) => s + d.completed, 0),
          evidences: Object.values(evByInd).reduce((s, v) => s + v, 0)
        })
      }
      setLoading(false)
    }
    load()
  }, [school])

  const completion = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
  const principalFirstName = school?.principal_name?.split(' ')[0] || 'مدير المدرسة'
  const isTrial = school?.subscription_status === 'trial'
  const trialDaysLeft = school ? Math.max(0, Math.ceil((new Date(school.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null

  if (schoolLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', background: CREAM }}>
      <p style={{ color: '#8A8270' }}>جاري التحميل...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic','Tajawal',sans-serif; }
        .domain-card { cursor: pointer; transition: all 0.2s; }
        .domain-card:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(11,31,58,0.10); }
        .std-row { cursor: pointer; transition: filter 0.15s; }
        .std-row:hover { filter: brightness(0.97); }
        .ind-row:hover { filter: brightness(0.96); }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: NAVY, margin: '0 0 2px' }}>مرحباً، {principalFirstName} 👋</p>
              <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>{school?.name} — 1448هـ - 1449هـ</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {isTrial && trialDaysLeft !== null && (
                <span className="body-font" style={{ fontSize: 12, fontWeight: 600, background: 'rgba(194,138,31,0.1)', color: '#A6730F', padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(194,138,31,0.25)' }}>
                  {trialDaysLeft} أيام متبقية من التجربة
                </span>
              )}
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_LIGHT, fontSize: 15, fontWeight: 700 }}>
                {school?.principal_name?.[0] || 'م'}
              </div>
            </div>
          </header>

          <main style={{ padding: '24px 28px', maxWidth: 960, margin: '0 auto' }}>

            {/* 4 كروت إحصائيات */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              <div style={{ background: NAVY, borderRadius: 16, padding: '20px' }}>
                <p className="body-font" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 0 6px' }}>نسبة الاكتمال الكلية</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{loading ? '—' : `${completion}%`}</p>
                <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 99 }}>
                  <div style={{ width: `${completion || 2}%`, height: '100%', background: GOLD_LIGHT, borderRadius: 99, transition: 'width 0.6s' }} />
                </div>
                <p className="body-font" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '6px 0 0' }}>الحد الأدنى: شاهد لكل مؤشر</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '20px' }}>
                <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: '0 0 6px' }}>إجمالي المؤشرات</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: '#1d4ed8', margin: 0 }}>{loading ? '—' : stats.total}</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '20px' }}>
                <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: '0 0 6px' }}>مؤشرات مكتملة</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: '#16a34a', margin: '0 0 4px' }}>{loading ? '—' : stats.completed}</p>
                {!loading && <p className="body-font" style={{ fontSize: 11, color: '#DC2626', margin: 0 }}>متبقي {stats.total - stats.completed}</p>}
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '20px' }}>
                <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: '0 0 6px' }}>إجمالي الشواهد</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: GOLD, margin: 0 }}>{loading ? '—' : stats.evidences}</p>
              </div>
            </div>

            {/* المجالات شبكة 2×2 */}
            <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 14 }}>المجالات الأربعة</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {loading ? [1,2,3,4].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, height: 100, opacity: 0.4 }} />
              )) : domains.map(domain => {
                const pct = domain.total_indicators ? Math.round((domain.completed / domain.total_indicators) * 100) : 0
                const color = DOMAIN_COLORS[domain.code] || NAVY
                const isActive = activeDomain === domain.id

                return (
                  <div key={domain.id}>
                    {/* كرت المجال */}
                    <div className="domain-card" onClick={() => { setActiveDomain(prev => prev === domain.id ? null : domain.id); setActiveStandard(null) }} style={{
                      background: isActive ? color : '#fff',
                      borderRadius: 16,
                      border: `2px solid ${isActive ? color : 'rgba(11,31,58,0.07)'}`,
                      padding: '18px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <CircleProgress percent={pct} color={isActive ? 'rgba(255,255,255,0.9)' : color} size={72} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: isActive ? '#fff' : NAVY }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 18 }}>{DOMAIN_ICONS[domain.code]}</span>
                          <p style={{ fontSize: 14, fontWeight: 700, color: isActive ? '#fff' : NAVY, margin: 0 }}>{domain.name_ar}</p>
                        </div>
                        <p className="body-font" style={{ fontSize: 12, color: isActive ? 'rgba(255,255,255,0.75)' : '#8A8270', margin: 0 }}>
                          {domain.completed} من {domain.total_indicators} مؤشراً مكتمل
                        </p>
                      </div>
                      <span style={{ fontSize: 16, color: isActive ? '#fff' : '#C0BCA8', transition: 'transform 0.25s', transform: isActive ? 'rotate(90deg)' : 'none', flexShrink: 0 }}>←</span>
                    </div>

                    {/* المعايير منسدلة */}
                    {isActive && (
                      <div style={{ marginTop: 6, borderRadius: 14, overflow: 'hidden', border: `1px solid ${color}33` }}>
                        {domain.standards.map((standard, sIdx) => {
                          const stdPct = standard.indicators.length ? Math.round((standard.completed / standard.indicators.length) * 100) : 0
                          const isActiveS = activeStandard === standard.id

                          return (
                            <div key={standard.id}>
                              {/* صف المعيار - رمادي فاتح مع border يمين بلون المجال */}
                              <div className="std-row" onClick={() => setActiveStandard(prev => prev === standard.id ? null : standard.id)} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px 12px 20px',
                                background: isActiveS ? `${color}14` : '#F5F4F1',
                                borderBottom: '1px solid rgba(11,31,58,0.06)',
                                borderRight: `4px solid ${color}`,
                              }}>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: stdPct === 100 ? '#16a34a' : stdPct > 0 ? color : '#D1D5DB' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: NAVY, margin: '0 0 1px', lineHeight: 1.4 }}>{standard.name_ar}</p>
                                  <span className="body-font" style={{ fontSize: 11, color: '#6B7280' }}>
                                    {standard.code} · {standard.completed}/{standard.indicators.length} مكتمل · {stdPct}%
                                  </span>
                                </div>
                                <span style={{ fontSize: 12, color: isActiveS ? color : '#C0BCA8', transition: 'transform 0.2s', flexShrink: 0, transform: isActiveS ? 'rotate(90deg)' : 'none' }}>←</span>
                              </div>

                              {/* المؤشرات - أبيض/ألوان مع زحزحة أكثر */}
                              {isActiveS && standard.indicators.map((ind, iIdx) => {
                                const hasEv = ind.evidence_count > 0
                                return (
                                  <Link key={ind.id} href={`/indicator/${ind.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="ind-row" style={{
                                      display: 'flex', alignItems: 'center', gap: 10,
                                      padding: '10px 16px 10px 40px',
                                      background: hasEv ? '#F0FDF4' : '#FFF8F8',
                                      borderBottom: iIdx < standard.indicators.length - 1 ? '1px solid rgba(11,31,58,0.04)' : 'none',
                                      borderRight: `4px solid ${hasEv ? '#86EFAC' : '#FCA5A5'}`,
                                    }}>
                                      <span style={{ fontSize: 12, flexShrink: 0 }}>{hasEv ? '✅' : '⭕'}</span>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p className="body-font" style={{ fontSize: 12, color: '#374151', margin: '0 0 1px', lineHeight: 1.5 }}>{ind.name_ar}</p>
                                        <span className="body-font" style={{ fontSize: 10, color: '#9CA3AF' }}>{ind.code}</span>
                                      </div>
                                      <span className="body-font" style={{
                                        fontSize: 11, fontWeight: 600, flexShrink: 0,
                                        padding: '3px 10px', borderRadius: 20,
                                        background: hasEv ? '#DCFCE7' : '#FEE2E2',
                                        color: hasEv ? '#16a34a' : '#DC2626'
                                      }}>
                                        {hasEv ? `${ind.evidence_count} شواهد` : 'فارغ'}
                                      </span>
                                      <span style={{ fontSize: 11, color: '#C0BCA8', flexShrink: 0 }}>←</span>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* أزرار سريعة */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              <Link href="/print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `linear-gradient(135deg, ${GOLD}, #A6730F)`, borderRadius: 14, padding: '16px 22px', textDecoration: 'none' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>🖨️ التقرير الكامل</p>
                  <p className="body-font" style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0 }}>اطبع ملف شواهد مدرستك</p>
                </div>
                <span style={{ fontSize: 18, color: '#fff' }}>←</span>
              </Link>
              <Link href="/forms" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: NAVY, borderRadius: 14, padding: '16px 22px', textDecoration: 'none' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>📋 النماذج الجاهزة</p>
                  <p className="body-font" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>29 نموذجاً جاهزاً للتحميل</p>
                </div>
                <span style={{ fontSize: 18, color: '#fff' }}>←</span>
              </Link>
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}
