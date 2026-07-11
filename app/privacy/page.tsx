import Link from 'next/link'

const NAVY = '#0B1F3A'
const GOLD = '#C28A1F'
const CREAM = '#FBF8F2'

export const metadata = {
  title: 'سياسة الخصوصية | شواهدي',
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

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`.body-font{font-family:'IBM Plex Sans Arabic','Tajawal',sans-serif} ul{margin:0;padding-inline-start:22px} li{margin-bottom:8px}`}</style>

      <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 20px', height: 72, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            ← الرئيسية
          </Link>
          <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: 0 }}>سياسة الخصوصية</p>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '36px 20px 60px' }}>
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '2rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)' }}>

          <p className="body-font" style={{ fontSize: 13, color: '#8A8270', marginBottom: 28 }}>
            آخر تحديث: يوليو 2026
          </p>

          <p className="body-font" style={{ fontSize: 14.5, color: '#3a3a3a', lineHeight: 2.1, marginBottom: 32 }}>
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
    </div>
  )
}
