import { createClient } from '@/lib/supabase/server';
import { CharacterSettingsContent } from './components/character-settings-content';

export default async function CharacterSettingsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">캐릭터 설정</h1>
        <p className="text-muted-foreground">AI 캐릭터를 생성하고 관리하세요</p>
      </div>
      
      <CharacterSettingsContent userId={user.id} />
    </div>
  );
} 