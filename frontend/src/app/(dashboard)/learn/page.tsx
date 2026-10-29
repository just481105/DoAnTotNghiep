"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const DEMO_USER_ID = "e6de30ce-ac04-487f-b376-163240602f84";
const BACKEND_URL = process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:5001";

export default function LearnPage() {
  const searchParams = useSearchParams();
  const currentTopic = searchParams.get("topic");

  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);

  // 1. Tải danh sách từ vựng theo Topic từ Backend
  const loadCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const topicQuery = currentTopic ? `&topic=${encodeURIComponent(currentTopic)}` : "";
      const res = await fetch(`${BACKEND_URL}/sm2/words?userId=${DEMO_USER_ID}${topicQuery}`);
      if (!res.ok) throw new Error("Lỗi tải từ vựng");
      const data = await res.json();
      setCards(data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTopic]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // 2. Phát âm thanh chuẩn US
  const handlePlayAudio = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 3. Gửi đánh giá SM-2 (0 - 5 điểm)
  const handleGrade = async (grade: number) => {
    if (cards.length === 0 || isGrading) return;
    setIsGrading(true);

    const currentCard = cards[currentIndex];
    try {
      await fetch(`${BACKEND_URL}/sm2/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          vocabularyId: currentCard.id,
          quality: grade,
        }),
      });

      // Lật lại mặt trước và chuyển sang từ kế tiếp
      setIsFlipped(false);
      setTimeout(() => {
        if (currentIndex + 1 < cards.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setCurrentIndex(cards.length); // Hoàn thành bộ thẻ
        }
        setIsGrading(false);
      }, 200);
    } catch (err) {
      console.error("Lỗi khi lưu điểm SM-2:", err);
      setIsGrading(false);
    }
  };

  // Phím tắt bàn phím: Space để lật, phím 0-5 để chấm điểm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (["0", "1", "2", "3", "4", "5"].includes(e.key) && isFlipped) {
        handleGrade(parseInt(e.key, 10));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, currentIndex, cards]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Đang nạp bộ Flashcard...</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* HEADER: Quay lại + Thông tin chủ đề + Tiến độ */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/vocab-sets"
          className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="text-center">
          <Badge variant="outline" className="text-xs uppercase font-bold text-indigo-600 border-indigo-200">
            {currentTopic ? decodeURIComponent(currentTopic) : "Tất cả từ vựng"}
          </Badge>
          <p className="text-xs text-muted-foreground mt-0.5">
            {cards.length > 0 && currentIndex < cards.length ? `${currentIndex + 1} / ${cards.length}` : "Hoàn thành"}
          </p>
        </div>

        <button
          onClick={loadCards}
          className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* THẺ FLASHCARD 3D */}
      <div className="max-w-xl w-full mx-auto my-auto py-6">
        {currentIndex < cards.length && currentCard ? (
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
          >
            {!isFlipped ? (
              /* MẶT TRƯỚC */
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
              /* MẶT SAU */
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
                    "{currentCard.exampleEn}"
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
          /* TRẠNG THÁI HOÀN THÀNH */
          <div className="w-full min-h-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-4">
            <span className="text-4xl">🎉</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Đã hoàn thành bộ thẻ này!</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Các từ đã được lên lịch ôn tập tiếp theo dựa theo thuật toán SM-2.
            </p>
            <Link href="/vocab-sets">
              <Button className="rounded-2xl text-xs gap-2 font-bold">
                <Layers className="w-4 h-4" /> Quay lại danh mục
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* THANH ĐÁNH GIÁ 6 MỨC ĐỘ SM-2 (0 ĐẾN 5) */}
      <div className="max-w-xl w-full mx-auto">
        <div className="grid grid-cols-6 gap-2">
          {[
            { q: 0, label: "Quên hẳn", color: "hover:bg-rose-500 hover:text-white" },
            { q: 1, label: "Sai sót", color: "hover:bg-orange-500 hover:text-white" },
            { q: 2, label: "Khó nhớ", color: "hover:bg-amber-500 hover:text-white" },
            { q: 3, label: "Tạm ổn", color: "hover:bg-sky-500 hover:text-white" },
            { q: 4, label: "Nhớ tốt", color: "hover:bg-blue-500 hover:text-white" },
            { q: 5, label: "Thuần thục", color: "hover:bg-emerald-500 hover:text-white" },
          ].map((item) => (
            <button
              key={item.q}
              disabled={!isFlipped || isGrading || currentIndex >= cards.length}
              onClick={() => handleGrade(item.q)}
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
