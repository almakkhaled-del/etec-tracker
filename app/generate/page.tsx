'use client'
import { useState, useEffect } from 'react'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const CREAM = '#FBF8F2'

function Field({ label, value, onChange, placeholder, half = false }: {
  label: string; value: string; onChange: (val: string) => void; placeholder?: string; half?: boolean
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 5, fontFamily: 'Tajawal, sans-serif' }}>
        {label}
      </label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px', border: '1.5px solid rgba(11,31,58,0.12)',
          borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          boxSizing: 'border-box', background: '#FAFAF7', color: NAVY, direction: 'rtl'
        }}
      />
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '2px solid rgba(194,138,31,0.2)', paddingBottom: 10, marginTop: 28 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0 }}>{title}</h3>
    </div>
  )
}

const MEMBERS = [
  { key: 'member_1', role: 'مدير المدرسة — رئيساً' },
  { key: 'member_2', role: 'وكيل الشؤون التعليمية — نائباً' },
  { key: 'member_3', role: 'وكيل شؤون الطلاب — عضواً' },
  { key: 'member_4', role: 'موجه طلابي — عضواً' },
  { key: 'member_5', role: 'موجه طلابي — عضواً' },
  { key: 'member_6', role: 'رائد النشاط — عضواً' },
  { key: 'member_7', role: 'معلم — عضواً' },
  { key: 'member_8', role: 'معلم — عضواً' },
  { key: 'member_9', role: 'معلم — عضواً' },
]

export default function GenerateOperationalPlan() {
  const { school } = useSchool()
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [f, setF] = useState({
    school_name: '', principal_name: '', teachers_count: '', deputies_count: '',
    work_phone: '', mobile: '', email: '',
    db_teachers: '', db_principal: '1', db_deputies: '', db_counselor: '', db_activity: '',
    db_admin: '', db_librarian: '', db_students: '', db_classes: '', db_labs: '',
    db_fields: '', db_halls: '',
    member_1: '', member_2: '', member_3: '', member_4: '', member_5: '',
    member_6: '', member_7: '', member_8: '', member_9: '',
  })

  useEffect(() => {
    if (school) {
      setF(prev => ({ ...prev, school_name: school.name || '', principal_name: school.principal_name || '', member_1: school.principal_name || '' }))
    }
  }, [school])

  function u(key: string, val: string) { setF(prev => ({ ...prev, [key]: val })) }

  async function handleGenerate() {
    if (!f.school_name) { alert('يرجى إدخال اسم المدرسة'); return }
    if (!f.principal_name) { alert('يرجى إدخال اسم مدير المدرسة'); return }
    setGenerating(true); setDone(false)
    try {
      const [Docxtemplater, PizZip, { saveAs }] = await Promise.all([
        import('docxtemplater').then(m => m.default),
        import('pizzip').then(m => m.default),
        import('file-saver'),
      ])
      const response = await fetch('/templates/template_operational_plan.docx')
      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } })
      doc.render(f)
      const output = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      saveAs(output, `الخطة التشغيلية - ${f.school_name}.docx`)
      setDone(true)
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.')
    }
    setGenerating(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic','Tajawal',sans-serif; }
        .gen-btn:hover { filter: brightness(1.05); }
        input:focus { border-color: #C28A1F !important; outline: none; }
        @media (max-width: 640px) { .grid-2 { grid-template-columns: 1fr !important; } .grid-3 { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>

          <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/forms" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← النماذج</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>إنشاء الخطة التشغيلية</p>
              <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>أدخل بيانات مدرستك — الخطة جاهزة بالكامل</p>
            </div>
          </header>

          <main style={{ padding: '24px 28px', maxWidth: 640, margin: '0 auto' }}>

            {/* الملف يحتوي */}
            <div style={{ background: 'linear-gradient(135deg, #0B1F3A, #14284a)', borderRadius: 16, padding: '18px 20px', marginBottom: 22, color: '#fff' }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>📄 الملف يحتوي تلقائياً:</p>
              <p className="body-font" style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.9, margin: 0 }}>
                غلاف رسمي بشعار الوزارة ورؤية 2030 · رؤية ورسالة المدرسة · تحليل الواقع SWOT · 5 أهداف عامة بـ19 برنامج مفصّل · مسؤولي التنفيذ ومؤشرات الأداء
              </p>
            </div>

            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '1.5rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)' }}>

              {/* القسم 1: بيانات المدرسة */}
              <SectionHeader icon="🏫" title="بيانات المدرسة" />
              <Field label="اسم المدرسة *" value={f.school_name} onChange={v => u('school_name', v)} placeholder="ابتدائية مجمع محمد بن أحمد الرشيد" />
              <Field label="اسم مدير المدرسة *" value={f.principal_name} onChange={v => u('principal_name', v)} placeholder="الاسم الكامل" />
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="عدد المعلمين" value={f.teachers_count} onChange={v => u('teachers_count', v)} placeholder="25" />
                <Field label="عدد الوكلاء" value={f.deputies_count} onChange={v => u('deputies_count', v)} placeholder="3" />
              </div>
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="هاتف العمل" value={f.work_phone} onChange={v => u('work_phone', v)} placeholder="01xxxxxxx" />
                <Field label="هاتف الجوال" value={f.mobile} onChange={v => u('mobile', v)} placeholder="05xxxxxxxx" />
              </div>
              <Field label="البريد الإلكتروني" value={f.email} onChange={v => u('email', v)} placeholder="school@email.com" />

              {/* القسم 2: قاعدة بيانات المدرسة */}
              <SectionHeader icon="📊" title="قاعدة بيانات المدرسة" />
              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Field label="عدد المعلمين" value={f.db_teachers} onChange={v => u('db_teachers', v)} placeholder="25" />
                <Field label="عدد الطلاب" value={f.db_students} onChange={v => u('db_students', v)} placeholder="385" />
                <Field label="عدد الصفوف" value={f.db_classes} onChange={v => u('db_classes', v)} placeholder="15" />
              </div>
              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Field label="مدير" value={f.db_principal} onChange={v => u('db_principal', v)} placeholder="1" />
                <Field label="وكيل" value={f.db_deputies} onChange={v => u('db_deputies', v)} placeholder="3" />
                <Field label="موجه طلابي" value={f.db_counselor} onChange={v => u('db_counselor', v)} placeholder="2" />
              </div>
              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Field label="رائد نشاط" value={f.db_activity} onChange={v => u('db_activity', v)} placeholder="1" />
                <Field label="إداري" value={f.db_admin} onChange={v => u('db_admin', v)} placeholder="2" />
                <Field label="أمين مصادر تعلم" value={f.db_librarian} onChange={v => u('db_librarian', v)} placeholder="1" />
              </div>
              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Field label="عدد المعامل" value={f.db_labs} onChange={v => u('db_labs', v)} placeholder="2" />
                <Field label="عدد الملاعب" value={f.db_fields} onChange={v => u('db_fields', v)} placeholder="1" />
                <Field label="عدد القاعات" value={f.db_halls} onChange={v => u('db_halls', v)} placeholder="3" />
              </div>

              {/* القسم 3: أعضاء لجنة إعداد الخطة */}
              <SectionHeader icon="👥" title="أعضاء لجنة إعداد الخطة (التميز)" />
              {MEMBERS.map(m => (
                <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span className="body-font" style={{ fontSize: 11, color: '#8A8270', width: 180, flexShrink: 0, textAlign: 'left' }}>{m.role}</span>
                  <input type="text" value={(f as any)[m.key]} onChange={e => u(m.key, e.target.value)}
                    placeholder="اسم العضو"
                    style={{
                      flex: 1, padding: '9px 12px', border: '1.5px solid rgba(11,31,58,0.12)',
                      borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                      boxSizing: 'border-box', background: '#FAFAF7', color: NAVY, direction: 'rtl'
                    }}
                  />
                </div>
              ))}

              {/* زر التوليد */}
              <div style={{ marginTop: 28 }}>
                <button onClick={handleGenerate} disabled={generating} className="gen-btn" style={{
                  width: '100%', padding: '16px', fontSize: 17, fontWeight: 800,
                  background: generating ? '#9CA3AF' : `linear-gradient(135deg, #D9A441, ${GOLD})`,
                  color: generating ? '#fff' : NAVY, border: 'none', borderRadius: 14,
                  cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif',
                  boxShadow: generating ? 'none' : '0 6px 20px rgba(194,138,31,0.30)', transition: 'all 0.2s'
                }}>
                  {generating ? '⏳ جاري إنشاء الملف...' : '📄 توليد الخطة التشغيلية ←'}
                </button>
              </div>

              {done && (
                <div style={{ marginTop: 18, background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 14, padding: '16px 18px', textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#15803D', margin: '0 0 6px' }}>✅ تم إنشاء الخطة التشغيلية بنجاح!</p>
                  <p className="body-font" style={{ fontSize: 13, color: '#166534', margin: '0 0 10px' }}>الملف تم تحميله: الخطة التشغيلية - {f.school_name}.docx</p>
                  <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>💡 يمكنك فتح الملف وتعديل أي تفاصيل إضافية</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
