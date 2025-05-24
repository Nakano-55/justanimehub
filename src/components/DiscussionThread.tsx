/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from './ui/card';
import { ThreadPost } from '@/components/ThreadPost';
import { NewPostForm } from '@/components/NewPostForm';
import { MessageSquare, Clock, User, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface Thread {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
  } | null;
}

interface ThreadListProps {
  threadId: string;
  lang: Language;
}

const translations = {
  en: {
    loading: 'Loading discussions...',
    error: 'Failed to load discussions',
    noThreads: 'No discussions yet. Start a new one!',
    startDiscussion: 'Start a Discussion',
    postedBy: 'Posted by',
    on: 'on',
    replies: 'replies',
    anonymous: 'Anonymous',
    viewThread: 'View Thread',
    createThread: 'Create Thread',
    discussionTitle: 'Discussion Title',
    discussionContent: 'Discussion Content',
    submit: 'Submit Discussion',
    submitting: 'Submitting...',
    success: 'Discussion created successfully',
    createError: 'Failed to create discussion',
    loginRequired: 'Please sign in to start a discussion',
  },
  id: {
    loading: 'Memuat diskusi...',
    error: 'Gagal memuat diskusi',
    noThreads: 'Belum ada diskusi. Mulai yang baru!',
    startDiscussion: 'Mulai Diskusi',
    postedBy: 'Diposting oleh',
    on: 'pada',
    replies: 'balasan',
    anonymous: 'Anonim',
    viewThread: 'Lihat Thread',
    createThread: 'Buat Thread',
    discussionTitle: 'Judul Diskusi',
    discussionContent: 'Konten Diskusi',
    submit: 'Kirim Diskusi',
    submitting: 'Mengirim...',
    success: 'Diskusi berhasil dibuat',
    createError: 'Gagal membuat diskusi',
    loginRequired: 'Silakan masuk untuk memulai diskusi',
  }
} as const;

export function DiscussionThread({ threadId, lang }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: threadsError } = await supabase
          .from('threads')
          .select(`
            *,
            profiles (
              username,
              full_name
            )
          `)
          .eq('anime_id', parseInt(threadId))
          .eq('language', lang)
          .order('created_at', { ascending: false });

        if (threadsError) throw threadsError;
        setThreads(data || []);
      } catch (err) {
        console.error('Error fetching threads:', err);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();

    const channel = supabase
      .channel('thread-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threads',
          filter: `anime_id=eq.${threadId}`,
        },
        () => {
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, lang, supabase, t.error]);

  const toggleThread = (threadId: string) => {
    setExpandedThreads(prev => {
      const next = new Set(prev);
      if (next.has(threadId)) {
        next.delete(threadId);
      } else {
        next.add(threadId);
      }
      return next;
    });
  };

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-400">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NewThreadForm animeId={parseInt(threadId)} lang={lang} />

      <div className="space-y-4">
        {threads.length === 0 ? (
          <p className="text-center text-neutral-400 py-8">{t.noThreads}</p>
        ) : (
          threads.map((thread) => (
            <Card key={thread.id} className="bg-neutral-900 border-neutral-800 p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{thread.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          {t.postedBy} {thread.profiles?.username || thread.profiles?.full_name || t.anonymous}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(thread.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/${lang}/thread/${thread.id}`}
                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300"
                  >
                    {t.viewThread}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${
                  expandedThreads.has(thread.id) ? 'max-h-full' : 'max-h-24'
                }`}>
                  <p className="text-neutral-300 whitespace-pre-line">{thread.content}</p>
                </div>

                {thread.content.length > 100 && (
                  <Button
                    variant="ghost"
                    onClick={() => toggleThread(thread.id)}
                    className="text-sm text-neutral-400 hover:text-white"
                  >
                    {expandedThreads.has(thread.id) ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

interface NewThreadFormProps {
  animeId: number;
  lang: Language;
}

function NewThreadForm({ animeId, lang }: NewThreadFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      
    } catch (error) {
      console.error('Error creating thread:', error);
      alert(error instanceof Error ? error.message : t.createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold">{t.startDiscussion}</h2>

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

        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="w-full py-2 bg-violet-600 hover:bg-violet-500 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSubmitting ? t.submitting : t.submit}
        </button>
      </form>
    </Card>
  );
}