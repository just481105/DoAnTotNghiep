"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LearningAnalytics } from "@/components/learning-analytics";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { 
  Trophy, 
  Calendar, 
  Search, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  Layers, 
  ChevronRight,
  Flame
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [filterTab, setFilterTab] = useState("all");
  const { stats, topRankings, retentionCurve, loading } = useDashboardData();

  const skillCards = [
    {
      title: "Học từ vựng SM-2",
      desc: "Ôn tập ngắt quãng khoa học",
      meta: "Toàn bộ từ vựng Oxford",
      href: "/learn",
      badge: "Free",
      color: "from-amber-400 to-orange-500",
      icon: Layers,
    },
    {
      title: "Luyện phát âm AI",
      desc: "Phân tích ngữ âm & âm vị IPA",
      meta: "Micro 16kHz • FastAPI",
      href: "/speaking",
      badge: "Pro",
      color: "from-rose-400 to-red-500",
      icon: Mic,
    },
    {
      title: "Listening",
      desc: "Luyện nghe chuẩn bản xứ",
      meta: "3 Part • 40 phút",
      href: "#",
      badge: "Pro",
      color: "from-emerald-400 to-teal-500",
      icon: Headphones,
    },
    {
      title: "Reading",
      desc: "Đọc hiểu & ngữ cảnh thực tế",
      meta: "4 Part • 60 phút",
      href: "#",
      badge: "Pro",
      color: "from-sky-400 to-blue-500",
      icon: BookOpen,
    },
    {
      title: "Writing",
      desc: "Chấm chữa ngữ pháp cùng AI",
      meta: "2 Task • 60 phút",
      href: "/writing", // <-- Đổi "#" thành "/writing" tại đây
      badge: "Pro",
      color: "from-indigo-400 to-purple-500",
      icon: PenTool,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        
        {/* KHU VỰC 1: TIẾN ĐỘ MỤC TIÊU & BẢNG XẾP HẠNG */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT 1: LỘ TRÌNH MỤC TIÊU */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-base">Lộ trình B1 & B2</span>
                <Badge variant="secondary" className="text-xs">Theo ngày</Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Còn <b>92 ngày</b> (31/12)</span>
                <button className="text-primary hover:underline ml-auto font-medium">Đổi</button>
              </div>

              <div className="space-y-2 pt-2">
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    <span>Lộ trình Oxford B1</span>
                    <span className="bg-emerald-200/60 px-2 py-0.5 rounded-full text-[10px]">25 Ngày</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Từ mất gốc đến tự tin 4.0 – 5.5</p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    <span>Lộ trình Oxford B2</span>
                    <span className="bg-amber-200/60 px-2 py-0.5 rounded-full text-[10px]">25 Ngày</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Luyện thực chiến & bứt phá 6.0 – 8.0</p>
                </div>
              </div>
            </div>

            <Button className="w-full mt-6 rounded-2xl gap-2 font-semibold">
              Khám phá lộ trình <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* CỘT 2: TỔNG QUAN CHỈ SỐ VỚI SKELETON & ANIMATED COUNTER */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Chỉ số hệ thống tuần này</h3>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-center">
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                      <AnimatedCounter value={stats?.totalSubmissions || 0} />+
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">Bài nộp</p>
                  </div>
                  <div className="bg-sky-50/60 dark:bg-sky-950/20 p-4 rounded-2xl text-center">
                    <span className="text-xl font-black text-sky-600">
                      <AnimatedCounter value={stats?.activeLearners || 0} />+
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">Học viên</p>
                  </div>
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl text-center">
                    <span className="text-xl font-black text-emerald-600">
                      <AnimatedCounter value={stats?.b1Completed || 0} />+
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">Làm BT B1</p>
                  </div>
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl text-center">
                    <span className="text-xl font-black text-amber-600">
                      <AnimatedCounter value={stats?.b2Completed || 0} />+
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">Làm BT B2</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center pt-4 border-t border-slate-100 dark:border-slate-800">
              Dữ liệu được cập nhật tự động từ cơ sở dữ liệu PostgreSQL[span_2](start_span)[span_2](end_span)[span_3](start_span)[span_3](end_span)
            </p>
          </div>

          {/* CỘT 3: BẢNG XẾP HẠNG HỌC TẬP (LEADERBOARD) TỪ API THẬT */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-100">BXH Học Tập</span>
                </div>
                <Badge variant="outline" className="text-rose-500 border-rose-200 bg-rose-50 text-[10px] flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-rose-500" /> Tuần này
                </Badge>
              </div>

              {loading ? (
                <div className="space-y-3 pt-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {topRankings && topRankings.length > 0 ? (
                    topRankings.map((user: any) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 rounded-2xl ${
                          user.rank === 1
                            ? "bg-amber-50/70 border border-amber-200/60"
                            : "bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 text-center text-sm font-black ${user.rank === 1 ? "text-amber-600" : "text-muted-foreground"}`}>
                            {user.rank === 1 ? "👑" : `#${user.rank}`}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {user.avatar}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</h4>
                            <p className="text-[10px] text-muted-foreground">
                              {user.rank === 1 ? "Top 1 Server" : "Chăm chỉ"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{user.xp} XP</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">Chưa có dữ liệu xếp hạng</p>
                  )}
                </div>
              )}
            </div>

            <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary mt-4">
              Xem bảng xếp hạng đầy đủ ➔
            </Button>
          </div>
        </div>

        {/* KHU VỰC 2: PHÂN TÍCH TIẾN ĐỘ & HIỆU QUẢ HỌC TẬP (DỮ LIỆU THẬT TỪ API) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Phân tích tiến độ & Hiệu quả học tập
            </h2>
            <p className="text-xs text-muted-foreground">
              Dữ liệu thuật toán SuperMemo-2 và phân tích âm vị từ AI Speech Gateway
            </p>
          </div>
          <LearningAnalytics retentionData={retentionCurve} />
        </div>

        {/* KHU VỰC 3: CÁC THẺ KỸ NĂNG VỚI HIỆU ỨNG NHẤC THẺ (LIFT-UP) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Kỹ năng học tập & Luyện thi
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {skillCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="h-full"
                >
                  <Link
                    href={card.href}
                    className="group block h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-6px_rgba(99,102,241,0.15)] hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge
                        variant={card.badge === "Free" ? "secondary" : "default"}
                        className="text-[10px] rounded-full px-2"
                      >
                        {card.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {card.desc}
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                        {card.meta}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* KHU VỰC 4: BỘ LỌC TÌM KIẾM */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["Tất cả", "Chưa làm", "Đã làm", "Luyện tập", "Đề thi mới nhất"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterTab === tab
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm bài tập, từ vựng..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

      </main>
    </div>
  );
}
