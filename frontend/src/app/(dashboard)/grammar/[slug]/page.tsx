import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllLessons, getLesson } from "@/lib/grammar";

// Giao diện cho từng loại thẻ Markdown
const md: Components = {
  h1: ({ children }) => (
    <h1 className="mb-6 text-3xl font-extrabold text-slate-900 dark:text-white">{children}</h1>
  ),
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
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-2 pl-6 text-[17px] text-slate-700 marker:font-bold dark:text-slate-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-8">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a href={href} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 rounded-r-2xl border-l-4 border-blue-500 bg-blue-50 px-5 py-1 dark:bg-blue-950/30">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-[15px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-800/60">{children}</thead>,
  th: ({ children }) => (
    <th className="px-4 py-3 font-bold text-slate-900 dark:text-white">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t border-slate-200 px-4 py-3 text-slate-700 dark:border-slate-800 dark:text-slate-300">
      {children}
    </td>
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      className="my-6 h-auto max-w-full rounded-2xl border border-slate-200 dark:border-slate-800"
    />
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[15px] dark:bg-slate-800">
      {children}
    </code>
  ),
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) notFound();

  const all = await getAllLessons();
  const idx = all.findIndex((l) => l.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <div className="min-h-screen bg-[#fbfbfd] pb-20 dark:bg-slate-950">
      <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/grammar" className="hover:text-blue-600">Ngữ pháp</Link>
          <span className="mx-2">/</span>
          <span>{lesson.grade ? `Lớp ${lesson.grade} · ` : ""}Bài {lesson.order}</span>
        </nav>

        <h1 className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-4xl">
          Bài {lesson.order}: {lesson.title}
        </h1>
        {lesson.summary && (
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">{lesson.summary}</p>
        )}

        <article className="mt-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
            {lesson.content}
          </ReactMarkdown>
        </article>

        <div className="mt-12 grid grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/grammar/${prev.slug}`}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <ChevronLeft className="size-4 shrink-0" />
              <span className="truncate">Bài {prev.order}: {prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/grammar/${next.slug}`}
              className="flex items-center justify-end gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <span className="truncate">Bài {next.order}: {next.title}</span>
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </main>
    </div>
  );
}
