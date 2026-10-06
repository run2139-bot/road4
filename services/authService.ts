import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const MESSAGES: [RegExp, string][] = [
  [/already registered|already been registered/i, "이미 가입된 이메일이에요."],
  [/invalid login credentials/i, "이메일 또는 비밀번호가 올바르지 않아요."],
  [/email not confirmed/i, "이메일 인증이 아직 완료되지 않았어요. 메일함을 확인해 주세요."],
  [/password should be at least/i, "비밀번호는 6자 이상이어야 해요."],
  [/invalid.*email|email.*invalid/i, "올바른 이메일 형식이 아니에요."],
  [/rate limit/i, "요청이 너무 많아요. 잠시 후 다시 시도해 주세요."],
];

function toMessage(message: string) {
  return MESSAGES.find(([re]) => re.test(message))?.[1] ?? message;
}

/** 회원가입. 이메일 인증이 켜져 있으면 세션이 없으므로 needsConfirmation 이 true 입니다. */
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(toMessage(error.message));
  // 이미 가입된 이메일은 보안상 에러 없이 identities 가 빈 배열로 돌아옵니다.
  if (data.user && data.user.identities?.length === 0) {
    throw new Error("이미 가입된 이메일이에요.");
  }
  return { needsConfirmation: !data.session };
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(toMessage(error.message));
}

/** 카카오 OAuth. 카카오 로그인 페이지로 이동했다가 현재 사이트로 돌아옵니다. */
export async function signInWithKakao() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: { redirectTo: window.location.origin },
  });
  if (error) throw new Error(toMessage(error.message));
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
