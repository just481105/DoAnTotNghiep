"use client";

import React from "react";
import { SpeechEvaluationResult } from "@/types";
import { Badge } from "@/components/ui/badge";

interface PhonemeDisplayProps {
  result: SpeechEvaluationResult | null;
}

export function PhonemeDisplay({ result }: PhonemeDisplayProps) {
  if (!result) return null;

  return (
    <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4 mx-auto">
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <span className="text-xs text-muted-foreground uppercase font-semibold">Từ cần luyện</span>
          <h3 className="text-2xl font-bold">{result.word}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Độ chính xác</span>
          <div className="text-2xl font-black text-primary">{result.accuracy_score}%</div>
        </div>
      </div>

      <div>
        <span className="text-xs text-muted-foreground font-medium mb-2 block">
          Chi tiết âm vị IPA (Xanh: Đúng • Đỏ: Cần chỉnh):
        </span>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xl">
          <span>/</span>
          {result.phonemes.map((item, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 rounded-md font-bold transition-colors ${
                item.is_correct
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 underline decoration-wavy"
              }`}
              title={`Điểm: ${item.score}/100`}
            >
              {item.phoneme}
            </span>
          ))}
          <span>/</span>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg text-xs text-slate-500">
        AI nhận diện bạn nói: <span className="font-semibold text-slate-800 dark:text-slate-200">"{result.transcribed_text}"</span>
      </div>
    </div>
  );
}
