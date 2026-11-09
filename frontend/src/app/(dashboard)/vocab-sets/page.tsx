"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Sparkles, ChevronRight, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/services/api-client";

interface VocabTopic {
  id: string;
  slug: string;
  title: string;
  desc: string;
  wordCount: number;
  learnCount: number;
  progressPercent: number;
  isLearned: boolean;
}

export default function VocabSetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [topics, setTopics] = useState<VocabTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth<VocabTopic[]>("/sm2/topics");
      setTopics(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách bộ từ.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-slate-950 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Bộ từ vựng</h1>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bộ từ..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
            Đang tải bộ từ vựng...
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Không tải được bộ từ</p>
            <p className="text-xs text-slate-500">{error}</p>
            <Button onClick={load} className="rounded-2xl text-xs gap-2 font-bold">
              <RefreshCw className="w-4 h-4" /> Thử lại
            </Button>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            {topics.length === 0 ? "Chưa có bộ từ nào trong hệ thống." : "Không tìm thấy bộ từ phù hợp."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((item) => (
              <Link
                key={item.id}
                href={`/vocab-sets/${item.slug}`}
                className="group block bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
                      <Sparkles className="w-4 h-4 fill-amber-400" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      {item.isLearned ? "Đang học" : "Chưa học"}
                    </Badge>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{item.wordCount} từ</span>
                    <span>•</span>
                    <span>{item.learnCount} thẻ đã học</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{item.progressPercent}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
