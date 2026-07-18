'use client'
import { useState } from 'react'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const CREAM = '#F5F8FA'
const USD_TO_SAR = 3.75

type Row = {
  name: string
  status: 'pending' | 'running' | 'done' | 'error'
  topCode?: string
  topName?: string
  confidence?: number
  inTok?: number
  outTok?: number
  costUSD?: number
  ms?: number
  error?: string
}

function fileToBase64(file: File): Promise<{ b64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = reader.result as string
      const b64 = res.split(',')[1] || ''
      resolve({ b64, mime: file.type || 'application/octet-stream' })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function SmartUploadTestPage() {
  const { loading } = useSchool()
  const [rows, setRows] = useState<Row[]>([])
  const [running, setRunning] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const list = Array.from(files)
    const initial: Row[] = list.map(f => ({ name: f.name, status: 'pending' }))
    setRows(initial)
    setRunning(true)

    for (let i = 0; i < list.length; i++) {
      setRows(prev => prev.map((r, j) => j === i ? { ...r, status: 'running' } : r))
      try {
        const { b64, mime } = await fileToBase64(list[i])
        const resp = await fetch('/api/classify-evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileBase64: b64, mimeType: mime, fileName: list[i].name }),
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || 'فشل')
        const top = data.suggestions?.[0]
        setRows(prev => prev.map((r, j) => j === i ? {
          ...r, status: 'done',
          topCode: top?.code, topName: top?.name, confidence: top?.confidence,
          inTok: data.usage?.inTok, outTok: data.usage?.outTok, costUSD: data.costUSD, ms: data.ms,
        } : r))
      } catch (e: any) {
        setRows(prev => prev.map((r, j) => j === i ? { ...r, status: 'error', error: e?.message || 'خطأ' } : r))
      }
    }
    setRunning(false)
  }

  const done = rows.filter(r => r.status === 'done')
  const totalCost = done.reduce((s, r) => s + (r.costUSD || 0), 0)
  const totalIn = done.reduce((s, r) => s + (r.inTok || 0), 0)
  const totalOut = done.reduce((s, r) => s + (r.outTok || 0), 0)
  const avgCost = done.length ? totalCost / done.length : 0

  const cell: React.CSSProperties = { padding: '10px 12px', fontSize: 12.5, borderBottom: '1px solid rgba(10,59,88,0.07)', fontFamily: 'IBM Plex Sans Arabic, sans-serif', verticalAlign: 'top' }
  const th: React.CSSProperties = { ...cell, fontWeight: 800, color: NAVY, background: '#F1F5F7', textAlign: 'right' }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <header className="page-header" style={{ background: '#fff', borderBottom: '1px solid rgba(10,59,88,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(10,59,88,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← اللوحة</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>الرفع الذكي — اختبار قياس التكلفة (داخلي)</p>
              <p style={{ fontSize: 12, color: '#7A8896', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>أداة قياس غير معلنة — لقياس التوكنات والدقة قبل بناء الميزة الكاملة</p>
            </div>
          </header>

          <main className="page-main" style={{ padding: '24px 28px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ background: '#fff', border: '1px solid rgba(10,59,88,0.08)', borderRadius: 16, padding: '20px 22px', marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: NAVY, margin: '0 0 12px' }}>ارفع عدة ملفات (صور / PDF) للتصنيف والقياس</p>
              <input type="file" multiple accept="image/*,application/pdf" disabled={running}
                onChange={e => handleFiles(e.target.files)}
                style={{ fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }} />
              {running && <p style={{ fontSize: 12.5, color: GOLD, margin: '10px 0 0', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>⏳ جاري التصنيف واحداً تلو الآخر...</p>}
            </div>

            {done.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                <Stat label="ملفات مُصنّفة" value={String(done.length)} />
                <Stat label="إجمالي التكلفة" value={`$${totalCost.toFixed(4)} ≈ ${(totalCost * USD_TO_SAR).toFixed(3)} ﷼`} />
                <Stat label="متوسط التكلفة/ملف" value={`$${avgCost.toFixed(4)} ≈ ${(avgCost * USD_TO_SAR).toFixed(3)} ﷼`} />
                <Stat label="توكنات (دخول/خروج)" value={`${totalIn.toLocaleString()} / ${totalOut.toLocaleString()}`} />
              </div>
            )}

            {rows.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid rgba(10,59,88,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>الملف</th>
                      <th style={th}>المؤشر المقترح</th>
                      <th style={th}>الثقة</th>
                      <th style={th}>دخول</th>
                      <th style={th}>خروج</th>
                      <th style={th}>التكلفة</th>
                      <th style={th}>الزمن</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td style={cell}>
                          {r.status === 'running' ? '⏳ ' : r.status === 'error' ? '⚠️ ' : r.status === 'done' ? '✓ ' : '• '}
                          {r.name}
                          {r.error && <div style={{ color: '#DC2626', fontSize: 11 }}>{r.error}</div>}
                        </td>
                        <td style={cell}>{r.topCode ? <><b style={{ color: NAVY }}>{r.topCode}</b><div style={{ color: '#7A8896', fontSize: 11.5 }}>{r.topName}</div></> : '—'}</td>
                        <td style={cell}>{r.confidence != null ? `${r.confidence}%` : '—'}</td>
                        <td style={cell}>{r.inTok?.toLocaleString() ?? '—'}</td>
                        <td style={cell}>{r.outTok?.toLocaleString() ?? '—'}</td>
                        <td style={cell}>{r.costUSD != null ? `$${r.costUSD.toFixed(4)}` : '—'}</td>
                        <td style={cell}>{r.ms != null ? `${(r.ms / 1000).toFixed(1)}s` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && rows.length === 0 && (
              <p style={{ fontSize: 13, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>اختر ملفات لبدء القياس. النتائج والتكلفة الفعلية بتظهر بجدول.</p>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(10,59,88,0.08)', borderRadius: 12, padding: '14px 16px' }}>
      <p style={{ fontSize: 11.5, color: '#7A8896', margin: '0 0 6px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 800, color: NAVY, margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{value}</p>
    </div>
  )
}
