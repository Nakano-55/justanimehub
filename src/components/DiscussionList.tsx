/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { NewThreadForm } from './NewThreadForm';
import { ThreadCard } from './ThreadCard';
import { 
  Loader2, 
  AlertCircle, 
  Plus, 
  Clock, 
  MessageSquare,
  TrendingUp,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface Thread {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  category: string;
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
    sortBy: 'Sort By',
    newest: 'Newest',
    oldest: 'Oldest',
    mostReplies: 'Most Replies',
    category: 'Category',
    allCategories: 'All Categories',
    plotDiscussion: 'Plot Discussion',
    characterAnalysis: 'Character Analysis',
    theories: 'Theories',
    general: 'General Discussion',
    review: 'Review Discussion',
  },
  id: {
    loading: 'Memuat diskusi...',
    error: 'Gagal memuat diskusi',
    noDiscussions: 'Belum ada diskusi. Mulai diskusi!',
    startDiscussion: 'Mulai Diskusi Baru',
    loadMore: 'Muat Lebih Banyak Diskusi',
    sortBy: 'Urutkan',
    newest: 'Terbaru',
    oldest: 'Terlama',
    mostReplies: 'Paling Banyak Balasan',
    category: 'Kategori',
    allCategories: 'Semua Kategori',
    plotDiscussion: 'Diskusi Plot',
    characterAnalysis: 'Analisis Karakter',
    theories: 'Teori',
    general: 'Diskusi Umum',
    review: 'Diskusi Ulasan',
  },
} as const;

const THREADS_PER_PAGE = 5;

const CATEGORIES = [
  'general',
  'plot_discussion',
  'character_analysis',
  'theories',
  'review'
] as const;

type Category = typeof CATEGORIES[number];

export function DiscussionList({ animeId, lang }: DiscussionListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'replies'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  const fetchThreads = async (pageNumber: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const start = pageNumber * THREADS_PER_PAGE;
      const end = start + THREADS_PER_PAGE - 1;

      let query = supabase
        .from('threads')
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .eq('anime_id', animeId)
        .eq('language', lang);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'replies':
          // This would require a count of replies, which we'll implement
          query = query.order('reply_count', { ascending: false });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
      }

      query = query.range(start, end);

      const { data: threadsData, error: threadsError } = await query;

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
  }, [animeId, lang, sortBy, selectedCategory]);

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchThreads(page + 1);
  };

  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, keyof typeof translations[typeof lang]> = {
      'general': 'general',
      'plot_discussion': 'plotDiscussion',
      'character_analysis': 'characterAnalysis',
      'theories': 'theories',
      'review': 'review',
    };

    return t[categoryMap[category] || 'general'];
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          onClick={() => setShowNewThreadForm(true)}
          className="bg-violet-600 hover:bg-violet-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.startDiscussion}
        </Button>

        <div className="flex items-center gap-4">
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as Category | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t.category} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allCategories}</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {getCategoryLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'replies')}
          >
            <SelectTrigger className="w-[180px]">
              <TrendingUp className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <Clock className="w-4 h-4 mr-2 inline-block" />
                {t.newest}
              </SelectItem>
              <SelectItem value="oldest">
                <Clock className="w-4 h-4 mr-2 inline-block" />
                {t.oldest}
              </SelectItem>
              <SelectItem value="replies">
                <MessageSquare className="w-4 h-4 mr-2 inline-block" />
                {t.mostReplies}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
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