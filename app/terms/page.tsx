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

      <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 20px', height: 72, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            ← الرئيسية
          </Link>
          <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: 0 }}>الشروط والأحكام</p>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '36px 20px 60px' }}>
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '2rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)' }}>

          <p className="body-font" style={{ fontSize: 13, color: '#8A8270', marginBottom: 28 }}>
            آخر تحديث: يوليو 2026
          </p>

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
    </div>
  )
}
