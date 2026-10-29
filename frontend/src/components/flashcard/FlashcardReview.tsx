"use client";

import { useState } from "react";

type Rating = "again" | "hard" | "good" | "easy";

interface FlashcardProps {
  card: {
    id: string;
    word: string;
    phonetic?: string;
    meaning: string;
    example?: string;
  };
  userId: string;
  onNext: () => void;
}

export default function FlashcardReview({ card, userId, onNext }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleReview = async (rating: Rating) => {
    setLoading(true);
    try {
      // Đổi 3001 thành đúng cổng của NestJS backend đang chạy
      const res = await fetch("http://localhost:3001/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          wordId: card.id,
          rating: rating,
        }),
      });

      const data = await res.json();
      setLastResult(data);
      setIsFlipped(false);
      onNext();
    } catch (error) {
      console.error("Lỗi khi gửi kết quả review:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="h-64 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center text-center select-none"
      >
        <span className="text-xs uppercase font-bold text-indigo-500 tracking-wider mb-2">
          {isFlipped ? "Định nghĩa & Nghĩa tiếng Việt" : "Từ vựng (Bấm để lật)"}
        </span>

        {!isFlipped ? (
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{card.word}</h2>
            {card.phonetic && <p className="text-sm text-slate-400 mt-1">{card.phonetic}</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{card.meaning}</h3>
            {card.example && <p className="text-xs text-slate-500 italic">"{card.example}"</p>}
          </div>
        )}
      </div>

      {isFlipped && (
        <div className="grid grid-cols-4 gap-2 animate-fade-in">
          <button
            disabled={loading}
            onClick={() => handleReview("again")}
            className="py-2.5 px-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition-colors disabled:opacity-50"
          >
            Again
          </button>
          <button
            disabled={loading}
            onClick={() => handleReview("hard")}
            className="py-2.5 px-2 bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold text-xs rounded-xl border border-amber-200 transition-colors disabled:opacity-50"
          >
            Hard
          </button>
          <button
            disabled={loading}
            onClick={() => handleReview("good")}
            className="py-2.5 px-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs rounded-xl border border-indigo-200 transition-colors disabled:opacity-50"
          >
            Good
          </button>
          <button
            disabled={loading}
            onClick={() => handleReview("easy")}
            className="py-2.5 px-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs rounded-xl border border-emerald-200 transition-colors disabled:opacity-50"
          >
            Easy
          </button>
        </div>
      )}

      {lastResult && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Kết quả SM-2 vừa cập nhật:</p>
          <p>Lần ôn liên tiếp (Repetition): {lastResult.repetition}</p>
          <p>Khoảng cách ôn tiếp theo: {lastResult.interval} ngày</p>
          <p>Hệ số ghi nhớ (EF): {lastResult.easinessFactor}</p>
          <p>Hạn ôn tiếp theo: {new Date(lastResult.nextReviewDate).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
