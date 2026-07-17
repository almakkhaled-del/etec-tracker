'use client'
// مكونات مشتركة تطابق تصميم مولّد الخطة التشغيلية الأصلي بالضبط
// (نفس الألوان، نفس Field/SectionHeader، نفس الخطوط)

export const NAVY = '#0A3B58'
export const GOLD = '#1F6E96'
export const CREAM = '#F5F8FA'

export function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (val: string) => void; placeholder?: string
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 5, fontFamily: 'Tajawal, sans-serif' }}>
        {label}
      </label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px', border: '1.5px solid rgba(10,59,88,0.12)',
          borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          boxSizing: 'border-box', background: '#F7F9FA', color: NAVY, direction: 'rtl'
        }}
      />
    </div>
  )
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (val: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 5, fontFamily: 'Tajawal, sans-serif' }}>
        {label}
      </label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{
          width: '100%', padding: '10px 12px', border: '1.5px solid rgba(10,59,88,0.12)',
          borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          boxSizing: 'border-box', background: '#F7F9FA', color: NAVY, direction: 'rtl', resize: 'vertical'
        }}
      />
    </div>
  )
}

export function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (val: string) => void; options: string[]
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 5, fontFamily: 'Tajawal, sans-serif' }}>
        {label}
      </label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px', border: '1.5px solid rgba(10,59,88,0.12)',
          borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          boxSizing: 'border-box', background: '#F7F9FA', color: NAVY, direction: 'rtl'
        }}>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  )
}

export function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '2px solid rgba(31,110,150,0.2)', paddingBottom: 10, marginTop: 28 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0 }}>{title}</h3>
    </div>
  )
}

export function GenerateButton({ generating, onClick, label = '📄 توليد الملف ←' }: {
  generating: boolean; onClick: () => void; label?: string
}) {
  return (
    <div style={{ marginTop: 28 }}>
      <button onClick={onClick} disabled={generating} style={{
        width: '100%', padding: '16px', fontSize: 17, fontWeight: 800,
        background: generating ? '#9CA3AF' : `linear-gradient(135deg, #3E8AB0, ${GOLD})`,
        color: generating ? '#fff' : NAVY, border: 'none', borderRadius: 14,
        cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif',
        boxShadow: generating ? 'none' : '0 6px 20px rgba(31,110,150,0.30)', transition: 'all 0.2s'
      }}>
        {generating ? '⏳ جاري إنشاء الملف...' : label}
      </button>
    </div>
  )
}

export function SuccessBox({ fileName }: { fileName: string }) {
  return (
    <div style={{ marginTop: 18, background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 14, padding: '16px 18px', textAlign: 'center' }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#15803D', margin: '0 0 6px' }}>✅ تم إنشاء الملف بنجاح!</p>
      <p style={{ fontSize: 13, color: '#166534', margin: '0 0 10px', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>الملف تم تحميله: {fileName}</p>
      <p style={{ fontSize: 12, color: '#7A8896', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>💡 يمكنك فتح الملف وتعديل أي تفاصيل إضافية</p>
      <div style={{ marginTop: 12, background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 10, padding: '10px 12px' }}>
        <p style={{ fontSize: 12.5, color: '#92400E', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif', lineHeight: 1.8 }}>
          ⚠️ بعد التعديل والتأكد من الملف، يرجى حفظه بصيغة PDF (حفظ باسم ← PDF) قبل رفعه كشاهد.
        </p>
      </div>
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <p style={{ color: '#DC2626', fontSize: 13, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginTop: 8 }}>{message}</p>
  )
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(10,59,88,0.07)', padding: '1.5rem 1.8rem', boxShadow: '0 4px 16px rgba(10,59,88,0.06)' }}>
      {children}
    </div>
  )
}

export function ItemCard({ children, onRemove, canRemove }: {
  children: React.ReactNode; onRemove: () => void; canRemove: boolean
}) {
  return (
    <div style={{ border: '1.5px solid rgba(10,59,88,0.1)', borderRadius: 12, padding: 16, marginBottom: 14, position: 'relative', background: '#F7F9FA' }}>
      {canRemove && (
        <button onClick={onRemove} type="button" style={{
          position: 'absolute', left: 10, top: 10, background: 'transparent', border: 'none',
          color: '#DC2626', fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Sans Arabic, sans-serif'
        }}>حذف ✕</button>
      )}
      {children}
    </div>
  )
}

export function AddItemButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} type="button" style={{
      width: '100%', padding: '12px', border: `2px dashed ${GOLD}`, borderRadius: 12,
      background: 'transparent', color: GOLD, fontWeight: 700, fontSize: 14, cursor: 'pointer',
      fontFamily: 'Tajawal, sans-serif', marginBottom: 20
    }}>
      ➕ إضافة بند جديد
    </button>
  )
}

export function PageShell({ title, subtitle, children }: {
  title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <main className="page-main" style={{ padding: '24px 28px', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>{title}</p>
        <p style={{ fontSize: 12, color: '#7A8896', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{subtitle}</p>
      </div>
      {children}
    </main>
  )
}
