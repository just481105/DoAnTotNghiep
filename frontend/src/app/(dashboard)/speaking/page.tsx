"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mic, Square, Loader2, Volume2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpeechEvaluationResult } from "@/types";

const AI_GATEWAY_URL =
  process.env.NEXT_PUBLIC_AI_GATEWAY_URL || "http://localhost:8000";
const CORE_API_URL =
  process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:5001";

interface TargetWordItem {
  id?: string;
  word: string;
  pos: string;
  cefr: string;
  ipa: string;
  meaning: string;
}

const DEFAULT_TARGET_WORDS: TargetWordItem[] = [
  {
    word: "abandon",
    pos: "verb",
    cefr: "B2",
    ipa: "/əˈbæn.dən/",
    meaning: "Từ bỏ, ruồng bỏ",
  },
  {
    word: "resilient",
    pos: "adjective",
    cefr: "C1",
    ipa: "/rɪˈzɪl.jənt/",
    meaning: "Kiên cường, phục hồi nhanh",
  },
  {
    word: "courage",
    pos: "noun",
    cefr: "B1",
    ipa: "/ˈkʌr.ɪdʒ/",
    meaning: "Sự can đảm, dũng cảm",
  },
];

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number = 16000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // Format = 1 (PCM)
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

function SpeakingContent() {
  const searchParams = useSearchParams();
  const queryWord = searchParams.get("word");

  const [targetList, setTargetList] = useState<TargetWordItem[]>(DEFAULT_TARGET_WORDS);
  const [wordIndex, setWordIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<SpeechEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedSamplesRef = useRef<Float32Array[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const initWordFromQuery = useCallback(async () => {
    if (!queryWord) return;

    try {
      const foundIdx = targetList.findIndex(
        (item) => item.word.toLowerCase() === queryWord.toLowerCase()
      );

      if (foundIdx !== -1) {
        setWordIndex(foundIdx);
        return;
      }

      const res = await fetch(`${CORE_API_URL}/sm2/words`);
      if (res.ok) {
        const words = await res.json();
        const matched = words.find(
          (w: any) => w.word.toLowerCase() === queryWord.toLowerCase()
        );

        if (matched) {
          const newTarget: TargetWordItem = {
            id: matched.id,
            word: matched.word,
            pos: matched.pos || "word",
            cefr: matched.cefrLevel || "B2",
            ipa: matched.ipa || "/.../",
            meaning: matched.meaningVi || matched.meaningEn || "",
          };
          setTargetList([newTarget, ...DEFAULT_TARGET_WORDS]);
          setWordIndex(0);
        }
      }
    } catch (err) {
      console.warn("Không thể đồng bộ từ mục tiêu từ URL:", err);
    }
  }, [queryWord, targetList]);

  useEffect(() => {
    initWordFromQuery();
  }, [initWordFromQuery]);

  const currentTarget = targetList[wordIndex] || DEFAULT_TARGET_WORDS[0];

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current!.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgb(15 23 42)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(56 189 248)";
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  };

  const startRecording = async () => {
    try {
      setError(null);
      setEvalResult(null);
      setXpEarned(null);
      recordedSamplesRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        recordedSamplesRef.current.push(new Float32Array(inputData));
      };

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioCtx.destination);

      drawWaveform();
      setIsRecording(true);
    } catch (err: any) {
      console.error(err);
      setError("Không thể truy cập Micro. Hãy cấp quyền trên trình duyệt.");
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    const totalLength = recordedSamplesRef.current.reduce((acc, c) => acc + c.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of recordedSamplesRef.current) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const wavBlob = encodeWAV(merged, 16000);
    await sendAudioToFastApi(wavBlob);
  };

  const sendAudioToFastApi = async (blob: Blob) => {
    try {
      setIsEvaluating(true);
      setError(null);

      const formData = new FormData();
      formData.append("audio", blob, "recording.wav");
      formData.append("target_word", currentTarget.word);
      formData.append("expected_ipa", currentTarget.ipa);

      // 1. Gửi sang FastAPI AI Gateway để phân tích âm vị IPA
      const response = await fetch(`${AI_GATEWAY_URL}/api/v1/evaluate-pronunciation`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errDetail = await response.text();
        throw new Error(`Mã lỗi ${response.status}: ${errDetail}`);
      }

      const data = await response.json();
      setEvalResult(data);

      // 2. Gửi kết quả về NestJS Core để lưu lịch sử và nhận điểm XP
      try {
        const nestRes = await fetch(`${CORE_API_URL}/users/me/speaking-history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "e6de30ce-ac04-487f-b376-163240602f84",
            word: currentTarget.word,
            accuracyScore: data.accuracy_score,
            transcribedText: data.transcribed_text,
          }),
        });

        if (nestRes.ok) {
          const nestData = await nestRes.json();
          setXpEarned(nestData.earnedXp || 10);
        }
      } catch (dbErr) {
        console.warn("Không thể lưu kết quả phát âm vào NestJS:", dbErr);
      }
    } catch (err: any) {
      console.error(err);
      setError("Lỗi kết nối AI Speech Gateway. Kiểm tra xem FastAPI (port 8000) đã bật chưa.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const playNativeAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentTarget.word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNextWord = () => {
    setEvalResult(null);
    setError(null);
    setXpEarned(null);
    setWordIndex((prev) => (prev + 1) % targetList.length);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex flex-col items-center">
      <div className="w-full text-center space-y-3 mb-8">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="uppercase tracking-wider">
            {currentTarget.pos} • {currentTarget.cefr}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Từ {wordIndex + 1} / {targetList.length}
          </span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {currentTarget.word}
          </h1>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={playNativeAudio}
            title="Nghe phát âm mẫu"
          >
            <Volume2 className="h-4 w-4 text-primary" />
          </Button>
        </div>

        <p className="text-xl font-mono text-slate-500">{currentTarget.ipa}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">"{currentTarget.meaning}"</p>
      </div>

      <div className="w-full bg-slate-900 rounded-2xl p-4 shadow-inner mb-6 border border-slate-800 flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={500}
          height={100}
          className="w-full h-24 rounded-lg bg-slate-950"
        />
        <div className="mt-3 text-xs text-slate-400">
          {isRecording ? "Đang thu âm... Bấm nút đỏ để hoàn tất" : "Bấm Micro và phát âm từ trên"}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        {!isRecording ? (
          <Button
            size="lg"
            className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 shadow-lg hover:scale-105 transition-all p-0 flex items-center justify-center"
            onClick={startRecording}
            disabled={isEvaluating}
          >
            <Mic className="h-7 w-7 text-primary-foreground" />
          </Button>
        ) : (
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full h-16 w-16 animate-pulse shadow-lg p-0 flex items-center justify-center"
            onClick={stopRecording}
          >
            <Square className="h-6 w-6 fill-current" />
          </Button>
        )}
      </div>

      {isEvaluating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>AI FastAPI đang phân tích âm vị IPA...</span>
        </div>
      )}

      {error && (
        <div className="w-full p-4 mb-6 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {evalResult && (
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="font-semibold text-sm">Điểm chính xác</span>
            <div className="flex items-center gap-3">
              {xpEarned && (
                <Badge className="bg-amber-100 text-amber-800 border-none font-bold gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> +{xpEarned} XP
                </Badge>
              )}
              <span
                className={`text-2xl font-black ${
                  evalResult.accuracy_score >= 80
                    ? "text-emerald-500"
                    : evalResult.accuracy_score >= 50
                    ? "text-amber-500"
                    : "text-rose-500"
                }`}
              >
                {evalResult.accuracy_score}%
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase font-semibold text-muted-foreground">
              Chi tiết âm vị IPA
            </span>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {evalResult.phonemes?.map((p, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg font-mono text-base font-bold flex flex-col items-center border ${
                    p.is_correct
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400"
                      : "bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400"
                  }`}
                >
                  <span>{p.phoneme}</span>
                  <span className="text-[10px] font-normal opacity-70">{p.score}đ</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleNextWord} className="gap-2">
              Luyện từ tiếp theo <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function SpeakingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-xs text-muted-foreground">
          Đang nạp màn hình Luyện nói AI...
        </div>
      }
    >
      <SpeakingContent />
    </Suspense>
  );
}
