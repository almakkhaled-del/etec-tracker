'use client'
import { useState, useEffect } from 'react'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const CREAM = '#F5F8FA'
const TEAL = '#1C7E72'
const TEAL_BORDER = '#2E9E8F'

type ImgState = { url: string } | null

export default function ActivityReportPage() {
  const { school, isTrial, loading } = useSchool()

  const [org1, setOrg1] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [org3, setOrg3] = useState('القسم الابتدائي')
  const [title, setTitle] = useState('')
  const [executors, setExecutors] = useState('')
  const [participants, setParticipants] = useState('')
  const [place, setPlace] = useState('')
  const [duration, setDuration] = useState('')
  const [dateText, setDateText] = useState('')
  const [beneficiaries, setBeneficiaries] = useState('')
  const [domain, setDomain] = useState('')
  const [objectives, setObjectives] = useState<string[]>(['', '', ''])
  const [steps, setSteps] = useState<string[]>(['', '', ''])
  const [photo1, setPhoto1] = useState<ImgState>(null)
  const [photo2, setPhoto2] = useState<ImgState>(null)
  const [principal, setPrincipal] = useState('')
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    if (school) {
      setSchoolName(prev => prev || school.name || '')
      setPrincipal(prev => prev || school.principal_name || '')
    }
  }, [school])

  function readImage(file: File | undefined, setter: (v: ImgState) => void) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter({ url: reader.result as string })
    reader.readAsDataURL(file)
  }

  const updateList = (arr: string[], set: (v: string[]) => void, i: number, v: string) => {
    const n = [...arr]; n[i] = v; set(n)
  }

  if (!loading && isTrial) {
    return (
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <AppSidebar />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 22, maxWidth: 440, width: '100%', padding: '38px 30px', textAlign: 'center', boxShadow: '0 8px 30px rgba(10,59,88,0.08)' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🔒</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>مولّد تقارير الأنشطة يتطلب الاشتراك</p>
              <p style={{ fontSize: 13.5, color: '#7A8896', margin: '0 0 24px', lineHeight: 2, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>اشترك الآن للوصول الكامل لأدوات المنصة.</p>
              <a href="/subscribe" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '15px', fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, #3E8AB0, ${GOLD})`, color: NAVY, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>⭐ اشترك الآن</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid rgba(10,59,88,0.12)', borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif', background: '#F7F9FA', color: NAVY, direction: 'rtl', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 5, fontFamily: 'Tajawal, sans-serif' }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        #report { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .rep-box { border: 2px solid ${TEAL_BORDER}; border-radius: 12px; padding: 8px 14px 10px; margin: 0; min-height: 36px; }
        .rep-box > legend { margin: 0 auto; padding: 0 10px; color: ${TEAL}; font-weight: 800; font-size: 13px; text-align: center; }
        .rep-box p, .rep-box li { font-family: 'IBM Plex Sans Arabic', sans-serif; color: #223; font-size: 12.5px; line-height: 1.8; margin: 0; }
        .rep-box ol { margin: 0; padding-inline-start: 18px; }
        .rep-photo { height: 185px; }
        @media print {
          .no-print { display: none !important; }
          html, body { background: #fff !important; }
          #report, #report * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #report { box-shadow: none !important; margin: 0 !important; border: none !important; width: 100% !important; max-width: none !important; }
          .rep-photo { height: 150px !important; }
          @page { size: A4 portrait; margin: 7mm; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div className="no-print"><AppSidebar /></div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <header className="page-header no-print" style={{ background: '#fff', borderBottom: '1px solid rgba(10,59,88,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/forms" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(10,59,88,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← النماذج</Link>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>مولّد تقارير الأنشطة والزيارات</p>
              <p style={{ fontSize: 12, color: '#7A8896', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>عبّئ البيانات، وشاهد المعاينة مباشرة، ثم اطبع أو احفظ PDF</p>
            </div>
            <button onClick={() => window.print()} style={{ padding: '11px 22px', fontSize: 14, fontWeight: 800, background: `linear-gradient(135deg, #178B7E, #3FA24C)`, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', boxShadow: '0 6px 18px rgba(23,139,126,0.3)' }}>🖨️ طباعة / حفظ PDF</button>
          </header>

          <main className="page-main" style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>

            {/* ===== الفورم ===== */}
            <div className="no-print" style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(10,59,88,0.07)', padding: '1.4rem 1.5rem', boxShadow: '0 4px 16px rgba(10,59,88,0.06)' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: NAVY, margin: '0 0 16px' }}>بيانات التقرير</p>

              <label style={labelStyle}>ترويسة الإدارة</label>
              <input value={org1} onChange={e => setOrg1(e.target.value)} placeholder="الإدارة العامة للتعليم بمنطقة ..." style={{ ...inputStyle, marginBottom: 8 }} />
              <input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="اسم المدرسة" style={{ ...inputStyle, marginBottom: 8 }} />
              <input value={org3} onChange={e => setOrg3(e.target.value)} placeholder="القسم" style={{ ...inputStyle, marginBottom: 16 }} />

              <label style={labelStyle}>عنوان النشاط / الفعالية *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: زيارة معرض بينالي الدرعية" style={{ ...inputStyle, marginBottom: 16 }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={labelStyle}>المنفّذ/ون</label><input value={executors} onChange={e => setExecutors(e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>المشارك/ون</label><input value={participants} onChange={e => setParticipants(e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>مكان التنفيذ</label><input value={place} onChange={e => setPlace(e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>مدة التنفيذ</label><input value={duration} onChange={e => setDuration(e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>تاريخ التنفيذ</label><input value={dateText} onChange={e => setDateText(e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>المستفيدون / العدد</label><input value={beneficiaries} onChange={e => setBeneficiaries(e.target.value)} style={inputStyle} /></div>
              </div>
              <div style={{ marginTop: 10 }}><label style={labelStyle}>المجال</label><input value={domain} onChange={e => setDomain(e.target.value)} placeholder="مثال: الأنشطة الطلابية والثقافية" style={inputStyle} /></div>

              <label style={{ ...labelStyle, marginTop: 18 }}>الأهداف</label>
              {objectives.map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 7 }}>
                  <input value={o} onChange={e => updateList(objectives, setObjectives, i, e.target.value)} placeholder={`هدف ${i + 1}`} style={inputStyle} />
                  {objectives.length > 1 && <button onClick={() => setObjectives(objectives.filter((_, j) => j !== i))} style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontSize: 12 }}>✕</button>}
                </div>
              ))}
              <button onClick={() => setObjectives([...objectives, ''])} style={{ border: `1.5px dashed ${TEAL_BORDER}`, background: 'transparent', color: TEAL, borderRadius: 9, padding: '7px', width: '100%', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}>➕ إضافة هدف</button>

              <label style={{ ...labelStyle, marginTop: 18 }}>خطوات التنفيذ / الوصف</label>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 7 }}>
                  <input value={s} onChange={e => updateList(steps, setSteps, i, e.target.value)} placeholder={`خطوة ${i + 1}`} style={inputStyle} />
                  {steps.length > 1 && <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontSize: 12 }}>✕</button>}
                </div>
              ))}
              <button onClick={() => setSteps([...steps, ''])} style={{ border: `1.5px dashed ${TEAL_BORDER}`, background: 'transparent', color: TEAL, borderRadius: 9, padding: '7px', width: '100%', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}>➕ إضافة خطوة</button>

              <label style={{ ...labelStyle, marginTop: 18 }}>الشواهد (صورتان)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input type="file" accept="image/*" onChange={e => readImage(e.target.files?.[0], setPhoto1)} style={{ ...inputStyle, padding: 8 }} />
                <input type="file" accept="image/*" onChange={e => readImage(e.target.files?.[0], setPhoto2)} style={{ ...inputStyle, padding: 8 }} />
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>مدير المدرسة</label>
                <input value={principal} onChange={e => setPrincipal(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* ===== المعاينة (التقرير) ===== */}
            <div id="report" style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(10,59,88,0.1)', boxShadow: '0 8px 30px rgba(10,59,88,0.1)', overflow: 'hidden', maxWidth: 800 }}>
              {/* الهيدر المتدرّج */}
              <div style={{ background: 'linear-gradient(110deg, #178B7E 0%, #2E9E7A 55%, #3FA24C 100%)', padding: '18px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
                <div style={{ textAlign: 'right', lineHeight: 1.6 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{org1}</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{schoolName}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{org3}</p>
                </div>
                {!logoError ? (
                  <img src="/moe-logo.png" alt="وزارة التعليم" onError={() => setLogoError(true)} style={{ height: 62, flexShrink: 0, marginInlineStart: 14, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                ) : (
                  <div style={{ textAlign: 'center', flexShrink: 0, marginInlineStart: 14 }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>وزارة التعليم</p>
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 600, opacity: 0.9 }}>Ministry of Education</p>
                  </div>
                )}
              </div>

              <div style={{ padding: '20px 26px 26px' }}>
                {/* شريط العنوان */}
                <div style={{ background: '#14323B', borderRadius: 10, padding: '12px 20px', textAlign: 'center', marginBottom: 18 }}>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#fff' }}>{title || 'عنوان النشاط'}</p>
                </div>

                {/* صف: المنفّذون / المشاركون */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <fieldset className="rep-box"><legend>المنفّذ/ون:</legend><p>{executors}</p></fieldset>
                  <fieldset className="rep-box"><legend>المشارك/ون:</legend><p>{participants}</p></fieldset>
                </div>

                {/* صف: المكان / المدة / التاريخ */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <fieldset className="rep-box"><legend>مكان التنفيذ:</legend><p>{place}</p></fieldset>
                  <fieldset className="rep-box"><legend>مدة التنفيذ:</legend><p>{duration}</p></fieldset>
                  <fieldset className="rep-box"><legend>تاريخ التنفيذ:</legend><p>{dateText}</p></fieldset>
                </div>

                {/* صف: المستفيدون / المجال */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <fieldset className="rep-box"><legend>المستفيدون / العدد:</legend><p>{beneficiaries}</p></fieldset>
                  <fieldset className="rep-box"><legend>المجال:</legend><p>{domain}</p></fieldset>
                </div>

                {/* صف: الأهداف / الخطوات */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, alignItems: 'stretch' }}>
                  <fieldset className="rep-box"><legend>الأهداف:</legend>
                    <ol>{objectives.filter(o => o.trim()).map((o, i) => <li key={i}>{o}</li>)}</ol>
                  </fieldset>
                  <fieldset className="rep-box"><legend>خطوات التنفيذ / الوصف:</legend>
                    <ol>{steps.filter(s => s.trim()).map((s, i) => <li key={i}>{s}</li>)}</ol>
                  </fieldset>
                </div>

                {/* الشواهد */}
                <div style={{ textAlign: 'center', margin: '0 0 12px' }}>
                  <span style={{ color: TEAL, fontWeight: 800, fontSize: 14, borderBottom: `2px solid ${TEAL_BORDER}`, padding: '0 30px 6px' }}>الشواهد</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[photo1, photo2].map((ph, i) => (
                    <div key={i} className="rep-photo" style={{ border: `2px solid ${TEAL_BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#F7FAF9' }}>
                      {ph ? <img src={ph.url} alt="شاهد" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#9AA6B0', fontSize: 12, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>صورة الشاهد {i + 1}</span>}
                    </div>
                  ))}
                </div>

                {/* التوقيع — مدير المدرسة فقط */}
                <div style={{ textAlign: 'center', paddingTop: 10 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 800, color: NAVY }}>مدير المدرسة</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#334', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{principal}</p>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}
