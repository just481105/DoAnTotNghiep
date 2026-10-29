"use client";

import React from "react";
import { SM2Rating } from "@/types";
import { Button } from "@/components/ui/button";

interface Sm2RatingBarProps {
  disabled: boolean;
  onRate: (rating: SM2Rating) => void;
}

const RATINGS: { rate: SM2Rating; label: string; desc: string; keyHint: string; color: string }[] = [
  { rate: 0, label: "Blackout", desc: "Quên hoàn toàn", keyHint: "0", color: "hover:border-red-600 hover:text-red-600" },
  { rate: 1, label: "Incorrect", desc: "Nhớ sai", keyHint: "1", color: "hover:border-rose-500 hover:text-rose-500" },
  { rate: 2, label: "Hard", desc: "Khó nhớ", keyHint: "2", color: "hover:border-orange-500 hover:text-orange-500" },
  { rate: 3, label: "Effort", desc: "Đúng, tốn sức", keyHint: "3", color: "hover:border-amber-500 hover:text-amber-500" },
  { rate: 4, label: "Good", desc: "Nhớ tốt", keyHint: "4", color: "hover:border-emerald-500 hover:text-emerald-500" },
  { rate: 5, label: "Perfect", desc: "Hoàn hảo", keyHint: "5", color: "hover:border-green-600 hover:text-green-600" },
];

export function Sm2RatingBar({ disabled, onRate }: Sm2RatingBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 w-full">
        {RATINGS.map((item) => (
          <Button
            key={item.rate}
            disabled={disabled}
            variant="outline"
            onClick={() => onRate(item.rate)}
            className={`flex flex-col h-auto py-2.5 px-1 border transition-all ${item.color} ${
              disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm">{item.rate}</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono">
                [{item.keyHint}]
              </span>
            </div>
            <span className="text-xs font-semibold">{item.label}</span>
            <span className="text-[10px] text-muted-foreground text-center line-clamp-1">{item.desc}</span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Mẹo: Nhấn số <kbd className="px-1 py-0.5 border rounded bg-slate-100 dark:bg-slate-800">0</kbd> đến <kbd className="px-1 py-0.5 border rounded bg-slate-100 dark:bg-slate-800">5</kbd> trên bàn phím để chọn nhanh.
      </p>
    </div>
  );
}