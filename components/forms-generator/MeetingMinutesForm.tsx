"use client";

import { useState } from "react";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

type Member = { name: string; job: string };
type Recommendation = {
  text: string;
  assignee: string;
  duration: string;
  dept: string;
};

// الأعضاء الثلاثة الأوائل وظائفهم ثابتة حسب النظام (مدير + وكيلين)
const FIXED_ROLES = [
  { job: "مدير المدرسة", role: "رئيس اللجنة" },
  { job: "وكيل الشؤون التعليمية والمدرسية", role: "عضو" },
  { job: "وكيل شؤون الطلاب", role: "عضو" },
];
const EDITABLE_ROLES = ["عضو", "مقررا اللجنة", "عضو", "عضو", "عضو"];

interface MeetingMinutesFormProps {
  schoolPrincipalName: string;
  onGenerated?: (fileName: string) => void;
}

export default function MeetingMinutesForm({
  schoolPrincipalName,
  onGenerated,
}: MeetingMinutesFormProps) {
  const [committeeName, setCommitteeName] = useState("");
  const [location, setLocation] = useState("إدارة المدرسة");
  const [meetingDatetime, setMeetingDatetime] = useState("");
  const [meetingNumber, setMeetingNumber] = useState("");
  const [attendeesCount, setAttendeesCount] = useState("");

  const [meetingHour, setMeetingHour] = useState("");
  const [meetingDay, setMeetingDay] = useState("");
  const [hijriDay, setHijriDay] = useState("");
  const [hijriMonthYear, setHijriMonthYear] = useState("");
  const [endHour, setEndHour] = useState("");

  const [agenda, setAgenda] = useState(["", "", "", "", ""]);

  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    Array.from({ length: 5 }, () => ({
      text: "",
      assignee: "",
      duration: "",
      dept: "",
    }))
  );

  const [unexecuted, setUnexecuted] = useState(["", "", ""]);

  // 3 أعضاء ثابتين (اسم فقط) + 5 أعضاء إضافيين (اسم ووظيفة)
  const [fixedMembers, setFixedMembers] = useState(["", "", ""]);
  const [extraMembers, setExtraMembers] = useState<Member[]>(
    Array.from({ length: 5 }, () => ({ name: "", job: "" }))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRecommendation(
    index: number,
    field: keyof Recommendation,
    value: string
  ) {
    setRecommendations((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function updateExtraMember(index: number, field: keyof Member, value: string) {
    setExtraMembers((prev) => {
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
    if (!fixedMembers[0].trim()) {
      setError("لازم اسم مدير المدرسة على الأقل");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/templates/meeting-minutes-template.docx");
      if (!res.ok) throw new Error("تعذر تحميل القالب");
      const arrayBuffer = await res.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const agendaData: Record<string, string> = {};
      agenda.forEach((a, i) => {
        agendaData[`agenda${i + 1}`] = a;
      });

      const recData: Record<string, string> = {};
      recommendations.forEach((r, i) => {
        const n = i + 1;
        recData[`rec${n}_text`] = r.text;
        recData[`rec${n}_assignee`] = r.assignee;
        recData[`rec${n}_duration`] = r.duration;
        recData[`rec${n}_dept`] = r.dept;
      });

      const unexecutedData: Record<string, string> = {};
      unexecuted.forEach((u, i) => {
        unexecutedData[`unexecuted${i + 1}`] = u;
      });

      const memberData: Record<string, string> = {};
      fixedMembers.forEach((name, i) => {
        memberData[`member${i + 1}_name`] = name;
      });
      extraMembers.forEach((m, i) => {
        const n = i + 4; // أعضاء 4-8
        memberData[`member${n}_name`] = m.name;
        memberData[`member${n}_job`] = m.job;
      });

      doc.render({
        committee_name: committeeName,
        location,
        meeting_datetime: meetingDatetime,
        meeting_number: meetingNumber,
        attendees_count: attendeesCount,
        meeting_hour: meetingHour,
        meeting_day: meetingDay,
        hijri_day: hijriDay,
        hijri_month_year: hijriMonthYear,
        end_hour: endHour,
        principal_name: schoolPrincipalName,
        ...agendaData,
        ...recData,
        ...unexecutedData,
        ...memberData,
      });

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const fileName = `محضر اجتماع ${committeeName}.docx`;
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
      <h2 className="text-xl font-bold">محضر اجتماع</h2>

      {/* بيانات الاجتماع الأساسية */}
      <section className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">اسم اللجنة</label>
          <input
            className="w-full border rounded-lg p-2"
            value={committeeName}
            onChange={(e) => setCommitteeName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">مقر الاجتماع</label>
            <input
              className="w-full border rounded-lg p-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الاجتماع</label>
            <input
              className="w-full border rounded-lg p-2"
              value={meetingNumber}
              onChange={(e) => setMeetingNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              موعد الاجتماع
            </label>
            <input
              className="w-full border rounded-lg p-2"
              value={meetingDatetime}
              onChange={(e) => setMeetingDatetime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              عدد/فئة الحاضرين
            </label>
            <input
              className="w-full border rounded-lg p-2"
              value={attendeesCount}
              onChange={(e) => setAttendeesCount(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-xs mb-1">الساعة</label>
            <input
              className="w-full border rounded-lg p-2"
              value={meetingHour}
              onChange={(e) => setMeetingHour(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs mb-1">اليوم</label>
            <input
              className="w-full border rounded-lg p-2"
              value={meetingDay}
              onChange={(e) => setMeetingDay(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs mb-1">التاريخ الهجري</label>
            <input
              className="w-full border rounded-lg p-2"
              placeholder="١٥"
              value={hijriDay}
              onChange={(e) => setHijriDay(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs mb-1">الشهر/السنة الهجرية</label>
            <input
              className="w-full border rounded-lg p-2"
              placeholder="١٢ / ١٤٤٨"
              value={hijriMonthYear}
              onChange={(e) => setHijriMonthYear(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            ساعة انتهاء الاجتماع
          </label>
          <input
            className="w-full border rounded-lg p-2"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
          />
        </div>
      </section>

      {/* جدول أعمال الاجتماع */}
      <section className="space-y-2">
        <h3 className="font-semibold">جدول أعمال الاجتماع</h3>
        {agenda.map((a, i) => (
          <input
            key={i}
            className="w-full border rounded-lg p-2"
            placeholder={`البند ${i + 1}`}
            value={a}
            onChange={(e) => {
              const next = [...agenda];
              next[i] = e.target.value;
              setAgenda(next);
            }}
          />
        ))}
      </section>

      {/* التوصيات */}
      <section className="space-y-3">
        <h3 className="font-semibold">التوصيات</h3>
        {recommendations.map((r, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2">
            <input
              className="w-full border rounded-lg p-2"
              placeholder="نص التوصية"
              value={r.text}
              onChange={(e) => updateRecommendation(i, "text", e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                className="border rounded-lg p-2"
                placeholder="الجهة المكلفة"
                value={r.assignee}
                onChange={(e) =>
                  updateRecommendation(i, "assignee", e.target.value)
                }
              />
              <input
                className="border rounded-lg p-2"
                placeholder="مدة التنفيذ"
                value={r.duration}
                onChange={(e) =>
                  updateRecommendation(i, "duration", e.target.value)
                }
              />
              <input
                className="border rounded-lg p-2"
                placeholder="الجهة التابعة"
                value={r.dept}
                onChange={(e) => updateRecommendation(i, "dept", e.target.value)}
              />
            </div>
          </div>
        ))}
      </section>

      {/* ما لم ينفذ من توصيات سابقة */}
      <section className="space-y-2">
        <h3 className="font-semibold">
          ما لم ينفذ من التوصيات السابقة وأسباب عدم التنفيذ (اختياري)
        </h3>
        {unexecuted.map((u, i) => (
          <input
            key={i}
            className="w-full border rounded-lg p-2"
            value={u}
            onChange={(e) => {
              const next = [...unexecuted];
              next[i] = e.target.value;
              setUnexecuted(next);
            }}
          />
        ))}
      </section>

      {/* أعضاء اللجنة */}
      <section className="space-y-2">
        <h3 className="font-semibold">أعضاء اللجنة الحاضرون</h3>

        <p className="text-xs text-gray-500">
          الأعضاء الثلاثة الأوائل ثابتون حسب النظام (مدير المدرسة + وكيلان)
        </p>
        {FIXED_ROLES.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <input
              className="border rounded-lg p-2"
              placeholder="الاسم"
              value={fixedMembers[i]}
              onChange={(e) => {
                const next = [...fixedMembers];
                next[i] = e.target.value;
                setFixedMembers(next);
              }}
            />
            <span className="text-sm text-gray-600">{r.job}</span>
            <span className="text-xs text-gray-500">{r.role}</span>
          </div>
        ))}

        <p className="text-xs text-gray-500 pt-2">أعضاء إضافيون (اختياري)</p>
        {extraMembers.map((m, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <input
              className="border rounded-lg p-2"
              placeholder="اسم العضو"
              value={m.name}
              onChange={(e) => updateExtraMember(i, "name", e.target.value)}
            />
            <input
              className="border rounded-lg p-2"
              placeholder="الوظيفة"
              value={m.job}
              onChange={(e) => updateExtraMember(i, "job", e.target.value)}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {EDITABLE_ROLES[i]}
            </span>
          </div>
        ))}
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
