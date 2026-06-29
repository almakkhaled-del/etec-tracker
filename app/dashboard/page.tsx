'use client'
import Link from 'next/link'

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: "'Tajawal', sans-serif", direction: 'rtl', color: '#111827' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 100 }}>
        <img src="/logo.png" alt="شواهدي" style={{ height: 44 }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/" style={{ padding: '8px 18px', fontSize: 14, borderRadius: 8, border: '1px solid #e5e7eb', textDecoration: 'none', color: '#374151' }}>
            تسجيل الدخول
          </Link>
          <Link href="/" style={{ padding: '8px 18px', fontSize: 14, borderRadius: 8, background: '#1d4ed8', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
            ابدأ مجاناً
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '5rem 1.5rem 4rem', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1e40af', fontSize: 12, fontWeight: 600, padding: '5px 16px', borderRadius: 20, marginBottom: 24 }}>
          متوافق مع معايير هيئة تقويم التعليم والتدريب 2023
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.35, marginBottom: 20, color: '#0f172a' }}>
          نظّم شواهد مدرستك<br />
          <span style={{ color: '#1d4ed8' }}>وكن جاهزاً لزيارة التقويم</span>
        </h1>
        <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.8, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
          شواهدي تساعد مدارس التعليم العام على توثيق وتنظيم شواهد معايير الاعتماد المدرسي — مجال بمجال، مؤشراً بمؤشر.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ padding: '14px 36px', fontSize: 16, fontWeight: 700, background: '#1d4ed8', color: '#fff', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 14px rgba(29,78,216,0.3)' }}>
            سجّل مدرستك الآن ←
          </Link>
          <Link href="/" style={{ padding: '14px 36px', fontSize: 16, border: '1.5px solid #d1d5db', borderRadius: 10, textDecoration: 'none', color: '#374151', background: '#fff' }}>
            تسجيل الدخول
          </Link>
        </div>
      </section>

      {/* المجالات */}
      <section style={{ background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '2rem 1.5rem' }}>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginBottom: 20, fontWeight: 500 }}>
          يغطي المجالات الأربعة لمعايير إتقان — 38 مؤشراً
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 700, margin: '0 auto' }}>
          {[
            { emoji: '🏫', label: 'الإدارة المدرسية', sub: '15 مؤشراً', color: '#eff6ff' },
            { emoji: '📚', label: 'التعليم والتعلم', sub: '13 مؤشراً', color: '#f0fdf4' },
            { emoji: '📊', label: 'نواتج التعلم', sub: '13 مؤشراً', color: '#fffbeb' },
            { emoji: '🏢', label: 'البيئة المدرسية', sub: '6 مؤشرات', color: '#fef2f2' },
          ].map(d => (
            <div key={d.label} style={{ background: d.color, borderRadius: 12, padding: '18px 10px', textAlign: 'center' }}>
              <p style={{ fontSize: 30, margin: '0 0 8px' }}>{d.emoji}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>{d.label}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{d.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* المشكلة */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>المشكلة</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>ما تواجهه المدارس اليوم</h2>
          <p style={{ fontSize: 15, color: '#6b7280' }}>معايير التقويم نظام جديد — وكثير من المدارس تبدأ من الصفر في كل زيارة</p>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { icon: '📂', color: '#fef2f2', title: 'الشواهد مبعثرة أو مفقودة', desc: 'الملفات الورقية تضيع، والصور غير مصنفة، والمدير لا يعرف ما اكتمل وما ينقصه قبيل الزيارة.' },
            { icon: '🤷', color: '#fffbeb', title: 'النظام جديد وغير مفهوم بالكامل', desc: 'كثير من المدارس تقدم شواهد خاطئة أو غير كافية لأنها لا تعرف ما المطلوب بالضبط لكل مؤشر.' },
            { icon: '⏰', color: '#f0f9ff', title: 'التجهيز يأتي متأخراً', desc: 'المدارس تبدأ التجهيز قبل الزيارة بأيام قليلة، مما يضغط على الإدارة ويقلل جودة الشواهد المقدمة.' },
          ].map(p => (
            <div key={p.title} style={{ display: 'flex', gap: 16, padding: '1.25rem 1.5rem', background: p.color, borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{p.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: '0 0 6px' }}>{p.title}</p>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* الحل */}
      <section style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>الحل</p>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>شواهدي تحل المشكلة</h2>
            <p style={{ fontSize: 15, color: '#6b7280' }}>منصة متكاملة تقود مدير المدرسة خطوة بخطوة طوال العام</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {[
              { icon: '📋', title: 'لوحة اكتمال فورية', desc: 'تعرف في ثوانٍ أي المجالات مكتملة وأيها يحتاج شواهد إضافية — بشكل بصري واضح.' },
              { icon: '📤', title: 'رفع شواهد بسهولة', desc: 'ارفع صوراً وملفات PDF ومستندات مباشرة تحت كل مؤشر من المؤشرات الـ 38.' },
              { icon: '📝', title: 'نماذج جاهزة', desc: 'محاضر لجان وخطط تشغيلية وتقارير — تعبّئها وتطلع PDF احترافي باسم مدرستك.' },
              { icon: '🖨️', title: 'تقرير كامل بضغطة', desc: 'اطبع ملف شواهد مدرستك كاملاً ومرتباً جاهزاً لأي زيارة تقويم أو اعتماد.' },
            ].map(f => (
              <div key={f.title} style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: 30, margin: '0 0 10px' }}>{f.icon}</p>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: '0 0 6px' }}>{f.title}</p>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* التسعير */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: '#fff', border: '2px solid #1d4ed8', borderRadius: 20, padding: '2.5rem 2rem', boxShadow: '0 8px 32px rgba(29,78,216,0.12)' }}>
            <p style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>سعر الاشتراك السنوي</p>
            <p style={{ fontSize: 52, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', lineHeight: 1 }}>999</p>
            <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 20 }}>ريال سعودي / سنة</p>
            <div style={{ textAlign: 'right', marginBottom: 24 }}>
              {['وصول كامل لجميع المجالات والمؤشرات', 'تخزين غير محدود للشواهد', 'نماذج جاهزة قابلة للتخصيص', 'تقارير PDF احترافية', 'دعم فني مستمر'].map(f => (
                <p key={f} style={{ fontSize: 13, color: '#374151', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                </p>
              ))}
            </div>
            <Link href="/" style={{ display: 'block', padding: '14px', fontSize: 16, fontWeight: 700, background: '#1d4ed8', color: '#fff', borderRadius: 10, textDecoration: 'none' }}>
              سجّل مدرستك الآن ←
            </Link>
          </div>
        </div>
      </section>

      {/* الفوتر */}
      <footer style={{ borderTop: '1px solid #e5e7eb', background: '#fff', padding: '1.5rem', textAlign: 'center' }}>
        <img src="/logo.png" alt="شواهدي" style={{ height: 36, marginBottom: 12 }} />
        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
          shawahede.com · منصة مستقلة لدعم المدارس · غير مرتبطة بهيئة تقويم التعليم والتدريب
        </p>
      </footer>
    </div>
  )
}
