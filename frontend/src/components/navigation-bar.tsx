"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Mic,
  FileText,
  Flame,
  Zap,
  Award,
  Bell,
  GraduationCap,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
  History,
  X,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { fetchWithAuth } from "@/services/api-client";

type ThemeMode = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "eng-platform-theme";

interface UserProgress {
  fullName: string;
  email: string;
  streakDays: number;
  xpPoints: number;
  nextLevelXP: number;
}

interface DashboardStatsResponse {
  user: {
    fullName: string | null;
    email: string;
    streakDays: number;
    xpPoints: number;
  } | null;
}

const INITIAL_USER_PROGRESS: UserProgress = {
  fullName: "Học viên",
  email: "",
  streakDays: 0,
  xpPoints: 0,
  nextLevelXP: 1000,
};

export function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userProgress, setUserProgress] = useState(INITIAL_USER_PROGRESS);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
      ? savedTheme
      : "system";
  });
  const profileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const settingsCloseButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const useDarkTheme =
        themeMode === "dark" ||
        (themeMode === "system" && mediaQuery.matches);

      document.documentElement.classList.toggle("dark", useDarkTheme);
      document.documentElement.style.colorScheme = useDarkTheme ? "dark" : "light";
    };

    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [themeMode]);

  useEffect(() => {
    if (!isProfileOpen && !isSettingsOpen) return;

    if (isProfileOpen) profileCloseButtonRef.current?.focus();
    if (isSettingsOpen) settingsCloseButtonRef.current?.focus();
  }, [isProfileOpen, isSettingsOpen]);

  useEffect(() => {
    const handleExpiredSession = () => router.replace("/login");
    window.addEventListener("auth:expired", handleExpiredSession);
    return () => {
      window.removeEventListener("auth:expired", handleExpiredSession);
    };
  }, [router]);

  useEffect(() => {
    if (pathname === "/login" || pathname === "/register") return;

    let active = true;
    fetchWithAuth<DashboardStatsResponse>("/users/me/dashboard-stats")
      .then(({ user }) => {
        if (!active || !user) return;

        const xpPoints = user.xpPoints || 0;
        setUserProgress({
          fullName: user.fullName || "Học viên",
          email: user.email,
          streakDays: user.streakDays || 0,
          xpPoints,
          nextLevelXP: Math.max(1000, (Math.floor(xpPoints / 1000) + 1) * 1000),
        });
      })
      .catch((error: unknown) => {
        console.error("Không thể tải tiến độ học viên:", error);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const navItems = [
    {
      title: "Tổng quan",
      href: "/",
      icon: LayoutDashboard,
      activeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    },
    {
      
      title: "Kho từ vựng",
      href: "/vocab-sets",
      icon: Layers,
      badge: "SM-2",
      activeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    },
    {
      title: "Luyện phát âm AI",
      href: "/speaking",
      icon: Mic,
      badge: "AI",
      activeColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    },
    {
      title: "Ngân hàng đề thi",
      href: "/exams",
      icon: FileText,
      badge: "Mới",
      activeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-16 w-full max-w-7xl min-w-0 items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        
        {/* KHU VỰC 1: LOGO THƯƠNG HIỆU */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100">
              ENG-PLATFORM
            </span>
            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
              Spaced Repetition & AI
            </span>
          </div>
        </Link>

        {/* KHU VỰC 2: THANH MENU ĐIỀU HƯỚNG NGANG */}
        <nav className="flex min-w-0 flex-1 items-center justify-start [&>*:first-child]:ml-auto [&>*:last-child]:mr-auto gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? `${item.activeColor} shadow-sm border border-indigo-200/50 dark:border-indigo-800/40`
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="hidden xl:inline text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Dropdown Tiện ích */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(!openDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Tiện ích</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {openDropdown && (
              <div 
                className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setOpenDropdown(false)}
              >
                <Link
                  href="/history"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <History className="w-4 h-4 text-slate-400" />
                  <span>Lịch sử ôn tập</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Cài đặt cá nhân</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* KHU VỰC 3: UTILITY HEADER (GAMIFICATION & TÀI KHOẢN) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* 1. STREAK NGỌN LỬA */}
          <div 
            title={`Chuỗi học liên tục: ${userProgress.streakDays} ngày`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-extrabold cursor-default hover:scale-105 transition-transform"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{userProgress.streakDays}</span>
          </div>

          {/* 2. CHỈ SỐ ĐIỂM KINH NGHIỆM XP */}
          <div 
            title={`Điểm kinh nghiệm: ${userProgress.xpPoints} XP`}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold cursor-default hover:scale-105 transition-transform"
          >
            <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
            <span>{userProgress.xpPoints} XP</span>
          </div>

          {/* 4. CHUÔNG THÔNG BÁO */}
          <button 
            title="Thông báo mới"
            className="relative w-9 h-9 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
              3
            </span>
          </button>

          {/* 5. USER AVATAR & DROPDOWN MENU */}
          <div className="relative">
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                UP
              </div>
            </button>

            {openUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setOpenUserMenu(false)}
              >
                {/* Thông tin học viên */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{userProgress.fullName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{userProgress.email}</p>
                  
                  {/* Tiến độ lên cấp mini */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>Điểm kinh nghiệm</span>
                      <span>{userProgress.xpPoints}/{userProgress.nextLevelXP} XP</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full" 
                        style={{ width: `${(userProgress.xpPoints / userProgress.nextLevelXP) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Các thao tác tài khoản */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenUserMenu(false);
                    setIsProfileOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Hồ sơ học tập</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenUserMenu(false);
                    setIsSettingsOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Cài đặt hệ thống</span>
                </button>
                
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                
                <button
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    router.replace("/login");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {isProfileOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <button
              type="button"
              aria-label="Đóng hồ sơ học tập"
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-sm"
            />
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="learning-profile-title"
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsProfileOpen(false);
              }}
              className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/70 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="bg-gradient-to-br from-emerald-700 via-emerald-700 to-teal-800 px-6 pb-8 pt-6 text-white sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-black ring-1 ring-white/25">
                      {userProgress.fullName
                        .split(" ")
                        .slice(-2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                        Hồ sơ học tập
                      </p>
                      <h2
                        id="learning-profile-title"
                        className="mt-1 truncate text-xl font-extrabold"
                      >
                        {userProgress.fullName}
                      </h2>
                      <p className="mt-0.5 truncate text-sm text-emerald-100">
                        {userProgress.email}
                      </p>
                    </div>
                  </div>
                  <button
                    ref={profileCloseButtonRef}
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    aria-label="Đóng hồ sơ"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4 rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div>
                    <p className="text-sm font-medium text-emerald-100">
                      Điểm kinh nghiệm
                    </p>
                    <p className="mt-1 text-3xl font-black">
                      {userProgress.xpPoints} XP
                    </p>
                  </div>
                  <Award className="mb-1 h-9 w-9 text-emerald-100" aria-hidden="true" />
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tiến độ của bạn
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <Flame className="h-5 w-5 fill-amber-500 text-amber-500" aria-hidden="true" />
                    <p className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">
                      {userProgress.streakDays} ngày
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Chuỗi học liên tục
                    </p>
                  </div>
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                    <Zap className="h-5 w-5 fill-indigo-500 text-indigo-500" aria-hidden="true" />
                    <p className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">
                      {userProgress.xpPoints.toLocaleString()} XP
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Điểm kinh nghiệm
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Tiến tới mục tiêu tiếp theo
                    </p>
                    <p className="shrink-0 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      {userProgress.xpPoints.toLocaleString()} /{" "}
                      {userProgress.nextLevelXP.toLocaleString()} XP
                    </p>
                  </div>
                  <div
                    className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                    role="progressbar"
                    aria-label="Tiến độ điểm kinh nghiệm"
                    aria-valuemin={0}
                    aria-valuemax={userProgress.nextLevelXP}
                    aria-valuenow={Math.min(
                      userProgress.xpPoints,
                      userProgress.nextLevelXP,
                    )}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-[width]"
                      style={{
                        width: `${Math.min(
                          (userProgress.xpPoints / userProgress.nextLevelXP) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="mt-6 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                >
                  Đóng hồ sơ
                </button>
              </div>
            </section>
          </div>,
          document.body,
        )}

      {isSettingsOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <button
              type="button"
              aria-label="Đóng cài đặt"
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-sm"
            />
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="system-settings-title"
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsSettingsOpen(false);
              }}
              className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/70 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:px-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                    Tùy chỉnh trải nghiệm
                  </p>
                  <h2
                    id="system-settings-title"
                    className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100"
                  >
                    Cài đặt hệ thống
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Chọn giao diện phù hợp với bạn.
                  </p>
                </div>
                <button
                  ref={settingsCloseButtonRef}
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  aria-label="Đóng cài đặt"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <fieldset>
                  <legend className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Giao diện
                  </legend>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Tùy chọn được lưu trên thiết bị này.
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {(
                      [
                        { value: "light", label: "Sáng", Icon: Sun },
                        { value: "dark", label: "Tối", Icon: Moon },
                        { value: "system", label: "Theo máy", Icon: Monitor },
                      ] as const
                    ).map(({ value, label, Icon }) => {
                      const selected = themeMode === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            setThemeMode(value);
                            window.localStorage.setItem(THEME_STORAGE_KEY, value);
                          }}
                          className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 ${
                            selected
                              ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <Settings className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                    Chế độ “Theo máy” tự đổi giao diện theo cài đặt sáng/tối của
                    thiết bị.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="mt-6 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                >
                  Xong
                </button>
              </div>
            </section>
          </div>,
          document.body,
        )}
    </header>
  );
}
