"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BookOpen, Clock, Award, ArrowRight, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/services/api-client";

interface ExamItem {
  id: string;
  title: string;
  description: string | null;
  examType: string;
  durationMin: number;
  totalMarks: number;
  _count: { questions: number };
}

export default function ExamsListPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth<ExamItem[]>("/exams");
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách đề thi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6">
      <main className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <Badge className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border-none font-bold">
              Đánh giá năng lực
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Ngân Hàng Đề Thi Chuẩn Hóa
            </h1>
            <p className="text-xs text-slate-500">
              Các bài thi trắc nghiệm có tính giờ và chấm điểm tự động.
            </p>
          </div>
          <Award className="w-12 h-12 text-indigo-500 hidden sm:block opacity-80" />
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
            Đang nạp ngân hàng đề thi...
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Không tải được đề thi</p>
            <p className="text-xs text-slate-500">{error}</p>
            <Button onClick={load} className="rounded-2xl text-xs gap-2 font-bold">
              <RefreshCw className="w-4 h-4" /> Thử lại
            </Button>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            Chưa có đề thi nào được xuất bản.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold text-indigo-600 border-indigo-200">
                      {item.examType}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.durationMin} phút</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {item._count?.questions ?? 0} câu hỏi
                  </span>
                  <Link href={`/exams/${item.id}`}>
                    <Button size="sm" className="rounded-xl text-xs gap-1.5 font-bold bg-indigo-600 hover:bg-indigo-700">
                      Vào thi <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
