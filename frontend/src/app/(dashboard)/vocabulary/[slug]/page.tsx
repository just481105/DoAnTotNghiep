import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { getVocabulary } from "@/lib/vocabulary";

// Giao diện cho từng loại thẻ Markdown (bảng từ vựng gọn hơn bài ngữ pháp)
const md: Components = {
  h2: ({ children }) => (
    <h2 className="mb-4 mt-10 text-2xl font-extrabold text-slate-900 dark:text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-8 text-xl font-bold text-slate-900 dark:text-white">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-4 text-[17px] leading-8 text-slate-700 dark:text-slate-300">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-2 pl-6 text-[17px] text-slate-700 marker:text-blue-500 dark:text-slate-300">
      {children}
    </ul>
  ),
  li: ({ children }) => <li className="leading-8">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-[15px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-800/60">{children}</thead>,
  th: ({ children }) => (
    <th className="whitespace-nowrap px-3 py-3 font-bold text-slate-900 dark:text-white">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t border-slate-200 px-3 py-2 align-top text-slate-700 dark:border-slate-800 dark:text-slate-300">
      {children}
    </td>
  ),
};

export default async function VocabularyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getVocabulary(slug);
  if (!lesson) notFound();

  return (
    <div className="min-h-screen bg-[#fbfbfd] pb-20 dark:bg-slate-950">
      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span>Từ vựng{lesson.grade ? ` · Lớp ${lesson.grade}` : ""}</span>
        </nav>

        <h1 className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-4xl">
          {lesson.title}
        </h1>
        {lesson.summary && (
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">{lesson.summary}</p>
        )}

        <article className="mt-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
            {lesson.content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
