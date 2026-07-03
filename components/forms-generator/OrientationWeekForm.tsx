"use client";

import { useState } from "react";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

interface OrientationWeekFormProps {
  schoolPrincipalName: string;
  onGenerated?: (fileName: string) => void;
}

export default function OrientationWeekForm({
  schoolPrincipalName,
  onGenerated,
}: OrientationWeekFormProps) {
  // إعداد يُملأ تلقائياً من اسم المدير، قابل للتعديل لو معدّ الخطة شخص آخر (رائدة نشاط مثلاً)
  const [preparedBy, setPreparedBy] = useState(schoolPrincipalName);
  const [location, setLocation] = useState("");
  const [period, setPeriod] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);

    if (!preparedBy.trim() || !location.trim() || !period.trim()) {
      setError("لازم تعبّي كل الحقول الثلاثة");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/templates/orientation-week-template.docx");
      if (!res.ok) throw new Error("تعذر تحميل القالب");
      const arrayBuffer = await res.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        prepared_by: preparedBy,
        location,
        period,
      });

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const fileName = `خطة الأسبوع التمهيدي.docx`;
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
    <div dir="rtl" className="max-w-2xl mx-auto space-y-6 p-4">
      <h2 className="text-xl font-bold">خطة الأسبوع التمهيدي</h2>
      <p className="text-sm text-gray-500">
        محتوى الخطة (برنامج الأيام الخمسة والجدول الزمني) معتمد وثابت — تحتاج
        بس تعبّي 3 حقول
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">إعداد</label>
          <input
            className="w-full border rounded-lg p-2"
            value={preparedBy}
            onChange={(e) => setPreparedBy(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">المكان</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="مثال: مدرسة ... الابتدائية"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الفترة</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="مثال: الأسبوع الأول من العام الدراسي 1448هـ"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      </div>

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
