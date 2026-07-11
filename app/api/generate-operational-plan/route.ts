import { NextRequest, NextResponse } from 'next/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'

const PROMPT = `أنت خبير في تحليل تقارير التقويم المدرسي السعودي وفق إطار إتقان.

اقرأ تقرير التقويم الخارجي المرفق واستخرج:

1. بيانات المدرسة من التقرير: اسم المدرسة، إدارة التعليم، نطاق التعليم، المرحلة الدراسية (ابتدائية/متوسطة/ثانوية)

2. SWOT من المؤشرات:
   - نقاط القوة: المؤشرات بمستوى متميز أو متقدم (75% وأعلى) — اذكر اسم المؤشر فقط بدون نسبة
   - نقاط الضعف: المؤشرات بمستوى انطلاق أو تهيئة (أقل من 75%) — اذكر اسم المؤشر فقط بدون نسبة
   - الفرص: استنتجها من السياق (دعم خارجي، موارد، شراكات)
   - التهديدات: استنتجها من السياق (تحديات بيئية أو مجتمعية)

3. أبرز القضايا الرئيسية: 9 قضايا مستنتجة من نقاط الضعف

4. برامج مخصصة لكل هدف من الأهداف العشرة — ركز على:
   - برامج تعزيز نقاط القوة
   - برامج علاج نقاط الضعف مرتبطة بالمؤشر الضعيف

أجب بـ JSON فقط:
{
  "school_info": {
    "school_name": "اسم المدرسة",
    "region": "إدارة التعليم",
    "district": "نطاق التعليم",
    "stage": "ابتدائية أو متوسطة أو ثانوية"
  },
  "swot": {
    "strengths": ["اسم المؤشر فقط"],
    "weaknesses": ["اسم المؤشر فقط"],
    "opportunities": ["فرصة"],
    "threats": ["تهديد"]
  },
  "main_issues": ["قضية 1","قضية 2","قضية 3","قضية 4","قضية 5","قضية 6","قضية 7","قضية 8","قضية 9"],
  "custom_programs": {
    "goal1_extra": [{"name":"برنامج إضافي مخصص","indicator":"مؤشر قياس"}],
    "goal2_extra": [],
    "goal3_extra": [],
    "goal4_extra": [],
    "goal5_extra": [],
    "goal6_extra": [],
    "goal7_extra": [],
    "goal8_extra": [],
    "goal9_extra": [],
    "goal10_extra": []
  }
}`

// ===== البرامج الثابتة من المجلة =====
const FIXED_GOALS = [
  {
    general: 'ضمان وصول التعليم لجميع',
    specific: 'وضع خطط استيعابية تضمن تعليم جميع الطلاب بكفاءة و دون تمييز',
    programs: [
      { name: 'إعداد الخطة التشغيلية', term: '1', week: 'الأول', target: 'لجنة التميز', req: 'ورشة عمل', head: 'لجنة التميز', support: 'مدير المدرسة', indicator: 'إعداد الخطة بنسبة 100%' },
      { name: 'إعداد خطة النشاط الطلابي', term: '1', week: 'الأول', target: 'رائد النشاط', req: 'ورشة عمل', head: 'رائد النشاط', support: 'وكيل المدرسة', indicator: 'تنفيذ 70% من البرامج' },
      { name: 'إعداد خطة التوجيه الطلابي', term: '1', week: 'الأول', target: 'الموجه الطلابي', req: 'ورشة عمل', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'تنفيذ 70% من البرامج' },
      { name: 'إعداد خطة التطوير المهني', term: '1', week: 'الأول', target: 'اللجنة الإدارية', req: 'ورشة عمل', head: 'اللجنة الإدارية', support: 'مدير المدرسة', indicator: 'التحاق 50% من المعلمين ببرامج تدريبية' },
      { name: 'إعداد خطة مجتمعات التعلم المهنية', term: '1', week: 'الأول', target: 'التحصيل الدراسي', req: 'ورشة عمل', head: 'التحصيل الدراسي', support: 'وكيل المدرسة', indicator: 'تشكيل 4 مجتمعات تعلم مهني' },
      { name: 'إعداد خطة تحسين التقويم المدرسي', term: '2', week: 'مستمر', target: 'فريق التقويم', req: 'ورشة عمل', head: 'فريق التقويم', support: 'مدير المدرسة', indicator: 'إعداد الخطة بنسبة 100%' },
      { name: 'إعداد خطة رعاية الموهوبين', term: '2', week: 'مستمر', target: 'منسق الموهوبين', req: 'اجتماع', head: 'منسق الموهوبين', support: 'رائد النشاط', indicator: 'رعاية 10% من الطلاب' },
      { name: 'اليوم العالمي لذوي الإعاقة', term: '', week: '', target: 'الطلاب', req: 'نشرات', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'تحسين نظرة الطلاب لذوي الإعاقة' },
    ]
  },
  {
    general: 'تطوير بيئة مدرسية آمنة و ابتكارية',
    specific: 'تهيئة الفصول والمرافق المدرسية بوسائل تعليمية مبتكرة مع الالتزام بمعايير الأمن والسلامة',
    programs: [
      { name: 'المبنى المدرسي', term: 'مستمر', week: 'مستمر', target: 'المبنى المدرسي', req: 'عقد صيانة', head: 'وكيل المدرسة', support: 'الصيانة', indicator: 'سلامة المبنى المدرسي' },
      { name: 'الفصول الدراسية', term: 'مستمر', week: 'مستمر', target: 'الفصول', req: 'خطابات', head: 'مدير المدرسة', support: 'التجهيزات', indicator: 'تجهيز الفصول الدراسية' },
      { name: 'النظافة', term: 'مستمر', week: 'مستمر', target: 'المبنى المدرسي', req: 'عقد نظافة', head: 'وكيل المدرسة', support: 'الصيانة', indicator: 'تحسن مستوى النظافة اليومية' },
      { name: 'أنا مسؤول', term: '1-2', week: 'بداية كل فصل', target: 'الطلاب', req: 'عرض', head: 'وكيل المدرسة', support: 'الموجه الطلابي', indicator: 'محافظة الطلاب على الممتلكات العامة' },
      { name: 'حصر الحالات الصحية', term: '1-2', week: 'بداية كل فصل', target: 'الطلاب', req: 'كشف صحي', head: 'الموجه الصحي', support: 'المركز الصحي', indicator: 'حصر الحالات بنسبة 100%' },
      { name: 'السلامة المرورية', term: '1-2', week: '2', target: 'الطلاب', req: 'نشرات تعريفية', head: 'رائد النشاط', support: 'الموجه الطلابي', indicator: 'ارتفاع التزام الطلاب بنسبة 90%' },
      { name: 'خطة الإخلاء', term: '1-2', week: 'مرة كل فصل', target: 'جميع منسوبي المدرسة', req: 'تطبيق عملي', head: 'وكيل المدرسة', support: 'الأمن و السلامة', indicator: 'تنفيذ الإخلاء في وقت قياسي' },
      { name: 'سلامة طفايات الحريق', term: '1-2', week: 'مرة كل فصل', target: 'طفايات الحريق', req: 'فحص', head: 'وكيل المدرسة', support: 'الأمن و السلامة', indicator: 'التأكد من سلامة جميع الطفايات' },
      { name: 'أجمل فصل', term: '1-2', week: '2', target: 'الطلاب', req: 'مسابقة', head: 'رائد النشاط', support: 'وكيل المدرسة', indicator: 'تجميل جميع الفصول' },
    ]
  },
  {
    general: 'تعزيز القيم والهوية الوطنية',
    specific: 'دمج القيم الإسلامية والهوية الوطنية في الأنشطة الصفية واللاصفية',
    programs: [
      { name: 'ميثاق مهنة التعليم', term: '1', week: '1', target: 'المعلمون', req: 'لقاء', head: 'اللجنة الإدارية', support: 'مدير المدرسة', indicator: 'توقيع الميثاق بنسبة 100%' },
      { name: 'تعزير السلوك الإيجابي', term: 'مستمر', week: 'مستمر', target: 'الطلاب', req: 'الإذاعة', head: 'الموجه الطلابي', support: 'المعلمون', indicator: 'ارتفاع التزام الطلاب بنسبة 90%' },
      { name: 'التوعية بقواعد السلوك و المواظبة', term: 'مستمر', week: 'مستمر', target: 'الطلاب', req: 'محاضرة', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'ارتفاع التزام الطلاب بنسبة 90%' },
      { name: 'تعزير المهارات النفسية', term: 'مستمر', week: 'مستمر', target: 'الطلاب', req: 'الإذاعة', head: 'الموجه الطلابي', support: 'المعلمون', indicator: 'ارتفاع التزام الطلاب بنسبة 90%' },
      { name: 'اليوم العالمي لذوي الإعاقة', term: '', week: '', target: 'الطلاب', req: 'نشرات', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'تحسين نظرة الطلاب لذوي الإعاقة' },
      { name: 'اليوم الوطني', term: '', week: '', target: 'الطلاب', req: 'فعاليات متنوعة', head: 'رائد النشاط', support: 'المعلمون', indicator: 'مشاركة الطلاب 40% من الطلاب' },
      { name: 'يوم التأسيس', term: '', week: '', target: 'الطلاب', req: 'فعاليات متنوعة', head: 'رائد النشاط', support: 'المعلمون', indicator: 'مشاركة الطلاب 40% من الطلاب' },
      { name: 'يوم العلم', term: '', week: '', target: 'الطلاب', req: 'فعاليات متنوعة', head: 'رائد النشاط', support: 'المعلمون', indicator: 'مشاركة الطلاب 40% من الطلاب' },
      { name: 'وطني في قلبي', term: '', week: '', target: 'الصفوف العليا', req: 'فعاليات متنوعة', head: 'رائد النشاط', support: 'المعلمون', indicator: 'مشاركة الطلاب 40% من الطلاب' },
    ]
  },
  {
    general: 'تحسين تجربة المستفيدين',
    specific: 'تطوير قنوات التواصل مع أولياء الأمور والطلاب لضمان رضاهم عن الخدمات التعليمية',
    programs: [
      { name: 'المجلس الطلابي', term: 'كل فصل', week: 'كل فصل', target: 'أعضاء المجلس', req: 'اجتماع', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'تنفيذ توصيات المجلس' },
      { name: 'إطار توثيق العلاقة بين المدرسة و الأسرة (مجالس الآباء)', term: 'بعد اختبارات الفترة', week: 'بعد اختبارات الفترة', target: 'أولياء الأمور', req: 'لقاء', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'مشاركة 50% من أولياء الأمور في البرامج' },
      { name: 'يوم التسامح العالمي', term: '', week: '', target: 'الطلاب', req: 'مصافحات', head: 'رائد النشاط', support: 'الموجه الطلابي', indicator: 'مشاركة جميع الطلاب' },
      { name: 'الثقافة الإعلامية', term: '', week: '', target: 'الطلاب', req: 'نشرة', head: 'رائد النشاط', support: 'اللغة العربية', indicator: 'اشتراك 5% من الطلاب' },
    ]
  },
  {
    general: 'الاستثمار في الطلاب والمدارس الأولى بالرعاية',
    specific: 'توفير برامج دعم أكاديمي وتربوي مخصصة للطلاب ذوي الاحتياجات أو المتعثرين دراسياً',
    programs: [
      { name: 'تكريم المتفوقين و المتميزين', term: 'بداية كل فصل', week: 'بداية كل فصل', target: 'المتفوقون', req: 'حفل تكريم', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'نسبة المكرمين 20% من الطلاب' },
      { name: 'برنامج علاجي للطلاب الضعاف', term: 'بعد الاختبارات الدورية', week: 'بعد الاختبارات الدورية', target: 'الطلاب الضعاف', req: 'دروس تقوية', head: 'المعلمون', support: 'الموجه الطلابي', indicator: 'تحسن مستويات الطلاب بنسبة 30%' },
      { name: 'التهيئة الارشادية للاختبارات', term: 'بعد الاختبارات الدورية', week: 'بعد الاختبارات الدورية', target: 'الطلاب', req: 'نشرات تعريفية', head: 'وكيل المدرسة', support: 'الموجه الطلابي', indicator: 'ارتفاع تحصيل الطلاب بنسبة 20%' },
      { name: 'الاستعداد لاختبارات نافس', term: 'حصة أسبوعياً', week: 'حصة أسبوعياً', target: 'الطلاب', req: 'اختبارات محاكية', head: 'وكيل المدرسة', support: 'معلمو مواد نافس', indicator: 'ارتفاع مستوى الطلاب بنسبة 30%' },
    ]
  },
  {
    general: 'تحسين أداء المدارس، وتعزيز شراكتها مع المجتمع',
    specific: 'بناء جسور تواصل فعّالة مع أولياء الأمور والمؤسسات المجتمعية لدعم العملية التعليمية',
    programs: [
      { name: 'الاجتماع المدرسي', term: 'بداية كل فصل و نهايته', week: 'بداية كل فصل و نهايته', target: 'منسوبو المدرسة', req: 'لقاء', head: 'مدير المدرسة', support: 'اللجنة الإدارية', indicator: 'نسبة رضا المستفيدين' },
      { name: 'الشراكة المجتمعية', term: 'مستمر', week: 'مستمر', target: 'المجتمع المحلي', req: 'عقود شراكة', head: 'مسؤول الشراكة', support: 'لجنة التميز', indicator: 'عقد 3 شراكات مجتمعية' },
      { name: 'التطوع الطلابي', term: '', week: '', target: 'الطلاب', req: 'مبادرة تطوعية', head: 'رائد النشاط', support: 'الموجه الطلابي', indicator: 'مشاركة 60% من الطلاب' },
    ]
  },
  {
    general: 'رفع كفاءة الإنفاق وتعزيز الاستدامة المالية',
    specific: 'تطبيق آليات لترشيد استهلاك الموارد المدرسية مع ضمان استدامة الخدمات التعليمية',
    programs: [
      { name: 'تفعيل الصندوق المدرسي', term: 'مستمر', week: 'مستمر', target: 'فريق الصندوق', req: '', head: 'فريق الصندوق المدرسي', support: 'مدير المدرسة', indicator: 'ضبط الميزانية' },
      { name: 'ترشيد الطاقة و المياه', term: '', week: '', target: 'الطلاب', req: 'حملة توعية', head: 'رائد النشاط', support: 'الموجه الطلابي', indicator: 'استهداف جميع الطلاب' },
      { name: 'برنامج إعادة التدوير', term: '', week: '', target: 'الطلاب', req: 'ورشة عمل', head: 'رائد النشاط', support: 'معلمو المواد العلمية', indicator: 'مشاركة 30% من الطلاب' },
      { name: 'المدرسة الخضراء', term: '', week: '', target: 'الطلاب', req: 'حملة تشجير', head: 'رائد النشاط', support: 'المعلمون', indicator: 'زراعة 50 شتلة في المدرسة' },
    ]
  },
  {
    general: 'تطوير كفاءات الموارد البشرية وتعزيز الثقافة المؤسسية',
    specific: 'تنفيذ برامج تدريبية مستمرة للمعلمين والإداريين بما يرفع من أدائهم التربوي والمهني',
    programs: [
      { name: 'جديد منصة مدرستي', term: '', week: '', target: 'المعلمون', req: 'ورشة تدريبية', head: 'معلم متميز', support: 'وكيل المدرسة', indicator: 'إتقان المعلمين لأدوات المنصة' },
      { name: 'تفعيل الجدول الذكي', term: '1', week: '1', target: 'المعلمون', req: 'ورشة عمل', head: 'مسؤول نظام نور', support: 'لجنة التميز', indicator: '100% من المعلمين يستخدمون التطبيق' },
      { name: 'الرخصة المهنية', term: 'مستمر', week: 'مستمر', target: 'المعلمون', req: 'نشرة تعريفية', head: 'وكيل المدرسة', support: 'مدير المدرسة', indicator: 'حصول جميع المعلمين على الرخصة المهنية' },
      { name: 'اليوم العالمي للتعليم', term: '', week: '', target: 'المعلمون', req: 'حفل تكريم', head: 'مدير المدرسة', support: 'وكيل المدرسة', indicator: 'تكريم المعلمين المتميزين' },
      { name: 'تبادل الزيارات', term: 'كل فصل', week: 'كل فصل', target: 'المعلمون', req: 'زيارات', head: 'مدير المدرسة', support: 'وكيل المدرسة', indicator: 'تبادل الخبرات بين المعلمين' },
      { name: 'البحث الإجرائي', term: 'كل فصل', week: 'كل فصل', target: 'المعلمون', req: 'بحث', head: 'المعلمون', support: 'مدير المدرسة', indicator: 'إعداد بحث كل فصل دراسي' },
    ]
  },
  {
    general: 'الارتقاء بمستوى التجربة الرقمية',
    specific: 'توظيف المنصات الرقمية في التعلم والتقويم لتعزيز تجربة تعليمية تفاعلية للطلاب',
    programs: [
      { name: 'زيارة للمكتبة العامة', term: '2', week: '2', target: 'الطلاب', req: 'زيارة خارجية', head: 'رائد النشاط', support: 'معلم لغتي', indicator: 'كتابة الطلاب تقرير عن الزيارة' },
      { name: 'اليوم العالمي للغة العربية', term: '2', week: '2', target: 'الطلاب', req: 'مسابقة', head: 'رائد النشاط', support: 'معلم لغتي', indicator: 'اشتراك 10% من الطلاب' },
      { name: 'مدن المستقبل', term: '', week: '', target: 'الطلاب', req: 'معرض مصور', head: 'رائد النشاط', support: 'المعلمون', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'تطبيقات STEM', term: '', week: '', target: 'الطلاب', req: 'عرض', head: 'معلم العلوم', support: 'رائد النشاط', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'الذكاء الاصطناعي', term: '', week: '', target: 'الطلاب', req: 'ورشة عمل', head: 'معلم الحاسب', support: 'رائد النشاط', indicator: 'اشتراك 10% من الطلاب' },
      { name: 'تفعيل أسبوع موهبة', term: '', week: '', target: 'الطلاب', req: 'مسابقات', head: 'منسق الموهوبين', support: 'رائد النشاط', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'تحدي انترنت الأشياء', term: '', week: '', target: 'الطلاب', req: 'مسابقة', head: 'معلم الحاسب', support: 'رائد النشاط', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'مهارات الرياضيات الذهنية', term: '', week: '', target: 'الطلاب', req: 'مسابقة', head: 'معلم الرياضيات', support: 'رائد النشاط', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'رواد فضاء المستقبل', term: '', week: '', target: 'الطلاب', req: 'عرض', head: 'معلم العلوم', support: 'رائد النشاط', indicator: 'مشاركة 10% من الطلاب' },
    ]
  },
  {
    general: 'تعزيز الحوكمة والالتزام وإدارة المخاطر',
    specific: 'وضع سياسات داخلية لمتابعة الالتزام بالأنظمة وتقليل المخاطر التشغيلية في المدرسة',
    programs: [
      { name: 'التصحيح الآلي', term: '2', week: '2', target: 'المعلمون', req: 'ورشة عمل', head: 'معلم متميز', support: 'لجنة التميز', indicator: 'استخدام 50% من المعلمين للتصحيح الآلي' },
      { name: 'تطبيق متابعة الطلاب', term: '1', week: '1', target: 'المعلمون', req: 'ورشة عمل', head: 'معلم متميز', support: 'لجنة التميز', indicator: 'استخدام 50% من المعلمين للتطبيق' },
      { name: 'تحليل نتائج الطلاب', term: 'بعد كل اختبار', week: 'بعد كل اختبار', target: 'المعلمون', req: 'تقرير', head: 'المعلمون', support: 'الموجه الطلابي', indicator: 'تحليل جميع الاختبارات' },
      { name: 'تقويم الأقران', term: '', week: '', target: 'الطلاب', req: 'حصة', head: 'المعلمون', support: 'وكيل المدرسة', indicator: 'تطبيق 10% من المعلمين للبرنامج' },
      { name: 'ملفات إنجاز الطلاب', term: 'مستمر', week: 'مستمر', target: 'الطلاب', req: 'ملف إنجاز', head: 'المعلمون', support: 'وكيل المدرسة', indicator: 'توفر 5 ملفات متميزة في كل صف' },
    ]
  },
]

// أهداف التعليم حسب المرحلة
const STAGE_GOALS: Record<string, string[]> = {
  'ابتدائية': [
    '١. غرس العقيدة الإسلامية الصحيحة في نفسية الطفل ورعايتها بتربية إسلامية متكاملة في خلقه وجسمه وعقله ولغته و انتمائه إلى أمة الإسلام',
    '٢. تدريب الطالب على إقامة الصلاة والأخذ بآداب السلوك والفضائل.',
    '٣. تنمية المهارات الأساسية المختلفة، وخاصة المهارة اللغوية، والمهارة العددية، والمهارات الحركية.',
    '٤. تزويد الطالب بالقدر المناسب من المعلومات في مختلف الموضوعات.',
    '٥. تعريف الطالب بنعم الله عليه في نفسه، و في بيئته الاجتماعية والجغرافية ليحسن استخدام النعم وينفع نفسه وبيئته.',
    '٦. تربية ذوقه البديعي وتعهد نشاطه الابتكاري، وتنمية تقدير العمل اليدوي لديه.',
    '٧. تنمية وعي الطالب ليدرك ما عليه من الواجبات وما له من الحقوق في حدود سنه وخصائص المرحلة التي يمر بها، وغرس حب وطنه والإخلاص لولاة أمره.',
    '٨. توليد الرغبة لدى الطالب في الازدياد من العلم النافع والعمل الصالح وتدريبه على الاستفادة من أوقات الفراغ.',
    '٩. إعداد الطالب لما يلي هذه المرحلة من مراحل حياته.',
  ],
  'متوسطة': [
    '١. تعميق الإيمان بالله وتربية الطالب على الإسلام عقيدةً وشريعةً وخُلُقاً.',
    '٢. تنمية الانتماء للوطن والولاء للقيادة والاعتزاز بالهوية الوطنية.',
    '٣. تطوير مهارات التفكير الناقد والإبداعي والبحث العلمي.',
    '٤. تنمية القدرات اللغوية والتواصلية باللغة العربية واللغات الأخرى.',
    '٥. تعزيز الصحة الجسدية والنفسية والاجتماعية للطالب.',
    '٦. تنمية المهارات الرياضية والعلمية والتقنية وتوظيفها في حل المشكلات.',
    '٧. بناء شخصية متوازنة قادرة على التعامل مع متغيرات العصر.',
    '٨. إعداد الطالب للمرحلة الثانوية وما بعدها من مراحل الحياة.',
  ],
  'ثانوية': [
    '١. ترسيخ منظومة القيم الإسلامية والوطنية وتعزيز الانتماء والهوية.',
    '٢. تأهيل الطالب للالتحاق بمؤسسات التعليم العالي وسوق العمل.',
    '٣. تنمية الاستقلالية الفكرية والقدرة على التحليل والاستنتاج والإبداع.',
    '٤. إتاحة الفرصة للتخصص في مسارات تتوافق مع ميول الطالب وقدراته.',
    '٥. تنمية مهارات القرن الحادي والعشرين: التفكير النقدي، التواصل، التعاون، الإبداع.',
    '٦. بناء الوعي بحقوق المواطنة وواجباتها وثقافة المشاركة المجتمعية.',
    '٧. تنمية روح ريادة الأعمال والابتكار والتميز المهني.',
    '٨. إعداد جيل واعٍ قادر على المساهمة في تحقيق رؤية المملكة 2030.',
  ]
}

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64, principalName } = await req.json()

    if (!pdfBase64 || !principalName) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'مفتاح API غير موجود' }, { status: 500 })

    async function callGemini(): Promise<string> {
      const delays = [6000, 12000, 20000]
      let lastErr = ''
      for (let i = 0; i <= delays.length; i++) {
        const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
              { text: PROMPT }
            ]}],
            generationConfig: { temperature: 0.3, maxOutputTokens: 8000, responseMimeType: 'application/json' }
          })
        })
        if (res.ok) {
          const d = await res.json()
          return d.candidates?.[0]?.content?.parts?.[0]?.text || ''
        }
        lastErr = await res.text()
        if ((res.status === 503 || res.status === 429) && i < delays.length) {
          await new Promise(r => setTimeout(r, delays[i]))
          continue
        }
        const errObj = JSON.parse(lastErr || '{}')
        const isDaily = lastErr?.includes('PerDay') || lastErr?.includes('limit: 20')
        if (isDaily) throw new Error('تم استنفاد الحصة اليومية من Gemini. يرجى المحاولة غداً أو التواصل مع الدعم الفني.')
        throw new Error(`Gemini error: ${lastErr}`)
      }
      throw new Error(`Gemini failed: ${lastErr}`)
    }

    const rawText = await callGemini()
    let aiData: any
    try {
      aiData = JSON.parse(rawText)
    } catch {
      try {
        // Try extracting JSON block
        const match = rawText.match(/\{[\s\S]*\}/)
        if (match) aiData = JSON.parse(match[0])
      } catch {}
      if (!aiData) {
        // Build minimal structure from partial response
        aiData = {
          school_info: { school_name: '', region: '', district: '', stage: 'ابتدائية' },
          swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
          main_issues: [],
          custom_programs: {}
        }
      }
    }

    const si = aiData.school_info || {}
    const info = {
      schoolName: si.school_name || 'المدرسة',
      principalName,
      region: si.region || '',
      district: si.district || '',
      stage: si.stage || 'ابتدائية'
    }

    const docxBuffer = await buildDocx(aiData, info)

    return new NextResponse(docxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="operational-plan.docx"`
      }
    })

  } catch (error: any) {
    console.error('Operational plan error:', error)
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 })
  }
}

async function buildDocx(aiData: any, info: any): Promise<ArrayBuffer> {
  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
    WidthType, BorderStyle, ShadingType, AlignmentType, PageOrientation,
    PageBreak, VerticalAlign, TableLayoutType
  } = await import('docx')

  const G = '1F5C2E'
  const GL = 'D9EAD3'
  const W = 'FFFFFF'
  const B = '000000'
  const GR = 'AAAAAA'
  const PW = 14400

  const BORD = {
    top: { style: BorderStyle.SINGLE, size: 4, color: GR },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: GR },
    left: { style: BorderStyle.SINGLE, size: 4, color: GR },
    right: { style: BorderStyle.SINGLE, size: 4, color: GR },
    insideH: { style: BorderStyle.SINGLE, size: 2, color: GR },
    insideV: { style: BorderStyle.SINGLE, size: 2, color: GR },
  }

  function tbl(rows: any[], w = PW) {
    return new Table({ width: { size: w, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: BORD, rows, visuallyRightToLeft: true })
  }
  function hC(t: string, w: number, cs = 1) {
    return new TableCell({ width: { size: w, type: WidthType.DXA }, columnSpan: cs, verticalAlign: VerticalAlign.CENTER, shading: { type: ShadingType.CLEAR, color: 'auto', fill: G }, children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: t, bold: true, color: W, size: 18, font: 'Times New Roman', rightToLeft: true })] })] })
  }
  function lC(t: string, w: number, cs = 1) {
    return new TableCell({ width: { size: w, type: WidthType.DXA }, columnSpan: cs, verticalAlign: VerticalAlign.CENTER, shading: { type: ShadingType.CLEAR, color: 'auto', fill: GL }, children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: t, bold: true, color: B, size: 18, font: 'Times New Roman', rightToLeft: true })] })] })
  }
  function dC(t: string, w: number, cs = 1, bold = false) {
    return new TableCell({ width: { size: w, type: WidthType.DXA }, columnSpan: cs, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: t || '', bold, color: B, size: 17, font: 'Times New Roman', rightToLeft: true })] })] })
  }
  function eC(w: number, cs = 1) { return dC('', w, cs) }
  function sp(after = 150) { return new Paragraph({ spacing: { after } }) }
  function pb() { return new Paragraph({ children: [new PageBreak()] }) }
  function ttl(t: string, size = 28) {
    return new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: t, bold: true, size, color: G, font: 'Times New Roman', rightToLeft: true })] })
  }
  function rtxt(t: string, bold = false, size = 20) {
    return new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: t, bold, size, font: 'Times New Roman', rightToLeft: true })] })
  }

  function progTable(programs: any[]) {
    const cols = [380, 2600, 750, 800, 1300, 1300, 1400, 1420, 4450]
    const hRow = new TableRow({ tableHeader: true, children: [
      hC('م', cols[0]), hC('اسم البرنامج', cols[1]), hC('الفصل', cols[2]),
      hC('الأسبوع', cols[3]), hC('المستهدفون', cols[4]), hC('أسلوب التنفيذ', cols[5]),
      hC('رئيس', cols[6]), hC('مساند', cols[7]), hC('مؤشر الإنجاز', cols[8]),
    ]})
    const dRows = programs.map((p: any, i: number) => new TableRow({ children: [
      dC(String(i + 1), cols[0]), dC(p.name, cols[1]), dC(p.term || '', cols[2]),
      dC(p.week || '', cols[3]), dC(p.target || '', cols[4]), dC(p.req || '', cols[5]),
      dC(p.head || '', cols[6]), dC(p.support || '', cols[7]), dC(p.indicator || '', cols[8]),
    ]}))
    return tbl([hRow, ...dRows])
  }

  function followTable(programs: any[]) {
    const cols = [380, 3400, 1200, 1200, 2000, 6220]
    const hRow = new TableRow({ tableHeader: true, children: [
      hC('م', cols[0]), hC('اسم البرنامج', cols[1]), hC('نعم', cols[2]),
      hC('لا', cols[3]), hC('تاريخ المتابعة', cols[4]), hC('إجراءات التحسين', cols[5]),
    ]})
    const dRows = programs.map((p: any, i: number) => new TableRow({ children: [
      dC(String(i + 1), cols[0]), dC(p.name, cols[1]), eC(cols[2]), eC(cols[3]), eC(cols[4]), eC(cols[5]),
    ]}))
    return tbl([hRow, ...dRows])
  }

  const swot = aiData.swot || {}
  const halfW = Math.floor(PW / 2)

  function swotCell(items: string[], w: number, fill: string) {
    return new TableCell({
      width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.TOP,
      shading: { type: ShadingType.CLEAR, color: 'auto', fill },
      children: (items || []).map((line: string) =>
        new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: `• ${line}`, color: B, size: 18, font: 'Times New Roman', rightToLeft: true })] })
      )
    })
  }

  const swotTbl = tbl([
    new TableRow({ children: [ hC('نقاط القوة', halfW), hC('الفرص', PW - halfW) ] }),
    new TableRow({ children: [ swotCell(swot.strengths || [], halfW, 'F0FFF4'), swotCell(swot.opportunities || [], PW - halfW, 'EFF6FF') ] }),
    new TableRow({ children: [ hC('نقاط الضعف', halfW), hC('التهديدات', PW - halfW) ] }),
    new TableRow({ children: [ swotCell(swot.weaknesses || [], halfW, 'FFF7F0'), swotCell(swot.threats || [], PW - halfW, 'FFF0F0') ] }),
  ])

  // Issues table
  const issues = aiData.main_issues || []
  const issuesTbl = tbl([
    new TableRow({ children: [ hC('أبرز القضايا الرئيسية', PW) ] }),
    ...issues.map((iss: string, i: number) => new TableRow({ children: [
      dC(`${i + 1}. ${iss}`, PW)
    ]}))
  ])

  // Members
  const mCols = [500, 4500, 3500, 2400, PW - 10900]
  const roles = ['مدير المدرسة','وكيل المدرسة','موجه طلابي','رائد النشاط','معلم','معلم','معلم','معلم','معلم']
  const positions = ['رئيساً','نائباً للرئيس','عضواً','عضواً','عضواً','عضواً','عضواً','عضواً','عضواً']
  const membersTbl = tbl([
    new TableRow({ tableHeader: true, children: [ hC('م', mCols[0]), hC('الاسم', mCols[1]), hC('الوظيفة', mCols[2]), hC('صفته', mCols[3]), hC('التوقيع', mCols[4]) ] }),
    ...[1,2,3,4,5,6,7,8,9].map((n: number, i: number) => new TableRow({ children: [ dC(String(n), mCols[0]), eC(mCols[1]), dC(roles[i], mCols[2]), dC(positions[i], mCols[3]), eC(mCols[4]) ] }))
  ])

  // Strategic goals table
  const stratCols = [500, PW - 4000 - 500, 3500, 500]
  const stratTbl = tbl([
    new TableRow({ tableHeader: true, children: [ hC('م', stratCols[0]), hC('الهدف العام', stratCols[1]), hC('الأهداف التشغيلية', stratCols[2]), hC('ر', stratCols[3]) ] }),
    ...FIXED_GOALS.map((g: any, i: number) => new TableRow({ children: [
      dC(String(i + 1), stratCols[0]),
      dC(g.general, stratCols[1], 1, true),
      dC(g.specific, stratCols[2]),
      dC(`${i + 1}-1`, stratCols[3]),
    ]}))
  ])

  // Goal sections
  const goalSections: any[] = []
  const customPrograms = aiData.custom_programs || {}

  FIXED_GOALS.forEach((goal: any, idx: number) => {
    const n = idx + 1
    const extraKey = `goal${n}_extra`
    const extra = (customPrograms[extraKey] || []).map((e: any) => ({
      name: e.name || '', term: '', week: '', target: 'المدرسة', req: '', head: 'مدير المدرسة', support: 'الوكيل', indicator: e.indicator || ''
    }))
    const allPrograms = [...goal.programs, ...extra]

    goalSections.push(
      pb(),
      ttl(`الهدف ${n}: ${goal.general}`),
      sp(80),
      tbl([
        new TableRow({ children: [ lC('الهدف العام', 2200), dC(goal.general, PW - 2200, 1, true) ] }),
        new TableRow({ children: [ lC('الهدف التفصيلي', 2200), dC(goal.specific, PW - 2200) ] }),
      ]),
      sp(100),
      progTable(allPrograms),
      sp(180),
      ttl('جدول متابعة البرامج', 24),
      sp(60),
      followTable(allPrograms),
    )
  })

  const signW = Math.floor(PW / 3)
  const stageGoals = STAGE_GOALS[info.stage] || STAGE_GOALS['ابتدائية']

  // Definitions table
  const defRows = [
    ['المجال', 'وهو الذي يتحقق فيه الهدف الاستراتيجي العام.'],
    ['الأهداف العامة', 'هي المقاصد او الغايات المستقبلية التي ترغب المدرسة الوصول اليها في المستقبل.'],
    ['الأهداف التفصيلية', 'اهداف فرعية ذكية تتفرع من الهدف العام، وقد تتعدد الأهداف التفصيلية تحت هدف عام واحد.'],
    ['البرامج', 'وسائل ومناشط تربوية تنفذ بطريقة مقصودة لتحقيق هدف تفصيلي فرعي.'],
    ['الزمن', 'تاريخ بداية ونهاية ومدة تنفيذ البرامج.'],
    ['المتطلبات', 'الموارد البشرية والمادية.'],
    ['الدعم الخارجي', 'جهات مساندة من القطاع الحكومي والخاص. تقدم خدمات محدودة وفق الأنظمة.'],
    ['الجهة الرئيسية', 'جهة محددة داخل المدرسة مسؤولة بشكل مباشرعن تنفيذ برنامج ما.'],
    ['الجهة المساندة', 'جهة مساندة ومساهمة للجهة الرئيسة و مسؤول مباشر في تنفيذ برنامج داخل المدرسة'],
    ['مؤشرات الإنجاز', 'هي أدوات كمية ونوعية تساهم في معرفة تحقيق البرامج لأهدافه.'],
  ]
  const defTbl = tbl([
    new TableRow({ tableHeader: true, children: [ hC('المصطلح', 3000), hC('التعريف', PW - 3000) ] }),
    ...defRows.map(([term, def]) => new TableRow({ children: [ lC(term, 3000), dC(def, PW - 3000) ] }))
  ])

  // Approval table
  const approvalTbl = tbl([
    new TableRow({ tableHeader: true, children: [ hC('م', 500), hC('الاسم', 4500), hC('الوظيفة', 3500), hC('الصفة', 2400), hC('التوقيع', PW - 10900) ] }),
    ...[1,2,3,4,5,6,7,8,9].map((n: number) => new TableRow({ children: [ dC(String(n), 500), eC(4500), eC(3500), eC(2400), eC(PW - 10900) ] }))
  ])

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Times New Roman', size: 20, rightToLeft: true }, paragraph: { alignment: AlignmentType.RIGHT } } } },
    sections: [{
      properties: { page: { size: { width: 16838, height: 11906 }, margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      children: [
        // === غلاف ===
        sp(300),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 80 }, children: [new TextRun({ text: 'المملكة العربية السعودية', bold: true, size: 26, font: 'Times New Roman', rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 80 }, children: [new TextRun({ text: 'وزارة التعليم', bold: true, size: 24, font: 'Times New Roman', rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 80 }, children: [new TextRun({ text: `${info.region} / ${info.district}`, bold: true, size: 22, font: 'Times New Roman', rightToLeft: true })] }),
        sp(200),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { before: 100, after: 400 }, children: [new TextRun({ text: `الخطة التشغيلية للعام الدراسي 1448هـ`, bold: true, size: 42, color: G, font: 'Times New Roman', rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 60 }, children: [new TextRun({ text: info.schoolName, bold: true, size: 30, font: 'Times New Roman', rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 60 }, children: [new TextRun({ text: 'مدير المدرسة', bold: true, size: 24, font: 'Times New Roman', rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 60 }, children: [new TextRun({ text: info.principalName, bold: true, size: 24, color: G, font: 'Times New Roman', rightToLeft: true })] }),

        // === مقدمة ===
        pb(),
        ttl('مـقـدمـة'),
        sp(100),
        rtxt('تُعد هذه الخطة التشغيلية بمثابة خارطة طريق شاملة للمدرسة و تأتي تجسيداً لرؤيتنا الطموحة ورسالتنا التربوية السامية التي تهدف إلى إعداد جيل واعٍ ومبتكر، و توفير بيئة تعليمية محفزة للتميز.'),
        rtxt('لقد تم بناء هذه الخطة بعناية فائقة، مستندة إلى تحليل دقيق للاحتياجات الحالية، و أفضل الممارسات التعليمية، وتطلعات جميع الأطراف المعنية و معايير التقويم المدرسي. إنها وثيقة حيوية توجه جهودنا المشتركة نحو تحقيق الأهداف الاستراتيجية للمدرسة، وتضمن التنسيق الفعال بين كافة الأقسام والبرامج.'),
        rtxt('تشمل هذه الخطة مجموعة متكاملة من البرامج والمبادرات التي تستهدف بشكل مباشر المحاور الأساسية للعملية التعليمية والتربوية، ونجاح هذه الخطة يعتمد على تكاتف الجهود، والالتزام المشترك، وروح التعاون التي تسود مجتمعنا المدرسي. نتطلع إلى عام دراسي ملئ بالإنجازات والتميز، نحو تحقيق الأهداف المنشودة في بناء جيل متعلم ومسؤول.'),

        // === معلومات عامة ===
        pb(),
        ttl('معلومات عامة عن المدرسة'),
        sp(80),
        tbl([
          new TableRow({ children: [ lC('اسم المدرسة', 2200), dC(info.schoolName, PW - 2200) ] }),
          new TableRow({ children: [ lC('مدير المدرسة', 2200), dC(info.principalName, 3500), lC('إدارة التعليم', 2500), dC(info.region, PW - 8200) ] }),
          new TableRow({ children: [ lC('نطاق التعليم', 2200), dC(info.district, 3500), lC('المرحلة', 2500), dC(info.stage, PW - 8200) ] }),
        ]),
        sp(200),
        ttl('الرؤية والرسالة والقيم'),
        sp(80),
        tbl([
          new TableRow({ children: [ lC('الرؤية', 1800), dC('أن نكون بيئة تعليمية رائدة ومستدامة، تخرج جيلاً واعياً ومبتكراً، قادراً على الإسهام بفاعلية في بناء مجتمعه ومواجهة تحديات المستقبل بثقة وكفاءة.', PW - 1800) ] }),
          new TableRow({ children: [ lC('الرسالة', 1800), dC('توفير تعليم نوعي ومحفز للتميز والإبداع، من خلال منهج دراسي متطور، وبيئة مدرسية آمنة وداعمة، وكادر تعليمي وإداري مؤهل ومُلهم. نسعى لتعزيز الشراكة المجتمعية الفاعلة، لتمكين طلابنا من تحقيق أقصى إمكاناتهم الأكاديمية والشخصية، وغرس القيم الإيجابية التي تؤهلهم ليكونوا مواطنين صالحين ومنتجين.', PW - 1800) ] }),
          new TableRow({ children: [ lC('القيم', 1800), dC('التميز - التعاون - الابتكار - المسؤولية - الاحترام - التعلم المستمر - الشفافية', PW - 1800) ] }),
        ]),

        // === الأهداف الاستراتيجية ===
        pb(),
        ttl('الأهداف الاستراتيجية للتعليم'),
        sp(100),
        ...([
          '١. ضمان وصول التعليم للجميع.',
          '٢. تطوير بيئة مدرسية آمنة و ابتكارية.',
          '٣. تعزيز القيم والهوية الوطنية.',
          '٤. تحسين تجربة المستفيدين.',
          '٥. الاستثمار في الطلاب والمدارس الأولى بالرعاية.',
          '٦. تحسين أداء المدارس، وتعزيز شراكتها مع المجتمع.',
          '٧. رفع كفاءة الإنفاق وتعزيز الاستدامة المالية.',
          '٨. تطوير كفاءات الموارد البشرية وتعزيز الثقافة المؤسسية.',
          '٩. الارتقاء بمستوى التجربة الرقمية.',
          '١٠. تعزيز الحوكمة والالتزام وإدارة المخاطر.',
        ].map(t => rtxt(t))),

        // === أهداف المرحلة ===
        pb(),
        ttl(`أهداف التعليم في المرحلة ${info.stage}`),
        sp(100),
        ...(stageGoals.map((t: string) => rtxt(t))),

        // === لجنة التميز ===
        pb(),
        ttl('لجنة التميز'),
        sp(100),
        rtxt('تعتبر لجنة التميز في المدرسة المحرك الأساسي والدماغ المخطط للارتقاء بالأداء المؤسسي والتعليمي. تتشكل هذه اللجنة من كفاءات قيادية وتربوية لديها رؤية عميقة للتحسين المستمر، وتسعى جاهدة لتعزيز ثقافة الإبداع والجودة في كافة مفاصل العمل المدرسي.', false),
        rtxt('يتجلى الدور المحوري للجنة التميز في قيادتها لعملية إعداد وصياغة الخطة التشغيلية للمدرسة. فمن خلال منهجية تشاركية ومستنيرة، تقوم اللجنة بتحليل معمق لواقع المدرسة، واستشراف للمستقبل، وتحديد لأولويات العمل بناءً على أحدث الممارسات التربوية وأهداف وزارة التعليم.', false),
        sp(100),
        ttl('أعضاء لجنة التميز'),
        sp(80),
        membersTbl,

        // === مصادر الخطة ===
        pb(),
        ttl('مصادر الخطة'),
        sp(100),
        tbl([
          ...([
            'الدليل الإجرائي والدليل التنظيمي لمدارس التعليم العام',
            'الأهداف العامة والسياسات لوزارة التعليم',
            'رؤية المملكة 2030',
            'البرامج المركزية لوحدة تطوير المدارس',
            'البرامج والمشروعات الوزارية المعتمد تطبيقها في الميدان',
            'البرامج والمشروعات المركزية على مستوى الإدارة العامة للتعليم',
            'دليل الخطط الدراسية',
            'تقرير أداء المدرسة في التقويم المدرسي الذاتي و الخارجي',
            'الخطة التشغيلية للمدرسة للعام السابق',
          ].map((src, i) => new TableRow({ children: [ lC(String(i + 1), 1000), dC(src, PW - 1000) ] })))
        ]),

        // === تحليل البيئة ===
        pb(),
        ttl('تحليل البيئة الداخلية و الخارجية'),
        sp(100),
        rtxt('تمكن أهمية تحليل البيئة الداخلية و الخارجية في معرفة الموقف الحقيقي للمدرسة والإستراتيجيات العامة التي يمكن اتخاذها انسجاماً بين نقاط القوة والضعف لها، والفرص والتهديدات التي تواجهها، و قد تمت عملية التحليل الاستراتيجي باستخدام مصفوفة SWOT'),
        sp(100),
        ttl('تشخيص واقع المدرسة'),
        sp(80),
        swotTbl,

        // === القضايا الرئيسية ===
        pb(),
        ttl('أبرز القضايا الرئيسية'),
        sp(80),
        issuesTbl,

        // === مراعاة مجالات التقويم ===
        pb(),
        ttl('تم مراعاة مجالات التقويم المدرسي عند وضع الخطة التشغيلية'),
        sp(100),
        rtxt('لقد أتاحت لنا نتائج التحليل فهماً معمقاً لوضع المدرسة الحالي، ومكامن قوتها التي يجب تعزيزها، ومجالات الضعف التي تتطلب المعالجة، وكذلك الفرص المتاحة التي يمكن استثمارها، والتحديات المحتملة التي ينبغي الاستعداد لها. وبناءً على هذه الرؤية الشاملة والمستنيرة، تم استخلاص وتحديد الأهداف العامة للخطة التشغيلية وفقاً لمجالات التقويم المدرسي المعتمدة، و سنعمل بكفاءة وفعالية لمعالجة التحديات واستثمار الإمكانات المتاحة لتحقيق أقصى درجات التميز في بيئتنا التعليمية.'),

        // === التعريفات ===
        pb(),
        ttl('تعريفات'),
        sp(80),
        defTbl,

        // === الأهداف العامة والتفصيلية ===
        pb(),
        ttl('الأهداف العامة و التفصيلية للخطة التشغيلية'),
        sp(80),
        stratTbl,

        // === أقسام الأهداف مع البرامج والمتابعة ===
        ...goalSections,

        // === اللجنة الإدارية ===
        pb(),
        ttl('اللجنة الإدارية'),
        sp(100),
        rtxt('تتولى اللجنة الإدارية بالمدرسة دوراً محورياً وحيوياً في هذه المرحلة، بصفتها الجهة المسؤولة عن الإشراف المباشر على تنفيذ كافة البرامج والمبادرات الواردة في الخطة التشغيلية. يمتد دور اللجنة ليشمل التوجيه، التنسيق، تقييم الأداء المرحلي، وتذليل العقبات التي قد تعترض سير العمل. وتعمل اللجنة على ضمان أن كل برنامج يتم تنفيذه وفقاً للجداول الزمنية المحددة، وبالموارد المخصصة، وبما يحقق النتائج المرجوة.'),
        sp(100),
        ttl('أعضاء اللجنة الإدارية'),
        sp(80),
        tbl([
          new TableRow({ tableHeader: true, children: [ hC('م', 500), hC('الاسم', 4500), hC('العمل', 3500), hC('الصفة', 2400), hC('التوقيع', PW - 10900) ] }),
          ...(['مدير المدرسة','وكيل المدرسة','الموجه الطلابي','رائد النشاط','معلم','معلم','معلم','مساعد إداري'].map((r, i) => new TableRow({ children: [
            dC(String(i + 1), 500), eC(4500), dC(r, 3500),
            dC(i === 0 ? 'رئيساً' : i === 1 ? 'نائب الرئيس' : i === 7 ? 'مقرراً' : 'عضواً', 2400), eC(PW - 10900)
          ]})))
        ]),

        // === الاعتماد ===
        pb(),
        ttl('فريق إعداد الخطة التشغيلية'),
        sp(80),
        approvalTbl,
        sp(200),
        tbl([
          new TableRow({ children: [ hC('يعتمد مدير المدرسة', PW, 3) ] }),
          new TableRow({ children: [ lC('الاسم', signW), lC('التوقيع', signW), lC('التاريخ', PW - signW * 2) ] }),
          new TableRow({ children: [ dC(info.principalName, signW), eC(signW), eC(PW - signW * 2) ] }),
        ]),
        sp(200),

        // === الختام ===
        pb(),
        ttl('في الختام'),
        sp(100),
        rtxt(`في ختام هذا السجل الشامل للخطة التشغيلية للمدرسة للعام الدراسي 1448هـ ، نؤكد أن هذه الوثيقة ليست مجرد مجموعة من البرامج والأهداف، بل هي تجسيد لرؤيتنا الطموحة والتزامنا الراسخ بتحقيق التميز في كل جانب من جوانب العملية التعليمية والتربوية.`),
        rtxt('لقد سعت هذه الخطة، بكافة محاورها ومبادراتها، إلى بناء بيئة مدرسية محفزة للتعلم والإبداع، وتنمية شاملة لشخصية الطالب، وتمكين الكادر التعليمي والإداري، وتعزيز الشراكة الفاعلة مع المجتمع المحلي.'),
        rtxt('إن النجاح في تنفيذ هذه الخطة يعتمد بشكل كبير على تكاتف جهود الجميع، من قيادة مدرسية ومعلمين وطلاب وأولياء أمور وشركاء مجتمع. وبتعاوننا وتفانينا، سنسعى جاهدين لتحويل كل هدف إلى إنجاز ملموس، وكل مبادرة إلى قصة نجاح تضاف إلى مسيرة مدرستنا الحافلة.'),
        rtxt('نتطلع إلى عام دراسي مثمر ومليء بالإنجازات، يرسخ مكانتنا كصرح تعليمي رائد، يسهم بفاعلية في بناء جيل واعٍ ومسؤول ومستقبل مشرق لوطننا الغالي.'),
        sp(200),
        new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: 'والله ولي التوفيق', bold: true, size: 32, color: G, font: 'Times New Roman', rightToLeft: true })] }),
      ]
    }]
  })

  const buf = await Packer.toBuffer(doc)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}
