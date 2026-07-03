'use client'
import { useState } from 'react'
import {
  Field, SectionHeader, GenerateButton, SuccessBox, ErrorBox, Card, NAVY,
} from './SharedFormUI'

type Member = { name: string; job: string }

const ROLE_LABELS = [
  'رئيس اللجنة', 'عضو', 'عضو', 'عضو', 'مقررة اللجنة', 'عضو', 'عضو', 'عضو',
]

interface CommitteeDecisionFormProps {
  schoolPrincipalName: string
  onGenerated?: (fileName: string) => void
}

export default function CommitteeDecisionForm({ schoolPrincipalName, onGenerated }: CommitteeDecisionFormProps) {
  const [committeeName, setCommitteeName] = useState('')
  const [day, setDay] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('')
  const [academicYear, setAcademicYear] = useState('1448هـ')
  const [members, setMembers] = useState<Member[]>(Array.from({ length: 8 }, () => ({ name: '', job: '' })))
  const [sem1, setSem1] = useState(['', '', ''])
  const [sem2, setSem2] = useState(['', '', ''])
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')

  function updateMember(i: number, field: keyof Member, value: string) {
    setMembers(prev => { const next = [...prev]; next[i] = { ...next[i], [field]: value }; return next })
  }

  async function handleGenerate() {
    setError(null); setDone(false)
    if (!committeeName.trim()) { setError('لازم تكتب اسم اللجنة'); return }
    if (!members.some(m => m.name.trim())) { setError('لازم تضيف عضو واحد على الأقل'); return }

    setGenerating(true)
    try {
      const [Docxtemplater, PizZip, { saveAs }] = await Promise.all([
        import('docxtemplater').then(m => m.default),
        import('pizzip').then(m => m.default),
        import('file-saver'),
      ])
      const response = await fetch('/templates/committee-decision-template.docx')
      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } })

      const memberData: Record<string, string> = {}
      members.forEach((m, i) => {
        memberData[`member${i + 1}_name`] = m.name
        memberData[`member${i + 1}_job`] = m.job
      })

      doc.render({
        committee_name: committeeName, day, date, duration, academic_year: academicYear,
        principal_name: schoolPrincipalName,
        sem1_meeting1: sem1[0], sem1_meeting2: sem1[1], sem1_meeting3: sem1[2],
        sem2_meeting1: sem2[0], sem2_meeting2: sem2[1], sem2_meeting3: sem2[2],
        ...memberData,
      })

      const output = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const f = `قرار تشكيل ${committeeName}.docx`
      saveAs(output, f)
      setFileName(f); setDone(true); onGenerated?.(f)
    } catch (e) {
      console.error(e)
      setError('حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.')
    }
    setGenerating(false)
  }

  return (
    <Card>
      <SectionHeader icon="📋" title="بيانات القرار" />
      <Field label="اسم اللجنة *" value={committeeName} onChange={setCommitteeName} placeholder="مثال: لجنة التميز المدرسي" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="اليوم" value={day} onChange={setDay} />
        <Field label="التاريخ" value={date} onChange={setDate} placeholder="1448/01/01هـ" />
        <Field label="مدة اللجنة" value={duration} onChange={setDuration} placeholder="عام دراسي كامل" />
        <Field label="العام الدراسي" value={academicYear} onChange={setAcademicYear} />
      </div>

      <SectionHeader icon="👥" title="أعضاء اللجنة" />
      {members.map((m, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: '#8A8270', width: 90, flexShrink: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{ROLE_LABELS[i]}</span>
          <input type="text" value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} placeholder="اسم العضو"
            style={{ flex: 1, padding: '9px 12px', border: '1.5px solid rgba(11,31,58,0.12)', borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif', boxSizing: 'border-box', background: '#FAFAF7', color: NAVY, direction: 'rtl' }} />
          <input type="text" value={m.job} onChange={e => updateMember(i, 'job', e.target.value)} placeholder="الوظيفة"
            style={{ flex: 1, padding: '9px 12px', border: '1.5px solid rgba(11,31,58,0.12)', borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif', boxSizing: 'border-box', background: '#FAFAF7', color: NAVY, direction: 'rtl' }} />
        </div>
      ))}

      <SectionHeader icon="🗓️" title="مواعيد الاجتماعات (اختياري)" />
      <p style={{ fontSize: 12, color: '#8A8270', marginBottom: 8, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>الفصل الدراسي الأول</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {sem1.map((v, i) => (
          <input key={i} value={v} onChange={e => { const n = [...sem1]; n[i] = e.target.value; setSem1(n) }} placeholder={`الاجتماع ${i + 1}`}
            style={{ padding: '9px 12px', border: '1.5px solid rgba(11,31,58,0.12)', borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif', background: '#FAFAF7', color: NAVY, direction: 'rtl' }} />
        ))}
      </div>
      <p style={{ fontSize: 12, color: '#8A8270', marginBottom: 8, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>الفصل الدراسي الثاني</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {sem2.map((v, i) => (
          <input key={i} value={v} onChange={e => { const n = [...sem2]; n[i] = e.target.value; setSem2(n) }} placeholder={`الاجتماع ${i + 1}`}
            style={{ padding: '9px 12px', border: '1.5px solid rgba(11,31,58,0.12)', borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif', background: '#FAFAF7', color: NAVY, direction: 'rtl' }} />
        ))}
      </div>

      {error && <ErrorBox message={error} />}
      <GenerateButton generating={generating} onClick={handleGenerate} label="📄 توليد قرار التشكيل ←" />
      {done && <SuccessBox fileName={fileName} />}
    </Card>
  )
}
