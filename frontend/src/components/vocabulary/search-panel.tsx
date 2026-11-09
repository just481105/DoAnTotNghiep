"use client";

import React, { useEffect, useState } from "react";
import { Search, Volume2, X } from "lucide-react";

interface DictEntry {
  word: string;
  pos: string;
  ipa: string;
  meaning: string;
}

function playAudio(word: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
}

function Highlight({ text, query }: { text: string; query: string }) {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-amber-200 px-0.5 text-slate-900">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}

/**
 * Ô tìm kiếm + bảng kết quả. Khi ô trống thì hiện `children` (bảng đầy đủ),
 * khi đang gõ thì thay bằng bảng kết quả.
 */
export default function VocabSearchPanel({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DictEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = query.trim();

  useEffect(() => {
    if (!q) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/vocabulary/search?q=${encodeURIComponent(q)}&limit=50`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`Lỗi ${res.status}`);
        setResults(await res.json());
        setIsLoading(false);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Không tìm kiếm được, thử lại.");
          setIsLoading(false);
        }
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  return (
    <>
      <div className="relative my-6">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm từ tiếng Anh (vd: com) hoặc nghĩa tiếng Việt (vd: máy tính, may tinh)..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Xóa tìm kiếm"
            className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {!q ? (
        children
      ) : error ? (
        <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-center text-xs text-rose-700">
          {error}
        </p>
      ) : results.length === 0 && !isLoading ? (
        <p className="py-10 text-center text-sm text-slate-400">Không tìm thấy kết quả cho “{q}”.</p>
      ) : (
        <>
          <p className="mb-2 text-xs text-slate-400">
            {isLoading ? "Đang tìm..." : `${results.length} kết quả`}
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-[15px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  <th className="px-3 py-3 font-bold text-slate-900 dark:text-white">Từ</th>
                  <th className="px-3 py-3 font-bold text-slate-900 dark:text-white">Loại từ</th>
                  <th className="px-3 py-3 font-bold text-slate-900 dark:text-white">Phiên âm</th>
                  <th className="px-3 py-3 font-bold text-slate-900 dark:text-white">Nghĩa</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr
                    key={`${r.word}-${r.pos}-${r.meaning}`}
                    className="border-t border-slate-200 dark:border-slate-800"
                  >
                    <td className="px-3 py-2 align-top">
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => playAudio(r.word)}
                          aria-label={`Nghe phát âm ${r.word}`}
                          className="grid size-7 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 dark:border-slate-700"
                        >
                          <Volume2 className="size-3.5" />
                        </button>
                        <b className="text-slate-900 dark:text-white">
                          <Highlight text={r.word} query={q} />
                        </b>
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top text-slate-700 dark:text-slate-300">{r.pos}</td>
                    <td className="px-3 py-2 align-top text-slate-700 dark:text-slate-300">{r.ipa}</td>
                    <td className="px-3 py-2 align-top text-slate-700 dark:text-slate-300">{r.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
