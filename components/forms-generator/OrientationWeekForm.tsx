'use client'
import { useState } from 'react'
import { Field, SectionHeader, GenerateButton, SuccessBox, ErrorBox, Card } from './SharedFormUI'

interface Props { schoolPrincipalName: string; onGenerated?: (fileName: string) => void }

export default function OrientationWeekForm({ schoolPrincipalName, onGenerated }: Props) {
  const [preparedBy, setPreparedBy] = useState(schoolPrincipalName)
  const [location, setLocation] = useState('')
  const [period, setPeriod] = useState('')
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')

  async function handleGenerate() {
    setError(null); setDone(false)
    if (!preparedBy.trim() || !location.trim() || !period.trim()) { setError('لازم تعبّي كل الحقول الثلاثة'); return }

    setGenerating(true)
    try {
      const [Docxtemplater, PizZip, { saveAs }] = await Promise.all([
        import('docxtemplater').then(m => m.default),
        import('pizzip').then(m => m.default),
        import('file-saver'),
      ])
      const response = await fetch('/templates/orientation-week-template.docx')
      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } })
      doc.render({ prepared_by: preparedBy, location, period })
      const output = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const f = `خطة الأسبوع التمهيدي.docx`
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
      <SectionHeader icon="🎒" title="خطة الأسبوع التمهيدي" />
      <p style={{ fontSize: 12, color: '#8A8270', marginBottom: 16, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
        محتوى الخطة (برنامج الأيام الخمسة والجدول الزمني) معتمد وثابت — تحتاج بس تعبّي 3 حقول
      </p>
      <Field label="إعداد" value={preparedBy} onChange={setPreparedBy} />
      <Field label="المكان" value={location} onChange={setLocation} placeholder="مثال: مدرسة ... الابتدائية" />
      <Field label="الفترة" value={period} onChange={setPeriod} placeholder="الأسبوع الأول من العام الدراسي 1448هـ" />

      {error && <ErrorBox message={error} />}
      <GenerateButton generating={generating} onClick={handleGenerate} label="📄 توليد خطة الأسبوع التمهيدي ←" />
      {done && <SuccessBox fileName={fileName} />}
    </Card>
  )
}
