"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Layers, 
  Mic, 
  FileText, 
  History, 
  Settings, 
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Flame
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Danh mục điều hướng các phân hệ
  const navItems = [
    {
      title: "Tổng quan",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: "Học từ vựng SM-2",
      href: "/learn",
      icon: Layers,
      badge: "SM-2",
    },
    {
      title: "Luyện phát âm AI",
      href: "/speaking",
      icon: Mic,
      badge: "AI",
    },
    {
      title: "Ngân hàng đề thi",
      href: "/exams",
      icon: FileText,
      badge: "Mới",
    },
    {
      title: "Lịch sử ôn tập",
      href: "/history",
      icon: History,
      badge: null,
    },
    {
      title: "Cài đặt cá nhân",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 select-none min-h-screen ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* 1. LOGO THƯƠNG HIỆU */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                ENG-PLATFORM
              </span>
              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                Spaced Repetition & AI
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* 2. CHUỖI NGÀY HỌC (STREAK GAMIFICATION MINI) */}
      {!collapsed && (
        <div className="px-4 py-3 m-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
              5 ngày liên tục!
            </span>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400">
              Giữ vững chuỗi phong độ
            </span>
          </div>
        </div>
      )}

      {/* 3. DANH MỤC CÁC PHÂN HỆ ĐIỀU HƯỚNG */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-600"
                }`}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.title}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 4. NÚT THU GỌN / MỞ RỘNG (COLLAPSIBLE BUTTON) */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Thu gọn thanh điều hướng</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
