"use client";

import { useState } from "react";
import FlashcardReview from "@/components/flashcard/FlashcardReview";

const DUMMY_CARDS = [
  { id: "word_01", word: "Ubiquitous", phonetic: "/juːˈbɪk.wə.təs/", meaning: "Có mặt ở khắp mọi nơi", example: "Smartphones have become ubiquitous in daily life." },
  { id: "word_02", word: "Resilience", phonetic: "/rɪˈzɪl.jəns/", meaning: "Khả năng phục hồi, kiên cường", example: "The team showed great resilience during the crisis." },
  { id: "word_03", word: "Meticulous", phonetic: "/məˈtɪk.jə.ləs/", meaning: "Tỉ mỉ, cẩn thận từng chi tiết", example: "He is meticulous about his code quality." },
];

export default function TestFlashcardPage() {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % DUMMY_CARDS.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Kiểm tra Thuật toán SM-2</h1>
        <p className="text-sm text-slate-500 mt-1">
          Đang xem thẻ {index + 1} / {DUMMY_CARDS.length}
        </p>
      </div>

      <FlashcardReview
        card={DUMMY_CARDS[index]}
        userId="user-test-1"
        onNext={handleNext}
      />
    </div>
  );
}
