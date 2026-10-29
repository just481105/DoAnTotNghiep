"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { Layers, CalendarDays, Mic2 } from "lucide-react";

interface RetentionItem {
  name: string;
  value: number;
  color: string;
}

interface LearningAnalyticsProps {
  retentionData?: RetentionItem[];
}

// Fallback data nếu API chưa trả về
const defaultRetentionData: RetentionItem[] = [
  { name: "Đang học mới (Rep = 0)", value: 0, color: "#6366f1" },
  { name: "Cần ôn hôm nay (Due)", value: 0, color: "#f59e0b" },
  { name: "Đã nhớ dài hạn (Interval > 21d)", value: 0, color: "#10b981" },
];

const heatmapWeeks = [
  { week: "T1", days: [1, 2, 0, 3, 2, 4, 1] },
  { week: "T2", days: [2, 3, 1, 0, 4, 3, 2] },
  { week: "T3", days: [3, 4, 2, 1, 0, 2, 3] },
  { week: "T4", days: [4, 3, 5, 2, 4, 3, 2] },
];

const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const getIntensityColor = (level: number) => {
  switch (level) {
    case 0:
      return "bg-slate-100 dark:bg-slate-800 text-transparent";
    case 1:
      return "bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200";
    case 2:
      return "bg-indigo-200 dark:bg-indigo-900 border border-indigo-300";
    case 3:
      return "bg-indigo-400 text-white";
    case 4:
      return "bg-indigo-500 text-white";
    case 5:
      return "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30";
    default:
      return "bg-slate-100";
  }
};

const phonemeRadarData = [
  { group: "Nguyên âm đơn", accuracy: 88 },
  { group: "Nguyên âm đôi", accuracy: 72 },
  { group: "Phụ âm vô thanh", accuracy: 65 },
  { group: "Phụ âm hữu thanh", accuracy: 82 },
  { group: "Âm đuôi (/d/, /t/, /s/)", accuracy: 55 },
];

export function LearningAnalytics({ retentionData }: LearningAnalyticsProps) {
  const chartData = retentionData && retentionData.length > 0 ? retentionData : defaultRetentionData;
  const totalWords = chartData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* KHỐI 1: BIỂU ĐỒ DONUT CHU KỲ GHI NHỚ SM-2 TỪ DATABASE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Chu kỳ ghi nhớ SM-2
              </h3>
              <p className="text-[11px] text-muted-foreground">Phân bổ {totalWords} thẻ từ thực tế</p>
            </div>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} từ`, "Số lượng"]}
                  contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{totalWords}</span>
              <span className="text-[10px] text-muted-foreground font-medium">Tổng từ vựng</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">{item.name}</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KHỐI 2: MA TRẬN TẦN SUẤT HỌC TẬP (HEATMAP) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Tần suất rèn luyện
              </h3>
              <p className="text-[11px] text-muted-foreground">Theo dõi hoạt động 28 ngày qua</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-8 gap-1.5 text-center text-[10px] text-muted-foreground font-semibold">
              <span></span>
              {dayLabels.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            {heatmapWeeks.map((weekItem, wIdx) => (
              <div key={wIdx} className="grid grid-cols-8 gap-1.5 items-center">
                <span className="text-[10px] font-mono text-muted-foreground text-center">
                  {weekItem.week}
                </span>
                {weekItem.days.map((level, dIdx) => (
                  <div
                    key={dIdx}
                    title={`Hoạt động: mức ${level}/5`}
                    className={`h-6 rounded-lg transition-transform hover:scale-110 cursor-pointer flex items-center justify-center text-[9px] font-bold ${getIntensityColor(
                      level
                    )}`}
                  >
                    {level > 0 ? level : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-4 border-t border-slate-100 dark:border-slate-800">
          <span>Ít hoạt động</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4, 5].map((lvl) => (
              <span key={lvl} className={`w-3.5 h-3.5 rounded ${getIntensityColor(lvl)}`} />
            ))}
          </div>
          <span>Tích cực</span>
        </div>
      </div>

      {/* KHỐI 3: PHÂN TÍCH ÂM VỊ SPEAKING AI */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
              <Mic2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Phân tích âm vị Speaking
              </h3>
              <p className="text-[11px] text-muted-foreground">Độ chính xác theo nhóm âm IPA</p>
            </div>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={phonemeRadarData}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="group" tick={{ fill: "#64748b", fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Độ chính xác (%)"
                  dataKey="accuracy"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.4}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, "Độ chuẩn"]}
                  contentStyle={{ borderRadius: "12px", fontSize: "11px" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-[11px] text-rose-800 dark:text-rose-300">
          <p className="font-semibold">Cần chú ý:</p>
          <p className="text-[10px] text-rose-700/80 dark:text-rose-400 mt-0.5">
            Nhóm <b>Âm đuôi (/d/, /t/, /s/)</b> đạt 55%. Bạn thường nuốt âm cuối khi luyện đọc[span_8](start_span)[span_8](end_span)[span_9](start_span)[span_9](end_span).
          </p>
        </div>
      </div>

    </div>
  );
}
