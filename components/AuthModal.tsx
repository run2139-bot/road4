"use client";

import { useEffect, useState } from "react";
import { LogIn, UserPlus, X } from "lucide-react";
import { signInWithEmail, signInWithKakao, signUpWithEmail } from "@/services/authService";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

interface Props {
  initialMode?: Mode;
  onClose: () => void;
  /** 로그인/가입 성공 시 호출. 안내할 메시지가 있으면 전달합니다. */
  onSuccess: (message: string) => void;
}

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-primary";

function KakaoLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="#191919">
      <path d="M12 3C6.48 3 2 6.58 2 10.99c0 2.85 1.87 5.35 4.68 6.76l-.96 3.52c-.08.3.26.54.52.36l4.2-2.8c.51.06 1.03.09 1.56.09 5.52 0 10-3.58 10-7.93C22 6.58 17.52 3 12 3z" />
    </svg>
  );
}

export default function AuthModal({ initialMode = "login", onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setConfirm("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && password !== confirm) return setError("비밀번호가 일치하지 않아요.");

    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email.trim(), password);
        onSuccess("로그인되었어요.");
      } else {
        const { needsConfirmation } = await signUpWithEmail(email.trim(), password);
        onSuccess(
          needsConfirmation
            ? "가입 확인 메일을 보냈어요. 메일의 링크로 인증을 마치면 로그인할 수 있어요."
            : "가입이 완료되어 로그인되었어요.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청에 실패했어요.");
      setSubmitting(false);
    }
  }

  async function handleKakao() {
    setError("");
    setSubmitting(true);
    try {
      // 성공하면 카카오 페이지로 이동하므로 submitting 을 되돌리지 않습니다.
      await signInWithKakao();
    } catch (err) {
      setError(err instanceof Error ? err.message : "카카오 로그인에 실패했어요.");
      setSubmitting(false);
    }
  }

  const tabCls =(active: boolean) =>
    cn(
      "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition",
      active ? "bg-primary/15 text-primary" : "text-slate-400 hover:text-slate-200",
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "로그인" : "회원가입"}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-t-3xl border border-primary/30 bg-slate-950 p-6 sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{mode === "login" ? "로그인" : "회원가입"}</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="rounded-full p-2 text-slate-400 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <button type="button" className={tabCls(mode === "login")} onClick={() => switchMode("login")}>
            <LogIn className="size-4" /> 로그인
          </button>
          <button type="button" className={tabCls(mode === "signup")} onClick={() => switchMode("signup")}>
            <UserPlus className="size-4" /> 회원가입
          </button>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-400">이메일</span>
          <input className={inputCls} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-400">비밀번호</span>
          <input
            className={inputCls}
            type="password"
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {mode === "signup" && (
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-400">비밀번호 확인</span>
            <input className={inputCls} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </label>
        )}

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-bold text-slate-950 hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "처리 중…" : mode === "login" ? "로그인" : "가입하기"}
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-500" role="separator">
          <span className="h-px flex-1 bg-slate-800" />
          또는
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleKakao}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-6 py-2.5 text-sm font-bold text-[#191919] hover:brightness-95 disabled:opacity-50"
        >
          <KakaoLogo />
          카카오로 시작하기
        </button>
      </form>
    </div>
  );
}
