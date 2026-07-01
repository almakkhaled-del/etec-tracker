'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const GOLD_LIGHT = '#E8C275'
const CREAM = '#FBF8F2'

const DOMAIN_COLORS: Record<string, string> = {
  '1': '#1d4ed8',
  '2': '#16a34a',
  '3': '#C28A1F',
  '4': '#7c3aed'
}
const DOMAIN_ICONS: Record<string, string> = {
  '1': '🏫', '2': '📚', '3': '📊', '4': '🏢'
}

type Indicator = {
  id: number; code: string; name_ar: string; order_num: number
  evidence_count: number
}
type Standard = {
  id: number; code: string; name_ar: string; order_num: number
  indicators: Indicator[]
  completed: number
}
type Domain = {
  id: number; code: string; name_ar: string; order_num: number
  standards: Standard[]
  total_indicators: number
  completed: number
}

export default function Dashboard() {
  const router = useRouter()
  const { school, loading: schoolLoading } = useSchool()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [openDomains, setOpenDomains] = useState<Record<number, boolean>>({})
  const [openStandards, setOpenStandards] = useState<Record<number, boolean>>({})
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
              const completed = inds.filter(i => i.evidence_count > 0).length
              return { ...s, indicators: inds, completed }
            })
          const total_indicators = stds.reduce((sum, s) => sum + s.indicators.length, 0)
          const completed = stds.reduce((sum, s) => sum + s.completed, 0)
          return { ...d, standards: stds, total_indicators, completed }
        })

        setDomains(built)
        const totalCompleted = built.reduce((s, d) => s + d.completed, 0)
        const totalIndicators = built.reduce((s, d) => s + d.total_indicators, 0)
        const totalEv = Object.values(evByInd).reduce((s, v) => s + v, 0)
        setStats({ total: totalIndicators, completed: totalCompleted, evidences: totalEv })

        // افتح المجال الأول تلقائياً
        if (built.length > 0) setOpenDomains({ [built[0].id]: true })
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
    setOpenDomains(prev => ({ ...prev, [id]: !prev[id] }))
  }
  function toggleStandard(id: number) {
    setOpenStandards(prev => ({ ...prev, [id]: !prev[id] }))
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
        .body-font { font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif; }
        .domain-row:hover { background: rgba(11,31,58,0.03) !important; }
        .std-row:hover { background: rgba(11,31,58,0.04) !important; }
        .ind-row:hover { background: rgba(11,31,58,0.04) !important; }
        .ind-link { text-decoration: none; color: inherit; }
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

          <main style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto' }}>

            {/* إحصائيات مختصرة */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              <div style={{ background: NAVY, borderRadius: 14, padding: '18px 18px' }}>
                <p className="body-font" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 0 6px' }}>نسبة الاكتمال</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{loading ? '—' : `${completion}%`}</p>
                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 99 }}>
                  <div style={{ width: `${completion || 2}%`, height: '100%', background: GOLD_LIGHT, borderRadius: 99, transition: 'width 0.6s' }} />
                </div>
                <p className="body-font" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '6px 0 0' }}>
                  الحد الأدنى: شاهد لكل مؤشر
                </p>
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 14, padding: '18px 18px' }}>
                <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: '0 0 6px' }}>إجمالي المؤشرات</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#1d4ed8', margin: 0 }}>{loading ? '—' : stats.total}</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 14, padding: '18px 18px' }}>
                <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: '0 0 6px' }}>مؤشرات مكتملة</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', margin: '0 0 4px' }}>{loading ? '—' : stats.completed}</p>
                {!loading && <p className="body-font" style={{ fontSize: 11, color: '#DC2626', margin: 0 }}>متبقي {stats.total - stats.completed}</p>}
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 14, padding: '18px 18px' }}>
                <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: '0 0 6px' }}>إجمالي الشواهد</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#C28A1F', margin: 0 }}>{loading ? '—' : stats.evidences}</p>
              </div>
            </div>

            {/* الشجرة */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(11,31,58,0.07)', overflow: 'hidden' }}>

              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <p className="body-font" style={{ color: '#8A8270' }}>جاري تحميل البيانات...</p>
                </div>
              ) : domains.map((domain, dIdx) => {
                const domainPct = domain.total_indicators ? Math.round((domain.completed / domain.total_indicators) * 100) : 0
                const domainColor = DOMAIN_COLORS[domain.code] || NAVY
                const isOpenD = !!openDomains[domain.id]

                return (
                  <div key={domain.id} style={{ borderBottom: dIdx < domains.length - 1 ? '1px solid rgba(11,31,58,0.06)' : 'none' }}>

                    {/* صف المجال */}
                    <div className="domain-row" onClick={() => toggleDomain(domain.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                      cursor: 'pointer', transition: 'background 0.15s',
                      background: isOpenD ? `${domainColor}08` : 'transparent'
                    }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{DOMAIN_ICONS[domain.code]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>{domain.name_ar}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 80, height: 4, background: '#EDEAE0', borderRadius: 99 }}>
                            <div style={{ width: `${domainPct || 2}%`, height: '100%', background: domainColor, borderRadius: 99, transition: 'width 0.4s' }} />
                          </div>
                          <span className="body-font" style={{ fontSize: 12, color: '#8A8270' }}>
                            {domain.completed}/{domain.total_indicators} مؤشراً
                          </span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: domainColor,
                        background: `${domainColor}12`, padding: '4px 12px', borderRadius: 20
                      }}>
                        {domainPct}%
                      </span>
                      <span style={{ fontSize: 14, color: '#C0BCA8', transition: 'transform 0.2s', transform: isOpenD ? 'rotate(90deg)' : 'none' }}>
                        ←
                      </span>
                    </div>

                    {/* معايير المجال */}
                    {isOpenD && domain.standards.map((standard, sIdx) => {
                      const stdPct = standard.indicators.length ? Math.round((standard.completed / standard.indicators.length) * 100) : 0
                      const isOpenS = !!openStandards[standard.id]

                      return (
                        <div key={standard.id} style={{ borderTop: '1px solid rgba(11,31,58,0.04)' }}>

                          {/* صف المعيار */}
                          <div className="std-row" onClick={() => toggleStandard(standard.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '13px 20px 13px 40px',
                            cursor: 'pointer', transition: 'background 0.15s',
                            background: isOpenS ? 'rgba(11,31,58,0.03)' : 'rgba(11,31,58,0.01)'
                          }}>
                            <div style={{
                              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                              background: domainColor, opacity: 0.6
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 2px' }}>
                                {standard.name_ar}
                              </p>
                              <span className="body-font" style={{ fontSize: 11, color: '#9CA3AF' }}>
                                معيار {standard.code} · {standard.completed}/{standard.indicators.length} مؤشرات مكتملة
                              </span>
                            </div>
                            <span className="body-font" style={{ fontSize: 11, color: stdPct === 100 ? '#16a34a' : '#8A8270', fontWeight: 600 }}>
                              {stdPct}%
                            </span>
                            <span style={{ fontSize: 12, color: '#C0BCA8', transition: 'transform 0.2s', transform: isOpenS ? 'rotate(90deg)' : 'none' }}>
                              ←
                            </span>
                          </div>

                          {/* مؤشرات المعيار */}
                          {isOpenS && standard.indicators.map((indicator) => {
                            const hasEv = indicator.evidence_count > 0
                            return (
                              <Link key={indicator.id} href={`/indicator/${indicator.id}`} className="ind-link">
                                <div className="ind-row" style={{
                                  display: 'flex', alignItems: 'center', gap: 12,
                                  padding: '11px 20px 11px 60px',
                                  borderTop: '1px solid rgba(11,31,58,0.03)',
                                  transition: 'background 0.15s',
                                  background: 'rgba(11,31,58,0.005)'
                                }}>
                                  <span style={{ fontSize: 14, flexShrink: 0 }}>
                                    {hasEv ? '✅' : '⭕'}
                                  </span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p className="body-font" style={{
                                      fontSize: 13, color: '#374151', margin: '0 0 2px',
                                      lineHeight: 1.5
                                    }}>
                                      {indicator.name_ar}
                                    </p>
                                    <span className="body-font" style={{ fontSize: 11, color: '#9CA3AF' }}>
                                      {indicator.code}
                                    </span>
                                  </div>
                                  <span className="body-font" style={{
                                    fontSize: 11, fontWeight: 600, flexShrink: 0, padding: '3px 10px', borderRadius: 20,
                                    background: hasEv ? '#F0FDF4' : '#FEF2F2',
                                    color: hasEv ? '#16a34a' : '#DC2626'
                                  }}>
                                    {hasEv ? `${indicator.evidence_count} شواهد` : 'فارغ'}
                                  </span>
                                  <span style={{ fontSize: 12, color: '#C0BCA8', flexShrink: 0 }}>←</span>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* أزرار سريعة */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              <Link href="/print" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #C28A1F, #A6730F)', borderRadius: 14,
                padding: '18px 22px', textDecoration: 'none'
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>🖨️ التقرير الكامل</p>
                  <p className="body-font" style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0 }}>اطبع ملف شواهد مدرستك</p>
                </div>
                <span style={{ fontSize: 18, color: '#fff' }}>←</span>
              </Link>
              <Link href="/forms" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: NAVY, borderRadius: 14,
                padding: '18px 22px', textDecoration: 'none'
              }}>
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
