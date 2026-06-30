'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import Link from 'next/link'

type Evidence = {
  id: string
  title: string
  description: string
  evidence_type: string
  file_url: string
  file_name: string
  evidence_date: string
  pdf_pages: string[] | null
}

type Indicator = {
  id: number
  code: string
  name_ar: string
  order_num: number
  evidences: Evidence[]
}

type Standard = {
  id: number
  code: string
  name_ar: string
  order_num: number
  indicators: Indicator[]
}

type Domain = {
  id: number
  code: string
  name_ar: string
  order_num: number
  standards: Standard[]
}

export default function PrintPage() {
  const { school, loading: schoolLoading } = useSchool()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, completed: 0, evidences: 0 })

  useEffect(() => {
    if (!school) return
    async function load() {
      const { data: domainsData } = await supabase.from('domains').select('*').order('order_num')
      const { data: standardsData } = await supabase.from('standards').select('*').order('order_num')
      const { data: indicatorsData } = await supabase.from('indicators').select('*').order('order_num')
      const { data: evidencesData } = await supabase
        .from('evidences')
        .select('*')
        .eq('school_id', school!.id)
        .order('created_at', { ascending: true })

      if (domainsData && standardsData && indicatorsData) {
        const evByIndicator: Record<number, Evidence[]> = {}
        evidencesData?.forEach(e => {
          if (!evByIndicator[e.indicator_id]) evByIndicator[e.indicator_id] = []
          evByIndicator[e.indicator_id].push(e)
        })

        const built: Domain[] = domainsData.map(d => {
          const stds = standardsData
            .filter(s => s.domain_id === d.id)
            .map(s => {
              const inds = indicatorsData
                .filter(i => i.standard_id === s.id)
                .map(i => ({ ...i, evidences: evByIndicator[i.id] || [] }))
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
      <p style={{ color: '#6b7280' }}>جاري تجهيز التقرير...</p>
    </div>
  )

  const today = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ fontFamily: 'Tajawal, sans-serif', direction: 'rtl', background: '#f0f0f0' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; break-before: page; }
          body { background: #fff !important; }
          .report-container { box-shadow: none !important; margin: 0 !important; }
        }
        .report-container { max-width: 800px; margin: 0 auto; background: #fff; }
      `}</style>

      <div className="no-print" style={{ position: 'sticky', top: 0, background: '#1d4ed8', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
        <Link href="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontSize: 14 }}>← رجوع للرئيسية</Link>
        <button onClick={() => window.print()} style={{ background: '#fff', color: '#1d4ed8', border: 'none', padding: '8px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
          🖨️ طباعة التقرير
        </button>
      </div>

      <div className="report-container" style={{ padding: '2rem', boxShadow: '0 0 20px rgba(0,0,0,0.1)', margin: '20px auto' }}>

        {/* صفحة الغلاف */}
        <div style={{ textAlign: 'center', padding: '4rem 1rem', borderBottom: '3px solid #1d4ed8' }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 60, marginBottom: 32 }} />
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>ملف شواهد معايير التقويم والاعتماد المدرسي</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>{school?.name}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
            {school?.school_number && <span>رقم المدرسة: {school.school_number}</span>}
            {school?.region && <span>المنطقة: {school.region}</span>}
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>تاريخ الطباعة: {today}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
            <div style={{ background: '#eff6ff', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>{stats.total}</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>إجمالي المؤشرات</p>
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#16a34a', margin: 0 }}>{stats.completed}</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>مؤشرات مكتملة</p>
            </div>
            <div style={{ background: '#fffbeb', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#d97706', margin: 0 }}>{stats.evidences}</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>إجمالي الشواهد</p>
            </div>
          </div>
        </div>

        {domains.map((domain) => (
          <div key={domain.id}>
            {domain.standards.map(standard => (
              <div key={standard.id}>

                {/* صفحة غلاف فرعية للمعيار */}
                <div className="page-break" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                  <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>{domain.name_ar}</p>
                  <p style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>معيار {standard.code}</p>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', maxWidth: 500, lineHeight: 1.5 }}>{standard.name_ar}</h2>
                  <div style={{ width: 60, height: 3, background: '#1d4ed8', borderRadius: 2, marginTop: 24 }} />
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>{standard.indicators.length} مؤشراً</p>
                </div>

                {standard.indicators.map(indicator => (
                  <div key={indicator.id} className="page-break" style={{ paddingTop: 8 }}>
                    <div style={{ background: '#1d4ed8', color: '#fff', padding: '16px 20px', borderRadius: 10, marginBottom: 20 }}>
                      <p style={{ fontSize: 11, opacity: 0.8, margin: '0 0 4px' }}>{domain.name_ar} · معيار {standard.code} · مؤشر {indicator.code}</p>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, lineHeight: 1.6 }}>{indicator.name_ar}</h3>
                    </div>

                    {indicator.evidences.length === 0 ? (
                      <p style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', padding: '12px 16px', borderRadius: 8 }}>
                        ⚠️ لا توجد شواهد مرفوعة لهذا المؤشر
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gap: 12 }}>
                        {indicator.evidences.map((ev, evIdx) => (
                          <div key={ev.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', breakInside: 'avoid' }}>
                            <div style={{ background: '#f9fafb', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>
                                شاهد {evIdx + 1}: {ev.title}
                              </p>
                              {ev.evidence_date && <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{ev.evidence_date}</p>}
                            </div>
                            {ev.description && (
                              <p style={{ fontSize: 12, color: '#6b7280', padding: '8px 14px 0', margin: 0 }}>{ev.description}</p>
                            )}

                            {ev.evidence_type === 'image' && ev.file_url && (
                              <img src={ev.file_url} alt={ev.title} style={{ width: '100%', maxHeight: 500, objectFit: 'contain', padding: 10, boxSizing: 'border-box' }} />
                            )}

                            {ev.evidence_type === 'pdf' && ev.pdf_pages && ev.pdf_pages.length > 0 && (
                              <div style={{ display: 'grid', gap: 8, padding: 10 }}>
                                {ev.pdf_pages.map((pageUrl, pIdx) => (
                                  <div key={pIdx}>
                                    <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', margin: '0 0 4px' }}>
                                      صفحة {pIdx + 1} من {ev.pdf_pages!.length}
                                    </p>
                                    <img src={pageUrl} alt={`${ev.title} - صفحة ${pIdx + 1}`} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6 }} />
                                  </div>
                                ))}
                              </div>
                            )}

                            {ev.evidence_type === 'pdf' && (!ev.pdf_pages || ev.pdf_pages.length === 0) && ev.file_url && (
                              <div style={{ padding: '14px', textAlign: 'center' }}>
                                <a href={ev.file_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#1d4ed8', textDecoration: 'underline' }}>
                                  📄 عرض ملف PDF: {ev.file_name}
                                </a>
                              </div>
                            )}

                            {ev.evidence_type === 'text' && (
                              <p style={{ fontSize: 12, color: '#374151', padding: '14px', margin: 0 }}>{ev.description || 'لا يوجد وصف إضافي'}</p>
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
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            نهاية التقرير · تم إنشاؤه عبر منصة شواهدي · shawahede.com
          </p>
        </div>

      </div>
    </div>
  )
}
