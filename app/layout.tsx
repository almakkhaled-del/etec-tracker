import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "شواهدي | منصة شواهد الاعتماد المدرسي",
  description: "منصة شواهدي تساعد مدارس التعليم العام على توثيق وتنظيم شواهد معايير الاعتماد المدرسي وفق إطار هيئة تقويم التعليم والتدريب إتقان",
  keywords: "شواهدي، اعتماد مدرسي، إتقان، شواهد، معايير، تقويم مدرسي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
