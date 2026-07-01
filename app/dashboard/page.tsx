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

type Indicator = {
  id: number; code: string; name_ar: string; order_num: number; evidence_count: number
}
type Standard = {
  id: number; code: string; name_ar: string; order_num: number
  indicators: Indicator[]; completed: number
}
type Domain = {
  id: number; code: string; name_ar: string; order_num: number
  standards: Standard[]; total_indicators: number; completed: number
}

function CircleProgress({ percent, color, size = 72 }: { percent: number; color: string; size?: number }) {
  const stroke = 6
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
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
      const { data: evidencesData } = await supabase
        .from('evidences').select('id, indicator_id').eq('school_id', school!.id)

      if (domainsData && standardsData && indicatorsData) {
        const evByInd: Record<number, number> = {}
        evidencesData?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })

        const built: Domain[] = domainsData.map(d => {
          const stds: Standard[] = standardsData
            .filter(s => s.domain_id === d.id)
            .map(s => {
              const inds: Indicator[] = indicatorsData
                .filter(i => i.standard_id === s.id)
                .map(i => ({ ...i, evidence_count: evByInd[i.id] || 0 }))
              return { ...s, indicators: inds, completed: inds.filter(i => i.evidence_count > 0).length }
            })
          const total_indicators = stds.reduce((s, st) => s + st.indicators.length, 0)
          const completed = stds.reduce((s, st) => s + st.completed, 0)
          return { ...d, standards: stds, total_indicators, completed }
        })

        setDomains(built)
        const totalCompleted = built.reduce((s, d) => s + d.completed, 0)
        const totalIndicators = built.reduce((s, d) => s + d.total_indicators, 0)
        const totalEv = Object.values(evByInd).reduce((s, v) => s + v, 0)
        setStats({ total: totalIndicators, completed: totalCompleted, evidences: totalEv })
      }
      setLoading(false)
    }
    load()
  }, [school])

  const completion = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
  const principalFirstName = school?.principal_name?.split(' ')[0] || 'مدير المدرسة'
  const isTrial = school?.subscription_status === 'trial'
  const trialDaysLeft = school ? Math.max(0, Math.ceil((new Date(school.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null

  function toggleDomain(id: number) {
    setActiveDomain(prev => prev === id ? null : id)
    setActiveStandard(null)
  }

  function toggleStandard(id: number) {
    setActiveStandard(prev => prev === id ? null : id)
  }

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
        .domain-card:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(11,31,58,0.1); }
        .std-card { cursor: pointer; transition: background 0.15s; }
        .std-card:hover { background: rgba(11,31,58,0.03) !important; }
        .ind-row { transition: background 0.15s; }
        .ind-row:hover { background: rgba(11,31,58,0.04) !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />

        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <header style={{
            background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)',
            padding: '0 28px', height: 80, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50
          }}>
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: NAVY, margin: '0 0 2px' }}>
                مرحباً، {principalFirstName} 👋
              </p>
              <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>
                {school?.name} — 1448هـ - 1449هـ
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
                width: 40, height: 40, borderRadius: '50%', background: NAVY,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: GOLD_LIGHT, fontSize: 15, fontWeight: 700
              }}>
                {school?.principal_name?.[0] || 'م'}
              </div>
            </div>
          </header>

          <main style={{ padding: '24px 28px', maxWidth: 960, margin: '0 auto' }}>

            {/* ====== OVERVIEW ====== */}
            <div style={{
              background: NAVY, borderRadius: 18, padding: '24px 28px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <CircleProgress percent={completion} color={GOLD_LIGHT} size={88} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{completion}%</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>نسبة الاكتمال الكلية</p>
                <p className="body-font" style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '0 0 14px' }}>
                  الحد الأدنى المطلوب: شاهد واحد على الأقل لكل مؤشر
                </p>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {[
                    { label: 'المؤشرات الكلية', value: stats.total, color: '#93C5FD' },
                    { label: 'مكتملة', value: stats.completed, color: '#86EFAC' },
                    { label: 'متبقية', value: stats.total - stats.completed, color: '#FCA5A5' },
                    { label: 'الشواهد', value: stats.evidences, color: GOLD_LIGHT },
                  ].map(s => (
                    <div key={s.label}>
                      <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: '0 0 2px' }}>
                        {loading ? '—' : s.value}
                      </p>
                      <p className="body-font" style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <Link href="/print" style={{
                  padding: '10px 18px', background: 'rgba(255,255,255,0.1)', color: '#fff',
                  borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600
                }}>🖨️ التقرير</Link>
                <Link href="/forms" style={{
                  padding: '10px 18px', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                  color: NAVY, borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700
                }}>📋 النماذج</Link>
              </div>
            </div>

            {/* ====== المجالات الأربعة (شبكة) ====== */}
            <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 14 }}>المجالات الأربعة</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 24 }}>
              {loading ? [1,2,3,4].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, height: 100, opacity: 0.4 }} />
              )) : domains.map(domain => {
                const pct = domain.total_indicators ? Math.round((domain.completed / domain.total_indicators) * 100) : 0
                const color = DOMAIN_COLORS[domain.code] || NAVY
                const isActive = activeDomain === domain.id

                return (
                  <div key={domain.id}>
                    {/* كرت المجال */}
                    <div className="domain-card" onClick={() => toggleDomain(domain.id)} style={{
                      background: '#fff', borderRadius: 16,
                      border: `2px solid ${isActive ? color : 'rgba(11,31,58,0.07)'}`,
                      padding: '18px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      boxShadow: isActive ? `0 4px 16px ${color}22` : 'none'
                    }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <CircleProgress percent={pct} color={color} size={72} />
                        <div style={{
                          position: 'absolute', inset: 0, display: 'flex',
                          alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 18 }}>{DOMAIN_ICONS[domain.code]}</span>
                          <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: 0 }}>{domain.name_ar}</p>
                        </div>
                        <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>
                          {domain.completed} من {domain.total_indicators} مؤشراً مكتمل
                        </p>
                      </div>
                      <span style={{
                        fontSize: 16, color: isActive ? color : '#C0BCA8',
                        transition: 'transform 0.25s',
                        transform: isActive ? 'rotate(90deg)' : 'none',
                        flexShrink: 0
                      }}>←</span>
                    </div>

                    {/* ====== المعايير (شبكة منسدلة) ====== */}
                    {isActive && (
                      <div style={{
                        marginTop: 10, background: '#fff', borderRadius: 14,
                        border: '1px solid rgba(11,31,58,0.07)', overflow: 'hidden'
                      }}>
                        <p className="body-font" style={{
                          fontSize: 11, color: '#8A8270', padding: '10px 16px 8px',
                          borderBottom: '1px solid rgba(11,31,58,0.05)', margin: 0,
                          background: '#FAFAFA', letterSpacing: 0.5
                        }}>
                          معايير {domain.name_ar}
                        </p>

                        {domain.standards.map((standard, sIdx) => {
                          const stdPct = standard.indicators.length
                            ? Math.round((standard.completed / standard.indicators.length) * 100) : 0
                          const isActiveS = activeStandard === standard.id

                          return (
                            <div key={standard.id} style={{
                              borderBottom: sIdx < domain.standards.length - 1
                                ? '1px solid rgba(11,31,58,0.05)' : 'none'
                            }}>
                              {/* صف المعيار */}
                              <div className="std-card" onClick={() => toggleStandard(standard.id)} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '13px 16px',
                                background: isActiveS ? `${color}06` : 'transparent'
                              }}>
                                <div style={{
                                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                  background: stdPct === 100 ? '#16a34a' : stdPct > 0 ? color : '#E5E7EB'
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: NAVY, margin: '0 0 2px', lineHeight: 1.4 }}>
                                    {standard.name_ar}
                                  </p>
                                  <p className="body-font" style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
                                    {standard.code} · {standard.completed}/{standard.indicators.length} مكتمل
                                  </p>
                                </div>
                                <span className="body-font" style={{
                                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                                  color: stdPct === 100 ? '#16a34a' : '#8A8270'
                                }}>
                                  {stdPct}%
                                </span>
                                <span style={{
                                  fontSize: 13, color: isActiveS ? color : '#C0BCA8',
                                  transition: 'transform 0.2s', flexShrink: 0,
                                  transform: isActiveS ? 'rotate(90deg)' : 'none'
                                }}>←</span>
                              </div>

                              {/* ====== المؤشرات ====== */}
                              {isActiveS && (
                                <div style={{ background: `${color}04`, borderTop: '1px solid rgba(11,31,58,0.04)' }}>
                                  {standard.indicators.map((ind, iIdx) => {
                                    const hasEv = ind.evidence_count > 0
                                    return (
                                      <Link key={ind.id} href={`/indicator/${ind.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="ind-row" style={{
                                          display: 'flex', alignItems: 'center', gap: 12,
                                          padding: '11px 16px 11px 28px',
                                          borderBottom: iIdx < standard.indicators.length - 1
                                            ? '1px solid rgba(11,31,58,0.04)' : 'none',
                                          background: 'transparent'
                                        }}>
                                          <span style={{ fontSize: 13, flexShrink: 0 }}>
                                            {hasEv ? '✅' : '⭕'}
                                          </span>
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <p className="body-font" style={{
                                              fontSize: 12, color: '#374151', margin: '0 0 1px', lineHeight: 1.5
                                            }}>
                                              {ind.name_ar}
                                            </p>
                                            <span className="body-font" style={{ fontSize: 10, color: '#9CA3AF' }}>
                                              {ind.code}
                                            </span>
                                          </div>
                                          <span className="body-font" style={{
                                            fontSize: 11, fontWeight: 600, flexShrink: 0,
                                            padding: '3px 10px', borderRadius: 20,
                                            background: hasEv ? '#F0FDF4' : '#FEF2F2',
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
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}
