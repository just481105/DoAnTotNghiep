"use client";

import React, { useRef } from "react";
import { Volume2 } from "lucide-react";
import { Vocabulary } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FlipCardProps {
  item: Vocabulary;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlipCard({ item, isFlipped, onFlip }: FlipCardProps) {
  // Bảo vệ an toàn: Nếu item chưa có dữ liệu thì không render để tránh crash
  if (!item) return null;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Link phát âm chuẩn bản xứ Mỹ từ kho dữ liệu Oxford/FreeDictionary
  const nativeAudioUrl =
    item.audio_us_url ||
    `https://api.dictionaryapi.dev/media/pronunciations/en/${item.word?.toLowerCase()}-us.mp3`;

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation(); // Tránh lật thẻ khi bấm nút loa

    let hasPlayed = false;
    const audio = new Audio(nativeAudioUrl);

    // Đặt timeout 800ms: Nếu file mạng tải quá lâu, hủy luôn và phát giọng máy bản xứ tức thì
    const timeoutTimer = setTimeout(() => {
      if (!hasPlayed) {
        hasPlayed = true;
        audio.src = ""; // Hủy tải file mạng đang treo
        playNativeAmericanTTS(item.word);
      }
    }, 800);

    audio
      .play()
      .then(() => {
        hasPlayed = true;
        clearTimeout(timeoutTimer);
      })
      .catch(() => {
        if (!hasPlayed) {
          hasPlayed = true;
          clearTimeout(timeoutTimer);
          audio.src = "";
          playNativeAmericanTTS(item.word);
        }
      });
  };

  const playNativeAmericanTTS = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;

    // Lọc danh sách giọng đọc, loại bỏ hoàn toàn các giọng tiếng Việt/giọng mặc định
    const voices = window.speechSynthesis.getVoices();
    const americanNativeVoice =
      voices.find(
        (v) =>
          v.lang === "en-US" &&
          (v.name.includes("Google US English") ||
            v.name.includes("Samantha") ||
            v.name.includes("Ava") ||
            v.name.includes("Allison") ||
            v.name.includes("Natural"))
      ) || voices.find((v) => v.lang.startsWith("en-US"));

    if (americanNativeVoice) {
      utterance.voice = americanNativeVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className="w-full max-w-lg h-96 cursor-pointer select-none [perspective:1000px] mx-auto"
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* MẶT TRƯỚC */}
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 rounded-2xl p-8 flex flex-col justify-between items-center [backface-visibility:hidden]">
          <div className="w-full flex justify-between items-center">
            <Badge variant="secondary" className="uppercase tracking-wider font-semibold">
              {item.pos} • {item.cefr_level}
            </Badge>
            <span className="text-xs text-muted-foreground">Nhấn Space hoặc Click để lật</span>
          </div>

          <div className="flex flex-col items-center gap-3 text-center my-auto">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {item.word}
            </h2>
            <p className="text-lg font-mono text-slate-500 dark:text-slate-400">
              {item.ipa}
            </p>

            {/* Nút bấm nghe âm thanh */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full mt-2 h-12 w-12 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 transition-all"
              onClick={handlePlayAudio}
              title="Nghe phát âm chuẩn bản xứ US"
            >
              <Volume2 className="h-5 w-5 text-primary" />
            </Button>
          </div>

          <div className="w-full text-center">
            <span className="text-xs text-slate-400">Xem nghĩa & ngữ cảnh ➔</span>
          </div>
        </div>

        {/* MẶT SAU */}
        <div className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-950 rounded-2xl p-8 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-primary">{item.word}</span>
              <Badge variant="outline">{item.pos}</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Nghĩa tiếng Việt</span>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{item.meaning_vi}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Định nghĩa En</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic">{item.meaning_en}</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Ví dụ ngữ cảnh</span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1">
                  "{item.example_en}"
                </p>
                {item.example_vi && (
                  <p className="text-xs text-slate-400 mt-0.5">({item.example_vi})</p>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Chọn mức độ nhớ bên dưới để tiếp tục
          </p>
        </div>
      </div>
    </div>
  );
}
