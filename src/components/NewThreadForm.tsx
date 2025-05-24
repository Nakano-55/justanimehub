'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { Loader2, X } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface NewThreadFormProps {
  animeId: number;
  lang: Language;
  onClose?: () => void;
  onSuccess?: () => void;
}

const translations = {
  en: {
    startDiscussion: 'Start a Discussion',
    discussionTitle: 'Discussion Title',
    discussionContent: 'Discussion Content',
    submit: 'Submit Discussion',
    submitting: 'Submitting...',
    success: 'Discussion created successfully',
    error: 'Failed to create discussion',
    loginRequired: 'Please sign in to start a discussion',
    cancel: 'Cancel',
  },
  id: {
    startDiscussion: 'Mulai Diskusi',
    discussionTitle: 'Judul Diskusi',
    discussionContent: 'Konten Diskusi',
    submit: 'Kirim Diskusi',
    submitting: 'Mengirim...',
    success: 'Diskusi berhasil dibuat',
    error: 'Gagal membuat diskusi',
    loginRequired: 'Silakan masuk untuk memulai diskusi',
    cancel: 'Batal',
  },
} as const;

export function NewThreadForm({ animeId, lang, onClose, onSuccess }: NewThreadFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(t.loginRequired);
      }

      const { error: submitError } = await supabase
        .from('threads')
        .insert({
          title: title.trim(),
          content: content.trim(),
          anime_id: animeId,
          created_by: user.id,
          language: lang,
        });

      if (submitError) throw submitError;

      setTitle('');
      setContent('');
      toast({
        description: t.success,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : t.error,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t.startDiscussion}</h2>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t.discussionTitle}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t.discussionContent}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px]"
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-neutral-400 hover:text-white"
            >
              {t.cancel}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="bg-violet-600 hover:bg-violet-500"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? t.submitting : t.submit}
          </Button>
        </div>
      </form>
    </Card>
  );
}