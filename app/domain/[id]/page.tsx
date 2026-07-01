'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const CREAM = '#FBF8F2'

const DOMAIN_COLORS: Record<string, string> = {
  '1': '#1d4ed8', '2': '#16a34a', '3': '#C28A1F', '4': '#7c3aed'
}
const DOMAIN_ICONS: Record<string, string> = {
  '1': '🏫', '2': '📚', '3': '📊', '4': '🏢'
}

type Indicator = { id: number; code: string; name_ar: string; evidence_count: number }
type Standard = { id: number; code: string; name_ar: string; indicators: Indicator[]; completed: number }
type Domain = { id: number; code: string; name_ar: string }

export default function DomainPage() {
  const { id } = useParams()
  const { school } = useSchool()
  const [domain, setDomain] = useState<Domain | null>(null)
  const [standards, setStandards] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)
  const [openStandard, setOpenStandard] = useState<number | null>(null)

  useEffect(() => {
    if (!school) return
    async function load() {
      const { data: dom } = await supabase.from('domains').select('*').eq('id', id).single()
      const { data: stds } = await supabase.from('standards').select('*').eq('domain_id', id).order('order_num')
      const { data: inds } = await supabase.from('indicators').select('*').order('order_num')
      const { data: evs } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', school!.id)

      if (stds && inds) {
        const evByInd: Record<number, number> = {}
        evs?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })

        const enriched: Standard[] = stds.map(s => {
          const indicators: Indicator[] = inds
            .filter(i => i.standard_id === s.id)
            .map(i => ({ ...i, evidence_count: evByInd[i.id] || 0 }))
          return { ...s, indicators, completed: indicators.filter(i => i.evidence_count > 0).length }
        })
        setStandards(enriched)
        setDomain(dom)
      }
      setLoading(false)
    }
    load()
  }, [id, school])

  const color = domain ? (DOMAIN_COLORS[domain.code] || NAVY) : NAVY
  const icon = domain ? (DOMAIN_ICONS[domain.code] || '📋') : '📋'
  const totalInd = standards.reduce((s, st) => s + st.indicators.length, 0)
  const completedInd = standards.reduce((s, st) => s + st.completed, 0)
  const domainPct = totalInd ? Math.round((completedInd / totalInd) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic','Tajawal',sans-serif; }
        .std-card:hover { box-shadow: 0 6px 20px rgba(11,31,58,0.10) !important; transform: translateY(-1px); }
        .std-card { transition: all 0.2s; cursor: pointer; }
        .ind-row:hover { background: rgba(11,31,58,0.04) !important; }
        .ind-row { transition: background 0.15s; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar activeDomainId={Number(id)} />

        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header - المجال في الزاوية */}
          <header style={{
            background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)',
            padding: '0 28px', height: 80, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* المجال في الزاوية - صغير */}
              <Link href="/dashboard" style={{
                display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                background: `${color}12`, border: `1.5px solid ${color}30`,
                borderRadius: 12, padding: '8px 14px'
              }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 11, color: color, fontWeight: 700, margin: 0 }}>{domain?.code && `المجال ${domain.code}`}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: 0 }}>{domain?.name_ar}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color, marginRight: 4 }}>{domainPct}%</span>
              </Link>

              <div style={{ width: 1, height: 32, background: 'rgba(11,31,58,0.1)' }} />

              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 1px' }}>اختر معياراً</p>
                <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>
                  {completedInd} من {totalInd} مؤشراً مكتملاً
                </p>
              </div>
            </div>

            <Link href="/dashboard" style={{ fontSize: 13, color: '#8A8270', textDecoration: 'none', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              ← رجوع للرئيسية
            </Link>
          </header>

          <main style={{ padding: '28px', maxWidth: 900, margin: '0 auto' }}>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#8A8270' }}>
                <p className="body-font">جاري التحميل...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {standards.map((standard, sIdx) => {
                  const pct = standard.indicators.length ? Math.round((standard.completed / standard.indicators.length) * 100) : 0
                  const isOpen = openStandard === standard.id

                  return (
                    <div key={standard.id}>
                      {/* كرت المعيار */}
                      <div className="std-card" onClick={() => setOpenStandard(prev => prev === standard.id ? null : standard.id)} style={{
                        background: isOpen ? `${color}08` : '#fff',
                        borderRadius: 16,
                        border: `2px solid ${isOpen ? color : 'rgba(11,31,58,0.07)'}`,
                        padding: '20px 24px',
                        display: 'flex', alignItems: 'center', gap: 18,
                        boxShadow: '0 2px 8px rgba(11,31,58,0.05)'
                      }}>
                        {/* رقم المعيار */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: isOpen ? color : `${color}14`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: isOpen ? '#fff' : color }}>
                            {sIdx + 1}
                          </span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 6px', lineHeight: 1.4 }}>
                            {standard.name_ar}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 80, height: 5, background: '#EDEAE0', borderRadius: 99 }}>
                              <div style={{ width: `${pct || 2}%`, height: '100%', background: pct === 100 ? '#16a34a' : color, borderRadius: 99, transition: 'width 0.4s' }} />
                            </div>
                            <span className="body-font" style={{ fontSize: 12, color: '#8A8270' }}>
                              {standard.completed}/{standard.indicators.length} مكتمل
                            </span>
                          </div>
                        </div>

                        <span style={{ fontSize: 14, fontWeight: 700, color: pct === 100 ? '#16a34a' : color }}>
                          {pct}%
                        </span>

                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: isOpen ? color : `${color}14`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}>
                          <span style={{ fontSize: 14, color: isOpen ? '#fff' : color, transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none', display: 'block' }}>←</span>
                        </div>
                      </div>

                      {/* المؤشرات تتشعب تحت المعيار */}
                      {isOpen && (
                        <div style={{
                          marginTop: 6, borderRadius: 14, overflow: 'hidden',
                          border: `1.5px solid ${color}25`,
                          background: '#fff'
                        }}>
                          {/* رأس المؤشرات */}
                          <div style={{
                            padding: '10px 20px', background: `${color}08`,
                            borderBottom: `1px solid ${color}15`,
                            display: 'flex', alignItems: 'center', gap: 8
                          }}>
                            <span style={{ fontSize: 12, color, fontWeight: 700 }}>مؤشرات معيار {standard.code}</span>
                            <span className="body-font" style={{ fontSize: 11, color: '#8A8270' }}>— اضغط لرفع الشواهد</span>
                          </div>

                          {standard.indicators.map((ind, iIdx) => {
                            const hasEv = ind.evidence_count > 0
                            return (
                              <Link key={ind.id} href={`/indicator/${ind.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="ind-row" style={{
                                  display: 'flex', alignItems: 'center', gap: 14,
                                  padding: '14px 20px',
                                  borderBottom: iIdx < standard.indicators.length - 1 ? '1px solid rgba(11,31,58,0.05)' : 'none',
                                  background: hasEv ? '#F8FFF9' : '#fff',
                                  borderRight: `4px solid ${hasEv ? '#86EFAC' : '#FCA5A5'}`,
                                }}>
                                  <span style={{ fontSize: 16, flexShrink: 0 }}>{hasEv ? '✅' : '⭕'}</span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p className="body-font" style={{ fontSize: 13, color: '#1F2937', margin: '0 0 2px', lineHeight: 1.6 }}>
                                      {ind.name_ar}
                                    </p>
                                    <span className="body-font" style={{ fontSize: 11, color: '#9CA3AF' }}>{ind.code}</span>
                                  </div>
                                  <span className="body-font" style={{
                                    fontSize: 12, fontWeight: 600, flexShrink: 0,
                                    padding: '4px 12px', borderRadius: 20,
                                    background: hasEv ? '#DCFCE7' : '#FEE2E2',
                                    color: hasEv ? '#15803d' : '#DC2626'
                                  }}>
                                    {hasEv ? `${ind.evidence_count} شواهد` : 'فارغ'}
                                  </span>
                                  <span style={{ fontSize: 14, color: '#C0BCA8', flexShrink: 0 }}>←</span>
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
          </main>
        </div>
      </div>
    </div>
  )
}
