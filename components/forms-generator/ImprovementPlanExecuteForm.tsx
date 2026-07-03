'use client'
import { useState } from 'react'
import { Field, TextAreaField, SelectField, SectionHeader, GenerateButton, SuccessBox, ErrorBox, Card, ItemCard, AddItemButton } from './SharedFormUI'

type Item = { domain: string; element: string; executed_actions: string; methods: string; committees_support: string; supervisor_support: string }
const EMPTY_ITEM: Item = { domain: '', element: '', executed_actions: '', methods: '', committees_support: '', supervisor_support: '' }

interface Props { schoolPrincipalName: string; onGenerated?: (fileName: string) => void }

export default function ImprovementPlanExecuteForm({ schoolPrincipalName, onGenerated }: Props) {
  const [schoolName, setSchoolName] = useState('')
  const [gradeStage, setGradeStage] = useState('')
  const [gender, setGender] = useState('بنين')
  const [ministryNumber, setMinistryNumber] = useState('')
  const [buildingOwnership, setBuildingOwnership] = useState('حكومي')
  const [buildingIndependence, setBuildingIndependence] = useState('مستقل')
  const [periodShift, setPeriodShift] = useState('صباحي')
  const [adminIndependence, setAdminIndependence] = useState('مستقلة')
  const [sharedAdminName, setSharedAdminName] = useState('')
  const [items, setItems] = useState<Item[]>([{ ...EMPTY_ITEM }])
  const [recommendations, setRecommendations] = useState('')
  const [supportProviderName, setSupportProviderName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')

  function updateItem(i: number, field: keyof Item, value: string) {
    setItems(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n })
  }
  function addItem() { setItems(prev => [...prev, { ...EMPTY_ITEM }]) }
  function removeItem(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)) }

  async function handleGenerate() {
    setError(null); setDone(false)
    if (!schoolName.trim()) { setError('لازم تكتب اسم المدرسة'); return }
    const filled = items.filter(it => it.domain.trim())
    if (filled.length === 0) { setError('لازم تضيف بند واحد على الأقل'); return }

    setGenerating(true)
    try {
      const [Docxtemplater, PizZip, { saveAs }] = await Promise.all([
        import('docxtemplater').then(m => m.default),
        import('pizzip').then(m => m.default),
        import('file-saver'),
      ])
      const response = await fetch('/templates/improvement-plan-execute-template.docx')
      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } })

      doc.render({
        school_name: schoolName, grade_stage: gradeStage, gender, ministry_number: ministryNumber,
        building_ownership: buildingOwnership, building_independence: buildingIndependence,
        period_shift: periodShift, admin_independence: adminIndependence, shared_admin_name: sharedAdminName,
        items: filled, recommendations, principal_name: schoolPrincipalName, support_provider_name: supportProviderName,
      })

      const output = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const f = `استمارة 2 - تنفيذ خطة التحسين - ${schoolName}.docx`
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
      <SectionHeader icon="🏫" title="أولاً: البيانات الأساسية" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="اسم المدرسة *" value={schoolName} onChange={setSchoolName} />
        <Field label="المرحلة" value={gradeStage} onChange={setGradeStage} />
        <SelectField label="جنس المدرسة" value={gender} onChange={setGender} options={['بنين', 'بنات']} />
        <Field label="الرقم الوزاري" value={ministryNumber} onChange={setMinistryNumber} />
        <SelectField label="نوع المبنى" value={buildingOwnership} onChange={setBuildingOwnership} options={['حكومي', 'مستأجر']} />
        <SelectField label="استقلالية المبنى" value={buildingIndependence} onChange={setBuildingIndependence} options={['مستقل', 'مشترك']} />
        <SelectField label="الفترة" value={periodShift} onChange={setPeriodShift} options={['صباحي', 'مسائي']} />
        <SelectField label="استقلالية الإدارة" value={adminIndependence} onChange={setAdminIndependence} options={['مستقلة', 'مشتركة']} />
      </div>
      <Field label="اسم المدرسة المشتركة في الإدارة (إن وجد)" value={sharedAdminName} onChange={setSharedAdminName} />

      <SectionHeader icon="🛠️" title="ثانياً: إجراءات تنفيذ خطة التحسين" />
      {items.map((item, i) => (
        <ItemCard key={i} canRemove={items.length > 1} onRemove={() => removeItem(i)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="المجال" value={item.domain} onChange={v => updateItem(i, 'domain', v)} />
            <Field label="العنصر / المكون" value={item.element} onChange={v => updateItem(i, 'element', v)} />
          </div>
          <TextAreaField label="الإجراءات المنفذة (وصف دقيق + يوم وتاريخ التنفيذ)" value={item.executed_actions} onChange={v => updateItem(i, 'executed_actions', v)} rows={2} />
          <TextAreaField label="أساليب وطرق التحسين" value={item.methods} onChange={v => updateItem(i, 'methods', v)} rows={2} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="لجان المدرسة (دعم مقدَّم)" value={item.committees_support} onChange={v => updateItem(i, 'committees_support', v)} />
            <Field label="المشرف التربوي (دعم مقدَّم)" value={item.supervisor_support} onChange={v => updateItem(i, 'supervisor_support', v)} />
          </div>
        </ItemCard>
      ))}
      <AddItemButton onClick={addItem} />

      <SectionHeader icon="💡" title="ثالثاً: التوصيات والمقترحات" />
      <TextAreaField label="" value={recommendations} onChange={setRecommendations} rows={3} />
      <Field label="اسم مقدم/ة خدمات دعم التميز المدرسي (اختياري)" value={supportProviderName} onChange={setSupportProviderName} />

      {error && <ErrorBox message={error} />}
      <GenerateButton generating={generating} onClick={handleGenerate} label="📄 توليد استمارة تنفيذ خطة التحسين ←" />
      {done && <SuccessBox fileName={fileName} />}
    </Card>
  )
}
