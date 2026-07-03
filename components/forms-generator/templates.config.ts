// ============================================================
// إعدادات النماذج الموحّدة — يضاف هنا كل نموذج جديد بعد بناء
// القالب (docx) والفورم الخاص به. المدير يختار من هذي القائمة
// أولاً، وبعدها تظهر له حقول النموذج المطلوب فقط.
// ============================================================

export type TemplateId =
  | "committee_decision"
  | "meeting_minutes"
  | "orientation_week_plan"
  | "school_status_report"
  | "improvement_plan_build"
  | "improvement_plan_execute";

export interface TemplateMeta {
  id: TemplateId;
  title: string;
  description: string;
  templateFile: string; // المسار داخل public/templates/
  status: "ready" | "coming_soon";
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "committee_decision",
    title: "قرار تشكيل لجنة",
    description: "قرار إداري باعتماد تشكيل لجنة وتكليف الأعضاء ومواعيد الاجتماعات",
    templateFile: "/templates/committee-decision-template.docx",
    status: "ready",
  },
  {
    id: "meeting_minutes",
    title: "محضر اجتماع",
    description: "محضر اجتماع دوري للجنة مع جدول الأعمال والتوصيات",
    templateFile: "/templates/meeting-minutes-template.docx",
    status: "ready",
  },
  {
    id: "orientation_week_plan",
    title: "خطة الأسبوع التمهيدي",
    description: "برنامج استقبال الطلاب المستجدين لمدة 5 أيام",
    templateFile: "/templates/orientation-week-template.docx",
    status: "ready",
  },
  {
    id: "school_status_report",
    title: "تقرير واقع المدرسة",
    description: "تحليل واقع المدرسة (SWOT) وأولويات التحسين حسب المجالات",
    templateFile: "/templates/school-status-report-template.docx",
    status: "ready",
  },
  {
    id: "improvement_plan_build",
    title: "استمارة (1): بناء خطة التحسين",
    description: "خطة تحسين في مجالات الممارسات الإشرافية — بنود ديناميكية",
    templateFile: "/templates/improvement-plan-build-template.docx",
    status: "ready",
  },
  {
    id: "improvement_plan_execute",
    title: "استمارة (2): تنفيذ خطة التحسين",
    description: "متابعة تنفيذ إجراءات خطة التحسين — بنود ديناميكية",
    templateFile: "/templates/improvement-plan-execute-template.docx",
    status: "ready",
  },
];
