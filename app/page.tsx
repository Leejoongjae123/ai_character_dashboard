import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from '@/components/login-form';

export default async function HomePage() {
  const supabase = await createClient();
  
  // Supabase 클라이언트 생성 실패 시 로그인 폼만 표시
  if (!supabase || supabase instanceof Error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">AI 캐릭터 대시보드</h1>
            <p className="text-muted-foreground mt-2">계정에 로그인하세요</p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-orange-500 text-sm mt-2">
                ⚠️ Supabase 환경변수를 설정해주세요
              </p>
            )}
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  // 사용자 정보 조회
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  // 로그인된 사용자가 있으면 대시보드로 리다이렉트
  if (user && !error) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">AI 캐릭터 대시보드</h1>
          <p className="text-muted-foreground mt-2">계정에 로그인하세요</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
