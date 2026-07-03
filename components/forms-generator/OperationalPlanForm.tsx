'use client'
import { useState, useEffect } from 'react'
import { Field, SectionHeader, GenerateButton, SuccessBox, ErrorBox, Card, NAVY } from './SharedFormUI'

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

interface Props {
  schoolName?: string
  schoolPrincipalName: string
  onGenerated?: (fileName: string) => void
}

export default function OperationalPlanForm({ schoolName: initialSchoolName, schoolPrincipalName, onGenerated }: Props) {
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
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
    setF(prev => ({
      ...prev,
      school_name: initialSchoolName || prev.school_name,
      principal_name: schoolPrincipalName || prev.principal_name,
      member_1: schoolPrincipalName || prev.member_1,
    }))
  }, [initialSchoolName, schoolPrincipalName])

  function u(key: string, val: string) { setF(prev => ({ ...prev, [key]: val })) }

  async function handleGenerate() {
    setError(null); setDone(false)
    if (!f.school_name) { setError('يرجى إدخال اسم المدرسة'); return }
    if (!f.principal_name) { setError('يرجى إدخال اسم مدير المدرسة'); return }
    setGenerating(true)
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
      const name = `الخطة التشغيلية - ${f.school_name}.docx`
      saveAs(output, name)
      setFileName(name); setDone(true); onGenerated?.(name)
    } catch (error) {
      console.error('Error:', error)
      setError('حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.')
    }
    setGenerating(false)
  }

  return (
    <Card>
      <div style={{ background: 'linear-gradient(135deg, #0B1F3A, #14284a)', borderRadius: 16, padding: '18px 20px', marginBottom: 22, color: '#fff' }}>
        <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>📄 الملف يحتوي تلقائياً:</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.9, margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
          غلاف رسمي بشعار الوزارة ورؤية 2030 · رؤية ورسالة المدرسة · تحليل الواقع SWOT · 5 أهداف عامة بـ19 برنامج مفصّل · مسؤولي التنفيذ ومؤشرات الأداء
        </p>
      </div>

      <SectionHeader icon="🏫" title="بيانات المدرسة" />
      <Field label="اسم المدرسة *" value={f.school_name} onChange={v => u('school_name', v)} placeholder="ابتدائية مجمع محمد بن أحمد الرشيد" />
      <Field label="اسم مدير المدرسة *" value={f.principal_name} onChange={v => u('principal_name', v)} placeholder="الاسم الكامل" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="عدد المعلمين" value={f.teachers_count} onChange={v => u('teachers_count', v)} placeholder="25" />
        <Field label="عدد الوكلاء" value={f.deputies_count} onChange={v => u('deputies_count', v)} placeholder="3" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="هاتف العمل" value={f.work_phone} onChange={v => u('work_phone', v)} placeholder="01xxxxxxx" />
        <Field label="هاتف الجوال" value={f.mobile} onChange={v => u('mobile', v)} placeholder="05xxxxxxxx" />
      </div>
      <Field label="البريد الإلكتروني" value={f.email} onChange={v => u('email', v)} placeholder="school@email.com" />

      <SectionHeader icon="📊" title="قاعدة بيانات المدرسة" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="عدد المعلمين" value={f.db_teachers} onChange={v => u('db_teachers', v)} placeholder="25" />
        <Field label="عدد الطلاب" value={f.db_students} onChange={v => u('db_students', v)} placeholder="385" />
        <Field label="عدد الصفوف" value={f.db_classes} onChange={v => u('db_classes', v)} placeholder="15" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="مدير" value={f.db_principal} onChange={v => u('db_principal', v)} placeholder="1" />
        <Field label="وكيل" value={f.db_deputies} onChange={v => u('db_deputies', v)} placeholder="3" />
        <Field label="موجه طلابي" value={f.db_counselor} onChange={v => u('db_counselor', v)} placeholder="2" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="رائد نشاط" value={f.db_activity} onChange={v => u('db_activity', v)} placeholder="1" />
        <Field label="إداري" value={f.db_admin} onChange={v => u('db_admin', v)} placeholder="2" />
        <Field label="أمين مصادر تعلم" value={f.db_librarian} onChange={v => u('db_librarian', v)} placeholder="1" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="عدد المعامل" value={f.db_labs} onChange={v => u('db_labs', v)} placeholder="2" />
        <Field label="عدد الملاعب" value={f.db_fields} onChange={v => u('db_fields', v)} placeholder="1" />
        <Field label="عدد القاعات" value={f.db_halls} onChange={v => u('db_halls', v)} placeholder="3" />
      </div>

      <SectionHeader icon="👥" title="أعضاء لجنة إعداد الخطة (التميز)" />
      {MEMBERS.map(m => (
        <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: '#8A8270', width: 180, flexShrink: 0, textAlign: 'left', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{m.role}</span>
          <input type="text" value={(f as any)[m.key]} onChange={e => u(m.key, e.target.value)} placeholder="اسم العضو"
            style={{ flex: 1, padding: '9px 12px', border: '1.5px solid rgba(11,31,58,0.12)', borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif', boxSizing: 'border-box', background: '#FAFAF7', color: NAVY, direction: 'rtl' }} />
        </div>
      ))}

      {error && <ErrorBox message={error} />}
      <GenerateButton generating={generating} onClick={handleGenerate} label="📄 توليد الخطة التشغيلية ←" />
      {done && <SuccessBox fileName={fileName} />}
    </Card>
  )
}
