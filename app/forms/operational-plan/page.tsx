'use client'
import { useState, useEffect } from 'react'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'

const NAVY = '#0B1F3A'
const GREEN = '#1F5C2E'
const CREAM = '#FBF8F2'

const GREEN_DARK = '1F5C2E'
const GREEN_LIGHT = 'D9EAD3'
const WHITE = 'FFFFFF'
const BLACK = '000000'
const GRAY = 'AAAAAA'
const PW = 14400

// ===== البرامج الثابتة =====
const FIXED_GOALS = [
  {
    general: 'ضمان وصول التعليم لجميع',
    specific: 'وضع خطط استيعابية تضمن تعليم جميع الطلاب بكفاءة و دون تمييز',
    programs: [
      { name: 'إعداد الخطة التشغيلية', term: '1', week: 'الأول', target: 'لجنة التميز', req: 'ورشة عمل', head: 'لجنة التميز', support: 'مدير المدرسة', indicator: 'إعداد الخطة بنسبة 100%' },
      { name: 'إعداد خطة النشاط الطلابي', term: '1', week: 'الأول', target: 'رائد النشاط', req: 'ورشة عمل', head: 'رائد النشاط', support: 'وكيل المدرسة', indicator: 'تنفيذ 70% من البرامج' },
      { name: 'إعداد خطة التوجيه الطلابي', term: '1', week: 'الأول', target: 'الموجه الطلابي', req: 'ورشة عمل', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'تنفيذ 70% من البرامج' },
      { name: 'إعداد خطة التطوير المهني', term: '1', week: 'الأول', target: 'اللجنة الإدارية', req: 'ورشة عمل', head: 'اللجنة الإدارية', support: 'مدير المدرسة', indicator: 'التحاق 50% من المعلمين ببرامج تدريبية' },
      { name: 'إعداد خطة مجتمعات التعلم المهنية', term: '1', week: 'الأول', target: 'المعلمون', req: 'ورشة عمل', head: 'المشرف الأكاديمي', support: 'وكيل المدرسة', indicator: 'تشكيل 4 مجتمعات تعلم مهني' },
      { name: 'إعداد خطة تحسين التقويم المدرسي', term: '2', week: 'مستمر', target: 'فريق التقويم', req: 'ورشة عمل', head: 'فريق التقويم', support: 'مدير المدرسة', indicator: 'إعداد الخطة بنسبة 100%' },
      { name: 'إعداد خطة رعاية الموهوبين', term: '2', week: 'مستمر', target: 'الطلاب الموهوبون', req: 'اجتماع تخطيطي', head: 'منسق الموهوبين', support: 'رائد النشاط', indicator: 'رعاية 10% من الطلاب' },
      { name: 'اليوم العالمي لذوي الإعاقة', term: '', week: '', target: 'جميع الطلاب', req: 'نشرات توعوية', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'تحسين نظرة الطلاب لذوي الإعاقة' },
    ]
  },
  {
    general: 'تطوير بيئة مدرسية آمنة و ابتكارية',
    specific: 'تهيئة الفصول والمرافق المدرسية بوسائل تعليمية مبتكرة مع الالتزام بمعايير الأمن والسلامة',
    programs: [
      { name: 'المبنى المدرسي', term: 'مستمر', week: 'مستمر', target: 'المبنى المدرسي', req: 'عقد صيانة', head: 'وكيل المدرسة', support: 'إدارة الصيانة', indicator: 'سلامة المبنى المدرسي' },
      { name: 'الفصول الدراسية', term: 'مستمر', week: 'مستمر', target: 'جميع الفصول', req: 'طلبات تجهيز', head: 'مدير المدرسة', support: 'إدارة التجهيزات', indicator: 'تجهيز الفصول الدراسية' },
      { name: 'النظافة', term: 'مستمر', week: 'مستمر', target: 'المبنى كاملاً', req: 'عقد نظافة', head: 'وكيل المدرسة', support: 'إدارة الصيانة', indicator: 'تحسن مستوى النظافة اليومية' },
      { name: 'أنا مسؤول', term: '1-2', week: 'بداية الفصل', target: 'جميع الطلاب', req: 'عروض تعريفية', head: 'وكيل المدرسة', support: 'الموجه الطلابي', indicator: 'المحافظة على الممتلكات' },
      { name: 'حصر الحالات الصحية', term: '1-2', week: 'بداية الفصل', target: 'جميع الطلاب', req: 'كشف صحي', head: 'الموجه الصحي', support: 'المركز الصحي', indicator: 'حصر 100% من الحالات' },
      { name: 'السلامة المرورية', term: '1-2', week: '2', target: 'جميع الطلاب', req: 'نشرات تعريفية', head: 'رائد النشاط', support: 'الموجه الطلابي', indicator: 'رفع الالتزام إلى 90%' },
      { name: 'خطة الإخلاء', term: '1-2', week: 'مرة كل فصل', target: 'منسوبو المدرسة', req: 'تطبيق عملي', head: 'وكيل المدرسة', support: 'مسؤول الأمن والسلامة', indicator: 'إخلاء كامل في وقت قياسي' },
      { name: 'سلامة طفايات الحريق', term: '1-2', week: 'مرة كل فصل', target: 'طفايات الحريق', req: 'فحص', head: 'وكيل المدرسة', support: 'الأمن و السلامة', indicator: 'التأكد من سلامة جميع الطفايات' },
      { name: 'أجمل فصل', term: '1-2', week: '2', target: 'جميع الطلاب', req: 'مسابقة', head: 'رائد النشاط', support: 'وكيل المدرسة', indicator: 'تجميل جميع الفصول' },
    ]
  },
  {
    general: 'تعزيز القيم والهوية الوطنية',
    specific: 'دمج القيم الإسلامية والهوية الوطنية في الأنشطة الصفية واللاصفية',
    programs: [
      { name: 'ميثاق مهنة التعليم', term: '1', week: '1', target: 'جميع المعلمين', req: 'لقاء رسمي', head: 'اللجنة الإدارية', support: 'مدير المدرسة', indicator: 'توقيع 100% من المعلمين' },
      { name: 'تعزيز السلوك الإيجابي', term: '1-2', week: 'مستمر', target: 'جميع الطلاب', req: 'إذاعة مدرسية', head: 'الموجه الطلابي', support: 'المعلمون', indicator: 'ارتفاع الالتزام إلى 90%' },
      { name: 'التوعية بقواعد السلوك والمواظبة', term: '1-2', week: 'مستمر', target: 'جميع الطلاب', req: 'محاضرات توعوية', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'ارتفاع الالتزام إلى 90%' },
      { name: 'تنمية المهارات النفسية', term: '1-2', week: 'مستمر', target: 'جميع الطلاب', req: 'إذاعة مدرسية', head: 'الموجه الطلابي', support: 'المعلمون', indicator: 'تحسن ملحوظ في السلوك' },
      { name: 'اليوم الوطني', term: '', week: '', target: 'جميع الطلاب', req: 'فعاليات متنوعة', head: 'رائد النشاط', support: 'المعلمون', indicator: 'مشاركة 40% من الطلاب' },
      { name: 'يوم التأسيس', term: '', week: '', target: 'جميع الطلاب', req: 'فعاليات متنوعة', head: 'رائد النشاط', support: 'المعلمون', indicator: 'مشاركة 40% من الطلاب' },
      { name: 'يوم العلم', term: '', week: '', target: 'جميع الطلاب', req: 'فعاليات متنوعة', head: 'رائد النشاط', support: 'المعلمون', indicator: 'مشاركة 40% من الطلاب' },
      { name: 'البرنامج الإرشادي التهيئي', term: '1', week: 'الأول', target: 'جميع الطلاب', req: 'فعاليات تهيئة', head: 'لجنة الأسبوع التمهيدي', support: 'وكيل المدرسة', indicator: 'رفع دافعية الطلاب' },
      { name: 'وطني في قلبي', term: '', week: '', target: 'الصفوف العليا', req: 'فعاليات ثقافية', head: 'رائد النشاط', support: 'المعلمون', indicator: 'مشاركة 40% من الطلاب' },
    ]
  },
  {
    general: 'تحسين تجربة المستفيدين',
    specific: 'تطوير قنوات التواصل مع أولياء الأمور والطلاب لضمان رضاهم عن الخدمات التعليمية',
    programs: [
      { name: 'المجلس الطلابي', term: 'كل فصل', week: 'كل فصل', target: 'أعضاء المجلس', req: 'اجتماع رسمي', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'تنفيذ توصيات المجلس' },
      { name: 'لقاءات أولياء الأمور (مجالس الآباء)', term: 'بعد الاختبارات', week: 'بعد الاختبارات', target: 'أولياء الأمور', req: 'دعوة رسمية', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'مشاركة 50% من أولياء الأمور' },
      { name: 'يوم التسامح العالمي', term: '', week: '', target: 'جميع الطلاب', req: 'فعاليات مصافحة', head: 'رائد النشاط', support: 'الموجه الطلابي', indicator: 'مشاركة جميع الطلاب' },
      { name: 'الثقافة الإعلامية للطلاب', term: '', week: '', target: 'جميع الطلاب', req: 'نشرة ثقافية', head: 'رائد النشاط', support: 'معلم اللغة العربية', indicator: 'اشتراك 5% من الطلاب' },
    ]
  },
  {
    general: 'الاستثمار في الطلاب والمدارس الأولى بالرعاية',
    specific: 'توفير برامج دعم أكاديمي وتربوي للطلاب ذوي الاحتياجات والمتعثرين دراسياً',
    programs: [
      { name: 'تكريم المتفوقين والمتميزين', term: 'بداية كل فصل', week: 'بداية كل فصل', target: 'الطلاب المتفوقون', req: 'حفل تكريم', head: 'الموجه الطلابي', support: 'وكيل المدرسة', indicator: 'تكريم 20% من الطلاب' },
      { name: 'برنامج علاجي للمتعثرين', term: 'بعد الاختبارات', week: 'بعد الاختبارات', target: 'الطلاب الضعاف', req: 'دروس تقوية', head: 'المعلمون', support: 'الموجه الطلابي', indicator: 'تحسن مستويات 30%' },
      { name: 'التهيئة الإرشادية للاختبارات', term: 'قبل الاختبارات', week: 'قبل الاختبارات', target: 'جميع الطلاب', req: 'نشرات إرشادية', head: 'وكيل المدرسة', support: 'الموجه الطلابي', indicator: 'ارتفاع تحصيل الطلاب' },
      { name: 'الاستعداد لاختبارات نافس', term: 'أسبوعياً', week: 'أسبوعياً', target: 'جميع الطلاب', req: 'اختبارات محاكاة', head: 'وكيل المدرسة', support: 'معلمو المواد', indicator: 'ارتفاع مستوى الطلاب 30%' },
    ]
  },
  {
    general: 'تحسين أداء المدارس وتعزيز شراكتها مع المجتمع',
    specific: 'بناء جسور تواصل فعّالة مع أولياء الأمور والمؤسسات المجتمعية لدعم العملية التعليمية',
    programs: [
      { name: 'الاجتماع المدرسي الدوري', term: 'بداية ونهاية الفصل', week: 'بداية ونهاية الفصل', target: 'منسوبو المدرسة', req: 'لقاء إداري', head: 'مدير المدرسة', support: 'اللجنة الإدارية', indicator: 'رضا المستفيدين' },
      { name: 'الشراكة المجتمعية الفاعلة', term: 'مستمر', week: 'مستمر', target: 'المجتمع المحلي', req: 'عقود شراكة', head: 'مسؤول الشراكة', support: 'لجنة التميز', indicator: 'عقد 3 شراكات مجتمعية' },
      { name: 'برنامج التطوع الطلابي', term: '', week: '', target: 'جميع الطلاب', req: 'مبادرة تطوعية', head: 'رائد النشاط', support: 'الموجه الطلابي', indicator: 'مشاركة 60% من الطلاب' },
    ]
  },
  {
    general: 'رفع كفاءة الإنفاق وتعزيز الاستدامة المالية',
    specific: 'تطبيق آليات لترشيد استهلاك الموارد المدرسية مع ضمان استدامة الخدمات التعليمية',
    programs: [
      { name: 'تفعيل الصندوق المدرسي', term: 'مستمر', week: 'مستمر', target: 'فريق الصندوق', req: 'آليات مالية', head: 'فريق الصندوق', support: 'مدير المدرسة', indicator: 'ضبط الميزانية المدرسية' },
      { name: 'ترشيد استهلاك الطاقة والمياه', term: '', week: '', target: 'جميع الطلاب', req: 'حملة توعية', head: 'رائد النشاط', support: 'الموجه الطلابي', indicator: 'تقليص الفاقد 20%' },
      { name: 'برنامج إعادة التدوير', term: '', week: '', target: 'جميع الطلاب', req: 'ورشة عمل تطبيقية', head: 'رائد النشاط', support: 'معلمو العلوم', indicator: 'مشاركة 30% من الطلاب' },
      { name: 'المدرسة الخضراء', term: '', week: '', target: 'جميع الطلاب', req: 'حملة تشجير', head: 'رائد النشاط', support: 'المعلمون', indicator: 'زراعة 50 شتلة في المدرسة' },
    ]
  },
  {
    general: 'تطوير كفاءات الكادر البشري وتعزيز ثقافة التميز المؤسسي',
    specific: 'تنفيذ برامج تدريبية مستمرة ترفع الأداء التربوي والمهني للمعلمين والإداريين',
    programs: [
      { name: 'التدريب على منصة مدرستي', term: '', week: '', target: 'جميع المعلمين', req: 'ورشة تدريبية', head: 'معلم متميز', support: 'وكيل المدرسة', indicator: 'إتقان 100% من المعلمين للمنصة' },
      { name: 'تفعيل الجدول الذكي', term: '1', week: '1', target: 'جميع المعلمين', req: 'ورشة عمل', head: 'مسؤول نظام نور', support: 'لجنة التميز', indicator: '100% من المعلمين يستخدمون التطبيق' },
      { name: 'الرخصة المهنية للمعلم', term: 'مستمر', week: 'مستمر', target: 'جميع المعلمين', req: 'نشرة إرشادية', head: 'وكيل المدرسة', support: 'مدير المدرسة', indicator: 'حصول جميع المعلمين على الرخصة' },
      { name: 'يوم التعليم العالمي', term: '', week: '', target: 'جميع المعلمين', req: 'حفل تكريم', head: 'مدير المدرسة', support: 'وكيل المدرسة', indicator: 'تكريم المعلمين المتميزين' },
      { name: 'تبادل الزيارات التربوية', term: 'كل فصل', week: 'كل فصل', target: 'جميع المعلمين', req: 'برنامج زيارات', head: 'مدير المدرسة', support: 'وكيل المدرسة', indicator: 'تبادل الخبرات بين المعلمين' },
      { name: 'البحث الإجرائي الميداني', term: 'كل فصل', week: 'كل فصل', target: 'جميع المعلمين', req: 'توجيه بحثي', head: 'المعلمون', support: 'مدير المدرسة', indicator: 'إعداد بحث لكل فصل دراسي' },
    ]
  },
  {
    general: 'الارتقاء بمستوى التجربة الرقمية',
    specific: 'توظيف المنصات الرقمية في التعلم والتقويم لتعزيز تجربة تعليمية تفاعلية للطلاب',
    programs: [
      { name: 'زيارة المكتبة العامة', term: '2', week: '2', target: 'جميع الطلاب', req: 'زيارة ميدانية', head: 'رائد النشاط', support: 'معلم اللغة', indicator: 'كتابة تقرير عن الزيارة' },
      { name: 'اليوم العالمي للغة العربية', term: '2', week: '2', target: 'جميع الطلاب', req: 'مسابقات لغوية', head: 'رائد النشاط', support: 'معلم اللغة', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'مدن المستقبل', term: '', week: '', target: 'جميع الطلاب', req: 'معرض مصور', head: 'رائد النشاط', support: 'المعلمون', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'تطبيقات STEM', term: '', week: '', target: 'جميع الطلاب', req: 'عرض تطبيقي', head: 'معلم العلوم', support: 'رائد النشاط', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'الذكاء الاصطناعي في التعليم', term: '', week: '', target: 'جميع الطلاب', req: 'ورشة عمل', head: 'معلم الحاسب', support: 'رائد النشاط', indicator: 'اشتراك 10% من الطلاب' },
      { name: 'أسبوع الموهبة والابتكار', term: '', week: '', target: 'جميع الطلاب', req: 'مسابقات إبداعية', head: 'منسق الموهوبين', support: 'رائد النشاط', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'تحدي إنترنت الأشياء', term: '', week: '', target: 'جميع الطلاب', req: 'مسابقة تقنية', head: 'معلم الحاسب', support: 'رائد النشاط', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'مهارات الرياضيات الذهنية', term: '', week: '', target: 'جميع الطلاب', req: 'مسابقة رياضية', head: 'معلم الرياضيات', support: 'رائد النشاط', indicator: 'مشاركة 10% من الطلاب' },
      { name: 'رواد فضاء المستقبل', term: '', week: '', target: 'جميع الطلاب', req: 'عرض علمي', head: 'معلم العلوم', support: 'رائد النشاط', indicator: 'مشاركة 10% من الطلاب' },
    ]
  },
  {
    general: 'تعزيز الحوكمة والالتزام وإدارة المخاطر',
    specific: 'وضع سياسات داخلية لمتابعة الالتزام بالأنظمة وتقليل المخاطر التشغيلية في المدرسة',
    programs: [
      { name: 'التصحيح الآلي لأعمال الطلاب', term: '2', week: '2', target: 'جميع المعلمين', req: 'ورشة عمل', head: 'معلم متميز', support: 'لجنة التميز', indicator: 'استخدام 50% من المعلمين للتصحيح الآلي' },
      { name: 'تطبيق متابعة الطلاب رقمياً', term: '1', week: '1', target: 'جميع المعلمين', req: 'ورشة عمل', head: 'معلم متميز', support: 'لجنة التميز', indicator: 'استخدام 50% من المعلمين للتطبيق' },
      { name: 'تحليل نتائج الطلاب دورياً', term: 'بعد كل اختبار', week: 'بعد كل اختبار', target: 'جميع المعلمين', req: 'تقرير تحليلي', head: 'المعلمون', support: 'الموجه الطلابي', indicator: 'تحليل جميع الاختبارات' },
      { name: 'تقويم الأقران بين الطلاب', term: '', week: '', target: 'جميع الطلاب', req: 'حصة تطبيقية', head: 'المعلمون', support: 'وكيل المدرسة', indicator: 'تطبيق 10% من المعلمين للبرنامج' },
      { name: 'ملفات إنجاز الطلاب', term: 'مستمر', week: 'مستمر', target: 'جميع الطلاب', req: 'ملف إنجاز', head: 'المعلمون', support: 'وكيل المدرسة', indicator: '5 ملفات متميزة في كل صف' },
    ]
  },
]

const STAGE_GOALS: Record<string, string[]> = {
  'ابتدائية': [
    '١. غرس العقيدة الإسلامية الصحيحة في نفسية الطفل ورعايتها بتربية إسلامية متكاملة في خلقه وجسمه وعقله ولغته وانتمائه إلى أمة الإسلام',
    '٢. تدريب الطالب على إقامة الصلاة والأخذ بآداب السلوك والفضائل.',
    '٣. تنمية المهارات الأساسية المختلفة، وخاصة المهارة اللغوية، والمهارة العددية، والمهارات الحركية.',
    '٤. تزويد الطالب بالقدر المناسب من المعلومات في مختلف الموضوعات.',
    '٥. تعريف الطالب بنعم الله عليه في نفسه، وفي بيئته الاجتماعية والجغرافية ليحسن استخدام النعم وينفع نفسه وبيئته.',
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

type Step = 'idle' | 'analyzing' | 'building' | 'done' | 'error'

export default function OperationalPlanPage() {
  const { school } = useSchool()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [principalName, setPrincipalName] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (school?.principal_name) setPrincipalName(school.principal_name)
  }, [school])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f?.type === 'application/pdf') { setPdfFile(f); setError('') }
    else setError('يرجى رفع ملف PDF فقط')
  }

  async function handleGenerate() {
    if (!pdfFile) { setError('يرجى رفع تقرير التقويم الخارجي PDF'); return }
    if (!principalName) { setError('يرجى إدخال اسم مدير المدرسة'); return }
    setStep('analyzing'); setError('')

    try {
      // Convert PDF to base64
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res((r.result as string).split(',')[1])
        r.onerror = () => rej(new Error('فشل قراءة الملف'))
        r.readAsDataURL(pdfFile)
      })

      // Call API - returns JSON only
      const response = await fetch('/api/generate-operational-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, principalName })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'خطأ غير معروف' }))
        throw new Error(err.error || 'فشل التحليل')
      }

      const aiData = await response.json()
      const si = aiData.school_info || {}

      const info = {
        schoolName: si.school_name || 'المدرسة',
        principalName,
        region: si.region || '',
        district: si.district || '',
        stage: si.stage || 'ابتدائية'
      }

      setStep('building')
      await buildDocxInBrowser(aiData, info)
      setStep('done')

    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
      setStep('error')
    }
  }

  async function buildDocxInBrowser(aiData: any, info: any) {
    const [
      { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
        WidthType, AlignmentType, BorderStyle, ShadingType, PageBreak, VerticalAlign,
        TableLayoutType },
      { saveAs }
    ] = await Promise.all([import('docx'), import('file-saver')])

    const B = { style: BorderStyle.SINGLE, size: 4, color: GRAY }
    const borders = { top: B, bottom: B, left: B, right: B, insideHorizontal: B, insideVertical: B }

    // ====== Helper functions ======
    function p(text: string, bold = false, size = 20, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER) {
      return new Paragraph({
        bidirectional: true,
        alignment: align,
        children: [new TextRun({ text: text || '', bold, size, font: 'Times New Roman', rightToLeft: true })]
      })
    }

    function pRight(text: string, bold = false, size = 20) {
      return p(text, bold, size, AlignmentType.RIGHT)
    }

    function pGreen(text: string, size = 26) {
      return new Paragraph({
        bidirectional: true,
        alignment: AlignmentType.CENTER,
        spacing: { before: 150, after: 100 },
        children: [new TextRun({ text, bold: true, size, color: GREEN_DARK, font: 'Times New Roman', rightToLeft: true })]
      })
    }

    function gap(n = 1) {
      return Array.from({ length: n }, () => new Paragraph({ children: [] }))
    }

    function pb() { return new Paragraph({ children: [new PageBreak()] }) }

    function hC(text: string, w: number, cs = 1) {
      return new TableCell({
        width: { size: w, type: WidthType.DXA }, columnSpan: cs,
        verticalAlign: VerticalAlign.CENTER,
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: GREEN_DARK },
        borders,
        children: [p(text, true, 18)]
      })
    }

    function lC(text: string, w: number, cs = 1) {
      return new TableCell({
        width: { size: w, type: WidthType.DXA }, columnSpan: cs,
        verticalAlign: VerticalAlign.CENTER,
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: GREEN_LIGHT },
        borders,
        children: [p(text, true, 18)]
      })
    }

    function dC(text: string, w: number, cs = 1, bold = false) {
      return new TableCell({
        width: { size: w, type: WidthType.DXA }, columnSpan: cs,
        verticalAlign: VerticalAlign.CENTER,
        borders,
        children: [p(text || '', bold, 17)]
      })
    }

    function eC(w: number, cs = 1) { return dC('', w, cs) }

    function tbl(rows: any[], w = PW) {
      return new Table({
        width: { size: w, type: WidthType.DXA },
        layout: TableLayoutType.FIXED,
        visuallyRightToLeft: true,
        rows
      })
    }

    function progTable(programs: any[]) {
      const cols = [380, 2600, 750, 800, 1300, 1300, 1400, 1420, 4450]
      return tbl([
        new TableRow({ tableHeader: true, children: [
          hC('م', cols[0]), hC('اسم البرنامج', cols[1]), hC('الفصل', cols[2]),
          hC('الأسبوع', cols[3]), hC('المستهدفون', cols[4]), hC('أسلوب التنفيذ', cols[5]),
          hC('رئيس', cols[6]), hC('مساند', cols[7]), hC('مؤشر الإنجاز', cols[8]),
        ]}),
        ...programs.map((prog: any, i: number) => new TableRow({ children: [
          dC(String(i + 1), cols[0]), dC(prog.name, cols[1]), dC(prog.term || '', cols[2]),
          dC(prog.week || '', cols[3]), dC(prog.target || '', cols[4]), dC(prog.req || '', cols[5]),
          dC(prog.head || '', cols[6]), dC(prog.support || '', cols[7]), dC(prog.indicator || '', cols[8]),
        ]}))
      ])
    }

    function followTable(programs: any[]) {
      const cols = [380, 3400, 1200, 1200, 2000, 6220]
      return tbl([
        new TableRow({ tableHeader: true, children: [
          hC('م', cols[0]), hC('اسم البرنامج', cols[1]), hC('نعم', cols[2]),
          hC('لا', cols[3]), hC('تاريخ المتابعة', cols[4]), hC('إجراءات التحسين', cols[5]),
        ]}),
        ...programs.map((prog: any, i: number) => new TableRow({ children: [
          dC(String(i + 1), cols[0]), dC(prog.name, cols[1]),
          eC(cols[2]), eC(cols[3]), eC(cols[4]), eC(cols[5]),
        ]}))
      ])
    }

    // ====== SWOT ======
    const swot = aiData.swot || {}
    const halfW = Math.floor(PW / 2)

    function swotCell(items: string[], w: number, fill: string) {
      return new TableCell({
        width: { size: w, type: WidthType.DXA },
        verticalAlign: VerticalAlign.TOP,
        shading: { type: ShadingType.CLEAR, color: 'auto', fill },
        borders,
        children: (items || []).length > 0
          ? (items || []).map((line: string) =>
              new Paragraph({
                bidirectional: true,
                alignment: AlignmentType.RIGHT,
                spacing: { before: 40, after: 40 },
                children: [new TextRun({ text: `• ${line}`, size: 18, font: 'Times New Roman', rightToLeft: true })]
              })
            )
          : [p('', false, 18)]
      })
    }

    const swotTbl = tbl([
      new TableRow({ children: [ hC('نقاط القوة', halfW), hC('الفرص', PW - halfW) ] }),
      new TableRow({ children: [ swotCell(swot.strengths || [], halfW, 'F0FFF4'), swotCell(swot.opportunities || [], PW - halfW, 'EFF6FF') ] }),
      new TableRow({ children: [ hC('نقاط الضعف', halfW), hC('التهديدات', PW - halfW) ] }),
      new TableRow({ children: [ swotCell(swot.weaknesses || [], halfW, 'FFF7F0'), swotCell(swot.threats || [], PW - halfW, 'FFF0F0') ] }),
    ])

    // ====== Issues ======
    const issues = aiData.main_issues || []
    const issuesTbl = tbl([
      new TableRow({ children: [ hC('أبرز القضايا الرئيسية', PW) ] }),
      ...issues.map((iss: string, i: number) => new TableRow({ children: [ dC(`${i + 1}. ${iss}`, PW) ] }))
    ])

    // ====== Members ======
    const mCols = [500, 4500, 3500, 2400, PW - 10900]
    const roles = ['مدير المدرسة','وكيل المدرسة','موجه طلابي','رائد النشاط','معلم','معلم','معلم','معلم','معلم']
    const positions = ['رئيساً','نائباً للرئيس','عضواً','عضواً','عضواً','عضواً','عضواً','عضواً','عضواً']

    const membersTbl = tbl([
      new TableRow({ tableHeader: true, children: [
        hC('م', mCols[0]), hC('الاسم', mCols[1]), hC('الوظيفة', mCols[2]),
        hC('صفته', mCols[3]), hC('التوقيع', mCols[4])
      ]}),
      ...[1,2,3,4,5,6,7,8,9].map((n: number, i: number) => new TableRow({ children: [
        dC(String(n), mCols[0]), eC(mCols[1]), dC(roles[i], mCols[2]), dC(positions[i], mCols[3]), eC(mCols[4])
      ]}))
    ])

    // ====== Definitions ======
    const defRows = [
      ['المجال', 'وهو الذي يتحقق فيه الهدف الاستراتيجي العام.'],
      ['الأهداف العامة', 'هي المقاصد او الغايات المستقبلية التي ترغب المدرسة الوصول اليها في المستقبل.'],
      ['الأهداف التفصيلية', 'اهداف فرعية ذكية تتفرع من الهدف العام، وقد تتعدد الأهداف التفصيلية تحت هدف عام واحد.'],
      ['البرامج', 'وسائل ومناشط تربوية تنفذ بطريقة مقصودة لتحقيق هدف تفصيلي فرعي.'],
      ['الزمن', 'تاريخ بداية ونهاية ومدة تنفيذ البرامج.'],
      ['المتطلبات', 'الموارد البشرية والمادية.'],
      ['الدعم الخارجي', 'جهات مساندة من القطاع الحكومي والخاص. تقدم خدمات محدودة وفق الأنظمة.'],
      ['الجهة الرئيسية', 'جهة محددة داخل المدرسة مسؤولة بشكل مباشر عن تنفيذ برنامج ما.'],
      ['الجهة المساندة', 'جهة مساندة ومساهمة للجهة الرئيسة ومسؤول مباشر في تنفيذ برنامج داخل المدرسة.'],
      ['مؤشرات الإنجاز', 'هي أدوات كمية ونوعية تساهم في معرفة تحقيق البرامج لأهدافه.'],
    ]

    const defTbl = tbl([
      new TableRow({ tableHeader: true, children: [ hC('المصطلح', 3000), hC('التعريف', PW - 3000) ] }),
      ...defRows.map(([term, def]) => new TableRow({ children: [ lC(term, 3000), dC(def, PW - 3000) ] }))
    ])

    // ====== Strategic goals table ======
    const stratTbl = tbl([
      new TableRow({ tableHeader: true, children: [
        hC('م', 500), hC('الهدف العام', PW - 4500 - 500), hC('الأهداف التشغيلية', 3500), hC('ر', 500)
      ]}),
      ...FIXED_GOALS.map((g, i) => new TableRow({ children: [
        dC(String(i + 1), 500),
        dC(g.general, PW - 4500 - 500, 1, true),
        dC(g.specific, 3500),
        dC(`${i + 1}-1`, 500),
      ]}))
    ])

    // ====== Goal sections ======
    const goalSections: any[] = []
    const customPrograms = aiData.custom_programs || {}
    const stageGoals = STAGE_GOALS[info.stage] || STAGE_GOALS['ابتدائية']
    const signW = Math.floor(PW / 3)

    FIXED_GOALS.forEach((goal, idx) => {
      const n = idx + 1
      const extra = (customPrograms[`goal${n}_extra`] || []).map((e: any) => ({
        name: e.name || '', term: '', week: '', target: 'المدرسة',
        req: '', head: 'مدير المدرسة', support: 'الوكيل', indicator: e.indicator || ''
      }))
      const allPrograms = [...goal.programs, ...extra]

      goalSections.push(
        pb(),
        pGreen(`الهدف ${n}: ${goal.general}`, 28),
        ...gap(),
        tbl([
          new TableRow({ children: [ lC('الهدف العام', 2200), dC(goal.general, PW - 2200, 1, true) ] }),
          new TableRow({ children: [ lC('الهدف التفصيلي', 2200), dC(goal.specific, PW - 2200) ] }),
        ]),
        ...gap(),
        progTable(allPrograms),
        ...gap(2),
        pGreen('جدول متابعة البرامج', 24),
        ...gap(),
        followTable(allPrograms),
      )
    })

    // ====== Build Document ======
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: 'Times New Roman', size: 20, rightToLeft: true },
            paragraph: { alignment: AlignmentType.RIGHT }
          }
        }
      },
      sections: [{
        properties: {
          page: {
            size: { width: 16838, height: 11906 },
            margin: { top: 720, bottom: 720, left: 720, right: 720 }
          }
        },
        children: [
          // === غلاف ===
          ...gap(2),
          p('المملكة العربية السعودية', true, 26),
          p('وزارة التعليم', true, 24),
          p(`${info.region} / ${info.district}`, true, 22),
          ...gap(2),
          pGreen(`الخطة التشغيلية للعام الدراسي 1448هـ`, 42),
          ...gap(),
          p(info.schoolName, true, 30),
          p('مدير المدرسة', true, 24),
          p(info.principalName, true, 24),

          // === مقدمة ===
          pb(),
          pGreen('مـقـدمـة'),
          ...gap(),
          pRight('تُعد هذه الخطة التشغيلية بمثابة خارطة طريق شاملة للمدرسة و تأتي تجسيداً لرؤيتنا الطموحة ورسالتنا التربوية السامية التي تهدف إلى إعداد جيل واعٍ ومبتكر، و توفير بيئة تعليمية محفزة للتميز.'),
          pRight('لقد تم بناء هذه الخطة بعناية فائقة، مستندة إلى تحليل دقيق للاحتياجات الحالية، و أفضل الممارسات التعليمية، وتطلعات جميع الأطراف المعنية و معايير التقويم المدرسي. إنها وثيقة حيوية توجه جهودنا المشتركة نحو تحقيق الأهداف الاستراتيجية للمدرسة، وتضمن التنسيق الفعال بين كافة الأقسام والبرامج.'),
          pRight('تشمل هذه الخطة مجموعة متكاملة من البرامج والمبادرات التي تستهدف بشكل مباشر المحاور الأساسية للعملية التعليمية والتربوية، ونجاح هذه الخطة يعتمد على تكاتف الجهود، والالتزام المشترك، وروح التعاون التي تسود مجتمعنا المدرسي. نتطلع إلى عام دراسي ملئ بالإنجازات والتميز.'),

          // === معلومات المدرسة ===
          pb(),
          pGreen('معلومات عامة عن المدرسة'),
          ...gap(),
          tbl([
            new TableRow({ children: [ lC('اسم المدرسة', 2200), dC(info.schoolName, PW - 2200) ] }),
            new TableRow({ children: [
              lC('مدير المدرسة', 2200), dC(info.principalName, 3500),
              lC('إدارة التعليم', 2500), dC(info.region, PW - 8200)
            ]}),
            new TableRow({ children: [
              lC('نطاق التعليم', 2200), dC(info.district, 3500),
              lC('المرحلة', 2500), dC(info.stage, PW - 8200)
            ]}),
          ]),
          ...gap(2),
          pGreen('الرؤية والرسالة والقيم'),
          ...gap(),
          tbl([
            new TableRow({ children: [ lC('الرؤية', 1800), dC('أن نكون بيئة تعليمية رائدة ومستدامة، تخرج جيلاً واعياً ومبتكراً، قادراً على الإسهام بفاعلية في بناء مجتمعه ومواجهة تحديات المستقبل بثقة وكفاءة.', PW - 1800) ] }),
            new TableRow({ children: [ lC('الرسالة', 1800), dC('توفير تعليم نوعي ومحفز للتميز والإبداع، من خلال منهج دراسي متطور، وبيئة مدرسية آمنة وداعمة، وكادر تعليمي مؤهل. نسعى لتعزيز الشراكة المجتمعية لتمكين طلابنا من تحقيق أقصى إمكاناتهم.', PW - 1800) ] }),
            new TableRow({ children: [ lC('القيم', 1800), dC('التميز - التعاون - الابتكار - المسؤولية - الاحترام - التعلم المستمر - الشفافية', PW - 1800) ] }),
          ]),

          // === الأهداف الاستراتيجية ===
          pb(),
          pGreen('الأهداف الاستراتيجية للتعليم'),
          ...gap(),
          ...[
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
          ].map(t => pRight(t)),

          // === أهداف المرحلة ===
          pb(),
          pGreen(`أهداف التعليم في المرحلة ${info.stage}`),
          ...gap(),
          ...stageGoals.map(t => pRight(t)),

          // === لجنة التميز ===
          pb(),
          pGreen('لجنة التميز'),
          ...gap(),
          pRight('تعتبر لجنة التميز في المدرسة المحرك الأساسي والدماغ المخطط للارتقاء بالأداء المؤسسي والتعليمي. تتشكل هذه اللجنة من كفاءات قيادية وتربوية لديها رؤية عميقة للتحسين المستمر، وتسعى جاهدة لتعزيز ثقافة الإبداع والجودة في كافة مفاصل العمل المدرسي.'),
          pRight('يتجلى الدور المحوري للجنة التميز في قيادتها لعملية إعداد وصياغة الخطة التشغيلية للمدرسة. فمن خلال منهجية تشاركية ومستنيرة، تقوم اللجنة بتحليل معمق لواقع المدرسة، واستشراف للمستقبل، وتحديد لأولويات العمل.'),
          ...gap(2),
          pGreen('أعضاء لجنة التميز'),
          ...gap(),
          membersTbl,

          // === مصادر الخطة ===
          pb(),
          pGreen('مصادر الخطة'),
          ...gap(),
          tbl([
            ...[
              'الدليل الإجرائي والدليل التنظيمي لمدارس التعليم العام',
              'الأهداف العامة والسياسات لوزارة التعليم',
              'رؤية المملكة 2030',
              'البرامج المركزية لوحدة تطوير المدارس',
              'البرامج والمشروعات الوزارية المعتمد تطبيقها في الميدان',
              'البرامج والمشروعات المركزية على مستوى الإدارة العامة للتعليم',
              'دليل الخطط الدراسية',
              'تقرير أداء المدرسة في التقويم المدرسي الذاتي والخارجي',
              'الخطة التشغيلية للمدرسة للعام السابق',
            ].map((src, i) => new TableRow({ children: [ lC(String(i + 1), 1000), dC(src, PW - 1000) ] }))
          ]),

          // === تحليل البيئة ===
          pb(),
          pGreen('تحليل البيئة الداخلية و الخارجية'),
          ...gap(),
          pRight('تمكن أهمية تحليل البيئة الداخلية والخارجية في معرفة الموقف الحقيقي للمدرسة والإستراتيجيات العامة التي يمكن اتخاذها انسجاماً بين نقاط القوة والضعف لها، والفرص والتهديدات التي تواجهها، وقد تمت عملية التحليل الاستراتيجي باستخدام مصفوفة SWOT'),
          ...gap(2),
          pGreen('تشخيص واقع المدرسة'),
          ...gap(),
          swotTbl,

          // === القضايا ===
          pb(),
          pGreen('أبرز القضايا الرئيسية'),
          ...gap(),
          issuesTbl,

          // === مراعاة مجالات التقويم ===
          pb(),
          pGreen('تم مراعاة مجالات التقويم المدرسي عند وضع الخطة التشغيلية'),
          ...gap(),
          pRight('لقد أتاحت لنا نتائج التحليل فهماً معمقاً لوضع المدرسة الحالي، ومكامن قوتها التي يجب تعزيزها، ومجالات الضعف التي تتطلب المعالجة، وكذلك الفرص المتاحة التي يمكن استثمارها، والتحديات المحتملة التي ينبغي الاستعداد لها. وبناءً على هذه الرؤية الشاملة، تم استخلاص وتحديد الأهداف العامة للخطة التشغيلية وفقاً لمجالات التقويم المدرسي المعتمدة.'),

          // === التعريفات ===
          pb(),
          pGreen('تعريفات'),
          ...gap(),
          defTbl,

          // === الأهداف العامة والتفصيلية ===
          pb(),
          pGreen('الأهداف العامة و التفصيلية للخطة التشغيلية'),
          ...gap(),
          stratTbl,

          // === البرامج ===
          ...goalSections,

          // === اللجنة الإدارية ===
          pb(),
          pGreen('اللجنة الإدارية'),
          ...gap(),
          pRight('تتولى اللجنة الإدارية بالمدرسة دوراً محورياً وحيوياً في هذه المرحلة، بصفتها الجهة المسؤولة عن الإشراف المباشر على تنفيذ كافة البرامج والمبادرات الواردة في الخطة التشغيلية.'),
          ...gap(2),
          pGreen('أعضاء اللجنة الإدارية'),
          ...gap(),
          tbl([
            new TableRow({ tableHeader: true, children: [
              hC('م', 500), hC('الاسم', 4500), hC('العمل', 3500), hC('الصفة', 2400), hC('التوقيع', PW - 10900)
            ]}),
            ...(['مدير المدرسة','وكيل المدرسة','الموجه الطلابي','رائد النشاط','معلم','معلم','معلم','مساعد إداري'].map((r, i) => new TableRow({ children: [
              dC(String(i + 1), 500), eC(4500), dC(r, 3500),
              dC(i === 0 ? 'رئيساً' : i === 1 ? 'نائب الرئيس' : i === 7 ? 'مقرراً' : 'عضواً', 2400),
              eC(PW - 10900)
            ]}))),
          ]),

          // === الاعتماد ===
          pb(),
          pGreen('فريق إعداد الخطة التشغيلية'),
          ...gap(),
          tbl([
            new TableRow({ tableHeader: true, children: [
              hC('م', 500), hC('الاسم', 4500), hC('الوظيفة', 3500), hC('الصفة', 2400), hC('التوقيع', PW - 10900)
            ]}),
            ...[1,2,3,4,5,6,7,8,9].map(n => new TableRow({ children: [
              dC(String(n), 500), eC(4500), eC(3500), eC(2400), eC(PW - 10900)
            ]}))
          ]),
          ...gap(2),
          tbl([
            new TableRow({ children: [ hC('يعتمد مدير المدرسة', PW, 3) ] }),
            new TableRow({ children: [ lC('الاسم', signW), lC('التوقيع', signW), lC('التاريخ', PW - signW * 2) ] }),
            new TableRow({ children: [ dC(info.principalName, signW), eC(signW), eC(PW - signW * 2) ] }),
          ]),

          // === الختام ===
          pb(),
          pGreen('في الختام'),
          ...gap(),
          pRight(`في ختام هذا السجل الشامل للخطة التشغيلية للمدرسة للعام الدراسي 1448هـ، نؤكد أن هذه الوثيقة ليست مجرد مجموعة من البرامج والأهداف، بل هي تجسيد لرؤيتنا الطموحة والتزامنا الراسخ بتحقيق التميز في كل جانب من جوانب العملية التعليمية والتربوية.`),
          pRight('لقد سعت هذه الخطة، بكافة محاورها ومبادراتها، إلى بناء بيئة مدرسية محفزة للتعلم والإبداع، وتنمية شاملة لشخصية الطالب، وتمكين الكادر التعليمي والإداري، وتعزيز الشراكة الفاعلة مع المجتمع المحلي.'),
          pRight('إن النجاح في تنفيذ هذه الخطة يعتمد بشكل كبير على تكاتف جهود الجميع. سنسعى جاهدين لتحويل كل هدف إلى إنجاز ملموس، وكل مبادرة إلى قصة نجاح تضاف إلى مسيرة مدرستنا الحافلة.'),
          pRight('نتطلع إلى عام دراسي مثمر ومليء بالإنجازات، يرسخ مكانتنا كصرح تعليمي رائد، يسهم بفاعلية في بناء جيل واعٍ ومسؤول ومستقبل مشرق لوطننا الغالي.'),
          ...gap(2),
          pGreen('والله ولي التوفيق', 32),
        ]
      }]
    })

    const buf = await Packer.toBuffer(doc)
    const blob = new Blob([new Uint8Array(buf)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    saveAs(blob, `الخطة_التشغيلية_${info.schoolName}.docx`)
  }

  const statusMap: Record<Step, { msg: string; color: string }> = {
    idle: { msg: '', color: '' },
    analyzing: { msg: '⏳ يحلل النظام التقرير ويستخرج البيانات...', color: GREEN },
    building: { msg: '📄 جاري بناء ملف الخطة التشغيلية...', color: GREEN },
    done: { msg: '✅ تم توليد الخطة التشغيلية بنجاح!', color: GREEN },
    error: { msg: '', color: '' },
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/forms" style={{ textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270' }}>← النماذج</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 1px' }}>الخطة التشغيلية الذكية</p>
              <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic' }}>ارفع تقرير التقويم — النظام يبني الخطة كاملة تلقائياً</p>
            </div>
          </header>
          <main style={{ padding: '28px', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ background: `linear-gradient(135deg, ${GREEN}, #2d7a3f)`, borderRadius: 16, padding: '18px 20px', marginBottom: 24, color: '#fff' }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>📊 ما يتضمنه الملف المولّد:</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.88)', lineHeight: 1.9, margin: 0, fontFamily: 'IBM Plex Sans Arabic' }}>
                غلاف رسمي · مقدمة · معلومات عامة · رؤية ورسالة وقيم · الأهداف الاستراتيجية · أهداف المرحلة · لجنة التميز · مصادر الخطة · تحليل SWOT من التقرير · أبرز القضايا · التعريفات · 10 أهداف + 64 برنامج + جداول متابعة · اللجنة الإدارية · الاعتماد · الختام
              </p>
            </div>
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(11,31,58,0.07)', padding: '1.6rem 1.8rem', boxShadow: '0 4px 16px rgba(11,31,58,0.06)' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>📄 تقرير التقويم الخارجي *</label>
                <div onClick={() => document.getElementById('pdf-in')?.click()} style={{ border: `2px dashed ${pdfFile ? GREEN : 'rgba(11,31,58,0.2)'}`, borderRadius: 12, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: pdfFile ? '#f0fdf4' : '#FAFAF7' }}>
                  <input id="pdf-in" type="file" accept=".pdf" onChange={handleFile} style={{ display: 'none' }} />
                  {pdfFile
                    ? <><p style={{ fontSize: 24, margin: '0 0 6px' }}>✅</p><p style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: 0 }}>{pdfFile.name}</p><p style={{ fontSize: 11, color: '#8A8270', margin: '4px 0 0' }}>اضغط للتغيير</p></>
                    : <><p style={{ fontSize: 32, margin: '0 0 6px' }}>📥</p><p style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: '0 0 4px' }}>ارفع تقرير التقويم الخارجي</p><p style={{ fontSize: 12, color: '#8A8270', margin: 0 }}>PDF فقط — تقرير هيئة تقويم التعليم (إتقان)</p></>
                  }
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>👤 اسم مدير المدرسة *</label>
                <input type="text" value={principalName} onChange={e => setPrincipalName(e.target.value)} placeholder="الاسم الكامل"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(11,31,58,0.12)', borderRadius: 9, fontSize: 13, fontFamily: 'IBM Plex Sans Arabic', boxSizing: 'border-box', background: '#FAFAF7', color: NAVY, direction: 'rtl', outline: 'none' }} />
              </div>
              {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}><p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>⚠️ {error}</p></div>}
              {step !== 'idle' && step !== 'error' && (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: GREEN, margin: 0, fontWeight: 600 }}>{statusMap[step].msg}</p>
                </div>
              )}
              <button onClick={handleGenerate} disabled={step === 'analyzing' || step === 'building'}
                style={{ width: '100%', padding: 16, fontSize: 16, fontWeight: 800, background: (step === 'analyzing' || step === 'building') ? '#9CA3AF' : `linear-gradient(135deg, #2d7a3f, ${GREEN})`, color: '#fff', border: 'none', borderRadius: 14, cursor: (step === 'analyzing' || step === 'building') ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal', boxShadow: (step === 'analyzing' || step === 'building') ? 'none' : '0 6px 20px rgba(31,92,46,0.30)', transition: 'all 0.2s' }}>
                {(step === 'analyzing' || step === 'building') ? '⏳ جاري بناء الخطة...' : '📊 توليد الخطة التشغيلية ←'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
