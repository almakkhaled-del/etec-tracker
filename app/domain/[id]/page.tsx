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

type Standard = {
  id: number; code: string; name_ar: string; order_num: number
  total_indicators: number; completed: number; total_evidences: number
}

export default function DomainPage() {
  const { id } = useParams()
  const { school, loading: schoolLoading } = useSchool()
  const [domain, setDomain] = useState<any>(null)
  const [standards, setStandards] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!school) return
    async function load() {
      const { data: domainData } = await supabase.from('domains').select('*').eq('id', id).single()
      const { data: standardsData } = await supabase.from('standards').select('*').eq('domain_id', id).order('order_num')
      const { data: indicatorsData } = await supabase.from('indicators').select('id, standard_id')
      const { data: evidences } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', school!.id)

      if (standardsData && indicatorsData) {
        const evByInd: Record<number, number> = {}
        evidences?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })

        const enriched = standardsData.map(s => {
          const indIds = indicatorsData.filter(i => i.standard_id === s.id).map(i => i.id)
          const completed = indIds.filter(iid => (evByInd[iid] || 0) > 0).length
          const totalEv = indIds.reduce((sum, iid) => sum + (evByInd[iid] || 0), 0)
          return { ...s, total_indicators: indIds.length, completed, total_evidences: totalEv }
        })
        setDomain(domainData)
        setStandards(enriched)
      }
      setLoading(false)
    }
    load()
  }, [id, school])

  const totalInd = standards.reduce((s, st) => s + st.total_indicators, 0)
  const completedInd = standards.reduce((s, st) => s + st.completed, 0)

  if (schoolLoading || loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', background: CREAM }}>
      <p style={{ color: '#8A8270' }}>جاري التحميل...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif; }
        .std-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(11,31,58,0.10); border-color: rgba(194,138,31,0.3) !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar activeDomainId={Number(id)} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <header style={{
            background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)',
            padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 50
          }}>
            <div>
              <Link href="/dashboard" style={{ fontSize: 12, color: '#8A8270', textDecoration: 'none', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                ← الرئيسية
              </Link>
              <p style={{ fontSize: 18, fontWeight: 800, color: NAVY, margin: '4px 0 0' }}>{domain?.name_ar}</p>
            </div>
          </header>

          <main style={{ padding: '32px 28px', maxWidth: 880, margin: '0 auto' }}>

            {/* شريط الفهم البسيط */}
            <div style={{ background: '#fff', border: '1px solid rgba(11,31,58,0.07)', borderRadius: 16, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: 'rgba(194,138,31,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0
              }}>
                📋
              </div>
              <div style={{ flex: 1 }}>
                <p className="body-font" style={{ fontSize: 13, color: '#8A8270', margin: '0 0 4px' }}>
                  هذا المجال يحتوي على {standards.length} معايير، وتحت كل معيار مجموعة مؤشرات تحتاج شواهد
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: 0 }}>
                  أكملت {completedInd} من {totalInd} مؤشراً
                </p>
              </div>
              <div style={{ textAlign: 'left', flexShrink: 0 }}>
                <p style={{ fontSize: 26, fontWeight: 800, color: GOLD, margin: 0 }}>
                  {totalInd ? Math.round((completedInd / totalInd) * 100) : 0}%
                </p>
              </div>
            </div>

            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 6 }}>اختر معياراً للبدء</p>
            <p className="body-font" style={{ fontSize: 13, color: '#8A8270', marginBottom: 18 }}>
              كل معيار فيه مجموعة مؤشرات — اضغط على المعيار لترى مؤشراته وترفع شواهده
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              {standards.map((standard, idx) => {
                const pct = standard.total_indicators ? Math.round((standard.completed / standard.total_indicators) * 100) : 0
                return (
                  <Link key={standard.id} href={`/standard/${standard.id}`} className="std-card" style={{
                    textDecoration: 'none', color: 'inherit', background: '#fff', borderRadius: 16,
                    border: '1.5px solid rgba(11,31,58,0.07)', padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: 18, transition: 'all 0.2s'
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, background: NAVY,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{idx + 1}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 16, color: NAVY, margin: '0 0 6px' }}>{standard.name_ar}</p>
                      <p className="body-font" style={{ fontSize: 13, color: '#8A8270', margin: 0 }}>
                        {standard.total_indicators} مؤشراً · {standard.total_evidences} شاهد مرفوع
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <div style={{ width: 80 }}>
                        <div style={{ background: '#EDEAE0', borderRadius: 99, height: 6, marginBottom: 6 }}>
                          <div style={{
                            width: `${pct || 2}%`, height: '100%', borderRadius: 99,
                            background: pct === 100 ? '#16a34a' : GOLD, transition: 'width 0.4s'
                          }} />
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, margin: 0, textAlign: 'center' }}>{pct}%</p>
                      </div>
                      <span style={{ fontSize: 20, color: '#C0BCA8' }}>←</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
