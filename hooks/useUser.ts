"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

/** 현재 로그인한 유저/세션. 로그인·로그아웃 시 실시간으로 갱신됩니다. */
export function useUser() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 구독 직후 INITIAL_SESSION 이벤트로 현재 세션이 한 번 전달됩니다.
    // 콜백 안에서 다른 supabase 호출을 await 하면 교착될 수 있어 상태만 갱신합니다.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const user: User | null = session?.user ?? null;
  return { user, session, loading };
}
