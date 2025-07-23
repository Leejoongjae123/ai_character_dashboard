import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasEnvVars } from "../utils";

/**
 * 서버용 Supabase 클라이언트 생성
 * Fluid compute 환경에서는 전역 변수에 저장하지 않고 
 * 매번 새로운 클라이언트를 생성해야 합니다.
 */
export async function createClient() {
  // 환경변수 체크
  if (!hasEnvVars) {
    const errorMessage = 'Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.';
    // 개발 환경에서만 에러를 발생시킴
    if (process.env.NODE_ENV === 'development') {
      return new Error(errorMessage) as any;
    }
    // 프로덕션에서는 null 반환
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const errorMessage = 'Supabase URL 또는 API 키가 누락되었습니다.';
    return null;
  }

  try {
    const cookieStore = await cookies();

    return createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Server Component에서 setAll이 호출된 경우
              // middleware에서 사용자 세션을 새로고침하고 있다면 무시할 수 있음
            }
          },
        },
      },
    );
  } catch (error) {
    return null;
  }
}
