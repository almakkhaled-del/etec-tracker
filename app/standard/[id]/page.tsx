'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const CREAM = '#F5F8FA'

const STATUS_LABEL: Record<string, string> = { empty: 'لم تبدأ بعد', started: 'بدأت', good: 'جيد', excellent: 'ممتاز' }
const STATUS_COLOR: Record<string, string> = { empty: '#DC2626', started: '#D97706', good: '#1d4ed8', excellent: '#16a34a' }
const STATUS_BG: Record<string, string> = { empty: '#FEF2F2', started: '#FFFBEB', good: '#EFF6FF', excellent: '#F0FDF4' }

type Indicator = { id: number; code: string; name_ar: string; order_num: number; evidence_count: number; status: string }

export default function StandardPage() {
  const { id } = useParams()
  const { school, loading: schoolLoading } = useSchool()
  const [standard, setStandard] = useState<any>(null)
  const [domain, setDomain] = useState<any>(null)
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!school) return
    async function load() {
      const { data: std } = await supabase.from('standards').select('*').eq('id', id).single()
      if (std) {
        setStandard(std)
        const { data: dom } = await supabase.from('domains').select('*').eq('id', std.domain_id).single()
        setDomain(dom)
      }
      const { data: indicatorsData } = await supabase.from('indicators').select('*').eq('standard_id', id).order('order_num')
      const { data: evidences } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', school!.id)

      if (indicatorsData) {
        const evByInd: Record<number, number> = {}
        evidences?.forEach(e => { evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1 })

        const enriched = indicatorsData.map(i => {
          const count = evByInd[i.id] || 0
          const status = count === 0 ? 'empty' : count < 3 ? 'started' : count < 5 ? 'good' : 'excellent'
          return { ...i, evidence_count: count, status }
        })
        setIndicators(enriched)
      }
      setLoading(false)
    }
    load()
  }, [id, school])

  const completed = indicators.filter(i => i.status !== 'empty').length

  if (schoolLoading || loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', background: CREAM }}>
      <p style={{ color: '#7A8896' }}>جاري التحميل...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif; }
        .ind-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(10,59,88,0.10); }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar activeDomainId={domain?.id} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <header className="page-header" style={{
            background: '#fff', borderBottom: '1px solid rgba(10,59,88,0.08)',
            padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 50
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                <Link href="/dashboard" style={{ color: '#7A8896', textDecoration: 'none' }}>الرئيسية</Link>
                <span>←</span>
                <Link href={`/domain/${domain?.id}`} style={{ color: '#7A8896', textDecoration: 'none' }}>{domain?.name_ar}</Link>
              </div>
              <p style={{ fontSize: 18, fontWeight: 800, color: NAVY, margin: '4px 0 0' }}>{standard?.name_ar}</p>
            </div>
          </header>

          <main className="page-main" style={{ padding: '32px 28px', maxWidth: 880, margin: '0 auto' }}>

            <div style={{ background: '#fff', border: '1px solid rgba(10,59,88,0.07)', borderRadius: 16, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: 'rgba(10,59,88,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: NAVY, flexShrink: 0
              }}>
                {standard?.code}
              </div>
              <div style={{ flex: 1 }}>
                <p className="body-font" style={{ fontSize: 13, color: '#7A8896', margin: '0 0 4px' }}>
                  هذا المعيار يحتوي على {indicators.length} مؤشرات — كل مؤشر يحتاج شاهداً واحداً على الأقل
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: 0 }}>
                  أكملت {completed} من {indicators.length} مؤشراً
                </p>
              </div>
              <div style={{ textAlign: 'left', flexShrink: 0 }}>
                <p style={{ fontSize: 26, fontWeight: 800, color: GOLD, margin: 0 }}>
                  {indicators.length ? Math.round((completed / indicators.length) * 100) : 0}%
                </p>
              </div>
            </div>

            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 6 }}>المؤشرات</p>
            <p className="body-font" style={{ fontSize: 13, color: '#7A8896', marginBottom: 18 }}>
              اضغط على أي مؤشر لرفع شواهده — صورة أو ملف PDF
            </p>

            <div style={{ display: 'grid', gap: 12 }}>
              {indicators.map((indicator, idx) => (
                <Link key={indicator.id} href={`/indicator/${indicator.id}`} className="ind-card" style={{
                  textDecoration: 'none', color: 'inherit', background: '#fff', borderRadius: 14,
                  border: '1px solid rgba(10,59,88,0.07)', padding: '18px 22px',
                  display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: STATUS_BG[indicator.status],
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: 16, fontWeight: 800, color: STATUS_COLOR[indicator.status]
                  }}>
                    {indicator.status === 'empty' ? idx + 1 : '✓'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: '0 0 4px', lineHeight: 1.5 }}>{indicator.name_ar}</p>
                    <p className="body-font" style={{ fontSize: 12, color: '#94A2AC', margin: 0 }}>
                      {indicator.code} · {indicator.evidence_count} شواهد مرفوعة
                    </p>
                  </div>

                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 20, flexShrink: 0,
                    background: STATUS_BG[indicator.status], color: STATUS_COLOR[indicator.status]
                  }}>
                    {STATUS_LABEL[indicator.status]}
                  </span>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
