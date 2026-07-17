import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "شواهدي | منصة شواهد الاعتماد المدرسي",
  description: "منصة شواهدي تساعد مدارس التعليم العام على توثيق وتنظيم شواهد معايير الاعتماد المدرسي وفق إطار هيئة تقويم التعليم والتدريب إتقان",
  keywords: "شواهدي، اعتماد مدرسي، إتقان، شواهد، معايير، تقويم مدرسي",
  verification: {
    other: {
      "domain-verification": "ad8979f45010b990f88dc4ba84dd8fc57a642211da1e29781d11265b305c7bcf",
    },
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-full flex flex-col">
        {/* الخطوط تُحمَّل مرة واحدة هنا لكل المنصة — بدل تكرار وسم <link>
            داخل كل صفحة (وكانت صفحة مولّد النماذج ناسيته أصلاً فيظهر خط
            النظام). الوسوم القديمة بالصفحات غير مؤذية: المتصفح لا يعيد
            التحميل لنفس الرابط. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {children}
      </body>
    </html>
  );
}
