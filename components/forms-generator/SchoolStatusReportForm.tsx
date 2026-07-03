"use client";

import { useState } from "react";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

interface SchoolStatusReportFormProps {
  schoolPrincipalName: string;
  onGenerated?: (fileName: string) => void;
}

const DOMAINS = [
  "الإدارة المدرسية",
  "التوجيه الطلابي",
  "الأنشطة المدرسية",
  "نواتج التعلم",
  "التدريس",
  "البيئة المدرسية",
];

const PRIORITY_OPTIONS = ["عالي", "متوسط", "منخفض", "لا يوجد احتياج"];

export default function SchoolStatusReportForm({
  schoolPrincipalName,
  onGenerated,
}: SchoolStatusReportFormProps) {
  const [schoolName, setSchoolName] = useState("");
  const [ministryNumber, setMinistryNumber] = useState("");
  const [gradeStage, setGradeStage] = useState("");
  const [gender, setGender] = useState("بنين");
  const [scope, setScope] = useState("");
  const [buildingType, setBuildingType] = useState("مستقل");
  const [principalPhone, setPrincipalPhone] = useState("");

  const [reportType, setReportType] = useState("ذاتي");
  const [reportDate, setReportDate] = useState("");
  const [overallAvg, setOverallAvg] = useState("");
  const [adminAvg, setAdminAvg] = useState("");
  const [teachingAvg, setTeachingAvg] = useState("");
  const [learningOutcomesAvg, setLearningOutcomesAvg] = useState("");
  const [environmentAvg, setEnvironmentAvg] = useState("");

  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [opportunities, setOpportunities] = useState("");
  const [challenges, setChallenges] = useState("");
  const [weaknessTreatment, setWeaknessTreatment] = useState("");

  const [priorities, setPriorities] = useState(
    DOMAINS.map(() => ({ priority: "متوسط", justification: "" }))
  );

  const [supportProviderName, setSupportProviderName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updatePriority(
    i: number,
    field: "priority" | "justification",
    value: string
  ) {
    setPriorities((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  async function handleGenerate() {
    setError(null);
    if (!schoolName.trim()) {
      setError("لازم تكتب اسم المدرسة");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/templates/school-status-report-template.docx");
      if (!res.ok) throw new Error("تعذر تحميل القالب");
      const arrayBuffer = await res.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const priorityData: Record<string, string> = {};
      priorities.forEach((p, i) => {
        priorityData[`priority${i + 1}`] = p.priority;
        priorityData[`justification${i + 1}`] = p.justification;
      });

      doc.render({
        school_name: schoolName,
        ministry_number: ministryNumber,
        grade_stage: gradeStage,
        gender,
        scope,
        building_type: buildingType,
        principal_name: schoolPrincipalName,
        principal_phone: principalPhone,
        report_type: reportType,
        report_date: reportDate,
        overall_avg: overallAvg,
        admin_avg: adminAvg,
        teaching_avg: teachingAvg,
        learning_outcomes_avg: learningOutcomesAvg,
        environment_avg: environmentAvg,
        strengths,
        weaknesses,
        opportunities,
        challenges,
        weakness_treatment: weaknessTreatment,
        support_provider_name: supportProviderName,
        ...priorityData,
      });

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const fileName = `تقرير واقع المدرسة - ${schoolName}.docx`;
      saveAs(blob, fileName);
      onGenerated?.(fileName);
    } catch (e: any) {
      console.error(e);
      setError("صار خطأ أثناء توليد الملف، حاول مرة ثانية");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto space-y-6 p-4">
      <h2 className="text-xl font-bold">تقرير واقع المدرسة</h2>

      {/* البيانات الأساسية */}
      <section className="space-y-3">
        <h3 className="font-semibold">البيانات الأساسية</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded-lg p-2"
            placeholder="اسم المدرسة"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
          <input
            className="border rounded-lg p-2"
            placeholder="الرقم الوزاري"
            value={ministryNumber}
            onChange={(e) => setMinistryNumber(e.target.value)}
          />
          <input
            className="border rounded-lg p-2"
            placeholder="المرحلة الدراسية"
            value={gradeStage}
            onChange={(e) => setGradeStage(e.target.value)}
          />
          <select
            className="border rounded-lg p-2"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="بنين">بنين</option>
            <option value="بنات">بنات</option>
          </select>
          <input
            className="border rounded-lg p-2"
            placeholder="النطاق"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          />
          <select
            className="border rounded-lg p-2"
            value={buildingType}
            onChange={(e) => setBuildingType(e.target.value)}
          >
            <option value="مستقل">مستقل</option>
            <option value="مشترك">مشترك</option>
          </select>
          <input
            className="border rounded-lg p-2 col-span-2"
            placeholder="رقم جوال مدير المدرسة"
            value={principalPhone}
            onChange={(e) => setPrincipalPhone(e.target.value)}
          />
        </div>
      </section>

      {/* نتائج التقويم */}
      <section className="space-y-3">
        <h3 className="font-semibold">نتائج التقويم المدرسي</h3>
        <div className="grid grid-cols-2 gap-3">
          <select
            className="border rounded-lg p-2"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="ذاتي">ذاتي</option>
            <option value="خارجي">خارجي</option>
          </select>
          <input
            className="border rounded-lg p-2"
            placeholder="تاريخ التقرير"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
          <input
            className="border rounded-lg p-2 col-span-2"
            placeholder="متوسط الأداء العام"
            value={overallAvg}
            onChange={(e) => setOverallAvg(e.target.value)}
          />
          <input
            className="border rounded-lg p-2"
            placeholder="الإدارة المدرسية"
            value={adminAvg}
            onChange={(e) => setAdminAvg(e.target.value)}
          />
          <input
            className="border rounded-lg p-2"
            placeholder="التعليم والتعلم"
            value={teachingAvg}
            onChange={(e) => setTeachingAvg(e.target.value)}
          />
          <input
            className="border rounded-lg p-2"
            placeholder="نواتج التعلم"
            value={learningOutcomesAvg}
            onChange={(e) => setLearningOutcomesAvg(e.target.value)}
          />
          <input
            className="border rounded-lg p-2"
            placeholder="البيئة المدرسية"
            value={environmentAvg}
            onChange={(e) => setEnvironmentAvg(e.target.value)}
          />
        </div>
      </section>

      {/* تحليل الواقع SWOT */}
      <section className="space-y-2">
        <h3 className="font-semibold">تحليل الواقع</h3>
        <textarea
          className="w-full border rounded-lg p-2"
          placeholder="نقاط القوة"
          rows={2}
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
        />
        <textarea
          className="w-full border rounded-lg p-2"
          placeholder="نقاط الضعف"
          rows={2}
          value={weaknesses}
          onChange={(e) => setWeaknesses(e.target.value)}
        />
        <textarea
          className="w-full border rounded-lg p-2"
          placeholder="الفرص"
          rows={2}
          value={opportunities}
          onChange={(e) => setOpportunities(e.target.value)}
        />
        <textarea
          className="w-full border rounded-lg p-2"
          placeholder="التحديات"
          rows={2}
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
        />
        <textarea
          className="w-full border rounded-lg p-2"
          placeholder="آلية معالجة نقاط الضعف"
          rows={2}
          value={weaknessTreatment}
          onChange={(e) => setWeaknessTreatment(e.target.value)}
        />
      </section>

      {/* الأولويات */}
      <section className="space-y-2">
        <h3 className="font-semibold">الأولويات العاجلة للتحسين</h3>
        {DOMAINS.map((domain, i) => (
          <div key={domain} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{domain}</span>
              <select
                className="border rounded-lg p-1 text-sm"
                value={priorities[i].priority}
                onChange={(e) => updatePriority(i, "priority", e.target.value)}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <input
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="مبررات تحديد مستوى الأولوية"
              value={priorities[i].justification}
              onChange={(e) =>
                updatePriority(i, "justification", e.target.value)
              }
            />
          </div>
        ))}
      </section>

      <input
        className="w-full border rounded-lg p-2"
        placeholder="اسم مقدم/ة خدمات دعم التميز المدرسي (اختياري)"
        value={supportProviderName}
        onChange={(e) => setSupportProviderName(e.target.value)}
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-emerald-700 text-white rounded-lg p-3 font-semibold disabled:opacity-50"
      >
        {loading ? "جاري التوليد..." : "توليد ملف Word"}
      </button>
    </div>
  );
}
