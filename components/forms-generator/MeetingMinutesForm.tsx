'use client'
import { useState } from 'react'
import { Field, SectionHeader, GenerateButton, SuccessBox, ErrorBox, Card, NAVY } from './SharedFormUI'

type Member = { name: string; job: string }
type Rec = { text: string; assignee: string; duration: string; dept: string }

const FIXED_ROLES = [
  { job: 'مدير المدرسة', role: 'رئيس اللجنة' },
  { job: 'وكيل الشؤون التعليمية والمدرسية', role: 'عضو' },
  { job: 'وكيل شؤون الطلاب', role: 'عضو' },
]
const EDITABLE_ROLES = ['عضو', 'مقررا اللجنة', 'عضو', 'عضو', 'عضو']

interface Props { schoolPrincipalName: string; onGenerated?: (fileName: string) => void }

export default function MeetingMinutesForm({ schoolPrincipalName, onGenerated }: Props) {
  const [committeeName, setCommitteeName] = useState('')
  const [location, setLocation] = useState('إدارة المدرسة')
  const [meetingDatetime, setMeetingDatetime] = useState('')
  const [meetingNumber, setMeetingNumber] = useState('')
  const [attendeesCount, setAttendeesCount] = useState('')
  const [meetingHour, setMeetingHour] = useState('')
  const [meetingDay, setMeetingDay] = useState('')
  const [hijriDay, setHijriDay] = useState('')
  const [hijriMonthYear, setHijriMonthYear] = useState('')
  const [endHour, setEndHour] = useState('')
  const [agenda, setAgenda] = useState(['', '', '', '', ''])
  const [recs, setRecs] = useState<Rec[]>(Array.from({ length: 5 }, () => ({ text: '', assignee: '', duration: '', dept: '' })))
  const [unexecuted, setUnexecuted] = useState(['', '', ''])
  const [fixedMembers, setFixedMembers] = useState(['', '', ''])
  const [extraMembers, setExtraMembers] = useState<Member[]>(Array.from({ length: 5 }, () => ({ name: '', job: '' })))
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')

  function updateRec(i: number, field: keyof Rec, value: string) {
    setRecs(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n })
  }
  function updateExtra(i: number, field: keyof Member, value: string) {
    setExtraMembers(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n })
  }

  async function handleGenerate() {
    setError(null); setDone(false)
    if (!committeeName.trim()) { setError('لازم تكتب اسم اللجنة'); return }
    if (!fixedMembers[0].trim()) { setError('لازم اسم مدير المدرسة على الأقل'); return }

    setGenerating(true)
    try {
      const [Docxtemplater, PizZip, { saveAs }] = await Promise.all([
        import('docxtemplater').then(m => m.default),
        import('pizzip').then(m => m.default),
        import('file-saver'),
      ])
      const response = await fetch('/templates/meeting-minutes-template.docx')
      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } })

      const agendaData: Record<string, string> = {}
      agenda.forEach((a, i) => { agendaData[`agenda${i + 1}`] = a })
      const recData: Record<string, string> = {}
      recs.forEach((r, i) => {
        recData[`rec${i + 1}_text`] = r.text
        recData[`rec${i + 1}_assignee`] = r.assignee
        recData[`rec${i + 1}_duration`] = r.duration
        recData[`rec${i + 1}_dept`] = r.dept
      })
      const unexecutedData: Record<string, string> = {}
      unexecuted.forEach((u, i) => { unexecutedData[`unexecuted${i + 1}`] = u })
      const memberData: Record<string, string> = {}
      fixedMembers.forEach((name, i) => { memberData[`member${i + 1}_name`] = name })
      extraMembers.forEach((m, i) => {
        const n = i + 4
        memberData[`member${n}_name`] = m.name
        memberData[`member${n}_job`] = m.job
      })

      doc.render({
        committee_name: committeeName, location, meeting_datetime: meetingDatetime,
        meeting_number: meetingNumber, attendees_count: attendeesCount,
        meeting_hour: meetingHour, meeting_day: meetingDay, hijri_day: hijriDay,
        hijri_month_year: hijriMonthYear, end_hour: endHour,
        principal_name: schoolPrincipalName,
        ...agendaData, ...recData, ...unexecutedData, ...memberData,
      })

      const output = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const f = `محضر اجتماع ${committeeName}.docx`
      saveAs(output, f)
      setFileName(f); setDone(true); onGenerated?.(f)
    } catch (e) {
      console.error(e)
      setError('حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.')
    }
    setGenerating(false)
  }

  const inputStyle = { padding: '9px 12px', border: '1.5px solid rgba(10,59,88,0.12)', borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif', background: '#F7F9FA', color: NAVY, direction: 'rtl' as const, width: '100%', boxSizing: 'border-box' as const }

  return (
    <Card>
      <SectionHeader icon="📋" title="بيانات الاجتماع" />
      <Field label="اسم اللجنة *" value={committeeName} onChange={setCommitteeName} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="مقر الاجتماع" value={location} onChange={setLocation} />
        <Field label="رقم الاجتماع" value={meetingNumber} onChange={setMeetingNumber} />
        <Field label="موعد الاجتماع" value={meetingDatetime} onChange={setMeetingDatetime} />
        <Field label="عدد/فئة الحاضرين" value={attendeesCount} onChange={setAttendeesCount} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: NAVY, marginBottom: 5 }}>الساعة</label><input value={meetingHour} onChange={e => setMeetingHour(e.target.value)} style={inputStyle} /></div>
        <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: NAVY, marginBottom: 5 }}>اليوم</label><input value={meetingDay} onChange={e => setMeetingDay(e.target.value)} style={inputStyle} /></div>
        <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: NAVY, marginBottom: 5 }}>التاريخ الهجري</label><input value={hijriDay} onChange={e => setHijriDay(e.target.value)} style={inputStyle} /></div>
        <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: NAVY, marginBottom: 5 }}>الشهر/السنة</label><input value={hijriMonthYear} onChange={e => setHijriMonthYear(e.target.value)} style={inputStyle} /></div>
      </div>
      <Field label="ساعة انتهاء الاجتماع" value={endHour} onChange={setEndHour} />

      <SectionHeader icon="📝" title="جدول أعمال الاجتماع" />
      {agenda.map((a, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <input value={a} onChange={e => { const n = [...agenda]; n[i] = e.target.value; setAgenda(n) }} placeholder={`البند ${i + 1}`} style={inputStyle} />
        </div>
      ))}

      <SectionHeader icon="✅" title="التوصيات" />
      {recs.map((r, i) => (
        <div key={i} style={{ border: '1.5px solid rgba(10,59,88,0.1)', borderRadius: 12, padding: 12, marginBottom: 10, background: '#F7F9FA' }}>
          <input value={r.text} onChange={e => updateRec(i, 'text', e.target.value)} placeholder="نص التوصية" style={{ ...inputStyle, marginBottom: 8 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <input value={r.assignee} onChange={e => updateRec(i, 'assignee', e.target.value)} placeholder="الجهة المكلفة" style={inputStyle} />
            <input value={r.duration} onChange={e => updateRec(i, 'duration', e.target.value)} placeholder="مدة التنفيذ" style={inputStyle} />
            <input value={r.dept} onChange={e => updateRec(i, 'dept', e.target.value)} placeholder="الجهة التابعة" style={inputStyle} />
          </div>
        </div>
      ))}

      <SectionHeader icon="⏳" title="ما لم ينفذ من التوصيات السابقة (اختياري)" />
      {unexecuted.map((u, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <input value={u} onChange={e => { const n = [...unexecuted]; n[i] = e.target.value; setUnexecuted(n) }} style={inputStyle} />
        </div>
      ))}

      <SectionHeader icon="👥" title="أعضاء اللجنة الحاضرون" />
      <p style={{ fontSize: 11, color: '#7A8896', marginBottom: 8, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>الأعضاء الثلاثة الأوائل ثابتون حسب النظام</p>
      {FIXED_ROLES.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <input value={fixedMembers[i]} onChange={e => { const n = [...fixedMembers]; n[i] = e.target.value; setFixedMembers(n) }} placeholder="الاسم" style={{ ...inputStyle, flex: 1 }} />
          <span style={{ fontSize: 11, color: '#7A8896', width: 160, flexShrink: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{r.job} — {r.role}</span>
        </div>
      ))}
      <p style={{ fontSize: 11, color: '#7A8896', margin: '10px 0 8px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>أعضاء إضافيون (اختياري)</p>
      {extraMembers.map((m, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <input value={m.name} onChange={e => updateExtra(i, 'name', e.target.value)} placeholder="اسم العضو" style={{ ...inputStyle, flex: 1 }} />
          <input value={m.job} onChange={e => updateExtra(i, 'job', e.target.value)} placeholder="الوظيفة" style={{ ...inputStyle, flex: 1 }} />
          <span style={{ fontSize: 11, color: '#7A8896', width: 60, flexShrink: 0 }}>{EDITABLE_ROLES[i]}</span>
        </div>
      ))}

      {error && <ErrorBox message={error} />}
      <GenerateButton generating={generating} onClick={handleGenerate} label="📄 توليد محضر الاجتماع ←" />
      {done && <SuccessBox fileName={fileName} />}
    </Card>
  )
}
