'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAVY = '#005448'
const GOLD = '#2FAB99'
const GOLD_LIGHT = '#8AD4C4'
const CREAM = '#F6F7F6'

export default function Landing() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

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
    <div style={{ minHeight: '100vh', background: '#F6F7F6', fontFamily: "'Tajawal', sans-serif", direction: 'rtl', color: '#005448' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1.02) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -0.5%); }
        }
        .hero-bg { animation: kenburns 24s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) { .hero-bg { animation: none; } }
        .body-font { font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif; }
        .cta-gold:hover { filter: brightness(1.08); }
        .login-input:focus { border-color: #2FAB99 !important; outline: none; }
        .login-btn:hover { background: #0a1830 !important; }

        .hero-split { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
        @media (max-width: 860px) {
          .hero-split { grid-template-columns: 1fr; gap: 32px; }
        }
        @media (min-width: 1200px) {
          .hero-split { gap: 100px; }
        }

        .hero-title { font-size: 38px; line-height: 1.7; }
        @media (max-width: 640px) {
          .hero-title { font-size: 30px; line-height: 1.65; }
        }

        .pricing-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        @media (max-width: 720px) {
          .pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
        }
      `}</style>

      {/* ============ NAV (مبسّط - شعار فقط) ============ */}
      <nav style={{
        background: 'rgba(246,247,246,0.92)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0,84,72,0.08)', padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 76, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <img src="/logo.png" alt="شواهدي" style={{ height: 58, objectFit: 'contain' }} />
        <a href="#login-box" style={{
          padding: '9px 22px', fontSize: 13, fontWeight: 700, color: '#fff',
          textDecoration: 'none', background: NAVY, borderRadius: 8
        }}>
          الدخول ↓
        </a>
      </nav>

      {/* ============ HERO (صافي بدون نص) ============ */}
      <section style={{ position: 'relative', overflow: 'hidden', height: '56vh', minHeight: 380, maxHeight: 560 }}>
        <div className="hero-bg" style={{
          position: 'absolute', inset: 0, backgroundImage: 'url(/hero.png)',
          backgroundSize: 'cover', backgroundPosition: 'center 35%', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,84,72,0.05) 0%, rgba(0,84,72,0.0) 50%, rgba(246,247,246,1) 100%)',
          zIndex: 1,
        }} />
      </section>

      {/* ============ نص + مربع دخول جنب بعض ============ */}
      <section style={{ padding: '5.5rem 2rem 4rem', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div className="hero-split">

          {/* النص - يمين */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(95,194,172,0.14)', border: '1px solid rgba(47,171,153,0.35)',
              color: '#1B7A66', fontSize: 12, fontWeight: 600, padding: '6px 16px',
              borderRadius: 30, marginBottom: 26, letterSpacing: 0.3
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2FAB99', display: 'inline-block' }} />
              متوافق مع معايير هيئة تقويم التعليم والتدريب
            </div>

            <h1 className="hero-title" style={{ fontWeight: 900, color: '#005448', marginBottom: 22 }}>
              <span style={{ display: 'block', marginBottom: 6 }}>لا تبحث عن الشاهد المناسب</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, #2FAB99, #1B7A66)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>شواهدي يرشدك إليه، وينشئه لك</span>
            </h1>

            <p className="body-font" style={{ fontSize: 16, color: '#5A5648', lineHeight: 1.9, marginBottom: 30, maxWidth: 540 }}>
              شواهدي منصة تساعد مدارس التعليم العام على <strong>إنشاء</strong> شواهد معايير الاعتماد المدرسي، تنظيمها، وطباعتها — مجال بمجال، مؤشراً بمؤشر، حتى تستقبل لجنة التقويم بثقة كاملة طوال العام.
            </p>

            <Link href="#login-box" className="cta-gold" style={{
              display: 'inline-block', padding: '15px 38px', fontSize: 16, fontWeight: 700,
              background: 'linear-gradient(135deg, #5FC2AC, #2FAB99)', color: '#005448',
              borderRadius: 10, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(47,171,153,0.28)', transition: 'filter 0.2s'
            }}>
              سجّل مدرستك الآن ←
            </Link>
          </div>

          {/* مربع الدخول - يسار */}
          <div id="login-box" style={{
            background: '#fff', borderRadius: 20, padding: '2.2rem 2rem',
            border: '1px solid rgba(0,84,72,0.07)', boxShadow: '0 16px 44px rgba(0,84,72,0.10)',
            scrollMarginTop: 100
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 6, textAlign: 'center' }}>تسجيل الدخول</h2>
            <p className="body-font" style={{ fontSize: 13, color: '#8A8270', marginBottom: 22, textAlign: 'center' }}>
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
                width: '100%', padding: '12px 16px', border: '1px solid rgba(0,84,72,0.15)',
                borderRadius: 10, fontSize: 14, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                boxSizing: 'border-box', marginBottom: 16, background: '#F6F7F6', color: NAVY
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
                width: '100%', padding: '12px 16px', border: '1px solid rgba(0,84,72,0.15)',
                borderRadius: 10, fontSize: 14, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                boxSizing: 'border-box', marginBottom: 20, background: '#F6F7F6', color: NAVY
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

            <p style={{ textAlign: 'center', fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              ليس لديك حساب؟{' '}
              <Link href="/register" style={{ color: GOLD, textDecoration: 'none', fontWeight: 700 }}>
                سجّل مدرستك مجاناً
              </Link>
            </p>
          </div>

        </div>
      </section>

      {/* ============ نبذة عن شواهدي ============ */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,84,72,0.08)', borderBottom: '1px solid rgba(0,84,72,0.08)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>نبذة عن المنصة</p>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: NAVY }}>وش هو شواهدي بالضبط؟</h2>
          </div>

          <div style={{ display: 'grid', gap: 20, marginBottom: 40 }}>
            <p className="body-font" style={{ fontSize: 16, color: '#374151', lineHeight: 2 }}>
              شواهدي منصة سعودية مبنية خصيصاً لمدارس التعليم العام (حكومية، أهلية، وعالمية) لمساعدتها على تنظيم <strong>شواهد معايير الاعتماد المدرسي</strong> وفق إطار هيئة تقويم التعليم والتدريب <strong>(إتقان)</strong> — بمعاييره الأربعة و47 مؤشراً.
            </p>
            <p className="body-font" style={{ fontSize: 16, color: '#374151', lineHeight: 2 }}>
              المشكلة اللي تعيشها أغلب المدارس اليوم: الشواهد مبعثرة بين ملفات ورقية، صور غير مصنفة، ومجلدات متفرقة — والتجهيز الحقيقي يبدأ متأخراً، قبل الزيارة بأيام قليلة، مما يضغط على الإدارة ويقلل من جودة ما يُقدَّم للجنة.
            </p>
            <p className="body-font" style={{ fontSize: 16, color: '#374151', lineHeight: 2 }}>
              شواهدي يقلب هذي المعادلة: بدل ما تبحث عن الشاهد المناسب وتتساءل "وش أرفع هنا؟"، تدخل على كل مؤشر وتلقى إرشاداً واضحاً لما هو مطلوب، ترفع صورة أو ملف PDF مباشرة، والنظام يحوّله ويرتبه تلقائياً. وفي أي وقت تحتاج، تطبع تقريراً كاملاً منظماً حسب المجالات والمعايير جاهزاً للجنة التقويم.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #005448, #0A6B5A)', borderRadius: 20,
            padding: '2.4rem 2rem', textAlign: 'center'
          }}>
            <p style={{ fontSize: 13, color: GOLD_LIGHT, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>
              الفرق الجوهري
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
              شواهدي ما يبيعك مساحة تخزين فقط —<br />
              <span style={{ color: GOLD_LIGHT }}>هو يساعدك تصنع الشاهد الصحيح، وتحفظه في مكانه</span>
            </p>
          </div>
        </div>
      </section>

      {/* ============ المجالات ============ */}
      <section style={{ background: '#fff', borderBottom: '1px solid rgba(0,84,72,0.08)', padding: '3rem 1.5rem' }}>
        <p className="body-font" style={{ textAlign: 'center', fontSize: 13, color: '#8A8270', marginBottom: 22, fontWeight: 600, letterSpacing: 1 }}>
          يغطي المجالات الأربعة لمعايير إتقان — 47 مؤشراً
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxWidth: 920, margin: '0 auto' }}>
          {[
            { emoji: '🏫', label: 'الإدارة المدرسية', sub: '15 مؤشراً' },
            { emoji: '📚', label: 'التعليم والتعلم', sub: '13 مؤشراً' },
            { emoji: '📊', label: 'نواتج التعلم', sub: '13 مؤشراً' },
            { emoji: '🏢', label: 'البيئة المدرسية', sub: '6 مؤشرات' },
          ].map(d => (
            <div key={d.label} style={{
              background: '#F6F7F6', borderRadius: 14, padding: '22px 12px', textAlign: 'center',
              border: '1px solid rgba(0,84,72,0.06)'
            }}>
              <p style={{ fontSize: 32, margin: '0 0 10px' }}>{d.emoji}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>{d.label}</p>
              <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: 0 }}>{d.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ المشكلة ============ */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>المشكلة</p>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: NAVY, marginBottom: 10 }}>ما تواجهه المدارس اليوم</h2>
          <p className="body-font" style={{ fontSize: 15, color: '#5A5648' }}>معايير التقويم نظام جديد — وكثير من المدارس تبدأ من الصفر في كل زيارة</p>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          {[
            { icon: '📂', title: 'الشواهد مبعثرة أو مفقودة', desc: 'الملفات الورقية تضيع، والصور غير مصنفة، والمدير لا يعرف ما اكتمل وما ينقصه قبيل الزيارة.' },
            { icon: '🤷', title: 'وش أرفع هنا بالضبط؟', desc: 'كثير من المدارس تحتار وتقدم شواهد غير كافية لأنها لا تعرف ما المطلوب بالضبط لكل مؤشر.' },
            { icon: '⏰', title: 'التجهيز يأتي متأخراً', desc: 'المدارس تبدأ التجهيز قبل الزيارة بأيام قليلة، مما يضغط على الإدارة ويقلل جودة الشواهد المقدمة.' },
          ].map(p => (
            <div key={p.title} style={{
              display: 'flex', gap: 18, padding: '1.4rem 1.6rem',
              background: '#fff', borderRadius: 14, border: '1px solid rgba(0,84,72,0.08)'
            }}>
              <span style={{ fontSize: 30, flexShrink: 0 }}>{p.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, color: NAVY, margin: '0 0 6px' }}>{p.title}</p>
                <p className="body-font" style={{ fontSize: 14, color: '#5A5648', margin: 0, lineHeight: 1.8 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ الحل ============ */}
      <section style={{ background: NAVY, padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 12, color: GOLD_LIGHT, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>الحل</p>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 10 }}>شواهدي يرشدك خطوة بخطوة</h2>
            <p className="body-font" style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>منصة متكاملة تقود مدير المدرسة طوال العام، لا قبل الزيارة فقط</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { icon: '📋', title: 'لوحة اكتمال فورية', desc: 'تعرف في ثوانٍ أي المجالات مكتملة وأيها يحتاج شواهد إضافية.' },
              { icon: '💡', title: 'إرشاد لكل مؤشر', desc: 'كل مؤشر يوضح لك بالضبط أي نوع من الشواهد يناسبه.' },
              { icon: '📤', title: 'رفع شواهد بسهولة', desc: 'ارفع صوراً وملفات PDF مباشرة، والنظام يرتبها ويحولها تلقائياً.' },
              { icon: '🖨️', title: 'تقرير كامل بضغطة', desc: 'اطبع ملف شواهد مدرستك كاملاً ومرتباً جاهزاً لأي زيارة.' },
            ].map(f => (
              <div key={f.title} style={{
                padding: '1.5rem 1.6rem', background: 'rgba(255,255,255,0.04)',
                borderRadius: 14, border: '1px solid rgba(138,212,196,0.2)'
              }}>
                <p style={{ fontSize: 32, margin: '0 0 12px' }}>{f.icon}</p>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 8px' }}>{f.title}</p>
                <p className="body-font" style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ الباقتان ============ */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-block', background: 'rgba(95,194,172,0.12)', color: '#1B7A66',
              fontSize: 13.5, fontWeight: 700, padding: '7px 18px', borderRadius: 20, marginBottom: 24
            }}>
              الإطلاق الرسمي — بداية العام الدراسي 1448هـ
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: NAVY, marginBottom: 52 }}>اختر الباقة المناسبة لمدرستك</h2>
          </div>

          <div className="pricing-grid">

            {/* الباقة التجريبية */}
            <div style={{
              background: CREAM, border: '2px solid rgba(0,84,72,0.1)', borderRadius: 24,
              padding: '3rem 2.6rem', display: 'flex', flexDirection: 'column'
            }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#8A8270', marginBottom: 14 }}>🆓 تجريبية</p>
              <p style={{ fontSize: 56, fontWeight: 900, color: NAVY, margin: '0 0 6px', lineHeight: 1 }}>0</p>
              <p className="body-font" style={{ fontSize: 14.5, color: '#8A8270', marginBottom: 30 }}>ريال / 7 أيام تجربة مجانية</p>
              <div style={{ textAlign: 'right', marginBottom: 32, flex: 1 }}>
                {['مجال واحد من أصل 4', 'حجم رفع حتى 50 ميجابايت', 'رفع صور وملفات PDF', 'تقرير طباعة أساسي'].map(f => (
                  <p key={f} className="body-font" style={{ fontSize: 14.5, color: NAVY, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#8A8270', fontWeight: 900, flexShrink: 0 }}>✓</span> {f}
                  </p>
                ))}
              </div>
              <a href="/register" style={{
                display: 'block', textAlign: 'center', padding: '16px', fontSize: 16, fontWeight: 700,
                background: 'rgba(0,84,72,0.06)', color: NAVY, borderRadius: 12, textDecoration: 'none'
              }}>
                ابدأ مجاناً ←
              </a>
            </div>

            {/* الباقة المتكاملة */}
            <div style={{
              background: NAVY, borderRadius: 24, position: 'relative',
              padding: '3rem 2.6rem', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 52px rgba(0,84,72,0.24)'
            }}>
              <div style={{
                position: 'absolute', top: -17, left: '50%', transform: 'translateX(-50%)',
                background: `linear-gradient(135deg, #5FC2AC, ${GOLD})`, color: NAVY,
                fontSize: 13, fontWeight: 800, padding: '7px 20px', borderRadius: 20,
                whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(47,171,153,0.35)'
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
                      <span style={{ color: GOLD_LIGHT, fontWeight: 900, flexShrink: 0 }}>✓</span> {item.text}
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
                background: `linear-gradient(135deg, #5FC2AC, ${GOLD})`, color: NAVY, borderRadius: 12, textDecoration: 'none'
              }}>
                اشترك الآن ←
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ============ الفوتر ============ */}
      <footer style={{ borderTop: '1px solid rgba(0,84,72,0.08)', background: '#fff', padding: '4rem 2rem 2.8rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 56, marginBottom: 20 }} />
          <p className="body-font" style={{ fontSize: 14, color: '#8A8270', margin: '0 0 20px' }}>
            shawahede.com · منصة مستقلة لدعم المدارس · غير مرتبطة بهيئة تقويم التعليم والتدريب
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 32 }}>
            <Link href="/privacy" className="body-font" style={{ fontSize: 14, color: '#8A8270', textDecoration: 'none' }}>سياسة الخصوصية</Link>
            <Link href="/terms" className="body-font" style={{ fontSize: 14, color: '#8A8270', textDecoration: 'none' }}>الشروط والأحكام</Link>
          </div>

          {/* ============ شارات التوثيق الرسمي ============ */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'center', gap: 18,
            marginBottom: 32
          }}>
            {/* توثيق التجارة الإلكترونية - وزارة التجارة + المركز السعودي للأعمال */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 18, background: '#FAFAF7',
              border: '1px solid rgba(0,84,72,0.08)', borderRadius: 16, padding: '18px 26px'
            }}>
              <img src="/ecommerce-auth-qr.png" alt="باركود توثيق التجارة الإلكترونية" style={{ height: 84, width: 84, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <img src="/ministry-of-commerce-logo.png" alt="وزارة التجارة" style={{ height: 34, objectFit: 'contain' }} />
                  <img src="/saudi-business-center-logo.png" alt="المركز السعودي للأعمال" style={{ height: 30, objectFit: 'contain' }} />
                </div>
                <p className="body-font" style={{ fontSize: 13, color: '#8A8270', margin: 0 }}>موثّق إلكترونياً — المركز السعودي للأعمال</p>
              </div>
            </div>

            {/* وثيقة العمل الحر */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 18, background: '#FAFAF7',
              border: '1px solid rgba(0,84,72,0.08)', borderRadius: 16, padding: '18px 26px'
            }}>
              <img src="/freelance-work-logo.png" alt="وثيقة العمل الحر" style={{ height: 68, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>وثيقة عمل حر</p>
                <p className="body-font" style={{ fontSize: 13, color: '#8A8270', margin: 0 }}>رقم الوثيقة: FL-898950755</p>
              </div>
            </div>
          </div>

          <div style={{ width: 60, height: 1, background: 'rgba(0,84,72,0.1)', margin: '0 auto 24px' }} />
          <a href="https://khaleddev.online" target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none'
          }}>
            <span className="body-font" style={{ fontSize: 13, color: '#8A8270' }}>صُنع بواسطة</span>
            <img src="/nextlogic-logo.png" alt="Next Logic by Khaled" style={{ height: 26, objectFit: 'contain' }} />
          </a>
        </div>
      </footer>
    </div>
  )
}
