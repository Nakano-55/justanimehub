'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from './ui/card';
import { ThreadPost } from '@/components/ThreadPost';
import { NewPostForm } from '@/components/NewPostForm';
import { MessageSquare, Clock, User, Loader2, AlertCircle } from 'lucide-react';
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

interface Post {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
  } | null;
}

interface DiscussionThreadProps {
  threadId: string;
  lang: Language;
}

const translations = {
  en: {
    loading: 'Loading discussion...',
    error: 'Failed to load discussion',
    noReplies: 'No replies yet. Be the first to reply!',
    postedBy: 'Posted by',
    on: 'on',
    replies: 'replies',
    anonymous: 'Anonymous',
    startDiscussion: 'Start a Discussion',
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
    noReplies: 'Belum ada balasan. Jadilah yang pertama membalas!',
    postedBy: 'Diposting oleh',
    on: 'pada',
    replies: 'balasan',
    anonymous: 'Anonim',
    startDiscussion: 'Mulai Diskusi',
    discussionTitle: 'Judul Diskusi',
    discussionContent: 'Konten Diskusi',
    submit: 'Kirim Diskusi',
    submitting: 'Mengirim...',
    success: 'Diskusi berhasil dibuat',
    createError: 'Gagal membuat diskusi',
    loginRequired: 'Silakan masuk untuk memulai diskusi',
  }
} as const;

export function DiscussionThread({ threadId, lang }: DiscussionThreadProps) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  // Fetch thread and posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch thread details
        const { data: threadData, error: threadError } = await supabase
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
          .single();

        if (threadError && threadError.code !== 'PGRST116') {
          throw threadError;
        }

        setThread(threadData);

        // Fetch posts if thread exists
        if (threadData) {
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select(`
              *,
              profiles (
                username,
                full_name
              )
            `)
            .eq('thread_id', threadData.id)
            .order('created_at', { ascending: true });

          if (postsError) throw postsError;
          setPosts(postsData || []);
        }
      } catch (err) {
        console.error('Error fetching thread:', err);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [threadId, lang, supabase, t.error]);

  // Set up realtime subscription
  useEffect(() => {
    if (!thread?.id) return;

    const channel = supabase
      .channel(`thread-${thread.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `thread_id=eq.${thread.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newPost, error } = await supabase
              .from('posts')
              .select(`
                *,
                profiles (
                  username,
                  full_name
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && newPost) {
              setPosts(current => [...current, newPost]);
            }
          } else if (payload.eventType === 'DELETE') {
            setPosts(current => current.filter(post => post.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setPosts(current =>
              current.map(post =>
                post.id === payload.new.id ? { ...post, ...payload.new } : post
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [thread?.id, supabase]);

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

  if (!thread) {
    return <NewThreadForm animeId={parseInt(threadId)} lang={lang} />;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-900 border-neutral-800 p-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{thread.title}</h1>
          
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
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{posts.length} {t.replies}</span>
            </div>
          </div>

          <div className="mt-4 text-neutral-200 whitespace-pre-line">
            {thread.content}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-neutral-400 py-8">{t.noReplies}</p>
        ) : (
          posts.map((post) => (
            <ThreadPost
              key={post.id}
              post={post}
              lang={lang}
            />
          ))
        )}
      </div>

      <NewPostForm
        threadId={thread.id}
        lang={lang}
      />
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

      window.location.reload();
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