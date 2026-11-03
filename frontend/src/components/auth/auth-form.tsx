"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

type AuthMode = "login" | "register";

type AuthResponse = {
  access_token: string;
};

function isAuthResponse(value: unknown): value is AuthResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "access_token" in value &&
    typeof value.access_token === "string"
  );
}

function getErrorMessage(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null || !("message" in value)) {
    return undefined;
  }

  const { message } = value;
  return Array.isArray(message)
    ? message.filter((item): item is string => typeof item === "string").join(" ")
    : typeof message === "string"
      ? message
      : undefined;
}

const API_URL = (
  process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isRegister && password !== confirmPassword) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(isRegister ? { fullName } : {}),
        }),
      });

      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result) || "Không thể đăng nhập lúc này.");
      }

      if (!isAuthResponse(result)) {
        throw new Error("Máy chủ trả về dữ liệu đăng nhập không hợp lệ.");
      }

      localStorage.setItem("access_token", result.access_token);
      router.replace("/");
    } catch (submitError) {
      setError(
        submitError instanceof TypeError
          ? "Không thể kết nối máy chủ. Hãy kiểm tra API đang chạy rồi thử lại."
          : submitError instanceof Error
            ? submitError.message
            : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8f7] px-4 py-6 text-slate-900 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -left-36 top-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <Link href="/" className="inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15">
            <GraduationCap className="h-6 w-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-black tracking-[0.12em] text-slate-900">
              ENG-PLATFORM
            </span>
            <span className="block text-xs font-medium text-slate-500">
              Học tiếng Anh mỗi ngày
            </span>
          </span>
        </Link>

        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-10">
          <section className="hidden max-w-xl lg:block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Chặng đường mới bắt đầu từ hôm nay
            </div>
            <h1 className="text-5xl font-black leading-[1.12] tracking-tight text-slate-900 xl:text-6xl">
              Học một chút.
              <br />
              Tiến bộ <span className="text-emerald-700">mỗi ngày.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Từ vựng, luyện tập và phát âm — tất cả hành trình tiếng Anh của
              bạn ở cùng một nơi.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur">
                <BookOpen className="mb-3 h-5 w-5 text-emerald-700" aria-hidden="true" />
                <p className="font-bold text-slate-900">Học có lộ trình</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Ôn tập đúng lúc, nhớ lâu hơn.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur">
                <CheckCircle2 className="mb-3 h-5 w-5 text-indigo-600" aria-hidden="true" />
                <p className="font-bold text-slate-900">Theo dõi tiến bộ</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Mỗi bước nhỏ đều đáng ghi nhận.
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)] backdrop-blur sm:p-9">
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 lg:hidden">
                  <GraduationCap className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
                  {isRegister ? "Bắt đầu miễn phí" : "Chào mừng trở lại"}
                </p>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {isRegister
                    ? "Tạo tài khoản để bắt đầu hành trình học tiếng Anh."
                    : "Đăng nhập để tiếp tục hành trình học tiếng Anh của bạn."}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {isRegister && (
                  <div>
                    <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-slate-700">
                      Họ và tên
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                      maxLength={100}
                      placeholder="Tên của bạn"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      maxLength={254}
                      placeholder="ban@email.com"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isRegister ? "new-password" : "current-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={8}
                      maxLength={72}
                      placeholder="Ít nhất 8 ký tự"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-12 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">
                      Nhập lại mật khẩu
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      minLength={8}
                      maxLength={72}
                      placeholder="Nhập lại mật khẩu"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                )}

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                <Link
                  href={isRegister ? "/login" : "/register"}
                  className="font-bold text-emerald-800 underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                >
                  {isRegister ? "Đăng nhập" : "Tạo tài khoản"}
                </Link>
              </p>

              <p className="mt-7 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-400">
                Mật khẩu được băm an toàn trước khi lưu vào hệ thống.
              </p>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Học đều đặn hôm nay, tự tin hơn ngày mai.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
