"use client";

import type { User } from "@supabase/supabase-js";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  user: User | null;
  loading: boolean;
  onlyMine: boolean;
  onToggleMine: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

const btnCls =
  "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition";

/** 카카오 계정은 이메일 동의 항목이 없으면 email 이 비어 있으므로 닉네임으로 대체합니다. */
const displayName = (user: User) =>
  (user.user_metadata?.name as string | undefined) ??
  (user.user_metadata?.full_name as string | undefined) ??
  "카카오 사용자";

export default function Header({ user, loading, onlyMine, onToggleMine, onOpenAuth, onSignOut }: Props) {
  return (
    <nav aria-label="계정" className="flex min-h-14 flex-wrap items-center justify-end gap-2 pt-6">
      {loading ? null : user ? (
        <>
          <span className="mr-1 flex items-center gap-1.5 text-sm text-slate-400">
            <UserRound className="size-4" />
            <span className="max-w-48 truncate">{user.email ?? displayName(user)}</span>
          </span>
          <button
            type="button"
            onClick={onToggleMine}
            aria-pressed={onlyMine}
            className={cn(
              btnCls,
              onlyMine
                ? "border-primary bg-primary/15 text-primary"
                : "border-slate-700 text-slate-400 hover:border-slate-500",
            )}
          >
            내 작성 코스
          </button>
          <button type="button" onClick={onSignOut} className={cn(btnCls, "border-slate-700 text-slate-300 hover:border-slate-500")}>
            <LogOut className="size-4" /> 로그아웃
          </button>
        </>
      ) : (
        <button type="button" onClick={onOpenAuth} className={cn(btnCls, "border-primary/50 text-primary hover:bg-primary/10")}>
          <LogIn className="size-4" /> 로그인 / 회원가입
        </button>
      )}
    </nav>
  );
}
