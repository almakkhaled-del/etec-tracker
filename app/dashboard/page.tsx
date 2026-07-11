'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'
import { getGuidance } from '@/lib/indicatorGuidance'

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
type Standard = { id: number; code: string; name_ar: string; domain_id: number }
type Indicator = { id: number; code: string; name_ar: string; standard_id: number; evidence_count: number }

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

function DashboardInner() {
  const { school, loading: schoolLoading, isTrial: trialPlan, allowedDomains } = useSchool()
  const searchParams = useSearchParams()
  const domainParam = searchParams.get('domain')

  const [domains, setDomains] = useState<Domain[]>([])
  const [standards, setStandards] = useState<Standard[]>([])
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, completed: 0, evidences: 0 })
  const [expandedDomain, setExpandedDomain] = useState<number | null>(null)
  const [expandedStandard, setExpandedStandard] = useState<number | null>(null)
  const [guidanceFor, setGuidanceFor] = useState<Indicator | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
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
      const { data: stds } = await supabase.from('standards').select('*').order('order_num')
      const { data: inds } = await supabase.from('indicators').select('*').order('order_num')
      const { data: evs } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', school!.id)

      if (domainsData && stds && inds) {
        const evByInd: Record<number, number> = {}
        evs?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })

        const stdByDomain: Record<number, number[]> = {}
        stds.forEach(s => { if (!stdByDomain[s.domain_id]) stdByDomain[s.domain_id] = []; stdByDomain[s.domain_id].push(s.id) })
        const indByStd: Record<number, number[]> = {}
        inds.forEach(i => { if (!indByStd[i.standard_id]) indByStd[i.standard_id] = []; indByStd[i.standard_id].push(i.id) })

        const enrichedDomains = domainsData.map(d => {
          const stdIds = stdByDomain[d.id] || []
          const indIds = stdIds.flatMap(sid => indByStd[sid] || [])
          const completed = indIds.filter(id => (evByInd[id] || 0) > 0).length
          const totalEv = indIds.reduce((sum, id) => sum + (evByInd[id] || 0), 0)
          return { ...d, total_indicators: indIds.length, completed, total_evidences: totalEv }
        })

        setDomains(enrichedDomains)
        setStandards(stds)
        setIndicators(inds.map(i => ({ ...i, evidence_count: evByInd[i.id] || 0 })))
        setStats({
          total: enrichedDomains.reduce((s, d) => s + d.total_indicators, 0),
          completed: enrichedDomains.reduce((s, d) => s + d.completed, 0),
          evidences: enrichedDomains.reduce((s, d) => s + d.total_evidences, 0),
        })
      }
      setLoading(false)
    }
    load()
  }, [school])

  useEffect(() => {
    if (domainParam && domains.length > 0) {
      const target = domains.find(d => String(d.id) === domainParam || d.code === domainParam)
      if (target) {
        const locked = trialPlan && allowedDomains != null && !allowedDomains.includes(target.id)
        if (!locked) setExpandedDomain(target.id)
        window.history.replaceState(null, '', '/dashboard')
      }
    }
  }, [domainParam, domains])

  function handleDomainClick(domain: Domain) {
    const locked = trialPlan && allowedDomains != null && !allowedDomains.includes(domain.id)
    if (locked) { setShowUpgrade(true); return }
    setExpandedDomain(prev => prev === domain.id ? null : domain.id)
    setExpandedStandard(null)
  }

  const domainStandards = (domainId: number) => standards.filter(s => s.domain_id === domainId)
  const standardIndicators = (stdId: number) => indicators.filter(i => i.standard_id === stdId)
  const stdCompleted = (stdId: number) => indicators.filter(i => i.standard_id === stdId && i.evidence_count > 0).length
  const stdTotal = (stdId: number) => indicators.filter(i => i.standard_id === stdId).length

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
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .domain-card { transition: all 0.22s ease; cursor: pointer; }
        .domain-card:hover { box-shadow: 0 8px 24px rgba(11,31,58,0.10) !important; }
        .std-row:hover { background: rgba(11,31,58,0.03) !important; }
        .ind-chip:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(11,31,58,0.10) !important; }
        .tree-expand { animation: treeOpen 0.3s cubic-bezier(0.4,0,0.2,1) both; }
        @keyframes treeOpen { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar activeDomainId={expandedDomain ?? undefined} />
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
                مرحباً، {principalFirstName} 👋
              </p>
              <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                {school?.name} — 1448هـ
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isTrial && trialDaysLeft !== null && (
                <Link href="/account" style={{ textDecoration: 'none' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, background: 'rgba(194,138,31,0.1)', color: '#A6730F',
                    padding: '5px 10px', borderRadius: 20, border: '1px solid rgba(194,138,31,0.25)',
                    fontFamily: 'IBM Plex Sans Arabic, sans-serif', display: 'inline-block'
                  }}>{trialDaysLeft} أيام متبقية</span>
                </Link>
              )}
              <Link href="/account" style={{ textDecoration: 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_LIGHT, fontSize: 14, fontWeight: 700 }}>
                  {school?.principal_name?.[0] || 'م'}
                </div>
              </Link>
            </div>
          </header>

          <main style={{ padding: mob ? '14px' : '28px', paddingBottom: mob ? 90 : 40, maxWidth: 1000, margin: '0 auto' }}>

            {/* Stats */}
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

            {/* Domain Cards */}
            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 14 }}>المجالات الأربعة</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {loading ? [1,2,3,4].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 18, height: 90, opacity: 0.4 }} />
              )) : domains.map(domain => {
                const pct = domain.total_indicators ? Math.round((domain.completed / domain.total_indicators) * 100) : 0
                const c = DOMAIN_COLORS[domain.code] || NAVY
                const isExpanded = expandedDomain === domain.id
                const locked = trialPlan && allowedDomains != null && !allowedDomains.includes(domain.id)
                const domStds = domainStandards(domain.id)

                return (
                  <div key={domain.id} style={{
                    background: '#fff', borderRadius: 18,
                    border: `1.5px solid ${isExpanded ? c + '40' : 'rgba(11,31,58,0.07)'}`,
                    boxShadow: isExpanded ? `0 4px 20px ${c}18` : '0 2px 8px rgba(11,31,58,0.05)',
                    overflow: 'hidden', transition: 'all 0.25s ease'
                  }}>
                    {/* Domain Header Row */}
                    <div onClick={() => handleDomainClick(domain)} className="domain-card" style={{
                      padding: mob ? '16px 18px' : '20px 24px',
                      display: 'flex', alignItems: 'center', gap: mob ? 14 : 20,
                      opacity: locked ? 0.75 : 1,
                      borderBottom: isExpanded ? `1px solid ${c}20` : 'none',
                    }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <CircleProgress percent={locked ? 0 : pct} color={locked ? '#C0BCA8' : c} size={mob ? 64 : 72} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: locked ? (mob ? 20 : 24) : (mob ? 13 : 15), fontWeight: 800, color: locked ? '#C0BCA8' : NAVY }}>
                            {locked ? '🔒' : `${pct}%`}
                          </span>
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                          <span style={{ fontSize: mob ? 18 : 20 }}>{DOMAIN_ICONS[domain.code]}</span>
                          <p style={{ fontWeight: 700, fontSize: mob ? 14 : 16, color: NAVY, margin: 0 }}>{domain.name_ar}</p>
                        </div>
                        {locked ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(194,138,31,0.12)', color: '#A6730F', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>🔒 يتطلب الاشتراك</span>
                        ) : (
                          <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                            {domain.completed} من {domain.total_indicators} مؤشراً · {domain.total_evidences} شاهد · {domStds.length} معايير
                          </p>
                        )}
                      </div>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: `${locked ? '#C0BCA8' : c}14`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.25s',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                      }}>
                        <span style={{ fontSize: 14, color: locked ? '#C0BCA8' : c }}>{locked ? '🔒' : '←'}</span>
                      </div>
                    </div>

                    {/* Tree: Standards + Indicators */}
                    {isExpanded && (
                      <div className="tree-expand" style={{ padding: mob ? '12px 14px' : '16px 20px', background: `${c}04` }}>
                        {domStds.map((std, stdIdx) => {
                          const stdInds = standardIndicators(std.id)
                          const completed = stdCompleted(std.id)
                          const total = stdTotal(std.id)
                          const stdPct = total ? Math.round((completed / total) * 100) : 0
                          const isStdExpanded = expandedStandard === std.id
                          const isLastStd = stdIdx === domStds.length - 1

                          return (
                            <div key={std.id} style={{ position: 'relative', marginBottom: isLastStd ? 0 : 4 }}>
                              {/* Tree line */}
                              {!isLastStd && (
                                <div style={{ position: 'absolute', right: mob ? 19 : 23, top: 40, bottom: -4, width: 2, background: `${c}20`, zIndex: 0 }} />
                              )}

                              {/* Standard Row */}
                              <div onClick={() => setExpandedStandard(prev => prev === std.id ? null : std.id)}
                                className="std-row" style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: mob ? '10px 12px' : '11px 14px',
                                  borderRadius: 12, cursor: 'pointer',
                                  background: isStdExpanded ? `${c}0a` : 'transparent',
                                  border: `1px solid ${isStdExpanded ? c + '25' : 'transparent'}`,
                                  marginBottom: 4, position: 'relative', zIndex: 1, transition: 'all 0.15s'
                                }}>
                                {/* Tree node dot */}
                                <div style={{
                                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                  background: stdPct === 100 ? '#16a34a' : stdPct > 0 ? c : '#D1D5DB',
                                  border: `2px solid ${stdPct === 100 ? '#16a34a' : stdPct > 0 ? c : '#D1D5DB'}`,
                                  boxShadow: stdPct > 0 ? `0 0 0 3px ${c}20` : 'none'
                                }} />
                                <div style={{
                                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                                  background: `${c}15`, display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', fontSize: 11, fontWeight: 800, color: c
                                }}>{std.code}</div>
                                <p style={{ flex: 1, fontSize: mob ? 12 : 13, fontWeight: 600, color: NAVY, margin: 0, lineHeight: 1.4 }}>{std.name_ar}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                  <span style={{ fontSize: 11, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{completed}/{total}</span>
                                  <div style={{ width: 40, height: 4, background: '#EDEAE0', borderRadius: 99 }}>
                                    <div style={{ width: `${stdPct || 2}%`, height: '100%', background: stdPct === 100 ? '#16a34a' : c, borderRadius: 99 }} />
                                  </div>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: stdPct === 100 ? '#16a34a' : c }}>{stdPct}%</span>
                                  <span style={{ fontSize: 12, color: c, transform: isStdExpanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▸</span>
                                </div>
                              </div>

                              {/* Indicators */}
                              {isStdExpanded && (
                                <div className="tree-expand" style={{
                                  display: 'grid',
                                  gridTemplateColumns: mob ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
                                  gap: 8, padding: mob ? '8px 8px 12px 8px' : '8px 12px 14px 48px',
                                }}>
                                  {stdInds.map((ind, idx) => {
                                    const hasEv = ind.evidence_count > 0
                                    return (
                                      <Link key={ind.id} href={`/indicator/${ind.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="ind-chip" style={{
                                          position: 'relative',
                                          background: hasEv ? '#F0FDF4' : '#FAFAF7',
                                          border: `1.5px solid ${hasEv ? '#86EFAC' : 'rgba(11,31,58,0.08)'}`,
                                          borderRadius: 12, padding: '10px 10px 8px',
                                          cursor: 'pointer', transition: 'all 0.18s',
                                          boxShadow: hasEv ? '0 2px 8px rgba(22,163,74,0.10)' : '0 1px 4px rgba(11,31,58,0.04)'
                                        }}>
                                          <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setGuidanceFor(ind) }}
                                            style={{
                                              position: 'absolute', top: 6, insetInlineStart: 6,
                                              width: 20, height: 20, borderRadius: '50%',
                                              background: 'rgba(11,31,58,0.06)', border: 'none', cursor: 'pointer',
                                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                                              fontSize: 11, color: NAVY, fontWeight: 800, padding: 0
                                            }}
                                          >ℹ︎</button>
                                          <div style={{ textAlign: 'center', marginBottom: 6, marginTop: 2 }}>
                                            <span style={{
                                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                              width: 28, height: 28, borderRadius: 8,
                                              background: hasEv ? '#DCFCE7' : '#FEE2E2',
                                              fontSize: 13, fontWeight: 800,
                                              color: hasEv ? '#15803d' : '#DC2626'
                                            }}>{hasEv ? '✓' : idx + 1}</span>
                                          </div>
                                          <p style={{ fontSize: 11, color: '#374151', margin: '0 0 6px', lineHeight: 1.5, textAlign: 'center', fontFamily: 'IBM Plex Sans Arabic, sans-serif', minHeight: 32 }}>{ind.name_ar}</p>
                                          <div style={{ textAlign: 'center' }}>
                                            <span style={{
                                              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                                              background: hasEv ? '#DCFCE7' : '#FEE2E2',
                                              color: hasEv ? '#15803d' : '#DC2626',
                                              fontFamily: 'IBM Plex Sans Arabic, sans-serif'
                                            }}>{hasEv ? `${ind.evidence_count} شواهد` : 'فارغ'}</span>
                                          </div>
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

            {/* Quick Links */}
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

          </main>
        </div>
      </div>

      {/* Modal: ترقية الاشتراك */}
      {showUpgrade && (
        <div onClick={() => setShowUpgrade(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,31,58,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 22, maxWidth: 400, width: '100%', padding: '30px 26px', textAlign: 'center', boxShadow: '0 20px 60px rgba(11,31,58,0.3)', animation: 'fadeUp 0.3s cubic-bezier(0.34,1.3,0.5,1) both' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🔒</div>
            <p style={{ fontSize: 18, fontWeight: 800, color: NAVY, margin: '0 0 8px' }}>هذا المجال يتطلب الاشتراك</p>
            <p style={{ fontSize: 13, color: '#8A8270', margin: '0 0 20px', lineHeight: 1.9, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              في النسخة التجريبية يتاح مجال <b>البيئة المدرسية</b> فقط. اشترك الآن لفتح المجالات الأربعة كاملة.
            </p>
            <a href="https://wa.me/966555826838" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, #D9A441, ${GOLD})`, color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', marginBottom: 10 }}>💬 تواصل للاشتراك</button>
            </a>
            <button onClick={() => setShowUpgrade(false)} style={{ width: '100%', padding: '11px', fontSize: 13, fontWeight: 600, background: 'transparent', color: '#8A8270', border: 'none', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>لاحقاً</button>
          </div>
        </div>
      )}

      {/* Modal: ماذا يتوقع */}
      {guidanceFor && (
        <div onClick={() => setGuidanceFor(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,31,58,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 22, maxWidth: 440, width: '100%', padding: '26px 24px', boxShadow: '0 20px 60px rgba(11,31,58,0.3)', animation: 'fadeUp 0.3s cubic-bezier(0.34,1.3,0.5,1) both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${GOLD}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💡</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: GOLD, margin: '0 0 2px', fontWeight: 700, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>ماذا يُتوقع من المدرسة؟</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.5 }}>{guidanceFor.name_ar}</p>
              </div>
              <button onClick={() => setGuidanceFor(null)} style={{ background: 'rgba(11,31,58,0.06)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 15, color: NAVY, flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ background: '#FBF8F2', borderRadius: 14, padding: '16px 18px', borderInlineStart: `4px solid ${GOLD}` }}>
              <p style={{ fontSize: 13.5, color: '#3A3A3A', margin: 0, lineHeight: 2, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                {getGuidance(guidanceFor.name_ar)}
              </p>
            </div>
            <Link href={`/indicator/${guidanceFor.id}`} onClick={() => setGuidanceFor(null)} style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', marginTop: 16, padding: '13px', fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg, #D9A441, ${GOLD})`, color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                رفع شواهد هذا المؤشر ←
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Nav — موبايل */}
      {mob && (
        <nav style={{ position: 'fixed', bottom: 0, right: 0, left: 0, zIndex: 100, background: '#fff', borderTop: '1px solid rgba(11,31,58,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingTop: 10, paddingBottom: 20 }}>
          {[
            { href: '/dashboard', icon: '🏠', label: 'الرئيسية' },
            { href: '/forms', icon: '📋', label: 'النماذج' },
            { href: '/print', icon: '🖨️', label: 'التقرير' },
            { href: 'https://wa.me/966555826838', icon: '💬', label: 'الدعم', external: true },
          ].map(item => (
            <a key={item.href} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined}
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

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF8F2', fontFamily: 'Tajawal, sans-serif' }}>
        <p style={{ color: '#8A8270' }}>جاري التحميل...</p>
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}
