import Link from 'next/link'

const NAVY = '#0A3B58'
const GOLD = '#1F6E96'
const CREAM = '#F5F8FA'

export const metadata = {
  title: 'سياسة الخصوصية | شواهدي',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 12 }}>{title}</h2>
      <div className="body-font" style={{ fontSize: 14.5, color: '#2F3B45', lineHeight: 2.1 }}>
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`.body-font{font-family:'IBM Plex Sans Arabic','Tajawal',sans-serif} ul{margin:0;padding-inline-start:22px} li{margin-bottom:8px}`}</style>

      {/* ============ NAV (نفس شريط الصفحة الرئيسية) ============ */}
      <nav style={{
        background: 'rgba(245,248,250,0.92)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(10,59,88,0.08)', padding: '0 28px',
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
          background: 'rgba(62,138,176,0.14)', border: '1px solid rgba(31,110,150,0.35)',
          color: '#175A7D', fontSize: 12, fontWeight: 600, padding: '6px 16px',
          borderRadius: 30, marginBottom: 18,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
          الشفافية والثقة
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 900, color: NAVY, margin: '0 0 8px' }}>سياسة الخصوصية</h1>
        <p className="body-font" style={{ fontSize: 13, color: '#7A8896', marginBottom: 32 }}>
          آخر تحديث: يوليو 2026
        </p>

        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(10,59,88,0.07)', padding: '2rem 1.8rem', boxShadow: '0 4px 16px rgba(10,59,88,0.06)' }}>

          <p className="body-font" style={{ fontSize: 14.5, color: '#2F3B45', lineHeight: 2.1, marginBottom: 32 }}>
            تحترم "شواهدي" خصوصية مستخدميها من مدارس التعليم العام، وتوضح هذه السياسة نوع البيانات التي نجمعها،
            كيف نستخدمها، ومع من نشاركها عند استخدامك للمنصة عبر الموقع shawahede.com.
          </p>

          <Section title="١. من نحن">
            شواهدي منصة إلكترونية سعودية (منشأة فردية) تساعد مدارس التعليم العام على تنظيم وتوثيق شواهد معايير
            الاعتماد المدرسي وفق إطار هيئة تقويم التعليم والتدريب (إتقان). شواهدي منصة مستقلة وغير مرتبطة رسمياً
            بهيئة تقويم التعليم والتدريب.
          </Section>

          <Section title="٢. البيانات التي نجمعها">
            <ul>
              <li>بيانات حساب المدرسة: اسم المدرسة، اسم مدير/ة المدرسة، البريد الإلكتروني، رقم الهاتف، الرقم الوزاري، ونوع المدرسة/مرحلتها.</li>
              <li>بيانات تسجيل الدخول: البريد الإلكتروني وكلمة المرور (تُخزَّن بشكل مشفّر عبر مزوّد خدمة موثوق ولا نطّلع عليها كنص صريح).</li>
              <li>الشواهد المرفوعة: الصور وملفات PDF/Word التي يرفعها مستخدمو المدرسة كأدلة لمؤشرات الاعتماد.</li>
              <li>بيانات الاستخدام الفنية: مثل سجلات الدخول، نوع المتصفح، وتفاعلك مع صفحات المنصة، لأغراض تحسين الخدمة وأمانها.</li>
            </ul>
          </Section>

          <Section title="٣. كيف نستخدم بياناتك">
            <ul>
              <li>تقديم خدمة تنظيم الشواهد وتوليد التقارير والنماذج المرتبطة بها.</li>
              <li>تشغيل ميزات التحليل الذكي (مثل تحليل تقارير التقويم الخارجي وتوليد خطط التحسين) عبر خدمات ذكاء اصطناعي تابعة لجهات خارجية موثوقة.</li>
              <li>التواصل معك بخصوص حسابك، الدعم الفني، أو تحديثات مهمة على الخدمة.</li>
              <li>تحسين أداء المنصة وإصلاح الأعطال.</li>
            </ul>
          </Section>

          <Section title="٤. مشاركة البيانات مع أطراف خارجية">
            نستخدم مزودي خدمات تقنية موثوقين لتشغيل المنصة، ولا نبيع بياناتك لأي جهة. الأطراف التي قد تُعالَج بياناتك
            من خلالها لغرض تشغيل الخدمة فقط:
            <ul style={{ marginTop: 10 }}>
              <li>مزوّد قاعدة البيانات والتخزين السحابي — لتخزين بيانات الحساب والشواهد المرفوعة بشكل آمن.</li>
              <li>مزوّد الاستضافة السحابية للموقع — لتشغيل المنصة وضمان توفرها.</li>
              <li>خدمة ذكاء اصطناعي تابعة لجهة خارجية (Google) — تُستخدم لتحليل محتوى تقارير التقويم التي يرفعها المستخدم عند استخدام ميزات "الخطة التشغيلية الذكية" و"خطة التحسين"، بغرض استخراج البيانات وتوليد المحتوى فقط.</li>
            </ul>
          </Section>

          <Section title="٥. أمان البيانات">
            نتخذ إجراءات تقنية وتنظيمية معقولة لحماية بياناتك، منها التشفير أثناء النقل، وضوابط وصول تقتصر بيانات
            كل مدرسة على مستخدمي تلك المدرسة فقط. مع ذلك، لا يمكن لأي منصة إلكترونية ضمان أمان مطلق بنسبة 100%،
            ونعمل باستمرار على تحسين هذه الإجراءات.
          </Section>

          <Section title="٦. مسؤولية المدرسة عن محتوى الشواهد">
            الشواهد المرفوعة (صور، ملفات PDF أو Word) قد تحتوي أحياناً على بيانات متعلقة بمنسوبي المدرسة أو طلابها
            ضمن سياق التوثيق. المدرسة هي المسؤولة عن التأكد من التزامها بالأنظمة المعمول بها (بما فيها نظام حماية
            البيانات الشخصية السعودي) عند رفع أي مستند يحتوي بيانات شخصية، وشواهدي تتعامل مع هذا المحتوى فقط
            كوسيط تقني لتنظيمه وعرضه للمدرسة نفسها.
          </Section>

          <Section title="٧. مدة الاحتفاظ بالبيانات">
            نحتفظ ببيانات حسابك وشواهدك طالما كان حسابك نشطاً. عند رغبتك في حذف حسابك وبياناته نهائياً، يمكنك
            التواصل معنا عبر البريد أدناه وسنقوم بذلك خلال مدة معقولة، ما لم يستوجب النظام الاحتفاظ ببعض البيانات
            لمدة أطول.
          </Section>

          <Section title="٨. حقوقك">
            يحق لك طلب الاطلاع على بياناتك، تصحيحها، أو حذفها، وذلك بالتواصل معنا عبر البريد الإلكتروني أدناه.
            نسعى للرد على هذه الطلبات ومعالجتها خلال مدة معقولة.
          </Section>

          <Section title="٩. ملفات تعريف الارتباط (Cookies)">
            نستخدم الحد الأدنى الضروري من تقنيات التخزين المحلي بشكل أساسي للحفاظ على جلسة تسجيل دخولك، ولا
            نستخدمها لأغراض إعلانية أو تتبع تسويقي.
          </Section>

          <Section title="١٠. التعديلات على هذه السياسة">
            قد نُحدّث سياسة الخصوصية من وقت لآخر لمواكبة تطور الخدمة أو الأنظمة المعمول بها. سيُنشر أي تحديث على
            هذه الصفحة مع تاريخ آخر تحديث.
          </Section>

          <Section title="١١. تواصل معنا">
            لأي استفسار متعلق بالخصوصية أو بياناتك، راسلنا على:{' '}
            <a href="mailto:support@shawahede.com" style={{ color: GOLD, fontWeight: 700, textDecoration: 'none' }}>
              support@shawahede.com
            </a>
          </Section>

        </div>
      </main>

      {/* ============ الفوتر (نفس فوتر الصفحة الرئيسية) ============ */}
      <footer style={{ borderTop: '1px solid rgba(10,59,88,0.08)', background: '#fff', padding: '2.5rem 1.5rem 1.8rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <img src="/logo.png" alt="شواهدي" style={{ height: 42, marginBottom: 16 }} />
          <p className="body-font" style={{ fontSize: 12, color: '#7A8896', margin: '0 0 16px' }}>
            shawahede.com · منصة مستقلة لدعم المدارس · غير مرتبطة بهيئة تقويم التعليم والتدريب
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 20 }}>
            <Link href="/privacy" className="body-font" style={{ fontSize: 12, color: GOLD, textDecoration: 'none', fontWeight: 700 }}>سياسة الخصوصية</Link>
            <Link href="/terms" className="body-font" style={{ fontSize: 12, color: '#7A8896', textDecoration: 'none' }}>الشروط والأحكام</Link>
          </div>
          <div style={{ width: 60, height: 1, background: 'rgba(10,59,88,0.1)', margin: '0 auto 20px' }} />
          <a href="https://khaleddev.online" target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none'
          }}>
            <span className="body-font" style={{ fontSize: 12, color: '#7A8896' }}>صُنع بواسطة</span>
            <img src="/nextlogic-logo.png" alt="Next Logic by Khaled" style={{ height: 22, objectFit: 'contain' }} />
          </a>
        </div>
      </footer>
    </div>
  )
}
