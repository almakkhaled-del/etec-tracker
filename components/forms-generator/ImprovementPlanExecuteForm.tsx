"use client";

import { useState } from "react";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

type Item = {
  domain: string;
  element: string;
  executed_actions: string;
  methods: string;
  committees_support: string;
  supervisor_support: string;
};

const EMPTY_ITEM: Item = {
  domain: "",
  element: "",
  executed_actions: "",
  methods: "",
  committees_support: "",
  supervisor_support: "",
};

interface ImprovementPlanExecuteFormProps {
  schoolPrincipalName: string;
  onGenerated?: (fileName: string) => void;
}

export default function ImprovementPlanExecuteForm({
  schoolPrincipalName,
  onGenerated,
}: ImprovementPlanExecuteFormProps) {
  const [schoolName, setSchoolName] = useState("");
  const [gradeStage, setGradeStage] = useState("");
  const [gender, setGender] = useState("بنين");
  const [ministryNumber, setMinistryNumber] = useState("");
  const [buildingOwnership, setBuildingOwnership] = useState("حكومي");
  const [buildingIndependence, setBuildingIndependence] = useState("مستقل");
  const [periodShift, setPeriodShift] = useState("صباحي");
  const [adminIndependence, setAdminIndependence] = useState("مستقلة");
  const [sharedAdminName, setSharedAdminName] = useState("");

  const [items, setItems] = useState<Item[]>([{ ...EMPTY_ITEM }]);
  const [recommendations, setRecommendations] = useState("");
  const [supportProviderName, setSupportProviderName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateItem(index: number, field: keyof Item, value: string) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGenerate() {
    setError(null);
    if (!schoolName.trim()) {
      setError("لازم تكتب اسم المدرسة");
      return;
    }
    const filledItems = items.filter((it) => it.domain.trim());
    if (filledItems.length === 0) {
      setError("لازم تضيف بند واحد على الأقل");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "/templates/improvement-plan-execute-template.docx"
      );
      if (!res.ok) throw new Error("تعذر تحميل القالب");
      const arrayBuffer = await res.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        school_name: schoolName,
        grade_stage: gradeStage,
        gender,
        ministry_number: ministryNumber,
        building_ownership: buildingOwnership,
        building_independence: buildingIndependence,
        period_shift: periodShift,
        admin_independence: adminIndependence,
        shared_admin_name: sharedAdminName,
        items: filledItems,
        recommendations,
        principal_name: schoolPrincipalName,
        support_provider_name: supportProviderName,
      });

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const fileName = `استمارة 2 - تنفيذ خطة التحسين - ${schoolName}.docx`;
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
      <h2 className="text-xl font-bold">
        استمارة (2): تنفيذ خطة التحسين في مجالات الممارسات الإشرافية
      </h2>

      {/* البيانات الأساسية */}
      <section className="space-y-3">
        <h3 className="font-semibold">أولاً: البيانات الأساسية</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded-lg p-2"
            placeholder="اسم المدرسة"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
          <input
            className="border rounded-lg p-2"
            placeholder="المرحلة"
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
            placeholder="الرقم الوزاري"
            value={ministryNumber}
            onChange={(e) => setMinistryNumber(e.target.value)}
          />
          <select
            className="border rounded-lg p-2"
            value={buildingOwnership}
            onChange={(e) => setBuildingOwnership(e.target.value)}
          >
            <option value="حكومي">حكومي</option>
            <option value="مستأجر">مستأجر</option>
          </select>
          <select
            className="border rounded-lg p-2"
            value={buildingIndependence}
            onChange={(e) => setBuildingIndependence(e.target.value)}
          >
            <option value="مستقل">مستقل</option>
            <option value="مشترك">مشترك</option>
          </select>
          <select
            className="border rounded-lg p-2"
            value={periodShift}
            onChange={(e) => setPeriodShift(e.target.value)}
          >
            <option value="صباحي">صباحي</option>
            <option value="مسائي">مسائي</option>
          </select>
          <select
            className="border rounded-lg p-2"
            value={adminIndependence}
            onChange={(e) => setAdminIndependence(e.target.value)}
          >
            <option value="مستقلة">مستقلة</option>
            <option value="مشتركة">مشتركة</option>
          </select>
          <input
            className="border rounded-lg p-2 col-span-2"
            placeholder="اسم المدرسة المشتركة في الإدارة (إن وجد)"
            value={sharedAdminName}
            onChange={(e) => setSharedAdminName(e.target.value)}
          />
        </div>
      </section>

      {/* البنود الديناميكية */}
      <section className="space-y-3">
        <h3 className="font-semibold">
          ثانياً: إجراءات تنفيذ خطة التحسين
        </h3>
        {items.map((item, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2 relative">
            {items.length > 1 && (
              <button
                onClick={() => removeItem(i)}
                className="absolute left-2 top-2 text-red-500 text-xs"
                type="button"
              >
                حذف
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <input
                className="border rounded-lg p-2"
                placeholder="المجال"
                value={item.domain}
                onChange={(e) => updateItem(i, "domain", e.target.value)}
              />
              <input
                className="border rounded-lg p-2"
                placeholder="العنصر / المكون"
                value={item.element}
                onChange={(e) => updateItem(i, "element", e.target.value)}
              />
            </div>
            <textarea
              className="w-full border rounded-lg p-2"
              placeholder="الإجراءات المنفذة (يكتب وصف الإجراء بدقة ويوم وتاريخ تنفيذه)"
              rows={2}
              value={item.executed_actions}
              onChange={(e) =>
                updateItem(i, "executed_actions", e.target.value)
              }
            />
            <textarea
              className="w-full border rounded-lg p-2"
              placeholder="أساليب وطرق التحسين"
              rows={2}
              value={item.methods}
              onChange={(e) => updateItem(i, "methods", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="border rounded-lg p-2"
                placeholder="لجان المدرسة (دعم مقدَّم)"
                value={item.committees_support}
                onChange={(e) =>
                  updateItem(i, "committees_support", e.target.value)
                }
              />
              <input
                className="border rounded-lg p-2"
                placeholder="المشرف التربوي (دعم مقدَّم)"
                value={item.supervisor_support}
                onChange={(e) =>
                  updateItem(i, "supervisor_support", e.target.value)
                }
              />
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          type="button"
          className="w-full border-2 border-dashed rounded-lg p-2 text-emerald-700 font-medium"
        >
          ➕ إضافة بند جديد
        </button>
      </section>

      {/* التوصيات */}
      <section className="space-y-2">
        <h3 className="font-semibold">ثالثاً: التوصيات والمقترحات</h3>
        <textarea
          className="w-full border rounded-lg p-2"
          rows={3}
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
        />
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
