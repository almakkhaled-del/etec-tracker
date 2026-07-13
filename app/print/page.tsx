'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import Link from 'next/link'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'

type Evidence = {
  id: string; title: string; description: string; evidence_type: string
  file_url: string; file_name: string; evidence_date: string; pdf_pages: string[] | null
}
type Indicator = { id: number; code: string; name_ar: string; order_num: number; evidences: Evidence[] }
type Standard = { id: number; code: string; name_ar: string; order_num: number; indicators: Indicator[] }
type Domain = { id: number; code: string; name_ar: string; order_num: number; standards: Standard[] }

export default function PrintPage() {
  const { school, loading: schoolLoading } = useSchool()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, completed: 0, evidences: 0 })
  const [showEmptyOnly, setShowEmptyOnly] = useState<'all' | 'completed'>('all')

  useEffect(() => {
    if (!school) return
    async function load() {
      const { data: domainsData } = await supabase.from('domains').select('*').order('order_num')
      const { data: standardsData } = await supabase.from('standards').select('*').order('order_num')
      const { data: indicatorsData } = await supabase.from('indicators').select('*').order('order_num')
      const { data: evidencesData } = await supabase
        .from('evidences').select('*').eq('school_id', school!.id).order('created_at', { ascending: true })

      if (domainsData && standardsData && indicatorsData) {
        const evByIndicator: Record<number, Evidence[]> = {}
        evidencesData?.forEach(e => {
          if (!evByIndicator[e.indicator_id]) evByIndicator[e.indicator_id] = []
          evByIndicator[e.indicator_id].push(e)
        })
        const built: Domain[] = domainsData.map(d => {
          const stds = standardsData.filter(s => s.domain_id === d.id).map(s => {
            const inds = indicatorsData.filter(i => i.standard_id === s.id).map(i => ({ ...i, evidences: evByIndicator[i.id] || [] }))
            return { ...s, indicators: inds }
          })
          return { ...d, standards: stds }
        })
        setDomains(built)
        const allIndicators = built.flatMap(d => d.standards.flatMap(s => s.indicators))
        const completed = allIndicators.filter(i => i.evidences.length > 0).length
        const totalEv = allIndicators.reduce((sum, i) => sum + i.evidences.length, 0)
        setStats({ total: allIndicators.length, completed, evidences: totalEv })
      }
      setLoading(false)
    }
    load()
  }, [school])

  if (schoolLoading || loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif' }}>
      <p style={{ color: '#7A8896' }}>جاري تجهيز التقرير...</p>
    </div>
  )

  const today = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })

  // فلترة المؤشرات حسب الخيار المختار
  const filteredDomains = domains.map(d => ({
    ...d,
    standards: d.standards
      .map(s => ({
        ...s,
        indicators: showEmptyOnly === 'completed'
          ? s.indicators.filter(i => i.evidences.length > 0)
          : s.indicators
      }))
      .filter(s => s.indicators.length > 0) // نخفي المعيار كلياً لو ما بقي فيه مؤشرات بعد الفلترة
  })).filter(d => d.standards.length > 0)

  return (
    <div style={{ fontFamily: 'Tajawal, sans-serif', direction: 'rtl', background: '#E6EBEE' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; break-before: page; }
          body { background: #fff !important; }
          .report-container { box-shadow: none !important; margin: 0 !important; }
        }
        .report-container { max-width: 800px; margin: 0 auto; background: #fff; }
        .body-font { font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif; }
        .filter-btn { transition: all 0.15s; cursor: pointer; }
      `}</style>

      <div className="no-print" style={{ position: 'sticky', top: 0, background: NAVY, padding: '14px 24px', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontSize: 14 }}>← رجوع للرئيسية</Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* مفتاح التبديل */}
            <div style={{
              display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 3
            }}>
              <button
                onClick={() => setShowEmptyOnly('all')}
                className="filter-btn body-font"
                style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                  background: showEmptyOnly === 'all' ? '#fff' : 'transparent',
                  color: showEmptyOnly === 'all' ? NAVY : 'rgba(255,255,255,0.7)',
                }}
              >
                عرض الكل ({stats.total})
              </button>
              <button
                onClick={() => setShowEmptyOnly('completed')}
                className="filter-btn body-font"
                style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                  background: showEmptyOnly === 'completed' ? '#fff' : 'transparent',
                  color: showEmptyOnly === 'completed' ? NAVY : 'rgba(255,255,255,0.7)',
                }}
              >
                المكتمل فقط ({stats.completed})
              </button>
            </div>

            <button onClick={() => window.print()} style={{
              background: `linear-gradient(135deg, #3E8AB0, ${GOLD})`, color: NAVY, border: 'none',
              padding: '10px 28px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif'
            }}>
              🖨️ طباعة التقرير
            </button>
          </div>
        </div>
      </div>

      <div className="report-container" style={{ padding: '2rem', boxShadow: '0 0 24px rgba(10,59,88,0.10)', margin: '20px auto' }}>

        <div style={{ textAlign: 'center', padding: '4rem 1rem', borderBottom: `3px solid ${NAVY}` }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 60, marginBottom: 32 }} />
          <p className="body-font" style={{ fontSize: 13, color: '#7A8896', marginBottom: 8 }}>ملف شواهد معايير التقويم والاعتماد المدرسي</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 16 }}>{school?.name}</h1>
          <div className="body-font" style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 13, color: '#7A8896', marginBottom: 24 }}>
            {school?.school_number && <span>رقم المدرسة: {school.school_number}</span>}
            {school?.region && <span>المنطقة: {school.region}</span>}
          </div>
          <p className="body-font" style={{ fontSize: 13, color: '#94A2AC' }}>تاريخ الطباعة: {today}</p>

          {showEmptyOnly === 'completed' && (
            <p className="body-font no-print" style={{ fontSize: 12, color: GOLD, marginTop: 10, fontWeight: 600 }}>
              📌 هذا التقرير يعرض المؤشرات المكتملة فقط
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
            <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>{stats.total}</p>
              <p className="body-font" style={{ fontSize: 11, color: '#7A8896', margin: 0 }}>إجمالي المؤشرات</p>
            </div>
            <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#16a34a', margin: 0 }}>{stats.completed}</p>
              <p className="body-font" style={{ fontSize: 11, color: '#7A8896', margin: 0 }}>مؤشرات مكتملة</p>
            </div>
            <div style={{ background: 'rgba(31,110,150,0.08)', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>{stats.evidences}</p>
              <p className="body-font" style={{ fontSize: 11, color: '#7A8896', margin: 0 }}>إجمالي الشواهد</p>
            </div>
          </div>
        </div>

        {filteredDomains.map((domain) => (
          <div key={domain.id}>
            {domain.standards.map(standard => (
              <div key={standard.id}>

                <div className="page-break" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                  <p className="body-font" style={{ fontSize: 13, color: '#7A8896', marginBottom: 4 }}>{domain.name_ar}</p>
                  <p style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>معيار {standard.code}</p>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: NAVY, maxWidth: 500, lineHeight: 1.5 }}>{standard.name_ar}</h2>
                  <div style={{ width: 60, height: 3, background: GOLD, borderRadius: 2, marginTop: 24 }} />
                  <p className="body-font" style={{ fontSize: 12, color: '#94A2AC', marginTop: 16 }}>{standard.indicators.length} مؤشراً</p>
                </div>

                {standard.indicators.map(indicator => (
                  <div key={indicator.id} className="page-break" style={{ paddingTop: 8 }}>
                    <div style={{ background: NAVY, color: '#fff', padding: '16px 20px', borderRadius: 10, marginBottom: 20 }}>
                      <p className="body-font" style={{ fontSize: 11, opacity: 0.75, margin: '0 0 4px' }}>{domain.name_ar} · معيار {standard.code} · مؤشر {indicator.code}</p>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, lineHeight: 1.6 }}>{indicator.name_ar}</h3>
                    </div>

                    {indicator.evidences.length === 0 ? (
                      <p className="body-font" style={{ fontSize: 13, color: '#991B1B', background: '#FEF2F2', padding: '12px 16px', borderRadius: 8 }}>
                        ⚠️ لا توجد شواهد مرفوعة لهذا المؤشر
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gap: 12 }}>
                        {indicator.evidences.map((ev, evIdx) => (
                          <div key={ev.id} style={{ border: '1px solid rgba(10,59,88,0.1)', borderRadius: 10, overflow: 'hidden', breakInside: 'avoid' }}>
                            <div style={{ background: '#F8F6F0', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: NAVY, margin: 0 }}>شاهد {evIdx + 1}: {ev.title}</p>
                              {ev.evidence_date && <p className="body-font" style={{ fontSize: 11, color: '#94A2AC', margin: 0 }}>{ev.evidence_date}</p>}
                            </div>
                            {ev.description && (
                              <p className="body-font" style={{ fontSize: 12, color: '#7A8896', padding: '8px 14px 0', margin: 0 }}>{ev.description}</p>
                            )}

                            {ev.evidence_type === 'image' && ev.file_url && (
                              <img src={ev.file_url} alt={ev.title} style={{ width: '100%', maxHeight: 500, objectFit: 'contain', padding: 10, boxSizing: 'border-box' }} />
                            )}

                            {ev.evidence_type === 'pdf' && ev.pdf_pages && ev.pdf_pages.length > 0 && (
                              <div style={{ display: 'grid', gap: 8, padding: 10 }}>
                                {ev.pdf_pages.map((pageUrl, pIdx) => (
                                  <div key={pIdx}>
                                    <p className="body-font" style={{ fontSize: 10, color: '#94A2AC', textAlign: 'center', margin: '0 0 4px' }}>
                                      صفحة {pIdx + 1} من {ev.pdf_pages!.length}
                                    </p>
                                    <img src={pageUrl} alt={`${ev.title} - صفحة ${pIdx + 1}`} style={{ width: '100%', border: '1px solid rgba(10,59,88,0.1)', borderRadius: 6 }} />
                                  </div>
                                ))}
                              </div>
                            )}

                            {ev.evidence_type === 'pdf' && (!ev.pdf_pages || ev.pdf_pages.length === 0) && ev.file_url && (
                              <div style={{ padding: '14px', textAlign: 'center' }}>
                                <a href={ev.file_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: GOLD, textDecoration: 'underline' }}>
                                  📄 عرض ملف PDF: {ev.file_name}
                                </a>
                              </div>
                            )}

                            {ev.evidence_type === 'text' && (
                              <p className="body-font" style={{ fontSize: 12, color: '#374151', padding: '14px', margin: 0 }}>{ev.description || 'لا يوجد وصف إضافي'}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}

        <div className="page-break" style={{ textAlign: 'center', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '50vh' }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 40, margin: '0 auto 16px' }} />
          <p className="body-font" style={{ fontSize: 13, color: '#94A2AC', margin: 0 }}>
            نهاية التقرير · تم إنشاؤه عبر منصة شواهدي · shawahede.com
          </p>
        </div>

      </div>
    </div>
  )
}
