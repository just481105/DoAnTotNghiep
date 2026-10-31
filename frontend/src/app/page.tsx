"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  FileText,
  Flame,
  Globe,
  Headphones,
  History,
  Layers,
  Map as MapIcon,
  Medal,
  Mic,
  PenTool,
  Search,
  Sparkles,
  SpellCheck,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  KIỂU DỮ LIỆU                                                       */
/* ------------------------------------------------------------------ */
type Skill =
  | "vocab"
  | "grammar"
  | "reading"
  | "listening"
  | "writing"
  | "pronunciation"
  | "mock";
type Grade = 10 | 11 | 12;

interface ExamItem {
  id: string;
  title: string;
  skill: Skill;
  grade: Grade;
  questions: number;
  done: boolean;
  attempts?: number;
  href?: string;
  emoji: string;
  tone: string;
}

/* ------------------------------------------------------------------ */
/*  CẤU HÌNH & DỮ LIỆU MẪU (TODO: thay bằng dữ liệu từ backend)        */
/* ------------------------------------------------------------------ */
// Ngày thi tốt nghiệp THPT (dự kiến) — sửa theo lịch thi chính thức
const EXAM_DATE = { day: 26, month: 6, year: 2027 };
const EXAM_LABEL = `${String(EXAM_DATE.day).padStart(2, "0")}/${String(EXAM_DATE.month).padStart(2, "0")}`;

const ROADMAPS = [
  {
    name: "Lộ trình Lớp 10 – 11",
    days: 40,
    sub: "Vững nền tảng từ vựng & ngữ pháp, mục tiêu 6.0 – 7.5",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60",
    href: "/learn",
  },
  {
    name: "Lộ trình Lớp 12",
    days: 60,
    sub: "Ôn thi tốt nghiệp, luyện đề thực chiến 8.0 – 9.5+",
    dot: "bg-orange-500",
    pill: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
    href: "/exams",
  },
];

const LEADERBOARD = [
  { name: "Nguyễn Minh Anh · 12A1", count: 114, avatar: "N", color: "bg-blue-600" },
  { name: "Trần Gia Bảo · 12A3", count: 102, avatar: "T", color: "bg-slate-500" },
  { name: "Lê Khánh Linh · 11A2", count: 96, avatar: "L", color: "bg-rose-500" },
];

const TOP_TOPICS = {
  main: {
    title: "Câu điều kiện & Câu ước",
    en: "Conditional Sentences & Wishes",
    percent: "42.4%",
    exams: 111,
    statA: { label: "Ngữ pháp", value: 49 },
    statB: { label: "Từ vựng", value: 43 },
    icon: SpellCheck,
  },
  others: [
    { rank: 2, title: "Mệnh đề quan hệ", percent: "33.6%", exams: 88, icon: BookOpen, color: "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400" },
    { rank: 3, title: "Câu bị động & Tường thuật", percent: "29%", exams: 76, icon: Layers, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  ],
};

const MOCK_TESTS = [
  { title: "Đề thi thử THPT", meta: "40 câu • 50 phút", tag: "Trọn bộ đề", free: true, featured: true, emoji: "🎓", tone: "from-amber-100 to-orange-100", href: "/exams" },
  { title: "Ngữ pháp", meta: "20 câu • 15 phút", tag: "Theo chuyên đề", free: false, featured: false, emoji: "📝", tone: "from-emerald-100 to-teal-100", href: "/exams" },
  { title: "Từ vựng & Cụm từ", meta: "20 câu • 15 phút", tag: "Theo chuyên đề", free: false, featured: false, emoji: "🧠", tone: "from-sky-100 to-blue-100", href: "/learn" },
  { title: "Đọc hiểu", meta: "4 bài • 25 phút", tag: "Theo chuyên đề", free: false, featured: false, emoji: "📖", tone: "from-yellow-100 to-amber-100", href: "/exams" },
  { title: "Giao tiếp & Sắp xếp", meta: "10 câu • 10 phút", tag: "Theo chuyên đề", free: false, featured: false, emoji: "💬", tone: "from-rose-100 to-orange-100", href: "/exams" },
];

const SKILL_META: Record<Skill, { label: string; icon: LucideIcon }> = {
  vocab: { label: "Từ vựng", icon: Layers },
  grammar: { label: "Ngữ pháp", icon: SpellCheck },
  reading: { label: "Đọc hiểu", icon: BookOpen },
  listening: { label: "Nghe", icon: Headphones },
  writing: { label: "Viết", icon: PenTool },
  pronunciation: { label: "Phát âm", icon: Mic },
  mock: { label: "Đề thi thử", icon: FileText },
};

const EXAMS: ExamItem[] = [
  { id: "1", title: "Từ vựng chủ đề Môi trường (Environment)", skill: "vocab", grade: 10, questions: 20, done: false, emoji: "🌿", tone: "from-emerald-100 to-lime-200" },
  { id: "2", href: "/grammar/thi-hien-tai-hoan-thanh", title: "Thì hiện tại hoàn thành & quá khứ đơn", skill: "grammar", grade: 10, questions: 15, done: false, emoji: "⏰", tone: "from-rose-100 to-pink-200" },
  { id: "3", href: "/grammar/menh-de-quan-he", title: "Mệnh đề quan hệ — Bài tập tổng hợp", skill: "grammar", grade: 11, questions: 20, done: false, emoji: "🔗", tone: "from-yellow-100 to-amber-200" },
  { id: "4", href: "/grammar/cau-dieu-kien", title: "Câu điều kiện loại 1, 2, 3", skill: "grammar", grade: 11, questions: 15, done: true, attempts: 2, emoji: "🎓", tone: "from-stone-100 to-orange-100" },
  { id: "5", title: "Đọc hiểu: Education & Technology", skill: "reading", grade: 12, questions: 10, done: false, emoji: "📖", tone: "from-sky-100 to-blue-200" },
  { id: "6", title: "Nghe hiểu: Hội thoại đời sống hằng ngày", skill: "listening", grade: 10, questions: 8, done: false, emoji: "🎧", tone: "from-emerald-100 to-teal-200" },
  { id: "7", title: "Viết lại câu — Chuyển đổi câu", skill: "writing", grade: 12, questions: 15, done: false, emoji: "✍️", tone: "from-indigo-100 to-purple-200" },
  { id: "8", title: "Đề thi thử tốt nghiệp THPT số 1", skill: "mock", grade: 12, questions: 40, done: true, attempts: 1, emoji: "🏆", tone: "from-amber-100 to-orange-200" },
];

const STATUS_TABS = ["Tất cả", "Chưa làm", "Đã làm"] as const;
const GRADE_TABS = ["Tất cả", "Lớp 10", "Lớp 11", "Lớp 12"] as const;

const PAGE_SIZE = 4;

/* ------------------------------------------------------------------ */
/*  HEATMAP (dữ liệu giả ổn định, TODO: thay bằng dữ liệu bài làm thật) */
/* ------------------------------------------------------------------ */
const HEAT_MONTHS = [
  { label: "Tháng 07", weeks: 4 },
  { label: "Tháng 08", weeks: 5 },
  { label: "Tháng 09", weeks: 4 },
  { label: "Tháng 10", weeks: 4 },
];
const DAY_LABELS = ["T2", "", "T4", "", "T6", "", "CN"];
const HEAT_COLORS = [
  "bg-slate-200/70 dark:bg-slate-700/60",
  "bg-emerald-200",
  "bg-emerald-400",
  "bg-emerald-600",
];

function heatLevel(seed: number): number {
  const r = ((seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  if (r > 0.96) return 3;
  if (r > 0.92) return 2;
  if (r > 0.86) return 1;
  return 0;
}

/* ------------------------------------------------------------------ */
/*  STYLE DÙNG CHUNG (có đủ biến thể dark mode)                         */
/* ------------------------------------------------------------------ */
const CARD =
  "rounded-[28px] border border-slate-200/70 bg-white/90 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none";
const INNER = "border border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900";
const HEADING = "text-slate-900 dark:text-slate-100";
const MUTED = "text-slate-500 dark:text-slate-400";
const TAB_GROUP = "rounded-2xl bg-sky-50/70 p-1.5 dark:bg-slate-800/60";
const TAB_ON = "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white";
const TAB_OFF = "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200";
const PAGE_BTN =
  "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

function IconTile({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${className}`}>{children}</div>
  );
}

/* ------------------------------------------------------------------ */
/*  TRANG CHỦ                                                           */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const [statusTab, setStatusTab] = useState<(typeof STATUS_TABS)[number]>("Tất cả");
  const [gradeTab, setGradeTab] = useState<(typeof GRADE_TABS)[number]>("Tất cả");
  const [skill, setSkill] = useState<Skill | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const daysLeft = useMemo(() => {
    const now = new Date();
    const end = new Date(EXAM_DATE.year, EXAM_DATE.month - 1, EXAM_DATE.day);
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXAMS.filter((e) => {
      if (statusTab === "Chưa làm" && e.done) return false;
      if (statusTab === "Đã làm" && !e.done) return false;
      if (gradeTab !== "Tất cả" && `Lớp ${e.grade}` !== gradeTab) return false;
      if (skill !== "all" && e.skill !== skill) return false;
      if (q && !e.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [statusTab, gradeTab, skill, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const skillCount = (s: Skill) => EXAMS.filter((e) => e.skill === s).length;
  const resetPage = () => setPage(1);
  const MainTopicIcon = TOP_TOPICS.main.icon;

  let heatSeed = 0;

  return (
    <div className="relative min-h-screen bg-[#fbfbfd] pb-20 dark:bg-slate-950">
      {/* nền chấm bi */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <main className="relative mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        {/* ============ HÀNG 1: LỘ TRÌNH | HÀNH TRÌNH | BXH ============ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.4fr)_minmax(0,1.2fr)]">
          {/* LỘ TRÌNH */}
          <section className={`${CARD} p-6`}>
            <div className="flex items-center gap-3">
              <IconTile className="bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
                <MapIcon className="size-6" />
              </IconTile>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`whitespace-nowrap text-lg font-extrabold ${HEADING}`}>Lộ trình THPT</h2>
                  <span className="whitespace-nowrap rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-600 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
                    Theo ngày
                  </span>
                </div>
                <p className={`text-sm ${MUTED}`}>Học theo ngày, bám sát chương trình</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              <CalendarDays className="size-4 shrink-0 text-rose-400" />
              <span suppressHydrationWarning className="min-w-0">
                Còn <b className="text-slate-900 dark:text-white">{daysLeft} ngày</b> đến kỳ thi ({EXAM_LABEL})
              </span>
              <button className="ml-auto shrink-0 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">
                Đổi
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {ROADMAPS.map((r) => (
                <Link
                  key={r.name}
                  href={r.href}
                  className={`group flex items-center gap-2 rounded-2xl ${INNER} px-4 py-3 transition hover:border-blue-200 hover:shadow-sm dark:hover:border-blue-900`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 shrink-0 rounded-full ${r.dot}`} />
                      <span className={`min-w-0 truncate text-sm font-bold ${HEADING}`}>{r.name}</span>
                      <span className={`ml-auto shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${r.pill}`}>
                        {r.days} Ngày
                      </span>
                    </div>
                    <p className={`mt-1 pl-4 text-xs ${MUTED}`}>{r.sub}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>

          {/* HÀNH TRÌNH CHĂM CHỈ */}
          <section className={`${CARD} p-6`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconTile className="bg-rose-50 text-rose-400 dark:bg-rose-950/40 dark:text-rose-300">
                  <CalendarDays className="size-6" />
                </IconTile>
                <div>
                  <h2 className={`text-lg font-extrabold ${HEADING}`}>Hành trình chăm chỉ</h2>
                  <p className={`text-sm ${MUTED}`}>Ghi nhận số bài làm mỗi ngày</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                Ít
                {HEAT_COLORS.map((c, i) => (
                  <span key={i} className={`size-3 rounded-full ${c}`} />
                ))}
                Nhiều
              </div>
            </div>

            <div className="mt-6 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-3">
                <div className="flex flex-col gap-1.5 pt-6">
                  {DAY_LABELS.map((d, i) => (
                    <span key={i} className="flex h-3.5 w-6 items-center text-[11px] text-slate-400">
                      {d}
                    </span>
                  ))}
                </div>

                {HEAT_MONTHS.map((m) => (
                  <div key={m.label}>
                    <div className="mb-2 h-4 text-sm font-medium text-slate-600 dark:text-slate-300">{m.label}</div>
                    <div className="flex gap-1.5">
                      {Array.from({ length: m.weeks }).map((_, w) => (
                        <div key={w} className="flex flex-col gap-1.5">
                          {Array.from({ length: 7 }).map((__, d) => {
                            const lvl = heatLevel(++heatSeed);
                            return <span key={d} className={`size-3.5 rounded-full ${HEAT_COLORS[lvl]}`} />;
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BXH HỌC TẬP */}
          <section className={`${CARD} p-6`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <IconTile className="bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400">
                  <Trophy className="size-6" />
                </IconTile>
                <div>
                  <h2 className={`whitespace-nowrap text-lg font-extrabold ${HEADING}`}>BXH Học Tập</h2>
                  <p className={`flex items-center gap-1 text-sm ${MUTED}`}>
                    <Zap className="size-3.5" /> Tuần này
                  </p>
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[11px] font-extrabold tracking-wide text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300">
                <Flame className="size-3.5" /> THI ĐUA
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between px-2 text-[11px] font-bold tracking-wider text-slate-400">
              <span>#&nbsp;&nbsp;&nbsp;&nbsp;HỌC SINH</span>
              <span>BÀI LÀM</span>
            </div>

            <div className="mt-2 space-y-2.5">
              {LEADERBOARD.map((u, i) => (
                <div
                  key={u.name}
                  className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 px-3 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/10"
                >
                  <span className="grid w-7 place-items-center text-amber-500">
                    {i === 0 ? <Crown className="size-5" /> : <Medal className="size-5" />}
                  </span>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white ${u.color}`}>
                    {u.avatar}
                  </span>
                  <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${HEADING}`}>{u.name}</span>
                  <span className="shrink-0 text-right">
                    <b className="text-base text-orange-700 dark:text-orange-400">{u.count}</b>{" "}
                    <span className="text-xs text-slate-400">bài</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ============ HÀNG 2: TOP CHUYÊN ĐỀ | LỖI HAY GẶP ============ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* TOP 3 CHUYÊN ĐỀ */}
          <section
            className={`${CARD} bg-linear-to-br from-amber-50/60 via-white to-white p-6 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconTile className="bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400">
                  <Trophy className="size-6" />
                </IconTile>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={`text-lg font-extrabold ${HEADING}`}>Top 3 chuyên đề hay ra thi</h2>
                    <span className="whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                      ✨ Năm học 2026–2027
                    </span>
                  </div>
                  <p className={`text-sm ${MUTED}`}>Từ các đề thi chính thức & đề thi thử gần nhất</p>
                </div>
              </div>
              <Link
                href="/exams"
                className="flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-700 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Chi tiết <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="mt-5 rounded-3xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50/40 p-5 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-slate-900/40">
              <div className="flex items-start justify-between gap-2">
                <span className="whitespace-nowrap rounded-full bg-orange-500 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white">
                  🔥 TOP 1 XU HƯỚNG
                </span>
                <span className="text-xl font-extrabold text-amber-800 dark:text-amber-300">
                  {TOP_TOPICS.main.percent}{" "}
                  <span className={`text-xs font-medium ${MUTED}`}>({TOP_TOPICS.main.exams} đề)</span>
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <IconTile className="size-11 bg-rose-100 text-rose-500 dark:bg-rose-950/50 dark:text-rose-300">
                  <MainTopicIcon className="size-5" />
                </IconTile>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{TOP_TOPICS.main.title}</h3>
                  <p className={`text-sm ${MUTED}`}>{TOP_TOPICS.main.en}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/70 pt-3 text-sm dark:border-amber-900/40">
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-orange-500" /> {TOP_TOPICS.main.statA.label}:{" "}
                    <b>{TOP_TOPICS.main.statA.value}</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-blue-500" /> {TOP_TOPICS.main.statB.label}:{" "}
                    <b>{TOP_TOPICS.main.statB.value}</b>
                  </span>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                  Xuất hiện nhiều nhất
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TOP_TOPICS.others.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.rank} className={`rounded-3xl ${INNER} p-4`}>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                        #{t.rank}
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.percent}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2.5">
                      <IconTile className={`size-9 rounded-xl ${t.color}`}>
                        <Icon className="size-4" />
                      </IconTile>
                      <h3 className={`text-base font-extrabold ${HEADING}`}>{t.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{t.exams} đề thi</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* LỖI HAY GẶP */}
          <section className={`${CARD} flex flex-col p-6`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconTile className="bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
                  <Target className="size-6" />
                </IconTile>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={`whitespace-nowrap text-lg font-extrabold ${HEADING}`}>Lỗi hay gặp</h2>
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
                      <Sparkles className="size-3" /> AI CHẨN ĐOÁN
                    </span>
                  </div>
                  <p className={`text-sm ${MUTED}`}>30 ngày qua · Ngữ pháp & Từ vựng</p>
                </div>
              </div>
              <Link
                href="/exams"
                className="flex shrink-0 items-center gap-1 rounded-full border border-sky-100 bg-white px-4 py-1.5 text-sm font-bold text-blue-700 hover:bg-sky-50 dark:border-sky-900/60 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
              >
                Chi tiết <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-3xl border border-slate-200/70 bg-slate-50/50 px-6 py-8 text-center dark:border-slate-800 dark:bg-slate-800/30">
              <div className="grid size-16 place-items-center rounded-2xl bg-white text-3xl shadow-sm dark:bg-slate-900">😣</div>
              <h3 className={`mt-4 text-base font-bold ${HEADING}`}>Chưa có dữ liệu lỗi cần lưu ý</h3>
              <p className={`mt-1 max-w-xs text-sm ${MUTED}`}>
                Làm bài tập Ngữ pháp hoặc Từ vựng để AI tổng hợp lỗi sai cho bạn.
              </p>
              <Link
                href="/exams"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-700/25 transition hover:bg-blue-800"
              >
                <Sparkles className="size-4" /> Luyện bài ngay
              </Link>
            </div>
          </section>
        </div>

        {/* ============ PHÒNG THI THỬ ============ */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="size-2.5 rounded-full bg-orange-400" />
              <h2 className={`text-lg font-extrabold ${HEADING}`}>Phòng Thi Thử Tốt Nghiệp THPT</h2>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                Chuẩn cấu trúc đề thi
              </span>
            </div>
            <p className={`text-sm ${MUTED}`}>
              Làm <b className={HEADING}>trọn bộ đề</b> hoặc luyện <b className={HEADING}>từng chuyên đề</b> có bấm giờ
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {MOCK_TESTS.map((t) => (
              <Link
                key={t.title}
                href={t.href}
                className="group rounded-[28px] border border-amber-100 bg-amber-50/40 p-3 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className={`relative grid h-40 place-items-center rounded-3xl border border-white bg-linear-to-br ${t.tone}`}>
                  <span
                    className={`absolute left-3 top-3 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      t.featured ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {t.tag}
                  </span>
                  <span className="mt-4 text-6xl transition-transform group-hover:scale-110">{t.emoji}</span>
                </div>
                <div className="px-1 pb-1 pt-3 text-center">
                  <h3 className={`text-base font-extrabold ${HEADING}`}>{t.title}</h3>
                  <p className={`text-xs ${MUTED}`}>{t.meta}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ THANH LỌC ============ */}
        <section className={`${CARD} flex flex-col items-stretch gap-3 p-3 lg:flex-row lg:items-center`}>
          {/* trạng thái */}
          <div className={`flex items-center gap-1 ${TAB_GROUP}`}>
            {STATUS_TABS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setStatusTab(t);
                  resetPage();
                }}
                className={`whitespace-nowrap rounded-xl px-5 py-2 text-sm font-bold transition ${
                  statusTab === t ? TAB_ON : TAB_OFF
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* khối lớp */}
          <div className={`flex items-center gap-1 overflow-x-auto ${TAB_GROUP}`}>
            {GRADE_TABS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setGradeTab(t);
                  resetPage();
                }}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition ${
                  gradeTab === t ? TAB_ON : TAB_OFF
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 whitespace-nowrap rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-2.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
            <Sparkles className="size-4 text-amber-500" />
            <b className="text-blue-700 dark:text-blue-300">{filtered.length}</b> bài tập
          </div>

          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetPage();
              }}
              placeholder="Tìm bài tập, chuyên đề, từ vựng..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
            />
          </div>
        </section>

        {/* ============ KHO BÀI TẬP ============ */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* sidebar kỹ năng */}
          <aside className={`${CARD} h-fit p-4`}>
            <p className="px-2 pb-3 text-xs font-bold tracking-widest text-slate-400">KỸ NĂNG</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSkill("all");
                  resetPage();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-bold transition ${
                  skill === "all"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Globe className="size-5" />
                <span className="flex-1">Tất cả</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    skill === "all"
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {EXAMS.length} bài
                </span>
              </button>

              {(Object.keys(SKILL_META) as Skill[]).map((s) => {
                const Icon = SKILL_META[s].icon;
                const active = skill === s;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setSkill(s);
                      resetPage();
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-semibold transition ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="flex-1">{SKILL_META[s].label}</span>
                    <span className={`text-xs ${active ? "text-white/80" : "text-slate-400"}`}>{skillCount(s)}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* danh sách bài */}
          <div>
            <div className="mb-3 flex items-center justify-between text-sm">
              <p className={`flex items-center gap-2 ${MUTED}`}>
                <span className="size-2 rounded-full bg-emerald-500" />
                Kho bài tập: <b className={HEADING}>{filtered.length} bài</b> sẵn có
              </p>
              <span className="text-slate-400">
                Trang {currentPage}/{totalPages}
              </span>
            </div>

            {pageItems.length === 0 ? (
              <div className={`${CARD} p-10 text-center text-sm ${MUTED}`}>Không tìm thấy bài tập phù hợp.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {pageItems.map((e) => (
                  <Link
                    key={e.id}
                    href={e.href ?? `/exams/${e.id}`}
                    className={`${CARD} group flex flex-col p-3 transition hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <div className={`relative grid h-40 place-items-center rounded-2xl bg-linear-to-br ${e.tone}`}>
                      {e.done && (
                        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-extrabold text-white">
                          <CheckCircle2 className="size-3.5" /> ĐÃ LÀM
                        </span>
                      )}
                      <span className="text-6xl transition-transform group-hover:scale-110">{e.emoji}</span>
                      <span className="absolute bottom-2 right-2 rounded-lg bg-white px-2.5 py-1 text-[11px] font-extrabold text-rose-700 shadow-sm">
                        {e.skill === "mock" ? "ĐỀ THI THỬ" : `LỚP ${e.grade}`}
                      </span>
                    </div>

                    <h3 className={`mt-3 line-clamp-3 min-h-[4.5rem] px-1 text-base font-extrabold leading-snug ${HEADING}`}>
                      {e.title}
                    </h3>

                    {e.done && e.attempts ? (
                      <span className="mb-2 ml-1 flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <History className="size-3.5" /> Xem lịch sử ({e.attempts})
                      </span>
                    ) : (
                      <span className="mb-2 h-6" />
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-1 pt-3 dark:border-slate-800">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          e.questions > 1
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        {e.questions} câu hỏi
                      </span>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {SKILL_META[e.skill].label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* phân trang */}
            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  className={`grid size-9 place-items-center rounded-xl transition disabled:opacity-40 ${PAGE_BTN}`}
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`size-9 rounded-xl text-sm font-bold transition ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : PAGE_BTN
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className={`grid size-9 place-items-center rounded-xl transition disabled:opacity-40 ${PAGE_BTN}`}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
