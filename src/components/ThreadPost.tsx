'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { User, Clock, Trash2, Loader2, Edit2, Check, X } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

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

interface ThreadPostProps {
  threadId: string;
  lang: Language;
}

const translations = {
  en: {
    loading: 'Loading replies...',
    error: 'Failed to load replies',
    noReplies: 'No replies yet',
    deleteConfirm: 'Are you sure you want to delete this reply?',
    deleteSuccess: 'Reply deleted successfully',
    deleteError: 'Failed to delete reply',
    editSuccess: 'Reply updated successfully',
    editError: 'Failed to update reply',
    by: 'by',
    on: 'on',
    anonymous: 'Anonymous',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
  },
  id: {
    loading: 'Memuat balasan...',
    error: 'Gagal memuat balasan',
    noReplies: 'Belum ada balasan',
    deleteConfirm: 'Apakah Anda yakin ingin menghapus balasan ini?',
    deleteSuccess: 'Balasan berhasil dihapus',
    deleteError: 'Gagal menghapus balasan',
    editSuccess: 'Balasan berhasil diperbarui',
    editError: 'Gagal memperbarui balasan',
    by: 'oleh',
    on: 'pada',
    anonymous: 'Anonim',
    edit: 'Edit',
    save: 'Simpan',
    cancel: 'Batal',
  },
} as const;

export function ThreadPost({ threadId, lang }: ThreadPostProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isAuthor, setIsAuthor] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  useEffect(() => {
    const fetchPosts = async () => {
      if (!threadId) {
        setError('Invalid thread ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (
              username,
              full_name
            )
          `)
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });

        if (postsError) throw postsError;

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const authorMap = (postsData || []).reduce((acc, post) => ({
            ...acc,
            [post.id]: post.created_by === user.id
          }), {});
          setIsAuthor(authorMap);
        }

        setPosts(postsData || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();

    const channel = supabase
      .channel(`posts-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, supabase, t.error]);

  const handleDelete = async (postId: string) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== postId));
      toast({
        description: t.deleteSuccess,
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: t.deleteError,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editContent.trim() })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, content: editContent.trim() } : post
        )
      );
      setEditingPost(null);
      setEditContent('');
      toast({
        description: t.editSuccess,
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: t.editError,
        variant: 'destructive',
      });
    }
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
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-violet-500 mr-2" />
        <span>{t.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 py-4">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-neutral-400 py-4">
        {t.noReplies}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {posts.map((post) => (
        <Card key={post.id} className="bg-neutral-800 border-neutral-700 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    {t.by} {post.profiles?.username || post.profiles?.full_name || t.anonymous}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>

              {isAuthor[post.id] && (
                <div className="flex items-center gap-2">
                  {editingPost !== post.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPost(post.id);
                          setEditContent(post.content);
                        }}
                        className="text-violet-400 hover:text-violet-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(post.id)}
                        disabled={!editContent.trim() || editContent === post.content}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPost(null);
                          setEditContent('');
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {editingPost === post.id ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px]"
              />
            ) : (
              <div className="text-neutral-200 whitespace-pre-line">
                {post.content}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}