import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 환경변수가 설정되지 않았으면 middleware 체크를 건너뜀
  if (!hasEnvVars) {
    console.warn('⚠️ Supabase 환경변수가 설정되지 않아 인증 미들웨어를 건너뜁니다.');
    return supabaseResponse;
  }

  // 환경변수 유효성 추가 체크
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 환경변수가 누락되었습니다.');
    return supabaseResponse;
  }

  try {
    // Supabase 클라이언트 생성
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // 사용자 인증 상태 확인
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    // 인증이 필요한 페이지에서 로그인하지 않은 사용자를 리다이렉트
    if (
      request.nextUrl.pathname !== "/" &&
      !user &&
      !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/auth")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error('❌ Supabase 미들웨어에서 오류 발생:', error);
    return supabaseResponse;
  }
}
