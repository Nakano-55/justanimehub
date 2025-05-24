'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { Loader2 } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface NewPostFormProps {
  threadId: string;
  lang: Language;
  onSuccess?: () => void;
}

const translations = {
  en: {
    writeReply: 'Write a reply',
    submit: 'Submit Reply',
    submitting: 'Submitting...',
    success: 'Reply posted successfully',
    error: 'Failed to post reply',
    loginRequired: 'Please sign in to post a reply',
    placeholder: 'Write your reply here...',
  },
  id: {
    writeReply: 'Tulis balasan',
    submit: 'Kirim Balasan',
    submitting: 'Mengirim...',
    success: 'Balasan berhasil dikirim',
    error: 'Gagal mengirim balasan',
    loginRequired: 'Silakan masuk untuk mengirim balasan',
    placeholder: 'Tulis balasan Anda di sini...',
  }
} as const;

export function NewPostForm({ threadId, lang, onSuccess }: NewPostFormProps) {
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

      const { data: newPost, error: submitError } = await supabase
        .from('posts')
        .insert({
          thread_id: threadId,
          content: content.trim(),
          created_by: user.id,
        })
        .select()
        .single();

      if (submitError) throw submitError;

      // Get thread details to notify the owner
      const { data: threadData } = await supabase
        .from('threads')
        .select('created_by, anime_id')
        .eq('id', threadId)
        .single();

      if (threadData && threadData.created_by !== user.id) {
        // Notify thread owner about the reply
        await supabase.from('notifications').insert({
          user_id: threadData.created_by,
          type: 'reply',
          message: 'Someone replied to your thread',
          link: `/${lang}/anime/${threadData.anime_id}`,
          data: {
            threadId,
            postId: newPost.id,
            content: content.substring(0, 100)
          }
        });
      }

      setContent('');
      toast({
        description: t.success,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error posting reply:', error);
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
        <h3 className="text-lg font-semibold">{t.writeReply}</h3>
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.placeholder}
          className="min-h-[100px] bg-neutral-800 border-neutral-700"
        />

        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="w-full bg-violet-600 hover:bg-violet-500"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSubmitting ? t.submitting : t.submit}
        </Button>
      </form>
    </Card>
  );
}