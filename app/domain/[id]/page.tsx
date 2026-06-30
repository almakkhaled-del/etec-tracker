'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchool } from '@/lib/useSchool'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Indicator = {
  id: number
  code: string
  name_ar: string
  order_num: number
  evidence_count: number
  status: string
}

type Standard = {
  id: number
  code: string
  name_ar: string
  order_num: number
  indicators: Indicator[]
}

const STATUS_LABEL: Record<string, string> = {
  empty: 'فارغ', started: 'بدأ', good: 'جيد', excellent: 'ممتاز'
}
const STATUS_COLOR: Record<string, string> = {
  empty: '#dc2626', started: '#d97706', good: '#2563eb', excellent: '#16a34a'
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
      const { data: domainData } = await supabase
        .from('domains').select('*').eq('id', id).single()
      const { data: standardsData } = await supabase
        .from('standards').select('*').eq('domain_id', id).order('order_num')
      const { data: indicatorsData } = await supabase
        .from('indicators').select('*').order('order_num')
      const { data: evidences } = await supabase
        .from('evidences')
        .select('id, indicator_id')
        .eq('school_id', school!.id)

      if (standardsData && indicatorsData) {
        const evByInd: Record<number, number> = {}
        evidences?.forEach(e => {
          evByInd[e.indicator_id] = (evByInd[e.indicator_id] || 0) + 1
        })
        const enriched = standardsData.map(s => {
          const inds = indicatorsData
            .filter(i => i.standard_id === s.id)
            .map(i => {
              const count = evByInd[i.id] || 0
              const status = count === 0 ? 'empty' : count < 3 ? 'started' : count < 5 ? 'good' : 'excellent'
              return { ...i, evidence_count: count, status }
            })
          return { ...s, indicators: inds }
        })
        setDomain(domainData)
        setStandards(enriched)
      }
      setLoading(false)
    }
    load()
  }, [id, school])

  const totalInd = standards.reduce((s, st) => s + st.indicators.length, 0)
  const completedInd = standards.reduce((s, st) => s + st.indicators.filter(i => i.status !== 'empty').length, 0)
  const totalEv = standards.reduce((s, st) => s + st.indicators.reduce((ss, i) => ss + i.evidence_count, 0), 0)

  if (schoolLoading || loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif' }}>
      <p style={{ color: '#6b7280' }}>جاري التحميل...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '24px 16px', maxWidth: 720, margin: '0 auto', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: 20 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: '#6b7280', fontSize: 13 }}>
          ← الرئيسية
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{domain?.name_ar}</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{totalInd} مؤشراً · {completedInd} مكتمل · {totalEv} شاهد</p>
      </div>

      {standards.map(standard => (
        <div key={standard.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 6 }}>{standard.code}</span>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: '#111827' }}>{standard.name_ar}</p>
            </div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {standard.indicators.filter(i => i.status !== 'empty').length} / {standard.indicators.length}
            </span>
          </div>

          {standard.indicators.map((indicator, idx) => (
            <Link key={indicator.id} href={`/indicator/${indicator.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ padding: '12px 16px', borderBottom: idx < standard.indicators.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <span style={{ fontSize: 18 }}>
                  {indicator.status === 'empty' ? '⭕' : indicator.status === 'excellent' ? '✅' : '🔵'}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, margin: 0, color: '#111827' }}>{indicator.name_ar}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{indicator.code} · {indicator.evidence_count} شواهد</p>
                </div>
                <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: STATUS_COLOR[indicator.status] + '18', color: STATUS_COLOR[indicator.status], fontWeight: 500 }}>
                  {STATUS_LABEL[indicator.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ))}

      {completedInd < totalInd && (
        <div style={{ marginTop: 8, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚠️</span>
          <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>
            {totalInd - completedInd} مؤشراً بدون شواهد — أضف شاهداً لكل منها لرفع تصنيفك
          </p>
        </div>
      )}
    </div>
  )
}
