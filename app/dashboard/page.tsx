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

type Domain = {
  id: number; code: string; name_ar: string; order_num: number
  total_indicators: number; completed: number; total_evidences: number
}

type Standard = {
  id: number; code: string; name_ar: string; completed: number; total: number
}

function CircleProgress({ percent, color, size = 80 }: { percent: number; color: string; size?: number }) {
  const stroke = 7; const r = (size - stroke) / 2; const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#EDEAE0" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  )
}

export default function Dashboard() {
  const { school, loading: schoolLoading } = useSchool()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, completed: 0, evidences: 0 })

  // حالة الـ animation
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [standards, setStandards] = useState<Standard[]>([])
  const [loadingStandards, setLoadingStandards] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [showStandards, setShowStandards] = useState(false)

  useEffect(() => {
    if (!school) return
    async function load() {
      const { data: domainsData } = await supabase.from('domains').select('*').order('order_num')
      const { data: stds } = await supabase.from('standards').select('id, domain_id')
      const { data: indicators } = await supabase.from('indicators').select('id, standard_id')
      const { data: evidences } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', school!.id)

      if (domainsData && stds && indicators) {
        const evByInd: Record<number, number> = {}
        evidences?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })
        const stdByDomain: Record<number, number[]> = {}
        stds.forEach(s => { if (!stdByDomain[s.domain_id]) stdByDomain[s.domain_id] = []; stdByDomain[s.domain_id].push(s.id) })
        const indByStd: Record<number, number[]> = {}
        indicators.forEach(i => { if (!indByStd[i.standard_id]) indByStd[i.standard_id] = []; indByStd[i.standard_id].push(i.id) })

        const enriched = domainsData.map(d => {
          const stdIds = stdByDomain[d.id] || []
          const indIds = stdIds.flatMap(sid => indByStd[sid] || [])
          const completed = indIds.filter(id => (evByInd[id] || 0) > 0).length
          const totalEv = indIds.reduce((sum, id) => sum + (evByInd[id] || 0), 0)
          return { ...d, total_indicators: indIds.length, completed, total_evidences: totalEv }
        })

        setDomains(enriched)
        setStats({
          total: enriched.reduce((s, d) => s + d.total_indicators, 0),
          completed: enriched.reduce((s, d) => s + d.completed, 0),
          evidences: enriched.reduce((s, d) => s + d.total_evidences, 0),
        })
      }
      setLoading(false)
    }
    load()
  }, [school])

  async function handleDomainClick(domain: Domain) {
    if (animating) return

    setAnimating(true)
    setSelectedDomain(domain)
    setShowStandards(false)
    setLoadingStandards(true)

    // جيب المعايير
    const { data: stdsData } = await supabase.from('standards').select('*').eq('domain_id', domain.id).order('order_num')
    const { data: indicators } = await supabase.from('indicators').select('id, standard_id')
    const { data: evidences } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', school!.id)

    if (stdsData && indicators) {
      const evByInd: Record<number, number> = {}
      evidences?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })
      const indByStd: Record<number, number[]> = {}
      indicators.forEach(i => { if (!indByStd[i.standard_id]) indByStd[i.standard_id] = []; indByStd[i.standard_id].push(i.id) })

      const enriched: Standard[] = stdsData.map(s => {
        const indIds = indByStd[s.id] || []
        const completed = indIds.filter(id => (evByInd[id] || 0) > 0).length
        return { ...s, completed, total: indIds.length }
      })
      setStandards(enriched)
    }

    setLoadingStandards(false)

    // بعد 350ms اظهر المعايير
    setTimeout(() => {
      setShowStandards(true)
      setAnimating(false)
    }, 350)
  }

  function handleBack() {
    setShowStandards(false)
    setSelectedDomain(null)
    setStandards([])
  }

  const completion = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
  const principalFirstName = school?.principal_name?.split(' ')[0] || 'مدير المدرسة'
  const isTrial = school?.subscription_status === 'trial'
  const trialDaysLeft = school ? Math.max(0, Math.ceil((new Date(school.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null

  if (schoolLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', background: CREAM }}>
      <p style={{ color: '#8A8270' }}>جاري التحميل...</p>
    </div>
  )

  const selectedColor = selectedDomain ? (DOMAIN_COLORS[selectedDomain.code] || NAVY) : NAVY

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic','Tajawal',sans-serif; }
        .domain-card { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
        .domain-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(11,31,58,0.12) !important; }
        .domain-card.selected { transform: scale(0.92); opacity: 0.95; }
        .domain-card.hidden { transform: scale(0.85) translateY(10px); opacity: 0; pointer-events: none; }
        .standards-container { animation: fadeSlideUp 0.4s ease forwards; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .std-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(11,31,58,0.10) !important; }
        .std-card { transition: all 0.2s; }
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
              <p style={{ fontSize: 17, fontWeight: 800, color: NAVY, margin: '0 0 2px' }}>مرحباً، {principalFirstName} 👋</p>
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
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_LIGHT, fontSize: 15, fontWeight: 700 }}>
                {school?.principal_name?.[0] || 'م'}
              </div>
            </div>
          </header>

          <main style={{ padding: '28px', maxWidth: 1000, margin: '0 auto' }}>

            {/* 4 إحصائيات */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
              <div style={{ background: NAVY, borderRadius: 16, padding: '22px 20px' }}>
                <p className="body-font" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 0 6px' }}>نسبة الاكتمال الكلية</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>{loading ? '—' : `${completion}%`}</p>
                <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 99 }}>
                  <div style={{ width: `${completion || 2}%`, height: '100%', background: GOLD_LIGHT, borderRadius: 99, transition: 'width 0.6s' }} />
                </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '22px 20px' }}>
                <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: '0 0 6px' }}>إجمالي المؤشرات</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#1d4ed8', margin: 0 }}>{loading ? '—' : stats.total}</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '22px 20px' }}>
                <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: '0 0 6px' }}>مؤشرات مكتملة</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#16a34a', margin: '0 0 4px' }}>{loading ? '—' : stats.completed}</p>
                {!loading && <p className="body-font" style={{ fontSize: 11, color: '#DC2626', margin: 0 }}>متبقي {stats.total - stats.completed}</p>}
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '22px 20px' }}>
                <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: '0 0 6px' }}>إجمالي الشواهد</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: GOLD, margin: 0 }}>{loading ? '—' : stats.evidences}</p>
              </div>
            </div>

            {/* المجالات أو المعايير */}
            {!showStandards ? (
              <>
                <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 16 }}>
                  {selectedDomain ? '' : 'اختر مجالاً للبدء'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
                  {loading ? [1,2,3,4].map(i => (
                    <div key={i} style={{ background: '#fff', borderRadius: 18, height: 130, opacity: 0.4 }} />
                  )) : domains.map(domain => {
                    const pct = domain.total_indicators ? Math.round((domain.completed / domain.total_indicators) * 100) : 0
                    const color = DOMAIN_COLORS[domain.code] || NAVY
                    const isSelected = selectedDomain?.id === domain.id
                    const isHidden = selectedDomain && !isSelected

                    return (
                      <div
                        key={domain.id}
                        onClick={() => handleDomainClick(domain)}
                        className={`domain-card${isSelected ? ' selected' : ''}${isHidden ? ' hidden' : ''}`}
                        style={{
                          background: '#fff', borderRadius: 18,
                          border: isSelected ? `2px solid ${color}` : '1.5px solid rgba(11,31,58,0.07)',
                          padding: '22px 24px',
                          display: 'flex', alignItems: 'center', gap: 20,
                          boxShadow: isSelected ? `0 6px 24px ${color}30` : '0 2px 8px rgba(11,31,58,0.05)'
                        }}
                      >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <CircleProgress percent={pct} color={color} size={80} />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{pct}%</span>
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 22 }}>{DOMAIN_ICONS[domain.code]}</span>
                            <p style={{ fontWeight: 700, fontSize: 15, color: NAVY, margin: 0 }}>{domain.name_ar}</p>
                          </div>
                          <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: '0 0 4px' }}>
                            {domain.completed} من {domain.total_indicators} مؤشراً مكتمل
                          </p>
                          <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>
                            {domain.total_evidences} شاهد مرفوع
                          </p>
                        </div>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: 16, color }}>←</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              /* المعايير */
              <div className="standards-container">
                {/* رأس المجال المختار */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <button onClick={handleBack} style={{
                    background: 'rgba(11,31,58,0.06)', border: 'none', borderRadius: 10,
                    padding: '8px 16px', fontSize: 13, color: NAVY, cursor: 'pointer',
                    fontFamily: 'Tajawal, sans-serif', fontWeight: 600
                  }}>
                    ← رجوع
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{DOMAIN_ICONS[selectedDomain!.code]}</span>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: 0 }}>{selectedDomain!.name_ar}</p>
                      <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>
                        {selectedDomain!.completed} من {selectedDomain!.total_indicators} مؤشراً مكتمل
                      </p>
                    </div>
                  </div>
                </div>

                {loadingStandards ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#8A8270' }}>
                    <p>جاري التحميل...</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {standards.map(std => {
                      const pct = std.total ? Math.round((std.completed / std.total) * 100) : 0
                      return (
                        <Link key={std.id} href={`/standard/${std.id}`} className="std-card" style={{
                          textDecoration: 'none', color: 'inherit',
                          background: '#fff', borderRadius: 16,
                          border: '1.5px solid rgba(11,31,58,0.07)',
                          padding: '18px 22px',
                          display: 'flex', alignItems: 'center', gap: 16,
                          boxShadow: '0 2px 8px rgba(11,31,58,0.05)'
                        }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                            background: `${selectedColor}14`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 15, fontWeight: 800, color: selectedColor
                          }}>
                            {std.code}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: '0 0 8px', lineHeight: 1.5 }}>
                              {std.name_ar}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 100, height: 5, background: '#EDEAE0', borderRadius: 99 }}>
                                <div style={{ width: `${pct || 2}%`, height: '100%', background: pct === 100 ? '#16a34a' : selectedColor, borderRadius: 99, transition: 'width 0.4s' }} />
                              </div>
                              <span className="body-font" style={{ fontSize: 12, color: '#8A8270' }}>
                                {std.completed}/{std.total} مكتمل
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: 15, fontWeight: 700, color: pct === 100 ? '#16a34a' : selectedColor, flexShrink: 0 }}>
                            {pct}%
                          </span>
                          <span style={{ fontSize: 16, color: '#C0BCA8', flexShrink: 0 }}>←</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* أزرار سريعة */}
            {!showStandards && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 8 }}>
                <Link href="/print" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: `linear-gradient(135deg, ${GOLD}, #A6730F)`,
                  borderRadius: 16, padding: '18px 24px', textDecoration: 'none'
                }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>🖨️ التقرير الكامل</p>
                    <p className="body-font" style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0 }}>اطبع ملف شواهد مدرستك كاملاً</p>
                  </div>
                  <span style={{ fontSize: 20, color: '#fff' }}>←</span>
                </Link>
                <Link href="/forms" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: NAVY, borderRadius: 16, padding: '18px 24px', textDecoration: 'none'
                }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>📋 النماذج الجاهزة</p>
                    <p className="body-font" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>29 نموذجاً جاهزاً للتحميل</p>
                  </div>
                  <span style={{ fontSize: 20, color: '#fff' }}>←</span>
                </Link>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}
