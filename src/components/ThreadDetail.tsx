'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ThreadPost } from './ThreadPost';
import { NewPostForm } from './NewPostForm';
import { ArrowLeft, User, Clock, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface Thread {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  anime_id: number;
  profiles?: {
    username: string | null;
    full_name: string | null;
  } | null;
}

interface ThreadDetailProps {
  threadId: string;
  lang: Language;
}

const translations = {
  en: {
    loading: 'Loading thread...',
    error: 'Failed to load thread',
    by: 'by',
    on: 'on',
    anonymous: 'Anonymous',
    backToAnime: 'Back to Anime',
    reply: 'Reply',
  },
  id: {
    loading: 'Memuat thread...',
    error: 'Gagal memuat thread',
    by: 'oleh',
    on: 'pada',
    anonymous: 'Anonim',
    backToAnime: 'Kembali ke Anime',
    reply: 'Balas',
  }
} as const;

export function ThreadDetail({ threadId, lang }: ThreadDetailProps) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: threadError } = await supabase
          .from('threads')
          .select(`
            *,
            profiles (
              username,
              full_name
            )
          `)
          .eq('id', threadId)
          .single();

        if (threadError) throw threadError;
        setThread(data);
      } catch (err) {
        console.error('Error fetching thread:', err);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThread();
  }, [threadId, supabase, t.error]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500 mr-2" />
        <span>{t.loading}</span>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-400">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {thread.anime_id && (
        <Link
          href={`/${lang}/anime/${thread.anime_id}`}
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToAnime}
        </Link>
      )}

      <Card className="bg-neutral-900 border-neutral-800 p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
            <div className="flex items-center gap-4 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>
                  {t.by} {thread.profiles?.username || thread.profiles?.full_name || t.anonymous}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDate(thread.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="text-neutral-200 whitespace-pre-line">
            {thread.content}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {t.reply}
          </Button>

          {showReplyForm && (
            <NewPostForm
              threadId={thread.id}
              lang={lang}
              onSuccess={() => setShowReplyForm(false)}
            />
          )}

          <ThreadPost
            threadId={thread.id}
            lang={lang}
          />
        </div>
      </Card>
    </div>
  );
}