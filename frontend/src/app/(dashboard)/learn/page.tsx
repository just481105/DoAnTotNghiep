"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/services/api-client";

interface VocabCard {
  id: string;
  word: string;
  pos: string;
  cefrLevel: string;
  ipa: string;
  meaningVi: string;
  meaningEn?: string;
  exampleEn: string;
  exampleVi?: string;
  audioUrl?: string;
  topic?: string;
  repetitions: number;
  intervalDays: number;
  easinessFactor: number;
}

const GRADES = [
  { q: 0, label: "Quên hẳn", color: "hover:bg-rose-500 hover:text-white" },
  { q: 1, label: "Sai sót", color: "hover:bg-orange-500 hover:text-white" },
  { q: 2, label: "Khó nhớ", color: "hover:bg-amber-500 hover:text-white" },
  { q: 3, label: "Tạm ổn", color: "hover:bg-sky-500 hover:text-white" },
  { q: 4, label: "Nhớ tốt", color: "hover:bg-blue-500 hover:text-white" },
  { q: 5, label: "Thuần thục", color: "hover:bg-emerald-500 hover:text-white" },
];

function LearnContent() {
  const searchParams = useSearchParams();
  const currentTopic = searchParams.get("topic");

  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setGradeError(null);
    try {
      const params = new URLSearchParams({ mode: "study" });
      if (currentTopic) params.set("topic", currentTopic);
      const data = await fetchWithAuth<VocabCard[]>(`/sm2/words?${params.toString()}`);
      setCards(Array.isArray(data) ? data : []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Không tải được danh sách thẻ.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentTopic]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handlePlayAudio = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGrade = useCallback(
    async (grade: number) => {
      const card = cards[currentIndex];
      if (!card || isGrading) return;
      setIsGrading(true);
      setGradeError(null);
      try {
        await fetchWithAuth("/sm2/grade", {
          method: "POST",
          body: JSON.stringify({ vocabularyId: card.id, quality: grade }),
        });
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } catch (err) {
        setGradeError(
          err instanceof Error
            ? `Không lưu được điểm: ${err.message}`
            : "Không lưu được điểm, thử lại.",
        );
      } finally {
        setIsGrading(false);
      }
    },
    [cards, currentIndex, isGrading],
  );

  // Phím tắt: Space để lật, 0-5 để chấm điểm
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (["0", "1", "2", "3", "4", "5"].includes(e.key) && isFlipped) {
        void handleGrade(parseInt(e.key, 10));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFlipped, handleGrade]);

  const topicLabel = currentTopic ? decodeURIComponent(currentTopic) : "Tất cả từ vựng";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Đang nạp bộ Flashcard...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Không tải được thẻ</h3>
        <p className="text-xs text-slate-500 max-w-xs">{loadError}</p>
        <div className="flex gap-2">
          <Button onClick={loadCards} className="rounded-2xl text-xs gap-2 font-bold">
            <RefreshCw className="w-4 h-4" /> Thử lại
          </Button>
          <Link href="/vocab-sets">
            <Button variant="outline" className="rounded-2xl text-xs font-bold">Quay lại</Button>
          </Link>
        </div>
      </div>
    );
  }

  const total = cards.length;
  const finished = total > 0 && currentIndex >= total;
  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 select-none">
      <div className="max-w-xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/vocab-sets"
          className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="text-center">
          <Badge variant="outline" className="text-xs uppercase font-bold text-indigo-600 border-indigo-200">
            {topicLabel}
          </Badge>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total === 0 ? "Không có thẻ" : finished ? "Hoàn thành" : `${currentIndex + 1} / ${total}`}
          </p>
        </div>

        <button
          onClick={loadCards}
          aria-label="Tải lại"
          className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-xl w-full mx-auto my-auto py-6">
        {total === 0 ? (
          <div className="w-full min-h-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-4">
            <span className="text-4xl">✅</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hôm nay không còn thẻ cần học</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Tất cả từ đã được lên lịch ôn. Quay lại khi có thẻ đến hạn, hoặc chọn bộ từ khác.
            </p>
            <Link href="/vocab-sets">
              <Button className="rounded-2xl text-xs gap-2 font-bold">
                <Layers className="w-4 h-4" /> Chọn bộ từ khác
              </Button>
            </Link>
          </div>
        ) : !finished && currentCard ? (
          <div
            onClick={() => setIsFlipped((f) => !f)}
            className="w-full min-h-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
          >
            {!isFlipped ? (
              <div className="flex flex-col justify-between h-full space-y-6">
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold">
                    {currentCard.cefrLevel || "B1"}
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                    {currentCard.pos}
                  </span>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {currentCard.word}
                  </h2>
                  <p className="text-sm font-mono text-slate-500">{currentCard.ipa}</p>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-xl text-xs gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAudio(currentCard.word);
                    }}
                  >
                    🔊 Nghe phát âm
                  </Button>
                </div>

                <p className="text-[11px] text-center text-slate-400 italic">Nhấn Space hoặc chạm vào thẻ để lật</p>
              </div>
            ) : (
              <div className="flex flex-col justify-between h-full space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {currentCard.meaningVi}
                  </h3>
                  {currentCard.meaningEn && (
                    <p className="text-xs text-slate-500 mt-1">{currentCard.meaningEn}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs italic text-slate-700 dark:text-slate-300">
                    &ldquo;{currentCard.exampleEn}&rdquo;
                  </p>
                  {currentCard.exampleVi && (
                    <p className="text-[11px] text-slate-400">{currentCard.exampleVi}</p>
                  )}
                </div>

                <p className="text-[11px] text-center text-slate-400 italic">Chọn mức độ ghi nhớ bên dưới</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full min-h-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-4">
            <span className="text-4xl">🎉</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Đã hoàn thành phiên học!</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Các từ đã được lên lịch ôn tiếp theo dựa trên thuật toán SM-2.
            </p>
            <div className="flex gap-2">
              <Button onClick={loadCards} variant="outline" className="rounded-2xl text-xs gap-2 font-bold">
                <RefreshCw className="w-4 h-4" /> Học tiếp
              </Button>
              <Link href="/vocab-sets">
                <Button className="rounded-2xl text-xs gap-2 font-bold">
                  <Layers className="w-4 h-4" /> Quay lại danh mục
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-xl w-full mx-auto space-y-2">
        {gradeError && (
          <p role="alert" className="rounded-xl bg-rose-50 text-rose-700 text-xs px-3 py-2 text-center">
            {gradeError}
          </p>
        )}
        <div className="grid grid-cols-6 gap-2">
          {GRADES.map((item) => (
            <button
              key={item.q}
              disabled={!isFlipped || isGrading || finished || total === 0}
              onClick={() => void handleGrade(item.q)}
              className={`p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs flex flex-col items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${item.color}`}
            >
              <span className="font-mono text-sm">{item.q}</span>
              <span className="text-[10px] font-normal hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500 dark:bg-slate-950">
          Đang nạp bộ flashcard...
        </div>
      }
    >
      <LearnContent />
    </Suspense>
  );
}
