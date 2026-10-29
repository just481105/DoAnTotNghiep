"use client";

import { useState, useRef, useCallback } from "react";

// Hàm chuyển đổi AudioBuffer thành định dạng WAV chuẩn 16.000 Hz Mono PCM
function encodeWAV(samples: Float32Array, sampleRate: number = 16000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  // fmt subchunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate (16000 Hz)
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)
  // data subchunk
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // PCM data (float32 to 16-bit signed PCM)
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Float32Array[]>([]);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);

  const startRecording = useCallback(async () => {
    try {
      recordedChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // ScriptProcessor ghi nhận từng buffer âm thanh
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        recordedChunksRef.current.push(new Float32Array(inputData));
      };

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioCtx.destination);

      setIsRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (err) {
      console.error("Lỗi khi truy cập micro:", err);
      alert("Vui lòng cấp quyền truy cập micro trên trình duyệt để luyện nói!");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;

    // Dọn dẹp stream & micro
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    // Ghép các chunk lại và xuất file WAV
    const totalLength = recordedChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of recordedChunksRef.current) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const wavBlob = encodeWAV(merged, 16000);
    const url = URL.createObjectURL(wavBlob);

    setAudioBlob(wavBlob);
    setAudioUrl(url);
    setIsRecording(false);
  }, [isRecording]);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    analyserNode: analyserRef.current,
    startRecording,
    stopRecording,
  };
}
