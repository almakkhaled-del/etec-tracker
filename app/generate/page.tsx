'use client'
import { useState, useEffect } from 'react'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const GOLD_LIGHT = '#E8C275'
const CREAM = '#FBF8F2'

function Field({ label, fieldKey, value, onChange, placeholder, type = 'text', required = false }: {
  label: string; fieldKey: string; value: string; onChange: (key: string, val: string) => void; placeholder?: string; type?: string; required?: boolean
}) {
  const inputStyle = {
    width: '100%' as const, padding: '12px 14px', border: '1.5px solid rgba(11,31,58,0.12)',
    borderRadius: 10, fontSize: 14, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
    boxSizing: 'border-box' as const, background: '#FAFAF7', color: '#0B1F3A', direction: 'rtl' as const
  }
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0B1F3A', marginBottom: 6, fontFamily: 'Tajawal, sans-serif' }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(fieldKey, e.target.value)} placeholder={placeholder}
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' as const, lineHeight: 1.8 }} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(fieldKey, e.target.value)} placeholder={placeholder}
          style={inputStyle} />
      )}
    </div>
  )
}

export default function GenerateOperationalPlan() {
  const { school } = useSchool()
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    school_name: '',
    teachers_count: '',
    deputies_count: '',
    coordinator_name: '',
    work_phone: '',
    email: '',
    mobile: '',
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
    vision: '',
    mission: '',
    principal_name: '',
  })

  // تعبئة تلقائية من بيانات المدرسة المسجلة
  useEffect(() => {
    if (school) {
      setForm(prev => ({
        ...prev,
        school_name: school.name || '',
        principal_name: school.principal_name || '',
      }))
    }
  }, [school])

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleGenerate() {
    if (!form.school_name) { alert('يرجى إدخال اسم المدرسة'); return }
    setGenerating(true)
    setDone(false)

    try {
      // تحميل المكتبات ديناميكياً
      const [Docxtemplater, PizZip, { saveAs }] = await Promise.all([
        import('docxtemplater').then(m => m.default),
        import('pizzip').then(m => m.default),
        import('file-saver'),
      ])

      // تحميل القالب
      const response = await fetch('/templates/template_operational_plan.docx')
      const arrayBuffer = await response.arrayBuffer()

      // فتح القالب واستبدال الحقول
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' }
      })

      doc.render(form)

      // تصدير الملف
      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      saveAs(output, `الخطة التشغيلية - ${form.school_name}.docx`)
      setDone(true)
    } catch (error) {
      console.error('Error generating document:', error)
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
        input:focus, textarea:focus { border-color: #C28A1F !important; outline: none; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />

        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <header style={{
            background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)',
            padding: '0 28px', height: 80, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link href="/forms" style={{
                display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px',
                fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif'
              }}>
                ← النماذج
              </Link>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>إنشاء الخطة التشغيلية</p>
                <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>عبّئ البيانات وحمّل الملف جاهزاً</p>
              </div>
            </div>
          </header>

          <main style={{ padding: '28px', maxWidth: 720, margin: '0 auto' }}>

            {/* تنبيه */}
            <div style={{
              background: 'rgba(194,138,31,0.08)', border: '1px solid rgba(194,138,31,0.25)',
              borderRadius: 14, padding: '14px 18px', marginBottom: 28,
              display: 'flex', gap: 10, alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
              <p className="body-font" style={{ fontSize: 13, color: '#7A5A0F', margin: 0, lineHeight: 1.7 }}>
                عبّئ البيانات الأساسية لمدرستك وسيتم توليد ملف Word رسمي جاهز للخطة التشغيلية.
                يمكنك تعديل الملف لاحقاً بعد التحميل وإضافة التفاصيل المتبقية.
              </p>
            </div>

            {/* الفورم */}
            <div style={{
              background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)',
              padding: '2rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)'
            }}>

              {/* القسم 1: بيانات المدرسة */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                  borderBottom: `2px solid ${GOLD}30`, paddingBottom: 10
                }}>
                  <span style={{ fontSize: 20 }}>🏫</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>بيانات المدرسة</h3>
                </div>

                <Field label="اسم المدرسة" fieldKey="school_name" value={form.school_name} onChange={update} placeholder="مثال: ابتدائية مجمع محمد بن أحمد الرشيد" required />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="عدد المعلمين" fieldKey="teachers_count" value={form.teachers_count} onChange={update} placeholder="مثال: 25" />
                  <Field label="عدد الوكلاء" fieldKey="deputies_count" value={form.deputies_count} onChange={update} placeholder="مثال: 3" />
                </div>

                <Field label="اسم منسق الخطة" fieldKey="coordinator_name" value={form.coordinator_name} onChange={update} placeholder="الاسم الكامل" />
                <Field label="اسم مدير المدرسة" fieldKey="principal_name" value={form.principal_name} onChange={update} placeholder="الاسم الكامل" required />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="هاتف العمل" fieldKey="work_phone" value={form.work_phone} onChange={update} placeholder="01xxxxxxx" />
                  <Field label="هاتف الجوال" fieldKey="mobile" value={form.mobile} onChange={update} placeholder="05xxxxxxxx" />
                </div>

                <Field label="البريد الإلكتروني" fieldKey="email" value={form.email} onChange={update} placeholder="school@email.com" />
              </div>

              {/* القسم 2: الرؤية والرسالة */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                  borderBottom: `2px solid ${GOLD}30`, paddingBottom: 10
                }}>
                  <span style={{ fontSize: 20 }}>🎯</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>الرؤية والرسالة</h3>
                </div>

                <Field label="رؤية المدرسة" fieldKey="vision" value={form.vision} onChange={update} placeholder="مثال: بيئة تعليمية محفزة تُعد جيلاً واعياً ومنتمياً لوطنه" type="textarea" />
                <Field label="رسالة المدرسة" fieldKey="mission" value={form.mission} onChange={update} placeholder="مثال: تقديم تعليم نوعي يعزز مهارات المتعلمين ويحقق الشراكة المجتمعية" type="textarea" />
              </div>

              {/* القسم 3: تحليل الواقع SWOT */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                  borderBottom: `2px solid ${GOLD}30`, paddingBottom: 10
                }}>
                  <span style={{ fontSize: 20 }}>📊</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>تحليل الواقع (SWOT)</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="نقاط القوة" fieldKey="strengths" value={form.strengths} onChange={update} placeholder="مثال: كادر تعليمي متميز، بيئة مدرسية محفزة" type="textarea" />
                  <Field label="نقاط الضعف" fieldKey="weaknesses" value={form.weaknesses} onChange={update} placeholder="مثال: نقص في الوسائل التعليمية الحديثة" type="textarea" />
                  <Field label="الفرص" fieldKey="opportunities" value={form.opportunities} onChange={update} placeholder="مثال: دعم إدارة التعليم، شراكات مجتمعية فعالة" type="textarea" />
                  <Field label="التهديدات" fieldKey="threats" value={form.threats} onChange={update} placeholder="مثال: كثرة التكليفات، تسرب بعض المعلمين" type="textarea" />
                </div>
              </div>

              {/* زر التوليد */}
              <button onClick={handleGenerate} disabled={generating} className="gen-btn" style={{
                width: '100%', padding: '16px', fontSize: 17, fontWeight: 800,
                background: generating ? '#9CA3AF' : `linear-gradient(135deg, #D9A441, ${GOLD})`,
                color: generating ? '#fff' : NAVY, border: 'none', borderRadius: 14,
                cursor: generating ? 'not-allowed' : 'pointer',
                fontFamily: 'Tajawal, sans-serif',
                boxShadow: generating ? 'none' : '0 6px 20px rgba(194,138,31,0.30)',
                transition: 'all 0.2s'
              }}>
                {generating ? '⏳ جاري إنشاء الملف...' : '📄 توليد ملف Word جاهز ←'}
              </button>

              {/* رسالة النجاح */}
              {done && (
                <div style={{
                  marginTop: 18, background: '#F0FDF4', border: '1.5px solid #86EFAC',
                  borderRadius: 14, padding: '16px 18px', textAlign: 'center'
                }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#15803D', margin: '0 0 6px' }}>✅ تم إنشاء الملف بنجاح!</p>
                  <p className="body-font" style={{ fontSize: 13, color: '#166534', margin: 0 }}>
                    الملف تم تحميله: الخطة التشغيلية - {form.school_name}.docx
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
