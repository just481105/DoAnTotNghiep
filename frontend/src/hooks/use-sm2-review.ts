"use client";

import { useState, useEffect, useCallback } from "react";
import { Vocabulary, SM2Rating } from "@/types";

interface OfflineReviewPayload {
  wordId: string;
  rating: SM2Rating;
  timestamp: number;
}

const OFFLINE_STORAGE_KEY = "offline_sm2_reviews_queue";

export function useSm2Review(initialVocabularies: Vocabulary[]) {
  const [queue, setQueue] = useState<Vocabulary[]>(initialVocabularies);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const currentWord = queue[currentIndex] || null;

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      const rawData = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (rawData) {
        localStorage.removeItem(OFFLINE_STORAGE_KEY);
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    async (rating: SM2Rating) => {
      if (!currentWord) return;

      const payload: OfflineReviewPayload = {
        wordId: currentWord.id,
        rating,
        timestamp: Date.now(),
      };

      if (!navigator.onLine) {
        const existing: OfflineReviewPayload[] = JSON.parse(
          localStorage.getItem(OFFLINE_STORAGE_KEY) || "[]"
        );
        existing.push(payload);
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(existing));
      }

      if (rating < 3) {
        setQueue((prev) => [...prev, currentWord]);
      }

      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentWord]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        toggleFlip();
      }

      if (isFlipped && ["0", "1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        handleRate(Number(e.key) as SM2Rating);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, toggleFlip, handleRate]);

  return {
    currentWord,
    isFlipped,
    isOffline,
    isCompleted: currentIndex >= queue.length,
    progress: queue.length > 0 ? (currentIndex / queue.length) * 100 : 0,
    toggleFlip,
    handleRate,
  };
}