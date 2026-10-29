"use client";

import React, { useState } from "react";
import { 
  PenTool, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  RotateCcw,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AI_GATEWAY_URL = process.env.NEXT_PUBLIC_AI_GATEWAY_URL || "http://localhost:8000";

// Sửa thành:
interface GrammarError {
  original_text: string;
  corrected_text: string;
  explanation: string;
}

interface WritingResult {
  overall_score: number;
  task_achievement: number;
  coherence_cohesion: number;
  lexical_resource: number;
  grammatical_accuracy: number;
  general_feedback: string;
  better_version: string;
  grammar_errors: GrammarError[];
}

const SAMPLE_PROMPTS = [
  {
    type: "VSTEP Task 2 (Essay)",
    title: "Online Learning vs Traditional Learning",
    description: "Some people believe that online learning is more effective than attending traditional classes. To what extent do you agree or disagree? Give reasons and examples."
  },
  {
    type: "VSTEP Task 1 (Letter)",
    title: "Letter of Complaint",
    description: "You recently bought a camera online, but it arrived damaged. Write a letter to the store manager to explain the issue and request a replacement or refund."
  }
];

export default function WritingMentorPage() {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [essayContent, setEssayContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<WritingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activePrompt = SAMPLE_PROMPTS[selectedPromptIndex];
  const wordCount = essayContent.trim() ? essayContent.trim().split(/\s+/).length : 0;

  const handleEvaluate = async () => {
    if (wordCount < 20) {
      setErrorMsg("Vui lòng viết tối thiểu 20 từ để AI có đủ dữ liệu phân tích.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMsg(null);

      const res = await fetch(`${AI_GATEWAY_URL}/api/v1/evaluate-writing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt.title + ": " + activePrompt.description,
          essay_text: essayContent,
          task_type: "VSTEP_TASK_2"
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Không thể phân tích bài viết");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi kết nối AI Gateway (Port 8000)");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setEssayContent("");
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 pb-24">
      <main className="max-w-5xl mx-auto space-y-6">
        {/* Banner tiêu đề */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <Badge className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border-none font-bold">
              AI Writing Mentor
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Chấm & Chữa Bài Viết VSTEP AI
            </h1>
            <p className="text-xs text-slate-500">
              Đánh giá theo 4 tiêu chí chuẩn VSTEP: Bố cục, Mạch lạc, Vốn từ và Ngữ pháp.
            </p>
          </div>
          <PenTool className="w-12 h-12 text-indigo-500 hidden sm:block opacity-80" />
        </div>

        {/* Khung chọn Đề bài */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Chọn đề bài luyện viết
            </span>
            <div className="flex gap-2">
              {SAMPLE_PROMPTS.map((p, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant={selectedPromptIndex === idx ? "default" : "outline"}
                  className="rounded-xl text-xs font-semibold"
                  onClick={() => {
                    setSelectedPromptIndex(idx);
                    handleReset();
                  }}
                >
                  {p.type}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              {activePrompt.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {activePrompt.description}
            </p>
          </div>
        </div>

        {/* Khung Soạn thảo */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Bài làm của bạn
            </span>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
              wordCount >= 150 
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" 
                : "bg-slate-100 text-slate-500 dark:bg-slate-800"
            }`}>
              {wordCount} từ {wordCount >= 250 && "✓ (Đạt chuẩn Task 2)"}
            </span>
          </div>

          <textarea
            value={essayContent}
            onChange={(e) => setEssayContent(e.target.value)}
            disabled={isAnalyzing}
            placeholder="Nhập bài viết bằng tiếng Anh của bạn tại đây... (Ví dụ: In modern society, online education has become increasingly popular...)"
            rows={10}
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed resize-y"
          />

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isAnalyzing || !essayContent}
              className="rounded-xl text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Viết lại
            </Button>
            <Button
              size="sm"
              onClick={handleEvaluate}
              disabled={isAnalyzing || wordCount < 20}
              className="rounded-xl text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI đang chấm điểm...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Chấm điểm với AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Khung Kết Quả Đánh Giá Chi Tiết */}
        {result && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Điểm tổng quan và 4 tiêu chí */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Báo Cáo Đánh Giá Bài Viết
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Thang điểm 10 quy đổi chuẩn định dạng VSTEP
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    Điểm Tổng:
                  </span>
                  <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                    {result.overall_score}
                    <span className="text-base font-normal text-slate-400">/10</span>
                  </span>
                </div>
              </div>

              {/* 4 Tiêu chí VSTEP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Bố cục & Nhiệm vụ</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                    {result.task_achievement}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Độ mạch lạc</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                    {result.coherence_cohesion}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Vốn từ vựng</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                    {result.lexical_resource}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Độ chuẩn ngữ pháp</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                    {result.grammatical_accuracy}
                  </span>
                </div>
              </div>

              {/* Nhận xét tổng quan */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Nhận xét của AI Mentor:</strong> {result.general_feedback}
                </div>
              </div>
            </div>

            {/* Chi tiết sửa lỗi ngữ pháp */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Các lỗi ngữ pháp cần lưu ý
              </h4>

              {result.grammar_errors.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Không phát hiện lỗi ngữ pháp cơ bản nào.</p>
              ) : (
                <div className="space-y-3">
                  {result.grammar_errors.map((err, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-rose-600 line-through bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg font-mono font-medium">
                          {err.original_text}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg font-mono">
                          {err.corrected_text}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">{err.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Đoạn văn tham khảo viết lại tự nhiên hơn */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Phiên bản viết lại tự nhiên hơn (Native Rewrite)
              </h4>
              <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans italic">
                "{result.better_version}"
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
