import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 환경변수 유효성 체크 함수
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 환경변수 존재 및 유효성 체크
export const hasEnvVars = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
  
  return !!(url && key && isValidUrl(url) && key.length > 10);
})();

// 환경변수 로그 (개발 환경에서만)
if (process.env.NODE_ENV === 'development' && !hasEnvVars) {
  console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
}
