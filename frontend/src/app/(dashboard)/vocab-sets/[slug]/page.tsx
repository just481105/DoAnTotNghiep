"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Volume2, ArrowLeft, Layers, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/services/api-client";

interface VocabItem {
  id?: string;
  order: number;
  word: string;
  pos: string;
  ipa: string;
  meaningVi: string;
  collocations?: string[];
  exampleEn: string;
  exampleVi?: string;
}

export default function TopicDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const topicName = decodeURIComponent(slug);

  const [searchQuery, setSearchQuery] = useState("");
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTopicWords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth<Array<Record<string, unknown>>>(
        `/sm2/words?topic=${encodeURIComponent(topicName)}`,
      );
      const list = Array.isArray(data) ? data : [];
      setVocabList(
        list.map((item, idx) => ({
          id: item.id as string,
          order: idx + 1,
          word: String(item.word ?? ""),
          pos: String(item.pos || "NOUN").toUpperCase(),
          ipa: String(item.ipa ?? ""),
          meaningVi: String(item.meaningVi ?? ""),
          exampleEn: String(item.exampleEn ?? ""),
          exampleVi: String(item.exampleVi ?? ""),
          collocations: Array.isArray(item.collocations) ? (item.collocations as string[]) : [],
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được từ vựng.");
    } finally {
      setIsLoading(false);
    }
  }, [topicName]);

  useEffect(() => {
    loadTopicWords();
  }, [loadTopicWords]);

  // 2. Phát âm thanh US
  const handlePlayAudio = (word: string) => {
    setPlayingWord(word);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onend = () => setPlayingWord(null);
      utterance.onerror = () => setPlayingWord(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredWords = vocabList.filter(
    (item) =>
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaningVi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* THANH ĐIỀU HƯỚNG TRỞ VỀ & HÀNH ĐỘNG HỌC FLASHCARD */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/vocab-sets"
              className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  DANH SÁCH TỪ VỰNG
                </h1>
                <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-none font-bold text-xs">
                  {vocabList.length} từ
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chủ đề: <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{topicName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm từ vựng trong bộ này..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <Link href={`/learn?topic=${encodeURIComponent(topicName)}`}>
              <Button className="rounded-2xl gap-2 font-bold text-xs shadow-md shadow-indigo-600/20">
                <Layers className="w-4 h-4" />
                Học Flashcard SM-2
              </Button>
            </Link>
          </div>
        </div>

        {/* BẢNG DANH SÁCH CÁC TỪ VỰNG CHI TIẾT */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
            Đang tải dữ liệu từ vựng...
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Không tải được từ vựng</p>
            <p className="text-xs text-slate-500">{error}</p>
            <Button onClick={loadTopicWords} className="rounded-2xl text-xs gap-2 font-bold">
              <RefreshCw className="w-4 h-4" /> Thử lại
            </Button>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            Chủ đề này chưa có từ vựng.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
            {filteredWords.map((item, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors"
              >
                {/* CỘT 1: STT, Từ vựng, Nút loa, Loại từ, Phiên âm IPA */}
                <div className="md:col-span-4 flex items-start gap-3">
                  <span className="text-xs font-mono text-slate-400 font-bold shrink-0 mt-0.5">
                    {item.order}
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {item.word}
                      </span>

                      <button
                        type="button"
                        onClick={() => handlePlayAudio(item.word)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all ${
                          playingWord === item.word
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-slate-200 text-slate-500 hover:text-indigo-600"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-slate-200 px-1.5 py-0.2"
                      >
                        {item.pos}
                      </Badge>
                    </div>

                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {item.ipa}
                    </p>
                  </div>
                </div>

                {/* CỘT 2: Nghĩa tiếng Việt & Collocations */}
                <div className="md:col-span-4 space-y-1.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {item.meaningVi}
                  </p>

                  {item.collocations && item.collocations.length > 0 && (
                    <div className="space-y-0.5">
                      {item.collocations.map((col, cIdx) => (
                        <p key={cIdx} className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          {col}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* CỘT 3: Ví dụ tiếng Anh & Dịch nghĩa */}
                <div className="md:col-span-4 space-y-1">
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    {item.exampleEn}
                  </p>
                  {item.exampleVi && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {item.exampleVi}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
