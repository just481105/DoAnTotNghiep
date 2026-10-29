"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

export function NavigationBar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  // Chỉ số Gamification của học viên (sẵn sàng binding từ API /users/me)
  const userProgress = {
    fullName: "Bùi Đức Nam",
    email: "student@engplatform.edu.vn",
    streakDays: 5,
    xpPoints: 1250,
    cefrLevel: "B2",
    nextLevelXP: 2000,
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* KHU VỰC 1: LOGO THƯƠNG HIỆU */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100">
              ENG-PLATFORM
            </span>
            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
              Spaced Repetition & AI
            </span>
          </div>
        </Link>

        {/* KHU VỰC 2: THANH MENU ĐIỀU HƯỚNG NGANG */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
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
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
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

          {/* 3. HUY HIỆU CẤP ĐỘ CEFR */}
          <div 
            title={`Trình độ hiện tại: Khung CEFR ${userProgress.cefrLevel}`}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-black cursor-default"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>{userProgress.cefrLevel}</span>
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
                      <span>Cấp độ: {userProgress.cefrLevel}</span>
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
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Hồ sơ học tập</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Cài đặt hệ thống</span>
                </Link>
                
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                
                <button
                  onClick={() => alert("Đăng xuất thành công")}
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
    </header>
  );
}
