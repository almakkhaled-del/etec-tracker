'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const GOLD_LIGHT = '#E8C275'

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
    <div style={{ minHeight: '100vh', background: '#FBF8F2', fontFamily: "'Tajawal', sans-serif", direction: 'rtl', color: '#0B1F3A' }}>
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
        .login-input:focus { border-color: #C28A1F !important; outline: none; }
        .login-btn:hover { background: #0a1830 !important; }

        .hero-split { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: start; }
        @media (max-width: 860px) {
          .hero-split { grid-template-columns: 1fr; }
        }

        .hero-title { font-size: 38px; line-height: 1.7; }
        @media (max-width: 640px) {
          .hero-title { font-size: 30px; line-height: 1.65; }
        }

        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 860px) {
          .pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
        }
      `}</style>

      {/* ============ NAV (مبسّط - شعار فقط) ============ */}
      <nav style={{
        background: 'rgba(251,248,242,0.92)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px',
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
          background: 'linear-gradient(180deg, rgba(11,31,58,0.05) 0%, rgba(11,31,58,0.0) 50%, rgba(251,248,242,1) 100%)',
          zIndex: 1,
        }} />
      </section>

      {/* ============ نص + مربع دخول جنب بعض ============ */}
      <section style={{ padding: '3.5rem 1.5rem 4rem', maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div className="hero-split">

          {/* النص - يمين */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(217,164,65,0.14)', border: '1px solid rgba(194,138,31,0.35)',
              color: '#A6730F', fontSize: 12, fontWeight: 600, padding: '6px 16px',
              borderRadius: 30, marginBottom: 26, letterSpacing: 0.3
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C28A1F', display: 'inline-block' }} />
              متوافق مع معايير هيئة تقويم التعليم والتدريب
            </div>

            <h1 className="hero-title" style={{ fontWeight: 900, color: '#0B1F3A', marginBottom: 22 }}>
              <span style={{ display: 'block', marginBottom: 6 }}>لا تبحث عن الشاهد المناسب</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, #C28A1F, #A6730F)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>شواهدي يرشدك إليه، وينشئه لك</span>
            </h1>

            <p className="body-font" style={{ fontSize: 16, color: '#5A5648', lineHeight: 1.9, marginBottom: 30, maxWidth: 540 }}>
              شواهدي منصة تساعد مدارس التعليم العام على <strong>إنشاء</strong> شواهد معايير الاعتماد المدرسي، تنظيمها، وطباعتها — مجال بمجال، مؤشراً بمؤشر، حتى تستقبل لجنة التقويم بثقة كاملة طوال العام.
            </p>

            <Link href="#login-box" className="cta-gold" style={{
              display: 'inline-block', padding: '15px 38px', fontSize: 16, fontWeight: 700,
              background: 'linear-gradient(135deg, #D9A441, #C28A1F)', color: '#0B1F3A',
              borderRadius: 10, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(194,138,31,0.28)', transition: 'filter 0.2s'
            }}>
              سجّل مدرستك الآن ←
            </Link>
          </div>

          {/* مربع الدخول - يسار */}
          <div id="login-box" style={{
            background: '#fff', borderRadius: 20, padding: '2.2rem 2rem',
            border: '1px solid rgba(11,31,58,0.07)', boxShadow: '0 16px 44px rgba(11,31,58,0.10)',
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
                width: '100%', padding: '12px 16px', border: '1px solid rgba(11,31,58,0.15)',
                borderRadius: 10, fontSize: 14, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                boxSizing: 'border-box', marginBottom: 16, background: '#FBF8F2', color: NAVY
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
                width: '100%', padding: '12px 16px', border: '1px solid rgba(11,31,58,0.15)',
                borderRadius: 10, fontSize: 14, fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                boxSizing: 'border-box', marginBottom: 20, background: '#FBF8F2', color: NAVY
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
      <section style={{ background: '#fff', borderTop: '1px solid rgba(11,31,58,0.08)', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '5rem 1.5rem' }}>
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
            background: 'linear-gradient(135deg, #0B1F3A, #14284a)', borderRadius: 20,
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
      <section style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '3rem 1.5rem' }}>
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
              background: '#FBF8F2', borderRadius: 14, padding: '22px 12px', textAlign: 'center',
              border: '1px solid rgba(11,31,58,0.06)'
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
              background: '#fff', borderRadius: 14, border: '1px solid rgba(11,31,58,0.08)'
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
                borderRadius: 14, border: '1px solid rgba(232,194,117,0.2)'
              }}>
                <p style={{ fontSize: 32, margin: '0 0 12px' }}>{f.icon}</p>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 8px' }}>{f.title}</p>
                <p className="body-font" style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ الباقات الثلاث ============ */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-block', background: 'rgba(217,164,65,0.12)', color: '#A6730F',
              fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 20, marginBottom: 20
            }}>
              الإطلاق الرسمي — بداية العام الدراسي 1448هـ
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 44 }}>اختر الباقة المناسبة لمدرستك</h2>
          </div>

          <div className="pricing-grid">

            {/* الباقة المجانية */}
            <div style={{
              background: '#fff', border: '2px solid rgba(11,31,58,0.1)', borderRadius: 20,
              padding: '2.2rem 1.8rem', display: 'flex', flexDirection: 'column'
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#8A8270', marginBottom: 10 }}>🆓 المجانية</p>
              <p style={{ fontSize: 40, fontWeight: 900, color: NAVY, margin: '0 0 4px', lineHeight: 1 }}>0</p>
              <p className="body-font" style={{ fontSize: 13, color: '#8A8270', marginBottom: 24 }}>ريال / للأبد</p>
              <div style={{ textAlign: 'right', marginBottom: 28, flex: 1 }}>
                {['مجال واحد من أصل 4', 'حجم رفع حتى 50 ميجابايت', 'رفع صور وملفات PDF', 'تقرير طباعة أساسي'].map(f => (
                  <p key={f} className="body-font" style={{ fontSize: 13, color: NAVY, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#8A8270', fontWeight: 900, flexShrink: 0 }}>✓</span> {f}
                  </p>
                ))}
              </div>
              <a href="/register" style={{
                display: 'block', textAlign: 'center', padding: '13px', fontSize: 14, fontWeight: 700,
                background: 'rgba(11,31,58,0.06)', color: NAVY, borderRadius: 10, textDecoration: 'none'
              }}>
                ابدأ مجاناً ←
              </a>
            </div>

            {/* الباقة الأساسية */}
            <div style={{
              background: '#fff', border: `2.5px solid ${GOLD}`, borderRadius: 20,
              padding: '2.2rem 1.8rem', display: 'flex', flexDirection: 'column',
              position: 'relative', boxShadow: '0 16px 44px rgba(194,138,31,0.14)'
            }}>
              <span style={{
                position: 'absolute', top: -13, right: '50%', transform: 'translateX(50%)',
                background: GOLD, color: '#fff', fontSize: 11, fontWeight: 700,
                padding: '4px 16px', borderRadius: 20
              }}>
                الأكثر طلباً
              </span>
              <p style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 10 }}>⭐ الأساسية</p>
              <p style={{ fontSize: 40, fontWeight: 900, color: NAVY, margin: '0 0 4px', lineHeight: 1 }}>؟</p>
              <p className="body-font" style={{ fontSize: 13, color: '#8A8270', marginBottom: 24 }}>السعر قيد التقييم</p>
              <div style={{ textAlign: 'right', marginBottom: 28, flex: 1 }}>
                {['جميع المجالات الأربعة', 'تخزين حتى 500 ميجابايت', 'مكتبة نماذج متعددة', 'تقارير PDF احترافية', 'دعم فني مستمر'].map(f => (
                  <p key={f} className="body-font" style={{ fontSize: 13, color: NAVY, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: GOLD, fontWeight: 900, flexShrink: 0 }}>✓</span> {f}
                  </p>
                ))}
              </div>
              <a href="#login-box" style={{
                display: 'block', textAlign: 'center', padding: '13px', fontSize: 14, fontWeight: 700,
                background: `linear-gradient(135deg, #D9A441, ${GOLD})`, color: NAVY, borderRadius: 10, textDecoration: 'none'
              }}>
                سجّل اهتمامك ←
              </a>
            </div>

            {/* الباقة المتقدمة */}
            <div style={{
              background: NAVY, borderRadius: 20,
              padding: '2.2rem 1.8rem', display: 'flex', flexDirection: 'column'
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 10 }}>👑 المتقدمة</p>
              <p style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: '0 0 4px', lineHeight: 1 }}>؟</p>
              <p className="body-font" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>السعر قيد التقييم</p>
              <div style={{ textAlign: 'right', marginBottom: 28, flex: 1 }}>
                {['جميع المجالات الأربعة', 'رفع ملفات غير محدود', 'توليد نماذج جاهزة تلقائياً', 'تقارير PDF احترافية', 'دعم فني ذو أولوية'].map(f => (
                  <p key={f} className="body-font" style={{ fontSize: 13, color: '#fff', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: GOLD_LIGHT, fontWeight: 900, flexShrink: 0 }}>✓</span> {f}
                  </p>
                ))}
              </div>
              <a href="#login-box" style={{
                display: 'block', textAlign: 'center', padding: '13px', fontSize: 14, fontWeight: 700,
                background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, textDecoration: 'none',
                border: `1px solid ${GOLD_LIGHT}40`
              }}>
                سجّل اهتمامك ←
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ============ الفوتر ============ */}
      <footer style={{ borderTop: '1px solid rgba(11,31,58,0.08)', background: '#fff', padding: '2.5rem 1.5rem 1.8rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 42, marginBottom: 16 }} />
          <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: '0 0 20px' }}>
            shawahede.com · منصة مستقلة لدعم المدارس · غير مرتبطة بهيئة تقويم التعليم والتدريب
          </p>
          <div style={{ width: 60, height: 1, background: 'rgba(11,31,58,0.1)', margin: '0 auto 20px' }} />
          <a href="https://khaleddev.online" target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none'
          }}>
            <span className="body-font" style={{ fontSize: 12, color: '#8A8270' }}>صُنع بواسطة</span>
            <img src="/nextlogic-logo.png" alt="Next Logic by Khaled" style={{ height: 22, objectFit: 'contain' }} />
          </a>
        </div>
      </footer>
    </div>
  )
}
