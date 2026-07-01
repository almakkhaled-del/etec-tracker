'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AppSidebar from '@/lib/AppSidebar'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const CREAM = '#FBF8F2'

const CATEGORIES = ['الكل', 'التخطيط والإعداد', 'الإدارة المدرسية', 'الشؤون التعليمية', 'شؤون الطلاب', 'التحسين والتطوير']

const CAT_ICONS: Record<string, string> = {
  'التخطيط والإعداد': '📋',
  'الإدارة المدرسية': '🏫',
  'الشؤون التعليمية': '📚',
  'شؤون الطلاب': '👨‍🎓',
  'التحسين والتطوير': '📈',
}

type Form = {
  id: number
  order_num: number
  title_ar: string
  description_ar: string
  category: string
  file_name: string
  file_url: string
  file_size_kb: number
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('الكل')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('forms').select('*').order('order_num')
      setForms(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = forms.filter(f => {
    const matchCat = activeCategory === 'الكل' || f.category === activeCategory
    const matchSearch = !search || f.title_ar.includes(search) || f.description_ar?.includes(search)
    return matchCat && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif; }
        .form-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(11,31,58,0.10); }
        .cat-btn:hover { background: rgba(11,31,58,0.06) !important; }
        .download-btn:hover { background: #0a1830 !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />

        <div style={{ flex: 1, minWidth: 0 }}>
          <header style={{
            background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)',
            padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 50
          }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: NAVY, margin: '0 0 2px' }}>النماذج الجاهزة</p>
              <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>
                {forms.length} نموذجاً جاهزاً للتحميل — حقيبة السجلات المدرسية 1448هـ
              </p>
            </div>
            <input
              type="text" placeholder="🔍 ابحث عن نموذج..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="body-font"
              style={{
                padding: '10px 16px', border: '1px solid rgba(11,31,58,0.15)', borderRadius: 10,
                fontSize: 14, width: 240, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                outline: 'none', background: CREAM
              }}
            />
          </header>

          <main style={{ padding: '28px', maxWidth: 1100, margin: '0 auto' }}>

            {/* نوتة المصادر */}
            <div style={{
              background: 'rgba(194,138,31,0.08)', border: '1px solid rgba(194,138,31,0.25)',
              borderRadius: 12, padding: '14px 18px', marginBottom: 24,
              display: 'flex', gap: 12, alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>📌</span>
              <p className="body-font" style={{ fontSize: 13, color: '#7A5A0F', margin: 0, lineHeight: 1.8 }}>
                هذه الملفات تم تجميعها من حسابات تعليمية ومن مصادر متعددة مع الشكر الجزيل لهذه الحسابات،
                ولم يتم إزالة أي حقوق مُضافة.
              </p>
            </div>

            {/* فلاتر الفئات */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} className="cat-btn" onClick={() => setActiveCategory(cat)} style={{
                  padding: '8px 18px', borderRadius: 20, border: '1.5px solid',
                  borderColor: activeCategory === cat ? NAVY : 'rgba(11,31,58,0.15)',
                  background: activeCategory === cat ? NAVY : 'transparent',
                  color: activeCategory === cat ? '#fff' : '#5A5648',
                  fontSize: 13, fontWeight: activeCategory === cat ? 700 : 400,
                  cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', transition: 'all 0.2s'
                }}>
                  {cat !== 'الكل' && CAT_ICONS[cat] + ' '}{cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8A8270' }}>
                <p>جاري التحميل...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8A8270' }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
                <p>لا توجد نماذج تطابق بحثك</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {filtered.map(form => (
                  <div key={form.id} className="form-card" style={{
                    background: '#fff', borderRadius: 16, border: '1px solid rgba(11,31,58,0.07)',
                    padding: '20px', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, background: 'rgba(11,31,58,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0
                      }}>
                        {CAT_ICONS[form.category] || '📄'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: '0 0 4px', lineHeight: 1.5 }}>
                          {form.title_ar}
                        </p>
                        <span style={{
                          fontSize: 11, background: 'rgba(11,31,58,0.06)', color: '#5A5648',
                          padding: '2px 10px', borderRadius: 20
                        }}>
                          {form.category}
                        </span>
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: '#8A8270',
                        background: CREAM, padding: '4px 10px', borderRadius: 8, flexShrink: 0
                      }}>
                        {form.order_num}
                      </span>
                    </div>

                    {form.description_ar && (
                      <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: 0, lineHeight: 1.7 }}>
                        {form.description_ar}
                      </p>
                    )}

                    <a href={form.file_url} download target="_blank" rel="noreferrer"
                      className="download-btn"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px', background: NAVY, color: '#fff', borderRadius: 10,
                        textDecoration: 'none', fontSize: 14, fontWeight: 600,
                        transition: 'background 0.2s', marginTop: 'auto',
                        fontFamily: 'Tajawal, sans-serif'
                      }}>
                      <span>⬇️</span>
                      تحميل النموذج
                    </a>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
