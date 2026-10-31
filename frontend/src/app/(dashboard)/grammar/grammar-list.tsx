"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookMarked, Search } from "lucide-react";
import type { LessonMeta } from "@/lib/grammar";

type Tab = "all" | "10" | "11" | "12";

const GRADES = [
  {
    key: 10,
    label: "Lớp 10",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    key: 11,
    label: "Lớp 11",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  },
  {
    key: 12,
    label: "Lớp 12",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
  },
];

const TAB_ON = "bg-blue-600 text-white shadow-md shadow-blue-600/25";
const TAB_OFF =
  "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700";

export default function GrammarList({ lessons }: { lessons: LessonMeta[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons.filter((l) => {
      if (tab !== "all" && String(l.grade) !== tab) return false;
      if (
        q &&
        !l.title.toLowerCase().includes(q) &&
        !(l.topic ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [lessons, tab, query]);

  // Gom bài theo lớp; bài chưa có lớp nằm nhóm cuối
  const groups = [
    ...GRADES.map((g) => ({
      key: String(g.key),
      label: g.label,
      badge: g.badge,
      items: visible.filter((l) => l.grade === g.key),
    })),
    {
      key: "none",
      label: "Chưa phân lớp",
      badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      items: visible.filter((l) => !l.grade),
    },
  ].filter((g) => g.items.length > 0);

  const countOf = (g: number) => lessons.filter((l) => l.grade === g).length;

  return (
    <div>
      {/* Thẻ lọc theo lớp + tìm kiếm */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTab("all")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === "all" ? TAB_ON : TAB_OFF
            }`}
          >
            Tất cả <span className="ml-1 opacity-80">{lessons.length}</span>
          </button>
          {GRADES.map((g) => (
            <button
              key={g.key}
              onClick={() => setTab(String(g.key) as Tab)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                tab === String(g.key) ? TAB_ON : TAB_OFF
              }`}
            >
              {g.label} <span className="ml-1 opacity-80">{countOf(g.key)}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài, chuyên đề..."
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
          />
        </div>
      </div>

      {/* Danh sách bài */}
      {groups.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">
          {lessons.length === 0
            ? "Chưa có bài học nào (hoặc backend chưa chạy)."
            : "Chưa có bài nào phù hợp."}
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map((g) => (
            <section key={g.key}>
              {tab === "all" && (
                <div className="mb-4 flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${g.badge}`}>
                    {g.label}
                  </span>
                  <span className="text-sm text-slate-500">{g.items.length} bài</span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
              )}

              <ul className="gap-x-12 md:columns-2">
                {g.items.map((l) => (
                  <li key={l.slug} className="mb-4 break-inside-avoid">
                    <Link
                      href={`/grammar/${l.slug}`}
                      className="group flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 transition hover:border-blue-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                    >
                      <BookMarked className="mt-0.5 size-5 shrink-0 text-blue-500" />
                      <span className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          Bài {l.order}:{" "}
                        </span>
                        <span className="font-medium text-blue-600 group-hover:underline dark:text-blue-400">
                          {l.title}
                        </span>
                        {l.topic && (
                          <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {l.topic}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
