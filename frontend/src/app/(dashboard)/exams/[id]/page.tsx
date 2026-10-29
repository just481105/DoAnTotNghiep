"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BACKEND_URL = process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:5001";
const STUDENT_USER_ID = "e6de30ce-ac04-487f-b376-163240602f84";

interface QuestionOption {
  id: string;
  optionLabel: string;
  content: string;
}

interface Question {
  id: string;
  prompt: string;
  orderIndex: number;
  options: QuestionOption[];
}

interface ExamDetail {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  questions: Question[];
}

interface ReviewItem {
  questionId: string;
  prompt: string;
  explanation: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
}

interface ExamResult {
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  reviewDetails: ReviewItem[];
}

export default function ExamTakingPage() {
  const params = useParams();
  const examId = params?.id as string;

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Tải chi tiết đề thi từ NestJS
  useEffect(() => {
    if (!examId) return;

    async function fetchExam() {
      try {
        const res = await fetch(`${BACKEND_URL}/exams/${examId}`);
        if (res.ok) {
          const data = await res.json();
          setExam(data);
          setTimeLeft((data.durationMin || 15) * 60);
        }
      } catch (err) {
        console.error("Lỗi nạp đề thi:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExam();
  }, [examId]);

  // 2. Đồng hồ đếm ngược thời gian
  useEffect(() => {
    if (timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  // 3. Gửi bài làm sang NestJS để chấm điểm và lưu vào CSDL
  const handleSubmitExam = async () => {
    if (isSubmitting || result || !examId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: STUDENT_USER_ID,
          answers: selectedAnswers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Lỗi gửi bài thi:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-semibold text-xs animate-pulse">
        Đang chuẩn bị phòng thi...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-500 text-sm">Không tìm thấy thông tin đề thi.</p>
        <Link href="/exams">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại danh mục
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 pb-20">
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Header phòng thi & Đồng hồ */}
        <div className="sticky top-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/exams">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {exam.title}
              </h2>
              <span className="text-[11px] text-slate-400">
                {exam.questions?.length || 0} câu hỏi • Hoàn thành để lưu kết quả
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Khối kết quả bài thi */}
        {result && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 text-center shadow-md">
            <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 mb-2">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Kết Quả Bài Thi
            </h3>
            <div className="flex justify-center items-center gap-6">
              <div>
                <span className="text-3xl font-black text-indigo-600">{result.score}%</span>
                <p className="text-xs text-slate-400">Điểm số</p>
              </div>
              <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800" />
              <div>
                <span className="text-3xl font-black text-emerald-600">
                  {result.totalCorrect}/{result.totalQuestions}
                </span>
                <p className="text-xs text-slate-400">Số câu đúng</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Kết quả bài làm đã được lưu trực tiếp vào cơ sở dữ liệu PostgreSQL.
            </p>
          </div>
        )}

        {/* Danh sách câu hỏi */}
        <div className="space-y-4">
          {exam.questions?.map((q, idx) => {
            const review = result?.reviewDetails?.find((r) => r.questionId === q.id);

            return (
              <div
                key={q.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 space-y-4 transition-all shadow-sm ${
                  review
                    ? review.isCorrect
                      ? "border-emerald-300 dark:border-emerald-900"
                      : "border-rose-300 dark:border-rose-900"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      Câu {idx + 1}
                    </Badge>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {q.prompt}
                    </p>
                  </div>
                  {review && (
                    <div>
                      {review.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {q.options?.map((opt) => {
                    const isSelected = selectedAnswers[q.id] === opt.id;
                    const isCorrectOpt = review?.correctOptionId === opt.id;
                    const isWrongSelected = review && isSelected && !review.isCorrect;

                    let btnStyle =
                      "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300";
                    if (isSelected && !review) {
                      btnStyle =
                        "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 font-bold";
                    } else if (isCorrectOpt) {
                      btnStyle =
                        "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 font-bold";
                    } else if (isWrongSelected) {
                      btnStyle =
                        "border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 line-through";
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={!!result}
                        onClick={() =>
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [q.id]: opt.id,
                          }))
                        }
                        className={`w-full text-left p-3.5 px-4 rounded-2xl border text-xs flex items-center justify-between transition-all ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px]">
                            {opt.optionLabel}
                          </span>
                          <span>{opt.content}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {review && review.explanation && (
                  <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs text-slate-500 flex items-start gap-2 border border-slate-100 dark:border-slate-800">
                    <AlertCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-slate-700 dark:text-slate-300">Giải thích:</strong>{" "}
                      {review.explanation}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nút nộp bài */}
        {!result && (
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmitExam}
              disabled={isSubmitting || Object.keys(selectedAnswers).length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-bold text-xs"
            >
              {isSubmitting ? "Đang chấm điểm..." : "Nộp bài thi"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
