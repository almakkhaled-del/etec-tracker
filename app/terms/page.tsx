import Link from 'next/link'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const CREAM = '#FBF8F2'

export const metadata = {
  title: 'الشروط والأحكام | شواهدي',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 12 }}>{title}</h2>
      <div className="body-font" style={{ fontSize: 14.5, color: '#3a3a3a', lineHeight: 2.1 }}>
        {children}
      </div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`.body-font{font-family:'IBM Plex Sans Arabic','Tajawal',sans-serif} ul{margin:0;padding-inline-start:22px} li{margin-bottom:8px}`}</style>

      {/* ============ NAV (نفس شريط الصفحة الرئيسية) ============ */}
      <nav style={{
        background: 'rgba(251,248,242,0.92)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 76, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 58, objectFit: 'contain' }} />
        </Link>
        <Link href="/#login-box" style={{
          padding: '9px 22px', fontSize: 13, fontWeight: 700, color: '#fff',
          textDecoration: 'none', background: NAVY, borderRadius: 8
        }}>
          الدخول ↓
        </Link>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 60px' }}>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(217,164,65,0.14)', border: '1px solid rgba(194,138,31,0.35)',
          color: '#A6730F', fontSize: 12, fontWeight: 600, padding: '6px 16px',
          borderRadius: 30, marginBottom: 18,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
          الشفافية والثقة
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 900, color: NAVY, margin: '0 0 8px' }}>الشروط والأحكام</h1>
        <p className="body-font" style={{ fontSize: 13, color: '#8A8270', marginBottom: 32 }}>
          آخر تحديث: يوليو 2026
        </p>

        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '2rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)' }}>

          <p className="body-font" style={{ fontSize: 14.5, color: '#3a3a3a', lineHeight: 2.1, marginBottom: 32 }}>
            باستخدامك لمنصة "شواهدي" عبر الموقع shawahede.com فإنك توافق على الشروط والأحكام التالية. يرجى قراءتها
            بعناية قبل استخدام المنصة أو تسجيل مدرستك.
          </p>

          <Section title="١. طبيعة الخدمة">
            شواهدي منصة إلكترونية تساعد مدارس التعليم العام على تنظيم وتوثيق وطباعة شواهد معايير الاعتماد المدرسي
            وفق إطار هيئة تقويم التعليم والتدريب (إتقان). شواهدي منصة مستقلة تقدَّم كأداة تنظيمية مساعدة، وهي
            <strong> غير مرتبطة رسمياً بهيئة تقويم التعليم والتدريب</strong>، ولا تضمن نتيجة أي زيارة أو عملية
            اعتماد أو تقويم تقوم بها الهيئة أو أي جهة تقويم أخرى.
          </Section>

          <Section title="٢. إنشاء الحساب">
            <ul>
              <li>يجب أن تكون من منسوبي المدرسة المخوّلين لتسجيلها (مدير/ة المدرسة أو من ينوب عنه/ا).</li>
              <li>أنت مسؤول عن دقة البيانات التي تُدخلها عند التسجيل، وعن سرية بيانات دخول حسابك.</li>
              <li>يحق لنا تعليق أو إغلاق أي حساب يُستخدم بشكل مخالف لهذه الشروط أو للأنظمة المعمول بها في المملكة العربية السعودية.</li>
            </ul>
          </Section>

          <Section title="٣. الباقات والاشتراكات">
            <ul>
              <li><strong>الباقة المجانية:</strong> تتيح الوصول لمجال واحد فقط من أصل المجالات الأربعة، بحد أقصى للتخزين كما هو موضح في صفحة الباقات على الموقع.</li>
              <li><strong>الباقات المدفوعة (الأساسية والمتقدمة):</strong> أسعارها ومزاياها قيد التقييم حالياً وسيُعلن عنها لاحقاً على الموقع. عند إتاحتها، ستُطبَّق شروط دفع وتجديد وإلغاء محددة تُعرض بوضوح قبل الاشتراك.</li>
              <li>نحتفظ بحق تعديل مزايا أي باقة أو حدود الاستخدام فيها مستقبلاً، مع إخطار مستخدمينا بأي تغيير جوهري.</li>
            </ul>
          </Section>

          <Section title="٤. محتوى المستخدم (الشواهد المرفوعة)">
            <ul>
              <li>تبقى ملكية جميع الشواهد والمستندات التي ترفعها مدرستك (صور، PDF، Word) لك أنت/لمدرستك.</li>
              <li>أنت تمنحنا فقط الحق التقني اللازم لتخزين هذا المحتوى ومعالجته وعرضه لك ضمن حسابك، بما يشمل تحويله لصور أو دمجه ضمن التقارير التي تولّدها المنصة.</li>
              <li>أنت مسؤول عن التأكد من أن المحتوى الذي ترفعه لا ينتهك حقوق أي طرف ثالث، ولا يحتوي على مواد مخالفة للأنظمة السعودية.</li>
            </ul>
          </Section>

          <Section title="٥. الاستخدام المقبول">
            يُمنع استخدام المنصة في أي غرض غير مشروع، أو محاولة الوصول غير المصرح به لحسابات مدارس أخرى، أو محاولة
            الإخلال بأمان المنصة أو تعطيل عملها.
          </Section>

          <Section title="٦. الملكية الفكرية">
            جميع حقوق التصميم والبرمجيات والعلامة التجارية الخاصة بمنصة "شواهدي" مملوكة لمالك المنصة، ولا يجوز نسخها
            أو إعادة استخدامها تجارياً دون إذن كتابي مسبق.
          </Section>

          <Section title="٧. حدود المسؤولية">
            تُقدَّم المنصة "كما هي" دون أي ضمانات صريحة أو ضمنية بخصوص خلوّها التام من الأعطال. شواهدي أداة تنظيمية
            مساعدة فقط، ولا تتحمل المسؤولية عن أي قرار تقويم أو اعتماد تتخذه هيئة تقويم التعليم والتدريب أو أي جهة
            تقويم أخرى، ولا عن أي أضرار غير مباشرة ناتجة عن استخدام المنصة أو التوقف المؤقت عن الخدمة.
          </Section>

          <Section title="٨. التوفر والتعديلات على الخدمة">
            نسعى لإتاحة المنصة بشكل مستمر، لكن قد تحدث فترات توقف مؤقتة للصيانة أو التحديث. نحتفظ بحق إضافة أو
            تعديل أو إيقاف أي ميزة في المنصة في أي وقت.
          </Section>

          <Section title="٩. إنهاء الخدمة">
            يمكنك إلغاء اشتراكك أو حذف حسابك في أي وقت بالتواصل معنا. كما يحق لنا تعليق أو إنهاء وصولك للمنصة في
            حال مخالفة هذه الشروط.
          </Section>

          <Section title="١٠. القانون المُطبَّق">
            تخضع هذه الشروط وتُفسَّر وفقاً لأنظمة المملكة العربية السعودية، وتختص محاكم المملكة بالفصل في أي نزاع
            ينشأ عنها ما لم يُتفق على خلاف ذلك.
          </Section>

          <Section title="١١. التعديلات على هذه الشروط">
            قد نُحدّث هذه الشروط من وقت لآخر. سيُنشر أي تحديث على هذه الصفحة مع تاريخ آخر تحديث، واستمرارك في
            استخدام المنصة بعد التحديث يُعد موافقة على الشروط المُحدَّثة.
          </Section>

          <Section title="١٢. تواصل معنا">
            لأي استفسار حول هذه الشروط، راسلنا على:{' '}
            <a href="mailto:support@shawahede.com" style={{ color: GOLD, fontWeight: 700, textDecoration: 'none' }}>
              support@shawahede.com
            </a>
          </Section>

        </div>
      </main>

      {/* ============ الفوتر (نفس فوتر الصفحة الرئيسية) ============ */}
      <footer style={{ borderTop: '1px solid rgba(11,31,58,0.08)', background: '#fff', padding: '2.5rem 1.5rem 1.8rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 42, marginBottom: 16 }} />
          <p className="body-font" style={{ fontSize: 12, color: '#8A8270', margin: '0 0 16px' }}>
            shawahede.com · منصة مستقلة لدعم المدارس · غير مرتبطة بهيئة تقويم التعليم والتدريب
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 20 }}>
            <Link href="/privacy" className="body-font" style={{ fontSize: 12, color: '#8A8270', textDecoration: 'none' }}>سياسة الخصوصية</Link>
            <Link href="/terms" className="body-font" style={{ fontSize: 12, color: GOLD, textDecoration: 'none', fontWeight: 700 }}>الشروط والأحكام</Link>
          </div>
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
