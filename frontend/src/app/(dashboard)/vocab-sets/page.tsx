"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Sparkles, ChevronRight, Plus, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [activeTab, setActiveTab] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [topics, setTopics] = useState<VocabTopic[]>([
    {
      id: "1",
      slug: "economy",
      title: "HuyForum: Economy",
      desc: "Bắt đầu bài tập để ghi nhớ từ vựng mới hoặc ôn tập lại.",
      wordCount: 24,
      learnCount: 1014,
      progressPercent: 0,
      isLearned: false,
    },
    {
      id: "2",
      slug: "vstep-b1",
      title: "VSTEP B1 Core Builder",
      desc: "Bắt đầu bài tập để ghi nhớ từ vựng mới hoặc ôn tập lại.",
      wordCount: 100,
      learnCount: 947,
      progressPercent: 0,
      isLearned: false,
    },
    {
      id: "3",
      slug: "travel",
      title: "Du lịch",
      desc: "Bắt đầu bài tập để ghi nhớ từ vựng mới hoặc ôn tập lại.",
      wordCount: 59,
      learnCount: 447,
      progressPercent: 0,
      isLearned: false,
    },
    {
      id: "4",
      slug: "vstep-b2",
      title: "VSTEP B2 Expansion",
      desc: "Bắt đầu bài tập để ghi nhớ từ vựng mới hoặc ôn tập lại.",
      wordCount: 100,
      learnCount: 384,
      progressPercent: 0,
      isLearned: false,
    },
    {
      id: "5",
      slug: "collocations",
      title: "VSTEP B2 Collocations & Phrases 100",
      desc: "Bắt đầu bài tập để ghi nhớ từ vựng mới hoặc ôn tập lại.",
      wordCount: 100,
      learnCount: 262,
      progressPercent: 0,
      isLearned: false,
    },
    {
      id: "6",
      slug: "hobbies",
      title: "Sở thích và thể thao",
      desc: "Bắt đầu bài tập để ghi nhớ từ vựng mới hoặc ôn tập lại.",
      wordCount: 71,
      learnCount: 252,
      progressPercent: 0,
      isLearned: false,
    },
  ]);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch("http://localhost:5001/sm2/topics");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTopics(data);
          }
        }
      } catch (err) {
        console.warn("Dùng danh sách tag mẫu:", err);
      }
    }
    fetchTopics();
  }, []);

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-slate-950 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* THANH CÔNG CỤ: TABS + TÌM KIẾM + BỘ LỌC */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setActiveTab("recommended")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "recommended"
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Được đề xuất
            </button>
            <button
              onClick={() => setActiveTab("my-sets")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "my-sets"
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Bộ từ của mình
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bộ từ..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Phổ biến nhất</span>
            </button>

            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span>Tạo bộ từ</span>
            </button>
          </div>
        </div>

        {/* LƯỚI CÁC THẺ TAG / BỘ TỪ: CLICK VÀO ĐÂY MỚI SANG DANH SÁCH CHI TIẾT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopics.map((item) => (
            <Link
              key={item.id}
              href={`/vocab-sets/${item.slug}`}
              className="group block bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all cursor-pointer"
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{item.wordCount} từ</span>
                  <span>•</span>
                  <span>{item.learnCount} lượt học</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {item.progressPercent}%
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
