/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { NewThreadForm } from './NewThreadForm';
import { ThreadCard } from './ThreadCard';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
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
  _count?: {
    posts: number;
  };
}

interface DiscussionListProps {
  animeId: number;
  lang: Language;
}

const translations = {
  en: {
    loading: 'Loading discussions...',
    error: 'Failed to load discussions',
    noDiscussions: 'No discussions yet. Start one!',
    startDiscussion: 'Start New Discussion',
    loadMore: 'Load More Discussions',
  },
  id: {
    loading: 'Memuat diskusi...',
    error: 'Gagal memuat diskusi',
    noDiscussions: 'Belum ada diskusi. Mulai diskusi!',
    startDiscussion: 'Mulai Diskusi Baru',
    loadMore: 'Muat Lebih Banyak Diskusi',
  },
} as const;

const THREADS_PER_PAGE = 5;

export function DiscussionList({ animeId, lang }: DiscussionListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  const fetchThreads = async (pageNumber: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const start = pageNumber * THREADS_PER_PAGE;
      const end = start + THREADS_PER_PAGE - 1;

      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .eq('anime_id', animeId)
        .eq('language', lang)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (threadsError) throw threadsError;

      // Fetch post counts for each thread
      const threadsWithCounts = await Promise.all(
        (threadsData || []).map(async (thread) => {
          const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .eq('thread_id', thread.id);

          return {
            ...thread,
            _count: {
              posts: count || 0
            }
          };
        })
      );

      if (pageNumber === 0) {
        setThreads(threadsWithCounts);
      } else {
        setThreads(prev => [...prev, ...threadsWithCounts]);
      }

      setHasMore(threadsWithCounts.length === THREADS_PER_PAGE);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();

    const channel = supabase
      .channel('thread-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threads',
          filter: `anime_id=eq.${animeId}`,
        },
        () => {
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [animeId, lang, supabase, t.error]);

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchThreads(page + 1);
  };

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
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setShowNewThreadForm(true)}
          className="bg-violet-600 hover:bg-violet-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.startDiscussion}
        </Button>
      </div>

      {showNewThreadForm && (
        <NewThreadForm
          animeId={animeId}
          lang={lang}
          onClose={() => setShowNewThreadForm(false)}
          onSuccess={() => {
            setShowNewThreadForm(false);
            fetchThreads();
          }}
        />
      )}

      {isLoading && threads.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500 mr-2" />
          <span>{t.loading}</span>
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-8 text-neutral-400">
          {t.noDiscussions}
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              lang={lang}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={loadMore}
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {t.loadMore}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}