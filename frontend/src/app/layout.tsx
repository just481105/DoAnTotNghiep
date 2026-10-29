import type { Metadata } from "next";
import "./globals.css";
import { NavigationBar } from "@/components/navigation-bar";

export const metadata: Metadata = {
  title: "ENG-PLATFORM | Nền tảng Học tiếng Anh Thông minh",
  description: "Dashboard học tập, Flashcard SM-2 và Luyện phát âm AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        {/* Thanh Navigation Bar nằm ngang cố định trên cùng */}
        <NavigationBar />

        {/* Nội dung Dashboard / bài học hiển thị toàn màn hình phía dưới */}
        <div className="flex-1 w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
