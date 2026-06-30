import Link from 'next/link'

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#FBF8F2', fontFamily: "'Tajawal', sans-serif", direction: 'rtl', color: '#0B1F3A' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1.02) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -0.5%); }
        }
        .hero-bg {
          animation: kenburns 24s ease-in-out infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-bg { animation: none; }
        }
        .body-font { font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif; }
        .nav-link:hover { opacity: 0.75; }
        .cta-primary:hover { background: #0a1830 !important; }
        .cta-gold:hover { filter: brightness(1.08); }
      `}</style>

      {/* ============ NAV ============ */}
      <nav style={{
        background: 'rgba(251,248,242,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(11,31,58,0.08)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 76,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <img src="/logo.png" alt="شواهدي" style={{ height: 58, objectFit: 'contain' }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" className="nav-link" style={{
            padding: '9px 20px', fontSize: 14, fontWeight: 600, color: '#0B1F3A',
            textDecoration: 'none', transition: 'opacity 0.2s'
          }}>
            تسجيل الدخول
          </Link>
          <Link href="/register" className="cta-gold" style={{
            padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 8,
            background: 'linear-gradient(135deg, #D9A441, #C28A1F)', color: '#0B1F3A',
            textDecoration: 'none', transition: 'filter 0.2s', whiteSpace: 'nowrap'
          }}>
            حساب تجريبي لمدة 7 أيام
          </Link>
        </div>
      </nav>

      {/* ============ HERO (صورة كاملة بدون نص فوقها) ============ */}
      <section style={{ position: 'relative', overflow: 'hidden', height: '56vh', minHeight: 380, maxHeight: 560 }}>
        <div className="hero-bg" style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(11,31,58,0.05) 0%, rgba(11,31,58,0.0) 50%, rgba(251,248,242,1) 100%)',
          zIndex: 1,
        }} />
      </section>

      {/* ============ النص الرئيسي (تحت الهيرو) ============ */}
      <section style={{ padding: '4rem 1.5rem 4rem', maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 560, marginRight: '8%', marginLeft: 'auto', textAlign: 'right' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(217,164,65,0.14)', border: '1px solid rgba(194,138,31,0.35)',
          color: '#A6730F', fontSize: 12, fontWeight: 600, padding: '6px 16px',
          borderRadius: 30, marginBottom: 26, letterSpacing: 0.3
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C28A1F', display: 'inline-block' }} />
          متوافق مع معايير هيئة تقويم التعليم والتدريب
        </div>

        <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.35, color: '#0B1F3A', marginBottom: 22 }}>
          نظّم شواهد مدرستك<br />
          <span style={{
            background: 'linear-gradient(135deg, #C28A1F, #A6730F)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>وكن جاهزاً لزيارة التقويم</span>
        </h1>

        <p className="body-font" style={{ fontSize: 17, color: '#5A5648', lineHeight: 1.9, marginBottom: 36, maxWidth: 540 }}>
          شواهدي تساعد مدارس التعليم العام على توثيق وتنظيم شواهد معايير الاعتماد المدرسي — مجال بمجال، مؤشراً بمؤشر، حتى تستقبل لجنة التقويم بثقة كاملة.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          <Link href="/register" className="cta-gold" style={{
            padding: '15px 38px', fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #D9A441, #C28A1F)', color: '#0B1F3A',
            borderRadius: 10, textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(194,138,31,0.28)', transition: 'filter 0.2s'
          }}>
            سجّل مدرستك الآن ←
          </Link>
          <Link href="/login" style={{
            padding: '15px 38px', fontSize: 16, fontWeight: 600,
            border: '1.5px solid rgba(11,31,58,0.2)', borderRadius: 10,
            textDecoration: 'none', color: '#0B1F3A'
          }}>
            تسجيل الدخول
          </Link>
        </div>
        </div>
      </section>

      {/* ============ المجالات ============ */}
      <section style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', borderTop: '1px solid rgba(11,31,58,0.08)', padding: '3rem 1.5rem' }}>
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
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0B1F3A', margin: '0 0 4px' }}>{d.label}</p>
              <p className="body-font" style={{ fontSize: 11, color: '#8A8270', margin: 0 }}>{d.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ المشكلة ============ */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, color: '#C28A1F', fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>المشكلة</p>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0B1F3A', marginBottom: 10 }}>ما تواجهه المدارس اليوم</h2>
          <p className="body-font" style={{ fontSize: 15, color: '#5A5648' }}>معايير التقويم نظام جديد — وكثير من المدارس تبدأ من الصفر في كل زيارة</p>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          {[
            { icon: '📂', title: 'الشواهد مبعثرة أو مفقودة', desc: 'الملفات الورقية تضيع، والصور غير مصنفة، والمدير لا يعرف ما اكتمل وما ينقصه قبيل الزيارة.' },
            { icon: '🤷', title: 'النظام جديد وغير مفهوم بالكامل', desc: 'كثير من المدارس تقدم شواهد خاطئة أو غير كافية لأنها لا تعرف ما المطلوب بالضبط لكل مؤشر.' },
            { icon: '⏰', title: 'التجهيز يأتي متأخراً', desc: 'المدارس تبدأ التجهيز قبل الزيارة بأيام قليلة، مما يضغط على الإدارة ويقلل جودة الشواهد المقدمة.' },
          ].map(p => (
            <div key={p.title} style={{
              display: 'flex', gap: 18, padding: '1.4rem 1.6rem',
              background: '#fff', borderRadius: 14, border: '1px solid rgba(11,31,58,0.08)'
            }}>
              <span style={{ fontSize: 30, flexShrink: 0 }}>{p.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#0B1F3A', margin: '0 0 6px' }}>{p.title}</p>
                <p className="body-font" style={{ fontSize: 14, color: '#5A5648', margin: 0, lineHeight: 1.8 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ الحل ============ */}
      <section style={{ background: '#0B1F3A', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 12, color: '#E8C275', fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>الحل</p>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 10 }}>شواهدي تحل المشكلة</h2>
            <p className="body-font" style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>منصة متكاملة تقود مدير المدرسة خطوة بخطوة طوال العام</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { icon: '📋', title: 'لوحة اكتمال فورية', desc: 'تعرف في ثوانٍ أي المجالات مكتملة وأيها يحتاج شواهد إضافية.' },
              { icon: '📤', title: 'رفع شواهد بسهولة', desc: 'ارفع صوراً وملفات PDF مباشرة تحت كل مؤشر من 47 مؤشراً.' },
              { icon: '📝', title: 'نماذج جاهزة', desc: 'محاضر لجان وخطط — تعبّئها وتطلع PDF احترافي باسم مدرستك.' },
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

      {/* ============ التسعير ============ */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(217,164,65,0.12)', color: '#A6730F',
            fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 20, marginBottom: 20
          }}>
            عرض تأسيسي محدود — بداية العام الدراسي
          </div>
          <div style={{
            background: '#fff', border: '2px solid #E8C275', borderRadius: 22,
            padding: '2.8rem 2.2rem', boxShadow: '0 16px 48px rgba(11,31,58,0.10)'
          }}>
            <p style={{ fontSize: 12, color: '#8A8270', fontWeight: 700, letterSpacing: 1, marginBottom: 4, textDecoration: 'line-through' }}>999 ريال / سنة</p>
            <p style={{ fontSize: 54, fontWeight: 900, color: '#0B1F3A', margin: '0 0 4px', lineHeight: 1 }}>699</p>
            <p className="body-font" style={{ fontSize: 17, color: '#5A5648', marginBottom: 24 }}>ريال سعودي / سنة</p>
            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              {['وصول كامل لجميع المجالات والمؤشرات', 'تخزين غير محدود للشواهد', 'نماذج جاهزة قابلة للتخصيص', 'تقارير PDF احترافية', 'دعم فني مستمر'].map(f => (
                <p key={f} className="body-font" style={{ fontSize: 14, color: '#0B1F3A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#C28A1F', fontWeight: 900, flexShrink: 0 }}>✓</span> {f}
                </p>
              ))}
            </div>
            <Link href="/register" className="cta-primary" style={{
              display: 'block', padding: '15px', fontSize: 17, fontWeight: 700,
              background: '#0B1F3A', color: '#fff', borderRadius: 11,
              textDecoration: 'none', transition: 'background 0.2s'
            }}>
              سجّل مدرستك الآن ←
            </Link>
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
