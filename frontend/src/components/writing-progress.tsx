"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { fetchWithAuth } from "@/services/api-client";

type HistoryItem = {
  id: string;
  taskType: string;
  prompt: string;
  overallScore: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalAccuracy: number;
  createdAt: string;
};

const taskLabel = (t: string) => (t === "VSTEP_TASK_1" ? "Thư (Task 1)" : "Luận (Task 2)");

export function WritingProgress({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchWithAuth<HistoryItem[]>("/ai/writing/history?limit=20")
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Không tải được lịch sử chấm bài.");
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // API trả mới nhất trước; biểu đồ cần cũ nhất trước
  const chartData = [...(items ?? [])].reverse().map((x, i) => ({
    name: `Bài ${i + 1}`,
    "Điểm tổng": x.overallScore,
    "Bố cục": x.taskAchievement,
    "Mạch lạc": x.coherenceCohesion,
    "Từ vựng": x.lexicalResource,
    "Ngữ pháp": x.grammaticalAccuracy,
  }));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-indigo-500" /> Tiến bộ Writing của bạn
      </h4>

      {error && <p className="text-xs text-rose-600">{error}</p>}
      {!error && items === null && <p className="text-xs text-slate-400">Đang tải...</p>}
      {!error && items !== null && items.length === 0 && (
        <p className="text-xs text-slate-500 italic">
          Chưa có bài nào được chấm. Chấm bài đầu tiên để bắt đầu theo dõi tiến bộ.
        </p>
      )}

      {items !== null && items.length === 1 && (
        <p className="text-xs text-slate-500 italic">
          Chấm thêm ít nhất 1 bài nữa để thấy biểu đồ thay đổi theo thời gian.
        </p>
      )}

      {items !== null && items.length >= 2 && (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Điểm tổng" stroke="#4f46e5" strokeWidth={3} dot />
              <Line type="monotone" dataKey="Bố cục" stroke="#0ea5e9" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Mạch lạc" stroke="#10b981" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Từ vựng" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Ngữ pháp" stroke="#ef4444" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {items !== null && items.length > 0 && (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {items.slice(0, 5).map((x) => (
            <li key={x.id} className="py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {taskLabel(x.taskType)}: {x.prompt}
                </p>
                <p className="text-slate-400">
                  {new Date(x.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="shrink-0 font-black text-indigo-600 dark:text-indigo-400">
                {x.overallScore}/10
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
