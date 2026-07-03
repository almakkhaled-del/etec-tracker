"use client";

import { useState } from "react";
import { TEMPLATES, TemplateId } from "./templates.config";
import CommitteeDecisionForm from "./CommitteeDecisionForm";
import MeetingMinutesForm from "./MeetingMinutesForm";
import OrientationWeekForm from "./OrientationWeekForm";
import SchoolStatusReportForm from "./SchoolStatusReportForm";
import ImprovementPlanBuildForm from "./ImprovementPlanBuildForm";
import ImprovementPlanExecuteForm from "./ImprovementPlanExecuteForm";

interface FormsGeneratorPageProps {
  // بيانات المدرسة الثابتة من النظام (اسم المدرسة/المدير) — لا تُعدَّل من هنا
  schoolPrincipalName: string;
}

export default function FormsGeneratorPage({
  schoolPrincipalName,
}: FormsGeneratorPageProps) {
  const [selected, setSelected] = useState<TemplateId | null>(null);

  const selectedMeta = TEMPLATES.find((t) => t.id === selected);

  return (
    <div dir="rtl" className="max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مولّد النماذج</h1>
        <p className="text-gray-500 text-sm mt-1">
          اختر النموذج اللي تبي تولّده، وبعدها تظهر لك الحقول المطلوبة فقط
        </p>
      </div>

      {/* شبكة اختيار النموذج */}
      <div className="grid sm:grid-cols-2 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            disabled={t.status === "coming_soon"}
            onClick={() => setSelected(t.id)}
            className={`text-right border rounded-xl p-4 transition ${
              selected === t.id
                ? "border-emerald-600 ring-2 ring-emerald-200"
                : "border-gray-200 hover:border-gray-300"
            } ${t.status === "coming_soon" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{t.title}</span>
              {t.status === "coming_soon" && (
                <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                  قريباً
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{t.description}</p>
          </button>
        ))}
      </div>

      {/* الفورم الديناميكي حسب الاختيار */}
      {selectedMeta?.status === "ready" && (
        <div className="border-t pt-6">
          {selected === "committee_decision" && (
            <CommitteeDecisionForm schoolPrincipalName={schoolPrincipalName} />
          )}
          {selected === "meeting_minutes" && (
            <MeetingMinutesForm schoolPrincipalName={schoolPrincipalName} />
          )}
          {selected === "orientation_week_plan" && (
            <OrientationWeekForm schoolPrincipalName={schoolPrincipalName} />
          )}
          {selected === "school_status_report" && (
            <SchoolStatusReportForm schoolPrincipalName={schoolPrincipalName} />
          )}
          {selected === "improvement_plan_build" && (
            <ImprovementPlanBuildForm schoolPrincipalName={schoolPrincipalName} />
          )}
          {selected === "improvement_plan_execute" && (
            <ImprovementPlanExecuteForm
              schoolPrincipalName={schoolPrincipalName}
            />
          )}
        </div>
      )}
    </div>
  );
}
