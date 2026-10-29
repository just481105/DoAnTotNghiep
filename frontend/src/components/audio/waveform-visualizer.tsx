"use client";

import React, { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null;
  isRecording: boolean;
}

export function WaveformVisualizer({ analyserNode, isRecording }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const dataArray = new Uint8Array(analyserNode ? analyserNode.frequencyBinCount : 64);

    const render = () => {
      animationId = requestAnimationFrame(render);

      if (analyserNode && isRecording) {
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        dataArray.fill(4); // Biên độ tĩnh khi chưa thu âm
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2.2;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = isRecording
          ? Math.max(4, (dataArray[i] / 255) * canvas.height * 0.9)
          : 6;

        ctx.fillStyle = isRecording ? "#10b981" : "#cbd5e1"; // Xanh lá khi thu âm, xám khi nghỉ
        ctx.beginPath();
        ctx.roundRect(x, (canvas.height - barHeight) / 2, barWidth - 2, barHeight, 4);
        ctx.fill();

        x += barWidth;
      }
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [analyserNode, isRecording]);

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-center">
      <canvas ref={canvasRef} width={400} height={70} className="w-full max-w-md h-16" />
    </div>
  );
}
