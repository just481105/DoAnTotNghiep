"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Zap, CalendarClock, Users, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/services/api-client";

interface DashboardStats {
  user: {
    id: string;
    fullName: string | null;
    email: string;
    streakDays: number;
    xpPoints: number;
  } | null;
  stats: { activeLearners: number; dueTodayCount: number };
  retentionCurve: { name: string; value: number; color: string }[];
  topRankings: { id: string; name: string; xp: number; rank: number; avatar: string }[];
}

const CARD =
  "rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchWithAuth<DashboardStats>("/users/me/dashboard-stats"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu tiến độ.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-semibold text-slate-400 animate-pulse">
        Đang tải tiến độ học...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto mt-16 max-w-md space-y-3 text-center">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Không tải được tiến độ</p>
        <p className="text-xs text-slate-500">{error}</p>
        <Button onClick={load} className="rounded-2xl text-xs gap-2 font-bold">
          <RefreshCw className="w-4 h-4" /> Thử lại
        </Button>
      </div>
    );
  }

  const total = data.retentionCurve.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950">
      <main className="mx-auto max-w-5xl space-y-6 px-4 pt-8 sm:px-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Xin chào, {data.user?.fullName || "bạn"}
          </h1>
          <p className="text-xs text-slate-500">Tiến độ học tập của bạn.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className={CARD}>
            <Zap className="mb-2 size-5 text-amber-500" />
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{data.user?.xpPoints ?? 0}</p>
            <p className="text-xs text-slate-500">Điểm XP</p>
          </div>
          <div className={CARD}>
            <Flame className="mb-2 size-5 text-orange-500" />
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{data.user?.streakDays ?? 0}</p>
            <p className="text-xs text-slate-500">Ngày liên tiếp</p>
          </div>
          <div className={CARD}>
            <CalendarClock className="mb-2 size-5 text-sky-500" />
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{data.stats.dueTodayCount}</p>
            <p className="text-xs text-slate-500">Thẻ đến hạn ôn</p>
          </div>
          <div className={CARD}>
            <Users className="mb-2 size-5 text-emerald-500" />
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{data.stats.activeLearners}</p>
            <p className="text-xs text-slate-500">Học viên trong hệ thống</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className={CARD}>
            <h2 className="mb-4 text-sm font-extrabold text-slate-900 dark:text-slate-100">Trạng thái ghi nhớ</h2>
            {total === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Chưa có thẻ nào. Hãy bắt đầu một bộ từ để thấy tiến độ ở đây.
              </p>
            ) : (
              <div className="space-y-4">
                {data.retentionCurve.map((r) => (
                  <div key={r.name}>
                    <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>{r.name}</span>
                      <b>{r.value}</b>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(r.value / total) * 100}%`, backgroundColor: r.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/vocab-sets" className="mt-5 inline-block text-xs font-bold text-blue-600 hover:underline">
              Học từ vựng ngay
            </Link>
          </section>

          <section className={CARD}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-slate-100">
              <Trophy className="size-4 text-amber-500" /> Bảng xếp hạng XP
            </h2>
            <ol className="space-y-2">
              {data.topRankings.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 px-3 py-2 dark:border-slate-800"
                >
                  <span className="w-5 text-center text-xs font-bold text-slate-400">{u.rank}</span>
                  <span className="grid size-8 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {u.avatar}
                  </span>
                  <span className="flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {u.name}
                  </span>
                  <span className="text-sm font-bold text-orange-600">{u.xp} XP</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
