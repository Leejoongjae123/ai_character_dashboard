'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Message } from '@/lib/types';
import { MessageFormData } from '../types';
import { Trash2, Save } from 'lucide-react';

interface CardMessagesModalProps {
  message: Message | null;
  isOpen: boolean;
  isCreating: boolean;
  onClose: () => void;
}

export function CardMessagesModal({ message, isOpen, isCreating, onClose }: CardMessagesModalProps) {
  const [formData, setFormData] = useState<MessageFormData>({
    messages: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (message && !isCreating) {
      setFormData({
        messages: message.messages || '',
      });
    } else {
      setFormData({
        messages: '',
      });
    }
  }, [message, isCreating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isCreating ? '/api/messages' : `/api/messages/${message?.id}`;
      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onClose();
      } else {
        console.log('메세지 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.log('메세지 저장 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!message || isCreating) {
      return;
    }

    if (!confirm('정말로 이 메세지를 삭제하시겠습니까?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/messages/${message.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onClose();
      } else {
        console.log('메세지 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.log('메세지 삭제 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? '새 메세지 추가' : '메세지 수정'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="messages">메세지 내용 *</Label>
            <Textarea
              id="messages"
              placeholder="메세지 내용을 입력하세요..."
              value={formData.messages}
              onChange={(e) => setFormData({ ...formData, messages: e.target.value })}
              required
              rows={10}
              className="resize-none"
            />
          </div>

          <div className="flex justify-between">
            <div>
              {!isCreating && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                취소
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
