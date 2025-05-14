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
  post: Post;
  lang: Language;
}

const translations = {
  en: {
    deleteConfirm: 'Are you sure you want to delete this post?',
    deleteSuccess: 'Post deleted successfully',
    deleteError: 'Failed to delete post',
    editSuccess: 'Post updated successfully',
    editError: 'Failed to update post',
    by: 'by',
    on: 'on',
    anonymous: 'Anonymous',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
  },
  id: {
    deleteConfirm: 'Apakah Anda yakin ingin menghapus post ini?',
    deleteSuccess: 'Post berhasil dihapus',
    deleteError: 'Gagal menghapus post',
    editSuccess: 'Post berhasil diperbarui',
    editError: 'Gagal memperbarui post',
    by: 'oleh',
    on: 'pada',
    anonymous: 'Anonim',
    edit: 'Edit',
    save: 'Simpan',
    cancel: 'Batal',
  },
} as const;

export function ThreadPost({ post, lang }: ThreadPostProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isAuthor, setIsAuthor] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  useEffect(() => {
    const checkAuthor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthor(user?.id === post.created_by);
    };

    checkAuthor();
  }, [post.created_by, supabase]);

  const handleDelete = async () => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

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
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editContent.trim() })
        .eq('id', post.id);

      if (error) throw error;

      toast({
        description: t.editSuccess,
      });
      setIsEditing(false);
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

  return (
    <Card className="bg-neutral-900 border-neutral-800 p-6">
      <div className="space-y-4">
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

          {isAuthor && (
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="text-violet-400 hover:text-violet-300 hover:bg-violet-950/50"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                className="flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                {t.cancel}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                disabled={!editContent.trim() || editContent === post.content}
                className="flex items-center gap-1 text-green-400 hover:text-green-300 hover:bg-green-950/50"
              >
                <Check className="w-4 h-4" />
                {t.save}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-neutral-200 whitespace-pre-line">
            {post.content}
          </div>
        )}
      </div>
    </Card>
  );
}