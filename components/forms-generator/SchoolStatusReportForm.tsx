'use client'
import { useState } from 'react'
import { Field, TextAreaField, SelectField, SectionHeader, GenerateButton, SuccessBox, ErrorBox, Card, NAVY } from './SharedFormUI'

interface Props { schoolPrincipalName: string; onGenerated?: (fileName: string) => void }

const DOMAINS = ['الإدارة المدرسية', 'التوجيه الطلابي', 'الأنشطة المدرسية', 'نواتج التعلم', 'التدريس', 'البيئة المدرسية']
const PRIORITY_OPTIONS = ['عالي', 'متوسط', 'منخفض', 'لا يوجد احتياج']

export default function SchoolStatusReportForm({ schoolPrincipalName, onGenerated }: Props) {
  const [schoolName, setSchoolName] = useState('')
  const [ministryNumber, setMinistryNumber] = useState('')
  const [gradeStage, setGradeStage] = useState('')
  const [gender, setGender] = useState('بنين')
  const [scope, setScope] = useState('')
  const [buildingType, setBuildingType] = useState('مستقل')
  const [principalPhone, setPrincipalPhone] = useState('')
  const [reportType, setReportType] = useState('ذاتي')
  const [reportDate, setReportDate] = useState('')
  const [overallAvg, setOverallAvg] = useState('')
  const [adminAvg, setAdminAvg] = useState('')
  const [teachingAvg, setTeachingAvg] = useState('')
  const [learningOutcomesAvg, setLearningOutcomesAvg] = useState('')
  const [environmentAvg, setEnvironmentAvg] = useState('')
  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')
  const [opportunities, setOpportunities] = useState('')
  const [challenges, setChallenges] = useState('')
  const [weaknessTreatment, setWeaknessTreatment] = useState('')
  const [priorities, setPriorities] = useState(DOMAINS.map(() => ({ priority: 'متوسط', justification: '' })))
  const [supportProviderName, setSupportProviderName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')

  function updatePriority(i: number, field: 'priority' | 'justification', value: string) {
    setPriorities(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n })
  }

  async function handleGenerate() {
    setError(null); setDone(false)
    if (!schoolName.trim()) { setError('لازم تكتب اسم المدرسة'); return }

    setGenerating(true)
    try {
      const [Docxtemplater, PizZip, { saveAs }] = await Promise.all([
        import('docxtemplater').then(m => m.default),
        import('pizzip').then(m => m.default),
        import('file-saver'),
      ])
      const response = await fetch('/templates/school-status-report-template.docx')
      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } })

      const priorityData: Record<string, string> = {}
      priorities.forEach((p, i) => {
        priorityData[`priority${i + 1}`] = p.priority
        priorityData[`justification${i + 1}`] = p.justification
      })

      doc.render({
        school_name: schoolName, ministry_number: ministryNumber, grade_stage: gradeStage, gender, scope,
        building_type: buildingType, principal_name: schoolPrincipalName, principal_phone: principalPhone,
        report_type: reportType, report_date: reportDate, overall_avg: overallAvg, admin_avg: adminAvg,
        teaching_avg: teachingAvg, learning_outcomes_avg: learningOutcomesAvg, environment_avg: environmentAvg,
        strengths, weaknesses, opportunities, challenges, weakness_treatment: weaknessTreatment,
        support_provider_name: supportProviderName, ...priorityData,
      })

      const output = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const f = `تقرير واقع المدرسة - ${schoolName}.docx`
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
      <SectionHeader icon="🏫" title="البيانات الأساسية" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="اسم المدرسة *" value={schoolName} onChange={setSchoolName} />
        <Field label="الرقم الوزاري" value={ministryNumber} onChange={setMinistryNumber} />
        <Field label="المرحلة الدراسية" value={gradeStage} onChange={setGradeStage} />
        <SelectField label="الجنس" value={gender} onChange={setGender} options={['بنين', 'بنات']} />
        <Field label="النطاق" value={scope} onChange={setScope} />
        <SelectField label="مبنى المدرسة" value={buildingType} onChange={setBuildingType} options={['مستقل', 'مشترك']} />
      </div>
      <Field label="رقم جوال مدير المدرسة" value={principalPhone} onChange={setPrincipalPhone} />

      <SectionHeader icon="📊" title="نتائج التقويم المدرسي" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SelectField label="نوع تقرير التقويم" value={reportType} onChange={setReportType} options={['ذاتي', 'خارجي']} />
        <Field label="تاريخ التقرير" value={reportDate} onChange={setReportDate} />
      </div>
      <Field label="متوسط الأداء العام" value={overallAvg} onChange={setOverallAvg} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="الإدارة المدرسية" value={adminAvg} onChange={setAdminAvg} />
        <Field label="التعليم والتعلم" value={teachingAvg} onChange={setTeachingAvg} />
        <Field label="نواتج التعلم" value={learningOutcomesAvg} onChange={setLearningOutcomesAvg} />
        <Field label="البيئة المدرسية" value={environmentAvg} onChange={setEnvironmentAvg} />
      </div>

      <SectionHeader icon="🔍" title="تحليل الواقع" />
      <TextAreaField label="نقاط القوة" value={strengths} onChange={setStrengths} rows={2} />
      <TextAreaField label="نقاط الضعف" value={weaknesses} onChange={setWeaknesses} rows={2} />
      <TextAreaField label="الفرص" value={opportunities} onChange={setOpportunities} rows={2} />
      <TextAreaField label="التحديات" value={challenges} onChange={setChallenges} rows={2} />
      <TextAreaField label="آلية معالجة نقاط الضعف" value={weaknessTreatment} onChange={setWeaknessTreatment} rows={2} />

      <SectionHeader icon="🎯" title="الأولويات العاجلة للتحسين" />
      {DOMAINS.map((domain, i) => (
        <div key={domain} style={{ border: '1.5px solid rgba(11,31,58,0.1)', borderRadius: 12, padding: 12, marginBottom: 10, background: '#FAFAF7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{domain}</span>
            <select value={priorities[i].priority} onChange={e => updatePriority(i, 'priority', e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid rgba(11,31,58,0.12)', fontSize: 12, fontFamily: 'IBM Plex Sans Arabic, sans-serif', background: '#fff', color: NAVY }}>
              {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <input value={priorities[i].justification} onChange={e => updatePriority(i, 'justification', e.target.value)} placeholder="مبررات تحديد مستوى الأولوية"
            style={{ width: '100%', padding: '8px 12px', border: '1.5px solid rgba(11,31,58,0.12)', borderRadius: 8, fontSize: 12, fontFamily: 'IBM Plex Sans Arabic, sans-serif', background: '#fff', color: NAVY, direction: 'rtl', boxSizing: 'border-box' }} />
        </div>
      ))}

      <Field label="اسم مقدم/ة خدمات دعم التميز المدرسي (اختياري)" value={supportProviderName} onChange={setSupportProviderName} />

      {error && <ErrorBox message={error} />}
      <GenerateButton generating={generating} onClick={handleGenerate} label="📄 توليد تقرير واقع المدرسة ←" />
      {done && <SuccessBox fileName={fileName} />}
    </Card>
  )
}
