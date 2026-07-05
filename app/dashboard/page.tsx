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
type Standard = { id: number; code: string; name_ar: string; completed: number; total: number }
type Indicator = { id: number; code: string; name_ar: string; evidence_count: number }

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

function BreadcrumbChip({ icon, label, color, onClick }: {
  icon: string; label: string; color: string; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', background: `${color}12`,
      border: `1.5px solid ${color}30`, borderRadius: 20,
      cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
      fontSize: 12, fontWeight: 700, color, whiteSpace: 'nowrap'
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <span style={{ fontSize: 10, opacity: 0.5 }}>✕</span>
    </button>
  )
}

export default function Dashboard() {
  const { school, loading: schoolLoading } = useSchool()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, completed: 0, evidences: 0 })

  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [standards, setStandards] = useState<Standard[]>([])
  const [loadingStd, setLoadingStd] = useState(false)
  const [showStandards, setShowStandards] = useState(false)

  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null)
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [loadingInd, setLoadingInd] = useState(false)
  const [showIndicators, setShowIndicators] = useState(false)

  const [animKey, setAnimKey] = useState(0)

  // mob يبدأ true — الجوال هو الافتراضي، الديسكتوب يتغير بعد الـ mount
  const [mob, setMob] = useState(true)
  useEffect(() => {
    const check = () => setMob(window.innerWidth <= 860)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isTrial = school?.subscription_status === 'trial'
  const trialDaysLeft = school ? Math.max(0, Math.ceil((new Date(school.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null
  const principalFirstName = school?.principal_name?.split(' ')[0] || 'مدير المدرسة'
  const completion = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0

  useEffect(() => {
    if (!school) return
    async function load() {
      const { data: domainsData } = await supabase.from('domains').select('*').order('order_num')
      const { data: stds } = await supabase.from('standards').select('id, domain_id')
      const { data: inds } = await supabase.from('indicators').select('id, standard_id')
      const { data: evs } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', school!.id)
      if (domainsData && stds && inds) {
        const evByInd: Record<number, number> = {}
        evs?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })
        const stdByDomain: Record<number, number[]> = {}
        stds.forEach(s => { if (!stdByDomain[s.domain_id]) stdByDomain[s.domain_id] = []; stdByDomain[s.domain_id].push(s.id) })
        const indByStd: Record<number, number[]> = {}
        inds.forEach(i => { if (!indByStd[i.standard_id]) indByStd[i.standard_id] = []; indByStd[i.standard_id].push(i.id) })
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
    setLoadingStd(true)
    setSelectedDomain(domain)
    setShowStandards(false)
    setShowIndicators(false)
    setSelectedStandard(null)
    const { data: stdsData } = await supabase.from('standards').select('*').eq('domain_id', domain.id).order('order_num')
    const { data: inds } = await supabase.from('indicators').select('id, standard_id')
    const { data: evs } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', school!.id)
    if (stdsData && inds) {
      const evByInd: Record<number, number> = {}
      evs?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })
      const indByStd: Record<number, number[]> = {}
      inds.forEach(i => { if (!indByStd[i.standard_id]) indByStd[i.standard_id] = []; indByStd[i.standard_id].push(i.id) })
      setStandards(stdsData.map(s => {
        const indIds = indByStd[s.id] || []
        return { ...s, total: indIds.length, completed: indIds.filter(id => (evByInd[id] || 0) > 0).length }
      }))
    }
    setLoadingStd(false)
    setAnimKey(k => k + 1)
    setShowStandards(true)
  }

  async function handleStandardClick(std: Standard) {
    setLoadingInd(true)
    setSelectedStandard(std)
    setShowIndicators(false)
    const { data: indsData } = await supabase.from('indicators').select('*').eq('standard_id', std.id).order('order_num')
    const { data: evs } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', school!.id)
    if (indsData) {
      const evByInd: Record<number, number> = {}
      evs?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })
      setIndicators(indsData.map(i => ({ ...i, evidence_count: evByInd[i.id] || 0 })))
    }
    setLoadingInd(false)
    setAnimKey(k => k + 1)
    setShowIndicators(true)
  }

  function handleBackToDomains() {
    setAnimKey(k => k + 1)
    setShowStandards(false)
    setShowIndicators(false)
    setSelectedDomain(null)
    setSelectedStandard(null)
  }

  function handleBackToStandards() {
    setAnimKey(k => k + 1)
    setShowIndicators(false)
    setSelectedStandard(null)
  }

  const domainColor = selectedDomain ? (DOMAIN_COLORS[selectedDomain.code] || NAVY) : NAVY
  const domainIcon = selectedDomain ? (DOMAIN_ICONS[selectedDomain.code] || '📋') : '📋'

  if (schoolLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREAM }}>
      <p style={{ color: '#8A8270', fontFamily: 'Tajawal, sans-serif' }}>جاري التحميل...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic','Tajawal',sans-serif; }
        .fade-in { animation: fadeUp 0.35s cubic-bezier(0.4,0,0.2,1) both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .domain-card { transition: all 0.22s ease; cursor: pointer; }
        .domain-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(11,31,58,0.12) !important; }
        .std-card { transition: all 0.18s ease; cursor: pointer; }
        .std-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(11,31,58,0.10) !important; }
        .ind-row:hover { background: rgba(11,31,58,0.03) !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar activeDomainId={selectedDomain?.id} />
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <header style={{
            background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)',
            padding: mob ? '0 16px' : '0 28px',
            height: mob ? 64 : 80,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 50
          }}>
            <div>
              <p style={{ fontSize: mob ? 15 : 17, fontWeight: 800, color: NAVY, margin: '0 0 2px' }}>
                {!showStandards ? `مرحباً، ${principalFirstName} 👋` : showIndicators ? 'المؤشرات' : 'المعايير'}
              </p>
              <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                {!showStandards ? `${school?.name} — 1448هـ`
                  : showIndicators ? `${selectedStandard?.completed} من ${selectedStandard?.total} مؤشراً مكتمل`
                  : `${selectedDomain?.completed} من ${selectedDomain?.total_indicators} مؤشراً مكتمل`}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isTrial && trialDaysLeft !== null && (
                <span style={{
                  fontSize: 11, fontWeight: 600, background: 'rgba(194,138,31,0.1)', color: '#A6730F',
                  padding: '5px 10px', borderRadius: 20, border: '1px solid rgba(194,138,31,0.25)',
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif'
                }}>{trialDaysLeft} أيام متبقية</span>
              )}
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_LIGHT, fontSize: 14, fontWeight: 700 }}>
                {school?.principal_name?.[0] || 'م'}
              </div>
            </div>
          </header>

          <main style={{ padding: mob ? '14px' : '28px', paddingBottom: mob ? 90 : undefined, maxWidth: 1000, margin: '0 auto' }}>

            {/* Stats */}
            {!showStandards && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: mob ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: mob ? 10 : 14, marginBottom: mob ? 16 : 28
              }}>
                <div style={{ background: NAVY, borderRadius: 16, padding: mob ? '16px 14px' : '22px 20px' }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>نسبة الاكتمال</p>
                  <p style={{ fontSize: mob ? 26 : 32, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{loading ? '—' : `${completion}%`}</p>
                  <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 99 }}>
                    <div style={{ width: `${completion || 2}%`, height: '100%', background: GOLD_LIGHT, borderRadius: 99 }} />
                  </div>
                </div>
                <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: mob ? '16px 14px' : '22px 20px' }}>
                  <p style={{ fontSize: 11, color: '#8A8270', margin: '0 0 4px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>إجمالي المؤشرات</p>
                  <p style={{ fontSize: mob ? 26 : 32, fontWeight: 800, color: '#1d4ed8', margin: 0 }}>{loading ? '—' : stats.total}</p>
                </div>
                <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: mob ? '16px 14px' : '22px 20px' }}>
                  <p style={{ fontSize: 11, color: '#8A8270', margin: '0 0 4px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>مؤشرات مكتملة</p>
                  <p style={{ fontSize: mob ? 26 : 32, fontWeight: 800, color: '#16a34a', margin: '0 0 3px' }}>{loading ? '—' : stats.completed}</p>
                  {!loading && <p style={{ fontSize: 11, color: '#DC2626', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>متبقي {stats.total - stats.completed}</p>}
                </div>
                <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: mob ? '16px 14px' : '22px 20px' }}>
                  <p style={{ fontSize: 11, color: '#8A8270', margin: '0 0 4px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>إجمالي الشواهد</p>
                  <p style={{ fontSize: mob ? 26 : 32, fontWeight: 800, color: GOLD, margin: 0 }}>{loading ? '—' : stats.evidences}</p>
                </div>
              </div>
            )}

            {/* Breadcrumb */}
            {showStandards && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <BreadcrumbChip icon={domainIcon} label={selectedDomain?.name_ar || ''} color={domainColor} onClick={handleBackToDomains} />
                {showIndicators && selectedStandard && (
                  <>
                    <span style={{ color: '#C0BCA8', fontSize: 14 }}>←</span>
                    <BreadcrumbChip icon="📋" label={selectedStandard.name_ar} color={domainColor} onClick={handleBackToStandards} />
                  </>
                )}
              </div>
            )}

            <div key={animKey} className="fade-in">

              {/* Level 1: Domains */}
              {!showStandards && (
                <>
                  <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 14 }}>المجالات الأربعة</p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: mob ? '1fr' : 'repeat(2, 1fr)',
                    gap: mob ? 12 : 16, marginBottom: mob ? 14 : 24
                  }}>
                    {loading ? [1,2,3,4].map(i => (
                      <div key={i} style={{ background: '#fff', borderRadius: 18, height: 120, opacity: 0.4 }} />
                    )) : domains.map(domain => {
                      const pct = domain.total_indicators ? Math.round((domain.completed / domain.total_indicators) * 100) : 0
                      const c = DOMAIN_COLORS[domain.code] || NAVY
                      const sz = mob ? 64 : 80
                      return (
                        <div key={domain.id} onClick={() => handleDomainClick(domain)} className="domain-card" style={{
                          background: '#fff', borderRadius: 18,
                          border: '1.5px solid rgba(11,31,58,0.07)',
                          padding: mob ? '16px 18px' : '22px 24px',
                          display: 'flex', alignItems: 'center', gap: mob ? 14 : 20,
                          boxShadow: '0 2px 8px rgba(11,31,58,0.05)'
                        }}>
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <CircleProgress percent={pct} color={c} size={sz} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: mob ? 13 : 16, fontWeight: 800, color: NAVY }}>{pct}%</span>
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                              <span style={{ fontSize: mob ? 18 : 22 }}>{DOMAIN_ICONS[domain.code]}</span>
                              <p style={{ fontWeight: 700, fontSize: mob ? 13 : 15, color: NAVY, margin: 0 }}>{domain.name_ar}</p>
                            </div>
                            <p style={{ fontSize: 12, color: '#8A8270', margin: '0 0 2px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                              {domain.completed} من {domain.total_indicators} مؤشراً مكتمل
                            </p>
                            <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                              {domain.total_evidences} شاهد مرفوع
                            </p>
                          </div>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: `${c}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 14, color: c }}>←</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: mob ? 10 : 14 }}>
                    <Link href="/print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `linear-gradient(135deg, ${GOLD}, #A6730F)`, borderRadius: 16, padding: mob ? '14px 18px' : '18px 24px', textDecoration: 'none' }}>
                      <div>
                        <p style={{ fontSize: mob ? 13 : 15, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>🖨️ التقرير الكامل</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>اطبع ملف شواهد مدرستك كاملاً</p>
                      </div>
                      <span style={{ fontSize: 18, color: '#fff' }}>←</span>
                    </Link>
                    <Link href="/forms" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: NAVY, borderRadius: 16, padding: mob ? '14px 18px' : '18px 24px', textDecoration: 'none' }}>
                      <div>
                        <p style={{ fontSize: mob ? 13 : 15, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>📋 النماذج الجاهزة</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>29 نموذجاً جاهزاً للتحميل</p>
                      </div>
                      <span style={{ fontSize: 18, color: '#fff' }}>←</span>
                    </Link>
                  </div>
                </>
              )}

              {/* Level 2: Standards */}
              {showStandards && !showIndicators && (
                loadingStd ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: '#8A8270' }}>جاري التحميل...</div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {standards.map(std => {
                      const pct = std.total ? Math.round((std.completed / std.total) * 100) : 0
                      return (
                        <div key={std.id} onClick={() => handleStandardClick(std)} className="std-card" style={{
                          background: '#fff', borderRadius: 16, border: '1.5px solid rgba(11,31,58,0.07)',
                          padding: mob ? '14px 16px' : '18px 22px',
                          display: 'flex', alignItems: 'center', gap: 14,
                          boxShadow: '0 2px 8px rgba(11,31,58,0.05)'
                        }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `${domainColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: domainColor }}>
                            {std.code}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: mob ? 13 : 14, fontWeight: 700, color: NAVY, margin: '0 0 6px', lineHeight: 1.5 }}>{std.name_ar}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 80, height: 4, background: '#EDEAE0', borderRadius: 99 }}>
                                <div style={{ width: `${pct || 2}%`, height: '100%', background: pct === 100 ? '#16a34a' : domainColor, borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: 11, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{std.completed}/{std.total}</span>
                            </div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? '#16a34a' : domainColor, flexShrink: 0 }}>{pct}%</span>
                          <span style={{ fontSize: 14, color: '#C0BCA8' }}>←</span>
                        </div>
                      )
                    })}
                  </div>
                )
              )}

              {/* Level 3: Indicators */}
              {showIndicators && (
                loadingInd ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: '#8A8270' }}>جاري التحميل...</div>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {indicators.map((ind, idx) => {
                      const hasEv = ind.evidence_count > 0
                      return (
                        <Link key={ind.id} href={`/indicator/${ind.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className="ind-row" style={{
                            background: hasEv ? '#F8FFF9' : '#fff', borderRadius: 14,
                            border: '1px solid rgba(11,31,58,0.07)',
                            borderRight: `4px solid ${hasEv ? '#86EFAC' : '#FCA5A5'}`,
                            padding: mob ? '13px 16px' : '16px 20px',
                            display: 'flex', alignItems: 'center', gap: 12,
                          }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                              background: hasEv ? '#DCFCE7' : '#FEE2E2',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14, fontWeight: 800, color: hasEv ? '#15803d' : '#DC2626'
                            }}>
                              {hasEv ? '✓' : idx + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: mob ? 12 : 13, color: '#1F2937', margin: '0 0 2px', lineHeight: 1.6, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{ind.name_ar}</p>
                              <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{ind.code}</span>
                            </div>
                            <span style={{
                              fontSize: 11, fontWeight: 600, flexShrink: 0,
                              padding: '3px 10px', borderRadius: 20,
                              background: hasEv ? '#DCFCE7' : '#FEE2E2',
                              color: hasEv ? '#15803d' : '#DC2626',
                              fontFamily: 'IBM Plex Sans Arabic, sans-serif'
                            }}>
                              {hasEv ? `${ind.evidence_count} شواهد` : 'فارغ'}
                            </span>
                            <span style={{ fontSize: 13, color: '#C0BCA8', flexShrink: 0 }}>←</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )
              )}

            </div>
          </main>
        </div>
      </div>

      {/* Bottom Nav — موبايل فقط */}
      {mob && (
        <nav style={{
          position: 'fixed', bottom: 0, right: 0, left: 0, zIndex: 100,
          background: '#fff', borderTop: '1px solid rgba(11,31,58,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          paddingTop: 10, paddingBottom: 20,
        }}>
          {[
            { href: '/dashboard', icon: '🏠', label: 'الرئيسية' },
            { href: '/forms', icon: '📋', label: 'النماذج' },
            { href: '/print', icon: '🖨️', label: 'التقرير' },
            { href: 'https://wa.me/00966555826838', icon: '💬', label: 'الدعم', external: true },
          ].map(item => (
            <a key={item.href} href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', flex: 1 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: NAVY, fontFamily: 'Tajawal, sans-serif' }}>{item.label}</span>
            </a>
          ))}
        </nav>
      )}

    </div>
  )
}

