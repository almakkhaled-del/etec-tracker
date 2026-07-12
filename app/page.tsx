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
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl', color: NAVY }}>
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

        .nav-links { display: flex; align-items: center; gap: 30px; }
        @media (max-width: 980px) { .nav-links { display: none; } }

        .hero-split { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
        @media (max-width: 860px) {
          .hero-split { grid-template-columns: 1fr; gap: 32px; }
        }
        @media (min-width: 1200px) {
          .hero-split { gap: 100px; }
        }

        .hero-title { font-size: 44px; line-height: 1.65; }
        @media (max-width: 640px) {
          .hero-title { font-size: 32px; line-height: 1.6; }
        }

        .hero-ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

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
        background: 'rgba(246,247,246,0.92)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0,84,72,0.08)', padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 76, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <img src="/logo.png" alt="شواهدي" style={{ height: 58, objectFit: 'contain' }} />

        <div className="nav-links body-font" style={{ fontSize: 14, fontWeight: 600, color: '#5A5648' }}>
          <a href="#about" style={{ color: 'inherit', textDecoration: 'none' }}>عن المنصة</a>
          <a href="#comparison" style={{ color: 'inherit', textDecoration: 'none' }}>المقارنة</a>
          <a href="#killer-feature" style={{ color: 'inherit', textDecoration: 'none' }}>الميزة الذكية</a>
          <a href="#domains" style={{ color: 'inherit', textDecoration: 'none' }}>معايير إتقان</a>
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
        </div>
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
              متوافق مع معايير هيئة تقويم التعليم والتدريب (إتقان)
            </div>

            <h1 className="hero-title" style={{ fontWeight: 900, color: '#005448', marginBottom: 22 }}>
              <span style={{ display: 'block', marginBottom: 6 }}>لا تبحث عن الشاهد المناسب</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, #2FAB99, #1B7A66)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>شواهدي يرشدك إليه، وينشئه لك</span>
            </h1>

            <p className="body-font" style={{ fontSize: 17.5, color: '#5A5648', lineHeight: 2, marginBottom: 30, maxWidth: 590 }}>
              شواهدي منصة سعودية متكاملة تحوّل جمع شواهد الاعتماد المدرسي من مهمة مرهقة تُنجز في اللحظات الأخيرة، إلى مسار واضح ومنظم تسير عليه إدارتك طوال العام. ترفع الشاهد، والنظام يصنّفه ويرتبه تلقائياً تحت المؤشر الصحيح — لتصل يوم الزيارة بملف متكامل يعكس مستوى مدرستك الحقيقي.
            </p>

            <div className="hero-ctas">
              <Link href="#login-box" className="cta-gold" style={{
                display: 'inline-block', padding: '16px 40px', fontSize: 17, fontWeight: 700,
                background: 'linear-gradient(135deg, #5FC2AC, #2FAB99)', color: '#005448',
                borderRadius: 10, textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(47,171,153,0.28)', transition: 'filter 0.2s'
              }}>
                سجّل مدرستك الآن (تجربة 7 أيام) ←
              </Link>
              <a href="#killer-feature" className="body-font" style={{
                display: 'inline-block', padding: '15px 30px', fontSize: 15.5, fontWeight: 700,
                background: '#fff', color: NAVY, border: '1px solid rgba(0,84,72,0.15)',
                borderRadius: 10, textDecoration: 'none'
              }}>
                شوف أقوى ميزة بالمنصة ↓
              </a>
            </div>

            <div className="body-font" style={{ marginTop: 18, display: 'flex', gap: 20, fontSize: 12.5, color: '#8A8270', flexWrap: 'wrap' }}>
              <span>⏱ التسجيل يستغرق دقيقة واحدة</span>
              <span>💳 لا يتطلب بطاقة ائتمانية</span>
            </div>
          </div>

          {/* مربع الدخول - يسار (بوابة الدخول الفعلية) */}
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
      <section id="about" style={{ background: '#fff', borderTop: '1px solid rgba(0,84,72,0.08)', borderBottom: '1px solid rgba(0,84,72,0.08)', padding: '5rem 1.5rem', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontSize: 13, color: GOLD, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>نبذة عن المنصة</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: NAVY }}>وش هو شواهدي بالضبط؟</h2>
          </div>

          <div style={{ display: 'grid', gap: 22, marginBottom: 44 }}>
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

          <div style={{
            background: 'linear-gradient(135deg, #005448, #0A6B5A)', borderRadius: 20,
            padding: '2.6rem 2.2rem', textAlign: 'center'
          }}>
            <p style={{ fontSize: 14, color: GOLD_LIGHT, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
              الفرق الجوهري
            </p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.75, maxWidth: 620, margin: '0 auto' }}>
              شواهدي ما يبيعك مساحة تخزين فقط —<br />
              <span style={{ color: GOLD_LIGHT }}>هو يساعدك تصنع الشاهد الصحيح، وتحفظه في مكانه</span>
            </p>
          </div>
        </div>
      </section>

      {/* ============ المقارنة: الوضع الحالي مقابل شواهدي ============ */}
      <section id="comparison" style={{ padding: '5.5rem 1.5rem', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: NAVY, marginBottom: 14 }}>حان الوقت تنهي معاناتك السنوية مع الاعتماد المدرسي</h2>
            <p className="body-font" style={{ fontSize: 16, color: '#5A5648', lineHeight: 1.9 }}>
              مقارنة بسيطة توضح كيف يغيّر شواهدي المعادلة تماماً — من العشوائية والضغط، إلى التنظيم والأتمتة الذكية.
            </p>
          </div>

          <div className="comparison-grid">
            {/* الوضع الحالي */}
            <div style={{ background: '#FEF6F5', border: '1px solid rgba(220,38,38,0.12)', borderRadius: 20, padding: '2.2rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid rgba(220,38,38,0.1)' }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>❌</span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#991B1B', margin: 0 }}>الوضع الحالي (المرهق)</h3>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { t: 'شتات الشواهد وضياعها', d: 'ملفات ورقية، صور بالجوال، ومجلدات سحابية غير مصنفة، بدون رؤية واضحة للنواقص.' },
                  { t: 'حيرة الصياغة والمطلوب', d: '"وش أرفع هنا بالضبط؟" — سؤال يتكرر كل مرة، وينتج عنه شواهد غير كافية للجنة.' },
                  { t: 'مأزق الوقت الضيق', d: 'التجهيز الحقيقي يبدأ قبل الزيارة بأيام قليلة، تحت ضغط يهدر جودة العمل.' },
                ].map(x => (
                  <div key={x.t} className="body-font" style={{ fontSize: 14.5, color: '#5A5648', lineHeight: 1.8 }}>
                    <p style={{ fontWeight: 700, color: '#991B1B', margin: '0 0 4px' }}>✕ {x.t}</p>
                    <p style={{ margin: 0 }}>{x.d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* الوضع الذكي مع شواهدي */}
            <div style={{ background: 'rgba(47,171,153,0.06)', border: '1px solid rgba(47,171,153,0.25)', borderRadius: 20, padding: '2.2rem 2rem', boxShadow: '0 12px 32px rgba(0,84,72,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid rgba(47,171,153,0.2)' }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(47,171,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: NAVY, margin: 0 }}>الوضع الذكي (مع شواهدي)</h3>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { t: 'لوحة مؤشرات فورية', d: 'تعرف بثوانٍ نسبة جاهزية كل مجال، وما هي النواقص التي تحتاج استكمالاً طوال العام.' },
                  { t: 'إرشاد مخصص لكل مؤشر', d: 'شرح واضح ودقيق يخبرك بنوع الشاهد المناسب، بدون اجتهاد شخصي مجهد.' },
                  { t: 'رفع ذكي وتصدير بضغطة', d: 'ارفع صورك وملفات PDF مباشرة، ودع النظام يفرزها ويصنفها، لتستخرج ملفاً منسقاً جاهزاً للجنة.' },
                ].map(x => (
                  <div key={x.t} className="body-font" style={{ fontSize: 14.5, color: '#374151', lineHeight: 1.8 }}>
                    <p style={{ fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>✓ {x.t}</p>
                    <p style={{ margin: 0 }}>{x.d}</p>
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
              display: 'inline-block', background: 'rgba(138,212,196,0.12)', border: '1px solid rgba(138,212,196,0.3)',
              color: GOLD_LIGHT, fontSize: 12.5, fontWeight: 700, padding: '6px 18px', borderRadius: 20, marginBottom: 18
            }}>
              🪄 أقوى ميزة في المنصة
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
              { icon: '📈', title: 'الخطة التشغيلية للمدرسة', desc: 'خطة متكاملة ومصاغة تربوياً، مخصصة لمدرستك بناءً على نتائج تقرير التقويم الفعلي.' },
              { icon: '🎯', title: 'خطة التحسين وتنفيذها', desc: 'خطة إجرائية مجدولة زمنياً لمعالجة الفجوات المرصودة قبل الزيارة القادمة.' },
              { icon: '🔍', title: 'تقرير واقع المدرسة', desc: 'تشخيص دقيق يستعرض نقاط القوة وفرص التحسين وفق المعايير المعتمدة.' },
              { icon: '🗂️', title: 'تقارير الزيارات والاحتفالات', desc: 'تعبئة آلية دورية لتوثيق الأنشطة والفعاليات المدرسية، وإنتاج ملفات PDF فورية.' },
              { icon: '📁', title: 'حزمة النماذج المتنوعة', desc: 'مجموعة واسعة من السجلات والملفات التوثيقية التي تحتاجها الإدارة يومياً.' },
              { icon: '💡', title: 'مستشارك الإداري الخبير', desc: 'شواهدي ما يبيعك مساحة تخزين فارغة — هو يرفع عنك العبء الورقي ويمنحك ملفات جاهزة للتوقيع.' },
            ].map(f => (
              <div key={f.title} style={{
                padding: '1.7rem 1.7rem', background: 'rgba(255,255,255,0.04)',
                borderRadius: 16, border: '1px solid rgba(138,212,196,0.2)'
              }}>
                <p style={{ fontSize: 30, margin: '0 0 12px' }}>{f.icon}</p>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#fff', margin: '0 0 8px' }}>{f.title}</p>
                <p className="body-font" style={{ fontSize: 14, color: 'rgba(255,255,255,0.68)', margin: 0, lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <a href="#pricing" className="cta-gold" style={{
              display: 'inline-block', padding: '15px 38px', fontSize: 16, fontWeight: 700,
              background: `linear-gradient(135deg, #5FC2AC, ${GOLD})`, color: NAVY,
              borderRadius: 10, textDecoration: 'none', transition: 'filter 0.2s'
            }}>
              احصل على هذه الميزات الآن ←
            </a>
          </div>
        </div>
      </section>

      {/* ============ المجالات ============ */}
      <section id="domains" style={{ background: '#fff', borderBottom: '1px solid rgba(0,84,72,0.08)', padding: '4rem 1.5rem', scrollMarginTop: 76 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 30px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: NAVY, marginBottom: 10 }}>تغطية كاملة لمعايير إتقان — 47 مؤشراً</h2>
          <p className="body-font" style={{ fontSize: 14.5, color: '#8A8270' }}>لا نترك مؤشراً واحداً للاجتهاد الشخصي — كل مؤشر له مكانه الواضح.</p>
        </div>
        <div className="domains-grid" style={{ maxWidth: 960, margin: '0 auto' }}>
          {[
            { emoji: '🏫', label: 'الإدارة المدرسية', sub: '15 مؤشراً' },
            { emoji: '📚', label: 'التعليم والتعلم', sub: '13 مؤشراً' },
            { emoji: '📊', label: 'نواتج التعلم', sub: '13 مؤشراً' },
            { emoji: '🏢', label: 'البيئة المدرسية', sub: '6 مؤشرات' },
          ].map(d => (
            <div key={d.label} style={{
              background: '#F6F7F6', borderRadius: 14, padding: '24px 14px', textAlign: 'center',
              border: '1px solid rgba(0,84,72,0.06)'
            }}>
              <p style={{ fontSize: 34, margin: '0 0 10px' }}>{d.emoji}</p>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>{d.label}</p>
              <p className="body-font" style={{ fontSize: 12.5, color: '#8A8270', margin: 0 }}>{d.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ الباقتان ============ */}
      <section id="pricing" style={{ padding: '6rem 1.5rem', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-block', background: 'rgba(95,194,172,0.12)', color: '#1B7A66',
              fontSize: 13.5, fontWeight: 700, padding: '7px 18px', borderRadius: 20, marginBottom: 24
            }}>
              الإطلاق الرسمي — بداية العام الدراسي 1448هـ
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 12 }}>اختر الباقة المناسبة لمدرستك وابدأ فوراً</h2>
            <p className="body-font" style={{ fontSize: 15.5, color: '#8A8270', marginBottom: 52 }}>وفّر جهد الكادر الإداري، واضمن جاهزية مستنداتك وخططك على أكمل وجه.</p>
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

          <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 8px' }}>🛡️ منصة آمنة وموثّقة بالكامل</p>
          <p className="body-font" style={{ fontSize: 13.5, color: '#8A8270', margin: '0 0 8px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.8 }}>
            شواهدي منصة سعودية مستقلة تهدف لدعم قيادات المدارس، وهي <strong>غير مرتبطة رسمياً</strong> بهيئة تقويم التعليم والتدريب.
          </p>
          <p className="body-font" style={{ fontSize: 14, color: '#8A8270', margin: '0 0 20px' }}>
            shawahede.com
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
