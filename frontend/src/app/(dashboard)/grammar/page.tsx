import { getAllLessons } from "@/lib/grammar";
import GrammarList from "./grammar-list";

export const metadata = { title: "Ngữ pháp tiếng Anh" };

export default async function GrammarPage() {
  const lessons = await getAllLessons();

  return (
    <div className="min-h-screen bg-[#fbfbfd] pb-20 dark:bg-slate-950">
      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Ngữ pháp tiếng Anh THPT
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {lessons.length} bài học. Chọn lớp để xem đúng chương trình của bạn.
        </p>

        <GrammarList lessons={lessons} />
      </main>
    </div>
  );
}
