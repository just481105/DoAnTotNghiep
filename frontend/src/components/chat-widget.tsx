"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AlertTriangle, Loader2, MessageCircle, Send, X } from "lucide-react";
import { fetchWithAuth } from "@/services/api-client";

type Msg = { role: "user" | "assistant"; content: string };

const HIDDEN_PATHS = ["/login", "/register"];

export function ChatWidget() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Kiểm tra đăng nhập mỗi khi đổi trang; đăng xuất thì xoá lịch sử chat
  useEffect(() => {
    const has = !!localStorage.getItem("access_token");
    setLoggedIn(has);
    if (!has) {
      setMessages([]);
      setOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  if (!loggedIn || HIDDEN_PATHS.includes(pathname)) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    // Backend nhận tối đa 20 tin, mỗi tin 2000 ký tự; chỉ gửi 12 tin gần nhất
    const recent = next.slice(-12);
    while (recent.length > 0 && recent[0].role === "assistant") recent.shift();

    try {
      const data = await fetchWithAuth<{ reply: string }>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: recent.map((m) => ({
            role: m.role,
            content: m.content.slice(0, 2000),
          })),
        }),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể kết nối gia sư AI. Thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[32rem] max-h-[80vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
            <span className="text-sm font-bold">Gia sư tiếng Anh AI</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Đóng khung chat"
              className="p-1 rounded-lg hover:bg-indigo-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.length === 0 && (
              <p className="text-xs text-slate-400 text-center mt-6">
                Hỏi mình về ngữ pháp, từ vựng hoặc cách viết bài VSTEP nhé!
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl whitespace-pre-wrap break-words leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI đang trả lời...
              </div>
            )}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                maxLength={2000}
                disabled={loading}
                placeholder="Nhập câu hỏi..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => void send()}
                disabled={loading || !input.trim()}
                aria-label="Gửi"
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              AI có thể nhầm lẫn. Hãy kiểm tra lại thông tin quan trọng.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng chat" : "Mở chat với gia sư AI"}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 flex items-center justify-center"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
