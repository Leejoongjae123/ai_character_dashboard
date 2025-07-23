'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Character } from '@/lib/types';
import { CharacterFormData } from '../types';
import { Trash2 } from 'lucide-react';

interface CharacterModalProps {
  character: Character | null;
  isOpen: boolean;
  isCreating: boolean;
  userId: string;
  onClose: () => void;
}

export function CharacterModal({ character, isOpen, isCreating, userId, onClose }: CharacterModalProps) {
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    role: '',
    description: '',
    ability1: '',
    ability1_min: 0,
    ability1_max: 100,
    ability2: '',
    ability2_min: 0,
    ability2_max: 100,
    is_active: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (character && !isCreating) {
      setFormData({
        name: character.name || '',
        role: character.role || '',
        description: character.description || '',
        ability1: character.ability1 || '',
        ability1_min: character.ability1_min || 0,
        ability1_max: character.ability1_max || 100,
        ability2: character.ability2 || '',
        ability2_min: character.ability2_min || 0,
        ability2_max: character.ability2_max || 100,
        is_active: character.is_active ?? true,
      });
    } else if (isCreating) {
      setFormData({
        name: '',
        role: '',
        description: '',
        ability1: '',
        ability1_min: 0,
        ability1_max: 100,
        ability2: '',
        ability2_min: 0,
        ability2_max: 100,
        is_active: true,
      });
    }
  }, [character, isCreating, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isCreating) {
        // 새 캐릭터 생성
        const response = await fetch('/api/characters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            user_id: userId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || '캐릭터 생성에 실패했습니다.');
          return;
        }
      } else if (character) {
        // 기존 캐릭터 수정
        const response = await fetch(`/api/characters/${character.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || '캐릭터 수정에 실패했습니다.');
          return;
        }
      }

      onClose();
    } catch {
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!character) return;
    
    const confirmed = confirm(`"${character.name}" 캐릭터를 정말 삭제하시겠습니까?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || '캐릭터 삭제에 실패했습니다.');
        return;
      }

      onClose();
    } catch {
      alert('서버 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field: keyof CharacterFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? '새 캐릭터 생성' : '캐릭터 편집'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">캐릭터 이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="캐릭터 이름을 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">역할 *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="예: 전사, 마법사, 힐러"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="캐릭터에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">능력치 설정</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ability1">능력 1</Label>
                <Input
                  id="ability1"
                  value={formData.ability1}
                  onChange={(e) => handleInputChange('ability1', e.target.value)}
                  placeholder="예: 공격력"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ability1_min">최소값</Label>
                <Input
                  id="ability1_min"
                  type="number"
                  value={formData.ability1_min}
                  onChange={(e) => handleInputChange('ability1_min', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ability1_max">최대값</Label>
                <Input
                  id="ability1_max"
                  type="number"
                  value={formData.ability1_max}
                  onChange={(e) => handleInputChange('ability1_max', parseInt(e.target.value) || 100)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ability2">능력 2</Label>
                <Input
                  id="ability2"
                  value={formData.ability2}
                  onChange={(e) => handleInputChange('ability2', e.target.value)}
                  placeholder="예: 방어력"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ability2_min">최소값</Label>
                <Input
                  id="ability2_min"
                  type="number"
                  value={formData.ability2_min}
                  onChange={(e) => handleInputChange('ability2_min', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ability2_max">최대값</Label>
                <Input
                  id="ability2_max"
                  type="number"
                  value={formData.ability2_max}
                  onChange={(e) => handleInputChange('ability2_max', parseInt(e.target.value) || 100)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked as boolean)}
            />
            <Label htmlFor="is_active">활성 상태</Label>
          </div>

          <DialogFooter className="gap-2">
            {!isCreating && character && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? '삭제 중...' : '삭제'}
              </Button>
            )}
            
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (isCreating ? '생성 중...' : '수정 중...') 
                  : (isCreating ? '생성' : '수정')
                }
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 