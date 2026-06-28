'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Evidence = {
  id: string
  title: string
  description: string
  evidence_type: string
  file_url: string
  file_name: string
  evidence_date: string
  created_at: string
}

export default function IndicatorPage() {
  const { id } = useParams()
  const [indicator, setIndicator] = useState<any>(null)
  const [standard, setStandard] = useState<any>(null)
  const [domain, setDomain] = useState<any>(null)
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data: ind } = await supabase
      .from('indicators').select('*').eq('id', id).single()
    if (ind) {
      setIndicator(ind)
      const { data: std } = await supabase
        .from('standards').select('*').eq('id', ind.standard_id).single()
      if (std) {
        setStandard(std)
        const { data: dom } = await supabase
          .from('domains').select('*').eq('id', std.domain_id).single()
        setDomain(dom)
      }
    }
    const { data: evs } = await supabase
      .from('evidences')
      .select('*')
      .eq('indicator_id', id)
      .order('created_at', { ascending: false })
    setEvidences(evs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function uploadEvidence() {
    if (!title) { alert('أدخل عنوان الشاهد'); return }
    setUploading(true)
    try {
      let file_url = ''
      let file_name = ''
      let evidence_type = 'text'

      if (file) {
        const ext = file.name.split('.').pop()
        const path = `evidences/${id}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('school-evidences').upload(path, file)
        if (error) throw error
        const { data: urlData } = supabase.storage.from('school-evidences').getPublicUrl(path)
        file_url = urlData.publicUrl
        file_name = file.name
        evidence_type = file.type.startsWith('image/') ? 'image' : 'pdf'
      }

      await supabase.from('evidences').insert({
        indicator_id: Number(id),
        title,
        description,
        evidence_type,
        file_url,
        file_name,
        evidence_date: date || null,
      })

      setTitle('')
      setDescription('')
      setDate('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      await load()
    } catch (e) {
      alert('حدث خطأ أثناء الرفع')
    }
    setUploading(false)
  }

  async function deleteEvidence(evId: string) {
    if (!confirm('حذف هذا الشاهد؟')) return
    await supabase.from('evidences').delete().eq('id', evId)
    await load()
  }

  const status = evidences.length === 0 ? 'فارغ' : evidences.length < 3 ? 'بدأ' : evidences.length < 5 ? 'جيد' : 'ممتاز'
  const statusColor = evidences.length === 0 ? '#dc2626' : evidences.length < 3 ? '#d97706' : evidences.length < 5 ? '#2563eb' : '#16a34a'

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '24px 16px', maxWidth: 720, margin: '0 auto', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: '#6b7280' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#6b7280' }}>الرئيسية</Link>
        <span>←</span>
        <Link href={`/domain/${domain?.id}`} style={{ textDecoration: 'none', color: '#6b7280' }}>{domain?.name_ar}</Link>
        <span>←</span>
        <span style={{ color: '#111827' }}>{standard?.name_ar}</span>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>جاري التحميل...</p>
      ) : (
        <>
          {/* معلومات المؤشر */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.6 }}>{indicator?.name_ar}</p>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: statusColor + '18', color: statusColor, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 6 }}>{indicator?.code}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{evidences.length} شواهد مرفوعة</span>
            </div>
          </div>

          {/* الشواهد المرفوعة */}
          {evidences.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>الشواهد المرفوعة ({evidences.length})</p>
              </div>
              {evidences.map((ev, idx) => (
                <div key={ev.id} style={{ padding: '12px 16px', borderBottom: idx < evidences.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>
                    {ev.evidence_type === 'image' ? '🖼️' : ev.evidence_type === 'pdf' ? '📄' : '📝'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#111827' }}>{ev.title}</p>
                    {ev.description && <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{ev.description}</p>}
                    {ev.evidence_date && <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{ev.evidence_date}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {ev.file_url && (
                      <a href={ev.file_url} target="_blank" rel="noreferrer"
                        style={{ fontSize: 12, padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: 6, textDecoration: 'none' }}>
                        عرض
                      </a>
                    )}
                    <button onClick={() => deleteEvidence(ev.id)}
                      style={{ fontSize: 12, padding: '4px 10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* رفع شاهد جديد */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>إضافة شاهد جديد</p>
            </div>
            <div style={{ padding: '16px' }}>
              <input
                type="text"
                placeholder="عنوان الشاهد *"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, marginBottom: 10, fontFamily: 'Tajawal, sans-serif', boxSizing: 'border-box' }}
              />
              <textarea
                placeholder="وصف مختصر (اختياري)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, marginBottom: 10, fontFamily: 'Tajawal, sans-serif', resize: 'none', boxSizing: 'border-box' }}
              />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }}
              />
              <div style={{ border: '2px dashed #e5e7eb', borderRadius: 8, padding: '20px', textAlign: 'center', marginBottom: 12, cursor: 'pointer' }}
                onClick={() => fileRef.current?.click()}>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                  {file ? `✅ ${file.name}` : '📎 اضغط لرفع ملف (صورة أو PDF)'}
                </p>
              </div>
              <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" style={{ display: 'none' }}
                onChange={e => setFile(e.target.files?.[0] || null)} />
              <button
                onClick={uploadEvidence}
                disabled={uploading}
                style={{ width: '100%', padding: '12px', background: uploading ? '#9ca3af' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                {uploading ? 'جاري الرفع...' : 'رفع الشاهد ✓'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
