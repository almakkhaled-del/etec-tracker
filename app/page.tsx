'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const GOLD_LIGHT = '#7FB3CB'
const CREAM = '#F5F8FA'

/* ============ نظام الأيقونات (يستبدل الإيموجي) ============ */
function Icon({ name, color = NAVY, size = 24, sw = 1.8 }: { name: string; color?: string; size?: number; sw?: number }) {
  const c = color
  switch (name) {
    case 'school':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3L21 8.5V10H3V8.5L12 3Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M5 10V20H19V10" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 20V14H14V20" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M3 20H21" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'book':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 6.2C10.2 4.7 6.8 4.2 4.3 4.6V17.3C6.8 16.9 10.2 17.4 12 18.9C13.8 17.4 17.2 16.9 19.7 17.3V4.6C17.2 4.2 13.8 4.7 12 6.2Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M12 6.2V18.9" stroke={c} strokeWidth={sw} />
        </svg>
      )
    case 'chart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M5 20V11" stroke={c} strokeWidth={sw + 0.3} strokeLinecap="round" />
          <path d="M12 20V4" stroke={c} strokeWidth={sw + 0.3} strokeLinecap="round" />
          <path d="M19 20V14" stroke={c} strokeWidth={sw + 0.3} strokeLinecap="round" />
          <path d="M3 20H21" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'building':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="5" y="3" width="14" height="18" rx="1.2" stroke={c} strokeWidth={sw} />
          <path d="M9 7.2H10M14 7.2H15M9 11H10M14 11H15M9 14.8H10M14 14.8H15" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <path d="M10 21V17.2H14V21" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      )
    case 'trending':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M3 17L9.5 10.5L13.5 14.5L21 7" stroke={c} strokeWidth={sw + 0.3} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 7H21V13" stroke={c} strokeWidth={sw + 0.3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'target':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke={c} strokeWidth={sw} />
          <circle cx="12" cy="12" r="4.4" stroke={c} strokeWidth={sw} />
          <circle cx="12" cy="12" r="1.3" fill={c} />
        </svg>
      )
    case 'search':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="6.5" stroke={c} strokeWidth={sw} />
          <path d="M20 20L15.8 15.8" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'calendar':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="15" rx="2" stroke={c} strokeWidth={sw} />
          <path d="M3 9.5H21" stroke={c} strokeWidth={sw} />
          <path d="M8 3V6.3M16 3V6.3" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'folder':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M3 7.2C3 6.2 3.9 5.2 5 5.2H9L11 7.2H19C20.1 7.2 21 8.1 21 9.2V17C21 18.1 20.1 19 19 19H5C3.9 19 3 18.1 3 17V7.2Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      )
    case 'bulb':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M9.2 18H14.8" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <path d="M10.2 21H13.8" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <path d="M12 3C8.5 3 6 5.6 6 9C6 11.1 7.1 12.5 8.1 13.5C8.7 14.1 9 14.7 9 15.4V16H15V15.4C15 14.7 15.3 14.1 15.9 13.5C16.9 12.5 18 11.1 18 9C18 5.6 15.5 3 12 3Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      )
    case 'shield':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3L19 6V11C19 15.4 16 18.8 12 20.6C8 18.8 5 15.4 5 11V6L12 3Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M9 12L11 14L15.2 9.4" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3L13.6 9.2L19.8 10.8L13.6 12.4L12 18.6L10.4 12.4L4.2 10.8L10.4 9.2L12 3Z" fill={c} />
        </svg>
      )
    case 'wand':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M4 20L15 9" stroke={c} strokeWidth={sw + 0.2} strokeLinecap="round" />
          <path d="M17 3L18 5.4L20.4 6.4L18 7.4L17 9.8L16 7.4L13.6 6.4L16 5.4L17 3Z" fill={c} />
          <path d="M5.5 12L6.2 13.6L7.8 14.3L6.2 15L5.5 16.6L4.8 15L3.2 14.3L4.8 13.6L5.5 12Z" fill={c} />
        </svg>
      )
    case 'check':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M6 12.5L9.8 16.3L18 7.5" stroke={c} strokeWidth={sw + 0.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'x':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M7 7L17 17M17 7L7 17" stroke={c} strokeWidth={sw + 0.4} strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

function IconBadge({ icon, color = NAVY, bg = 'rgba(31,110,150,0.12)', size = 56, iconSize }: {
  icon: string; color?: string; bg?: string; size?: number; iconSize?: number
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2.6, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Icon name={icon} color={color} size={iconSize || Math.round(size * 0.46)} />
    </div>
  )
}

export default function Landing() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  // قائمة الجوال: روابط الأقسام كانت تختفي كلياً تحت 980px بدون أي بديل
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogin() {
    setLoginError('')
    if (!email || !password) { setLoginError('يرجى تعبئة البريد الإلكتروني وكلمة المرور'); return }
    setLoginLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const { data: user } = await supabase.auth.getUser()
      const { data: schoolUser } = await supabase
        .from('school_users').select('school_id').eq('auth_id', user.user?.id).single()

      if (schoolUser) {
        const { data: school } = await supabase
          .from('schools').select('subscription_status, subscription_end').eq('id', schoolUser.school_id).single()
        if (school) {
          const isExpired = new Date(school.subscription_end) < new Date()
          if (isExpired || school.subscription_status === 'expired') {
            router.push('/expired'); return
          }
        }
      }
      router.push('/dashboard')
    } catch (e: any) {
      setLoginError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }
    setLoginLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl', color: NAVY }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        .body-font { font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif; }
        .cta-gold:hover { filter: brightness(1.08); }
        .login-input:focus { border-color: #1F6E96 !important; outline: none; }
        .login-btn:hover { background: #04202F !important; }
        .about-split { display: grid; grid-template-columns: 1.3fr 1fr; gap: 50px; align-items: start; }
        @media (max-width: 860px) { .about-split { grid-template-columns: 1fr; gap: 32px; } }

        .nav-links { display: flex; align-items: center; gap: 30px; }
        .nav-burger { display: none; }
        @media (max-width: 980px) {
          .nav-links { display: none; }
          .nav-burger { display: flex; }
        }
        .nav-mobile-menu a:active { background: rgba(10,59,88,0.05); }
        @media (min-width: 981px) { .nav-mobile-menu { display: none !important; } }

        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 780px) { .comparison-grid { grid-template-columns: 1fr; } }

        .killer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 980px) { .killer-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .killer-grid { grid-template-columns: 1fr; } }

        .domains-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        @media (max-width: 700px) { .domains-grid { grid-template-columns: repeat(2, 1fr); } }

        .pricing-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        @media (max-width: 720px) {
          .pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
        }
      `}</style>

      {/* ============ NAV ============ */}
      <nav style={{
        background: 'rgba(245,248,250,0.92)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(10,59,88,0.08)', padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 76, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <img src="/logo.png" alt="شواهدي" style={{ height: 58, objectFit: 'contain' }} />

        <div className="nav-links body-font" style={{ fontSize: 14, fontWeight: 600, color: '#4C5A66' }}>
          <a href="#about" style={{ color: 'inherit', textDecoration: 'none' }}>عن المنصة</a>
          <a href="#comparison" style={{ color: 'inherit', textDecoration: 'none' }}>المقارنة</a>
          <a href="#killer-feature" style={{ color: 'inherit', textDecoration: 'none' }}>الميزة الذكية</a>
          <a href="#domains" style={{ color: 'inherit', textDecoration: 'none' }}>معايير هيئة تقويم التعليم والتدريب</a>
          <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>الباقات</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="#login-box" className="body-font" style={{
            fontSize: 13.5, fontWeight: 700, color: NAVY, textDecoration: 'none', padding: '9px 8px'
          }}>
            دخول المدارس
          </a>
          <Link href="/register" style={{
            padding: '9px 22px', fontSize: 13, fontWeight: 700, color: '#fff',
            textDecoration: 'none', background: NAVY, borderRadius: 8
          }}>
            جرّب مجاناً ←
          </Link>
          <button className="nav-burger" onClick={() => setMenuOpen(o => !o)} aria-label="قائمة الأقسام" style={{
            width: 38, height: 38, borderRadius: 9, background: 'rgba(10,59,88,0.07)', border: 'none',
            cursor: 'pointer', flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ width: 17, height: 2, background: NAVY, borderRadius: 1 }} />
            <span style={{ width: 17, height: 2, background: NAVY, borderRadius: 1 }} />
            <span style={{ width: 17, height: 2, background: NAVY, borderRadius: 1 }} />
          </button>
        </div>
      </nav>

      {/* قائمة أقسام منسدلة بالجوال — تظهر تحت شريط التنقل الثابت مباشرة */}
      {menuOpen && (
        <div className="nav-mobile-menu body-font" style={{
          position: 'sticky', top: 76, zIndex: 99, background: '#fff',
          borderBottom: '1px solid rgba(10,59,88,0.1)', boxShadow: '0 12px 28px rgba(10,59,88,0.10)',
          display: 'flex', flexDirection: 'column', padding: '6px 0'
        }}>
          {[
            { href: '#about', label: 'عن المنصة' },
            { href: '#comparison', label: 'المقارنة' },
            { href: '#killer-feature', label: 'الميزة الذكية' },
            { href: '#domains', label: 'معايير هيئة تقويم التعليم والتدريب' },
            { href: '#pricing', label: 'الباقات' },
          ].map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
              padding: '13px 24px', fontSize: 14.5, fontWeight: 600, color: NAVY,
              textDecoration: 'none', borderBottom: '1px solid rgba(10,59,88,0.05)'
            }}>
              {l.label}
            </a>
          ))}
        </div>
      )}

      {/* ============ الهيرو: صورة كاملة بدون نص ============ */}
      <section style={{ padding: 0, margin: 0 }}>
        <img
          src="/hero-3.png"
          alt="شواهدي: من تقرير التقويم الخارجي إلى ملفات جاهزة للاعتماد والطباعة بضغطة زر"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </section>

      {/* ============ نبذة عن شواهدي + تسجيل الدخول ============ */}
      <section id="about" style={{ background: '#fff', borderTop: '1px solid rgba(10,59,88,0.08)', borderBottom: '1px solid rgba(10,59,88,0.08)', padding: '5rem 1.5rem', scrollMarginTop: 76 }}>
        <div style={{ width: '100%' }}>
          <div className="about-split" style={{ marginBottom: 48 }}>

            {/* النبذة - أقصى يمين */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, color: GOLD, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>نبذة عن المنصة</p>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: NAVY, marginBottom: 24 }}>وش هو شواهدي بالضبط؟</h2>

              <div style={{ display: 'grid', gap: 22 }}>
                <p className="body-font" style={{ fontSize: 17, color: '#374151', lineHeight: 2.1 }}>
                  شواهدي منصة سعودية مبنية خصيصاً لمدارس التعليم العام (حكومية، أهلية، وعالمية) لمساعدتها على تنظيم <strong>شواهد معايير الاعتماد المدرسي</strong> وفق إطار هيئة تقويم التعليم والتدريب <strong>(إتقان)</strong> — بمعاييره الأربعة و47 مؤشراً.
                </p>
                <p className="body-font" style={{ fontSize: 17, color: '#374151', lineHeight: 2.1 }}>
                  المشكلة اللي تعيشها أغلب المدارس اليوم: الشواهد مبعثرة بين ملفات ورقية، صور غير مصنفة، ومجلدات متفرقة — والتجهيز الحقيقي يبدأ متأخراً، قبل الزيارة بأيام قليلة، مما يضغط على الإدارة ويقلل من جودة ما يُقدَّم للجنة.
                </p>
                <p className="body-font" style={{ fontSize: 17, color: '#374151', lineHeight: 2.1 }}>
                  شواهدي يقلب هذي المعادلة: بدل ما تبحث عن الشاهد المناسب وتتساءل "وش أرفع هنا؟"، تدخل على كل مؤشر وتلقى إرشاداً واضحاً لما هو مطلوب، ترفع صورة أو ملف PDF مباشرة، والنظام يحوّله ويرتبه تلقائياً تحت المؤشر الصحيح. وفي أي وقت تحتاج، تطبع تقريراً كاملاً منظماً حسب المجالات والمعايير جاهزاً للجنة التقويم.
                </p>
              </div>
            </div>

            {/* صندوق الدخول - أقصى يسار */}
            <div id="login-box" style={{
              background: '#fff', borderRadius: 20, padding: '2.2rem 2rem',
              border: '1px solid rgba(10,59,88,0.07)', boxShadow: '0 16px 44px rgba(10,59,88,0.10)',
              scrollMarginTop: 100
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 6, textAlign: 'center' }}>تسجيل الدخول</h3>
              <p className="body-font" style={{ fontSize: 13, color: '#7A8896', marginBottom: 22, textAlign: 'center' }}>
                أدخل بيانات مدرستك للمتابعة
              </p>

              <label style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 7, display: 'block', fontFamily: 'Tajawal, sans-serif' }}>
                البريد الإلكتروني
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@school.edu.sa" className="login-input"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid rgba(10,59,88,0.15)',
                  borderRadius: 10, fontSize: 14, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                  boxSizing: 'border-box', marginBottom: 16, background: '#F5F8FA', color: NAVY
                }}
              />

              <label style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 7, display: 'block', fontFamily: 'Tajawal, sans-serif' }}>
                كلمة المرور
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="login-input"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid rgba(10,59,88,0.15)',
                  borderRadius: 10, fontSize: 14, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                  boxSizing: 'border-box', marginBottom: 20, background: '#F5F8FA', color: NAVY
                }}
              />

              {loginError && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
                  padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626',
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif'
                }}>
                  {loginError}
                </div>
              )}

              <button onClick={handleLogin} disabled={loginLoading} className="login-btn" style={{
                width: '100%', padding: '13px', fontSize: 15, fontWeight: 700,
                background: loginLoading ? '#9ca3af' : NAVY, color: '#fff',
                border: 'none', borderRadius: 10, cursor: loginLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Tajawal, sans-serif', marginBottom: 16, transition: 'background 0.2s'
              }}>
                {loginLoading ? 'جاري الدخول...' : 'دخول ←'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#7A8896', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                ليس لديك حساب؟{' '}
                <Link href="/register" style={{ color: GOLD, textDecoration: 'none', fontWeight: 700 }}>
                  سجّل مدرستك مجاناً
                </Link>
              </p>
            </div>

          </div>

          <div style={{
            background: 'linear-gradient(135deg, #0A3B58, #0F4C6E)', borderRadius: 20,
            padding: '2.6rem 2.2rem', textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.5,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1.4px, transparent 1.4px)',
              backgroundSize: '22px 22px'
            }} />
            <div style={{
              position: 'absolute', width: 260, height: 260, borderRadius: '50%',
              background: 'rgba(127,179,203,0.18)', filter: 'blur(50px)', top: -110, right: -80
            }} />
            <div style={{
              position: 'absolute', width: 220, height: 220, borderRadius: '50%',
              background: 'rgba(31,110,150,0.16)', filter: 'blur(50px)', bottom: -100, left: -70
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 14, color: GOLD_LIGHT, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
                الفرق الجوهري
              </p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.75, maxWidth: 620, margin: '0 auto' }}>
                شواهدي ما يبيعك مساحة تخزين فقط —<br />
                <span style={{ color: GOLD_LIGHT }}>هو يساعدك تصنع الشاهد الصحيح، وتحفظه في مكانه</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ المقارنة: الوضع الحالي مقابل شواهدي ============ */}
      <section id="comparison" style={{ padding: '5.5rem 1.5rem', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: NAVY, marginBottom: 14 }}>حان الوقت تنهي معاناتك السنوية مع الاعتماد المدرسي</h2>
            <p className="body-font" style={{ fontSize: 16, color: '#4C5A66', lineHeight: 1.9 }}>
              مقارنة بسيطة توضح كيف يغيّر شواهدي المعادلة تماماً — من العشوائية والضغط، إلى التنظيم والأتمتة الذكية.
            </p>
          </div>

          <div className="comparison-grid">
            {/* الوضع الحالي */}
            <div style={{ background: '#FEF6F5', border: '1px solid rgba(220,38,38,0.12)', borderRadius: 20, padding: '2.2rem 2rem', boxShadow: '0 10px 26px rgba(220,38,38,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid rgba(220,38,38,0.1)' }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="x" color="#DC2626" size={18} />
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#991B1B', margin: 0 }}>الوضع الحالي (المرهق)</h3>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { t: 'شتات الشواهد وضياعها', d: 'ملفات ورقية، صور بالجوال، ومجلدات سحابية غير مصنفة، بدون رؤية واضحة للنواقص.' },
                  { t: 'حيرة الصياغة والمطلوب', d: '"وش أرفع هنا بالضبط؟" — سؤال يتكرر كل مرة، وينتج عنه شواهد غير كافية للجنة.' },
                  { t: 'مأزق الوقت الضيق', d: 'التجهيز الحقيقي يبدأ قبل الزيارة بأيام قليلة، تحت ضغط يهدر جودة العمل.' },
                ].map(x => (
                  <div key={x.t} className="body-font" style={{ fontSize: 14.5, color: '#4C5A66', lineHeight: 1.8 }}>
                    <p style={{ fontWeight: 700, color: '#991B1B', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name="x" color="#DC2626" size={14} /> {x.t}
                    </p>
                    <p style={{ margin: 0, paddingRight: 22 }}>{x.d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* الوضع الذكي مع شواهدي */}
            <div style={{ background: 'rgba(31,110,150,0.06)', border: '1px solid rgba(31,110,150,0.25)', borderRadius: 20, padding: '2.2rem 2rem', boxShadow: '0 12px 32px rgba(10,59,88,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid rgba(31,110,150,0.2)' }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(31,110,150,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="sparkle" color={NAVY} size={18} />
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: NAVY, margin: 0 }}>الوضع الذكي (مع شواهدي)</h3>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { t: 'لوحة مؤشرات فورية', d: 'تعرف بثوانٍ نسبة جاهزية كل مجال، وما هي النواقص التي تحتاج استكمالاً طوال العام.' },
                  { t: 'إرشاد مخصص لكل مؤشر', d: 'شرح واضح ودقيق يخبرك بنوع الشاهد المناسب، بدون اجتهاد شخصي مجهد.' },
                  { t: 'رفع ذكي وتصدير بضغطة', d: 'ارفع صورك وملفات PDF مباشرة، ودع النظام يفرزها ويصنفها، لتستخرج ملفاً منسقاً جاهزاً للجنة.' },
                ].map(x => (
                  <div key={x.t} className="body-font" style={{ fontSize: 14.5, color: '#374151', lineHeight: 1.8 }}>
                    <p style={{ fontWeight: 700, color: NAVY, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name="check" color={GOLD} size={14} /> {x.t}
                    </p>
                    <p style={{ margin: 0, paddingRight: 22 }}>{x.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ الميزة الذكية: تحليل التقرير وتوليد الخطط ============ */}
      <section id="killer-feature" style={{ background: NAVY, padding: '5.5rem 1.5rem', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
            <span className="body-font" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(127,179,203,0.12)', border: '1px solid rgba(127,179,203,0.3)',
              color: GOLD_LIGHT, fontSize: 12.5, fontWeight: 700, padding: '6px 18px', borderRadius: 20, marginBottom: 18
            }}>
              <Icon name="wand" color={GOLD_LIGHT} size={15} />
              أقوى ميزة في المنصة
            </span>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.6, marginBottom: 16 }}>
              بضغطة زر واحدة، شواهدي يحلّل تقريرك الخارجي ويولّد خططك آلياً
            </h2>
            <p className="body-font" style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', lineHeight: 1.9 }}>
              أكبر عبء يواجه مدير المدرسة هو تفكيك تقرير هيئة التقويم الخارجي وصياغة الخطط الطويلة. ارفع تقرير الهيئة فقط، ودع النظام يولّد لك الملفات القيادية التالية جاهزة للاعتماد والطباعة:
            </p>
          </div>

          <div className="killer-grid">
            {[
              { icon: 'trending', title: 'الخطة التشغيلية للمدرسة', desc: 'خطة متكاملة ومصاغة تربوياً، مخصصة لمدرستك بناءً على نتائج تقرير التقويم الفعلي.' },
              { icon: 'target', title: 'خطة التحسين وتنفيذها', desc: 'خطة إجرائية مجدولة زمنياً لمعالجة الفجوات المرصودة قبل الزيارة القادمة.' },
              { icon: 'search', title: 'تقرير واقع المدرسة', desc: 'تشخيص دقيق يستعرض نقاط القوة وفرص التحسين وفق المعايير المعتمدة.' },
              { icon: 'calendar', title: 'تقارير الزيارات والاحتفالات', desc: 'تعبئة آلية دورية لتوثيق الأنشطة والفعاليات المدرسية، وإنتاج ملفات PDF فورية.' },
              { icon: 'folder', title: 'حزمة النماذج المتنوعة', desc: 'مجموعة واسعة من السجلات والملفات التوثيقية التي تحتاجها الإدارة يومياً.' },
              { icon: 'bulb', title: 'مستشارك الإداري الخبير', desc: 'شواهدي ما يبيعك مساحة تخزين فارغة — هو يرفع عنك العبء الورقي ويمنحك ملفات جاهزة للتوقيع.' },
            ].map(f => (
              <div key={f.title} style={{
                padding: '1.6rem 1.6rem', background: '#fff',
                borderRadius: 16, border: '1px solid rgba(10,59,88,0.06)', boxShadow: '0 10px 24px rgba(0,0,0,0.12)'
              }}>
                <IconBadge icon={f.icon} color={NAVY} bg="rgba(31,110,150,0.13)" size={50} />
                <p style={{ fontWeight: 700, fontSize: 16, color: NAVY, margin: '14px 0 8px' }}>{f.title}</p>
                <p className="body-font" style={{ fontSize: 14, color: '#4C5A66', margin: 0, lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <a href="#pricing" className="cta-gold" style={{
              display: 'inline-block', padding: '15px 38px', fontSize: 16, fontWeight: 700,
              background: `linear-gradient(135deg, #3E8AB0, ${GOLD})`, color: NAVY,
              borderRadius: 10, textDecoration: 'none', transition: 'filter 0.2s'
            }}>
              احصل على هذه الميزات الآن ←
            </a>
          </div>
        </div>
      </section>

      {/* ============ المجالات ============ */}
      <section id="domains" style={{ background: '#fff', borderBottom: '1px solid rgba(10,59,88,0.08)', padding: '4rem 1.5rem', scrollMarginTop: 76 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 30px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: NAVY, marginBottom: 10 }}>تغطية كاملة لمعايير هيئة تقويم التعليم والتدريب — 47 مؤشراً</h2>
          <p className="body-font" style={{ fontSize: 14.5, color: '#7A8896' }}>لا نترك مؤشراً واحداً للاجتهاد الشخصي — كل مؤشر له مكانه الواضح.</p>
        </div>
        <div className="domains-grid" style={{ maxWidth: 960, margin: '0 auto' }}>
          {[
            { icon: 'school', label: 'الإدارة المدرسية', sub: '15 مؤشراً' },
            { icon: 'book', label: 'التعليم والتعلم', sub: '13 مؤشراً' },
            { icon: 'chart', label: 'نواتج التعلم', sub: '13 مؤشراً' },
            { icon: 'building', label: 'البيئة المدرسية', sub: '6 مؤشرات' },
          ].map(d => (
            <div key={d.label} style={{
              background: '#F5F8FA', borderRadius: 16, padding: '26px 16px', textAlign: 'center',
              border: '1px solid rgba(10,59,88,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <IconBadge icon={d.icon} color={NAVY} bg="rgba(31,110,150,0.13)" size={58} />
              <p style={{ fontSize: 14.5, fontWeight: 700, color: NAVY, margin: '14px 0 4px' }}>{d.label}</p>
              <p className="body-font" style={{ fontSize: 12.5, color: '#7A8896', margin: 0 }}>{d.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ الباقتان ============ */}
      <section id="pricing" style={{ padding: '6rem 1.5rem', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-block', background: 'rgba(62,138,176,0.12)', color: '#175A7D',
              fontSize: 13.5, fontWeight: 700, padding: '7px 18px', borderRadius: 20, marginBottom: 24
            }}>
              الإطلاق الرسمي — بداية العام الدراسي 1448هـ
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 12 }}>اختر الباقة المناسبة لمدرستك وابدأ فوراً</h2>
            <p className="body-font" style={{ fontSize: 15.5, color: '#7A8896', marginBottom: 52 }}>وفّر جهد الكادر الإداري، واضمن جاهزية مستنداتك وخططك على أكمل وجه.</p>
          </div>

          <div className="pricing-grid">

            {/* الباقة التجريبية */}
            <div style={{
              background: CREAM, border: '2px solid rgba(10,59,88,0.1)', borderRadius: 24,
              padding: '3rem 2.6rem', display: 'flex', flexDirection: 'column'
            }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#7A8896', marginBottom: 14 }}>🆓 تجريبية</p>
              <p style={{ fontSize: 56, fontWeight: 900, color: NAVY, margin: '0 0 6px', lineHeight: 1 }}>0</p>
              <p className="body-font" style={{ fontSize: 14.5, color: '#7A8896', marginBottom: 30 }}>ريال / 7 أيام تجربة مجانية</p>
              <div style={{ textAlign: 'right', marginBottom: 32, flex: 1 }}>
                {['مجال واحد من أصل 4', 'حجم رفع حتى 50 ميجابايت', 'رفع صور وملفات PDF', 'تقرير طباعة أساسي'].map(f => (
                  <p key={f} className="body-font" style={{ fontSize: 14.5, color: NAVY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name="check" color="#7A8896" size={16} /> {f}
                  </p>
                ))}
              </div>
              <a href="/register" style={{
                display: 'block', textAlign: 'center', padding: '16px', fontSize: 16, fontWeight: 700,
                background: 'rgba(10,59,88,0.06)', color: NAVY, borderRadius: 12, textDecoration: 'none'
              }}>
                ابدأ مجاناً ←
              </a>
            </div>

            {/* الباقة المتكاملة */}
            <div style={{
              background: NAVY, borderRadius: 24, position: 'relative',
              padding: '3rem 2.6rem', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 52px rgba(10,59,88,0.24)'
            }}>
              <div style={{
                position: 'absolute', top: -17, left: '50%', transform: 'translateX(-50%)',
                background: `linear-gradient(135deg, #3E8AB0, ${GOLD})`, color: NAVY,
                fontSize: 13, fontWeight: 800, padding: '7px 20px', borderRadius: 20,
                whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(31,110,150,0.35)'
              }}>
                🎉 عرض تدشين المنصة
              </div>

              <p style={{ fontSize: 15, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 14 }}>👑 المتكاملة</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                <p style={{ fontSize: 56, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>599</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.45)', margin: 0, textDecoration: 'line-through' }}>699</p>
              </div>
              <p className="body-font" style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.6)', marginBottom: 30 }}>ريال / عام دراسي — بمناسبة الافتتاح وتدشين المنصة</p>
              <div style={{ textAlign: 'right', marginBottom: 32, flex: 1 }}>
                {[
                  { text: 'جميع المجالات الأربعة' },
                  { text: 'رفع ملفات غير محدود' },
                  { text: 'تحليل ذكي متكامل لتقرير هيئة التقويم الخارجي' },
                  {
                    text: 'استخراج آلي بعد تحليل تقرير هيئة التقويم الخارجي لـ:',
                    sub: ['الخطة التشغيلية', 'متابعة الخطة التشغيلية', 'واقع المدرسة', 'خطة التحسين', 'تنفيذ خطة التحسين']
                  },
                  { text: 'نموذج تقارير الزيارات والاحتفالات (تعبئة آلية لإنتاج PDF)' },
                  { text: 'مجموعة كبيرة من النماذج المتنوعة' },
                  { text: 'دعم فني ذو أولوية على مدار العام، ومتابعة مستجدات الميدان من مختصين' },
                ].map(item => (
                  <div key={item.text} style={{ marginBottom: 14 }}>
                    <p className="body-font" style={{ fontSize: 14.5, color: '#fff', margin: 0, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ paddingTop: 2, flexShrink: 0 }}><Icon name="check" color={GOLD_LIGHT} size={16} /></span> {item.text}
                    </p>
                    {item.sub && (
                      <div style={{ marginTop: 8, paddingRight: 26 }}>
                        {item.sub.map(s => (
                          <p key={s} className="body-font" style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', margin: '0 0 6px' }}>
                            – {s}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <a href="https://wa.me/966555826838?text=أبي أشترك بالباقة المتكاملة" target="_blank" rel="noreferrer" style={{
                display: 'block', textAlign: 'center', padding: '16px', fontSize: 16, fontWeight: 700,
                background: `linear-gradient(135deg, #3E8AB0, ${GOLD})`, color: NAVY, borderRadius: 12, textDecoration: 'none'
              }}>
                اشترك الآن ←
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ============ الفوتر ============ */}
      <footer style={{ borderTop: '1px solid rgba(10,59,88,0.08)', background: '#fff', padding: '4rem 2rem 2.8rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 56, marginBottom: 20 }} />

          <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="shield" color={GOLD} size={18} /> منصة آمنة وموثّقة بالكامل
          </p>
          <p className="body-font" style={{ fontSize: 13.5, color: '#7A8896', margin: '0 0 8px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.8 }}>
            شواهدي منصة سعودية مستقلة تهدف لدعم قيادات المدارس، وهي <strong>غير مرتبطة رسمياً</strong> بهيئة تقويم التعليم والتدريب.
          </p>
          <p className="body-font" style={{ fontSize: 14, color: '#7A8896', margin: '0 0 20px' }}>
            shawahede.com
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 32 }}>
            <Link href="/privacy" className="body-font" style={{ fontSize: 14, color: '#7A8896', textDecoration: 'none' }}>سياسة الخصوصية</Link>
            <Link href="/terms" className="body-font" style={{ fontSize: 14, color: '#7A8896', textDecoration: 'none' }}>الشروط والأحكام</Link>
          </div>

          {/* ============ شارات التوثيق الرسمي ============ */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'center', gap: 18,
            marginBottom: 32
          }}>
            {/* توثيق التجارة الإلكترونية - وزارة التجارة + المركز السعودي للأعمال */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 18, background: '#F7F9FA',
              border: '1px solid rgba(10,59,88,0.08)', borderRadius: 16, padding: '18px 26px'
            }}>
              <img src="/ecommerce-auth-qr.png" alt="باركود توثيق التجارة الإلكترونية" style={{ height: 84, width: 84, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <img src="/ministry-of-commerce-logo.png" alt="وزارة التجارة" style={{ height: 32, objectFit: 'contain' }} />
                  <img src="/saudi-business-center-logo.png" alt="المركز السعودي للأعمال" style={{ height: 32, objectFit: 'contain' }} />
                </div>
                <p className="body-font" style={{ fontSize: 13, color: '#7A8896', margin: 0 }}>موثّق إلكترونياً — المركز السعودي للأعمال</p>
              </div>
            </div>

            {/* وثيقة العمل الحر */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 18, background: '#F7F9FA',
              border: '1px solid rgba(10,59,88,0.08)', borderRadius: 16, padding: '18px 26px'
            }}>
              <img src="/freelance-work-logo.png" alt="وثيقة العمل الحر" style={{ height: 68, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>وثيقة عمل حر</p>
                <p className="body-font" style={{ fontSize: 13, color: '#7A8896', margin: 0 }}>رقم الوثيقة: FL-898950755</p>
              </div>
            </div>
          </div>

          <div style={{ width: 60, height: 1, background: 'rgba(10,59,88,0.1)', margin: '0 auto 24px' }} />
          <a href="https://khaleddev.online" target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none'
          }}>
            <span className="body-font" style={{ fontSize: 13, color: '#7A8896' }}>صُنع بواسطة</span>
            <img src="/nextlogic-logo.png" alt="Next Logic by Khaled" style={{ height: 26, objectFit: 'contain' }} />
          </a>
        </div>
      </footer>
    </div>
  )
}
