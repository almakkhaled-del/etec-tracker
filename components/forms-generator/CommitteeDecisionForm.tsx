"use client";

import { useState } from "react";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

// ============================================================
// نوع البيانات لعضو اللجنة (اسم + وظيفة فقط - الصفة ثابتة بالقالب)
// ============================================================
type Member = { name: string; job: string };

const ROLE_LABELS = [
  "رئيس اللجنة",
  "عضو",
  "عضو",
  "عضو",
  "مقررة اللجنة",
  "عضو",
  "عضو",
  "عضو",
];

interface CommitteeDecisionFormProps {
  // تُمرَّر من بيانات المدرسة المسجّلة في النظام (ثابتة، غير قابلة للتعديل من هذا الفورم)
  schoolPrincipalName: string;
  onGenerated?: (fileName: string) => void;
}

export default function CommitteeDecisionForm({
  schoolPrincipalName,
  onGenerated,
}: CommitteeDecisionFormProps) {
  const [committeeName, setCommitteeName] = useState("");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [academicYear, setAcademicYear] = useState("1448هـ");

  const [members, setMembers] = useState<Member[]>(
    Array.from({ length: 8 }, () => ({ name: "", job: "" }))
  );

  const [sem1, setSem1] = useState(["", "", ""]);
  const [sem2, setSem2] = useState(["", "", ""]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateMember(index: number, field: keyof Member, value: string) {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleGenerate() {
    setError(null);

    if (!committeeName.trim()) {
      setError("لازم تكتب اسم اللجنة");
      return;
    }
    const filledMembers = members.filter((m) => m.name.trim());
    if (filledMembers.length === 0) {
      setError("لازم تضيف عضو واحد على الأقل");
      return;
    }

    setLoading(true);
    try {
      // 1) جلب القالب من مسار الملفات الثابتة (public/templates/)
      const res = await fetch("/templates/committee-decision-template.docx");
      if (!res.ok) throw new Error("تعذر تحميل القالب");
      const arrayBuffer = await res.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // 2) بناء بيانات الأعضاء (فراغ للحقول غير المعبّأة)
      const memberData: Record<string, string> = {};
      members.forEach((m, i) => {
        const n = i + 1;
        memberData[`member${n}_name`] = m.name || "";
        memberData[`member${n}_job`] = m.job || "";
      });

      doc.render({
        committee_name: committeeName,
        day,
        date,
        duration,
        academic_year: academicYear,
        principal_name: schoolPrincipalName,
        sem1_meeting1: sem1[0],
        sem1_meeting2: sem1[1],
        sem1_meeting3: sem1[2],
        sem2_meeting1: sem2[0],
        sem2_meeting2: sem2[1],
        sem2_meeting3: sem2[2],
        ...memberData,
      });

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const fileName = `قرار تشكيل ${committeeName}.docx`;
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
      <h2 className="text-xl font-bold">قرار تشكيل لجنة</h2>

      {/* بيانات القرار الأساسية */}
      <section className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">اسم اللجنة</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="مثال: لجنة التميز المدرسي"
            value={committeeName}
            onChange={(e) => setCommitteeName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">اليوم</label>
            <input
              className="w-full border rounded-lg p-2"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التاريخ</label>
            <input
              className="w-full border rounded-lg p-2"
              placeholder="1448/01/01هـ"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              مدة اللجنة
            </label>
            <input
              className="w-full border rounded-lg p-2"
              placeholder="عام دراسي كامل"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              العام الدراسي
            </label>
            <input
              className="w-full border rounded-lg p-2"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* أعضاء اللجنة */}
      <section className="space-y-2">
        <h3 className="font-semibold">أعضاء اللجنة</h3>
        <p className="text-xs text-gray-500">
          الصفة في اللجنة ثابتة حسب النظام المعتمد (رئيس / أعضاء / مقررة)
        </p>
        {members.map((m, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <input
              className="border rounded-lg p-2"
              placeholder="اسم العضو"
              value={m.name}
              onChange={(e) => updateMember(i, "name", e.target.value)}
            />
            <input
              className="border rounded-lg p-2"
              placeholder="الوظيفة"
              value={m.job}
              onChange={(e) => updateMember(i, "job", e.target.value)}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {ROLE_LABELS[i]}
            </span>
          </div>
        ))}
      </section>

      {/* جدول اجتماعات اللجنة (اختياري) */}
      <section className="space-y-3">
        <h3 className="font-semibold">مواعيد الاجتماعات (اختياري)</h3>
        <div>
          <p className="text-sm mb-1">الفصل الدراسي الأول</p>
          <div className="grid grid-cols-3 gap-2">
            {sem1.map((v, i) => (
              <input
                key={i}
                className="border rounded-lg p-2"
                placeholder={`الاجتماع ${i + 1}`}
                value={v}
                onChange={(e) => {
                  const next = [...sem1];
                  next[i] = e.target.value;
                  setSem1(next);
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm mb-1">الفصل الدراسي الثاني</p>
          <div className="grid grid-cols-3 gap-2">
            {sem2.map((v, i) => (
              <input
                key={i}
                className="border rounded-lg p-2"
                placeholder={`الاجتماع ${i + 1}`}
                value={v}
                onChange={(e) => {
                  const next = [...sem2];
                  next[i] = e.target.value;
                  setSem2(next);
                }}
              />
            ))}
          </div>
        </div>
      </section>

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
