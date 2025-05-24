'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ThreadPost } from './ThreadPost';
import { NewPostForm } from './NewPostForm';
import { User, Clock, MessageSquare, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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

interface ThreadCardProps {
  thread: Thread;
  lang: Language;
}

const translations = {
  en: {
    by: 'by',
    on: 'on',
    anonymous: 'Anonymous',
    replies: 'replies',
    showReplies: 'Show Replies',
    hideReplies: 'Hide Replies',
    reply: 'Reply',
    viewThread: 'View Full Thread',
    showMore: 'Show More',
    showLess: 'Show Less',
  },
  id: {
    by: 'oleh',
    on: 'pada',
    anonymous: 'Anonim',
    replies: 'balasan',
    showReplies: 'Tampilkan Balasan',
    hideReplies: 'Sembunyikan Balasan',
    reply: 'Balas',
    viewThread: 'Lihat Thread Lengkap',
    showMore: 'Tampilkan Lebih Banyak',
    showLess: 'Tampilkan Lebih Sedikit',
  },
} as const;

const CONTENT_PREVIEW_LENGTH = 300;

export function ThreadCard({ thread, lang }: ThreadCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const t = translations[lang];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shouldTruncate = thread.content.length > CONTENT_PREVIEW_LENGTH;
  const displayContent = isExpanded 
    ? thread.content 
    : shouldTruncate 
      ? `${thread.content.slice(0, CONTENT_PREVIEW_LENGTH)}...`
      : thread.content;

  return (
    <Card className="bg-neutral-900 border-neutral-800 p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{thread.title}</h3>
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
            {thread._count && (
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>{thread._count.posts} {t.replies}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-neutral-200 whitespace-pre-line">
          {displayContent}
        </div>

        {shouldTruncate && (
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-neutral-400 hover:text-white"
          >
            {isExpanded ? t.showLess : t.showMore}
          </Button>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2"
          >
            {showReplies ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {t.hideReplies}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {t.showReplies}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {t.reply}
          </Button>
          <Link
            href={`/${lang}/thread/${thread.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-md text-white"
          >
            {t.viewThread}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {showReplyForm && (
          <NewPostForm
            threadId={thread.id}
            lang={lang}
            onSuccess={() => {
              setShowReplyForm(false);
              setShowReplies(true);
            }}
          />
        )}

        {showReplies && (
          <ThreadPost
            threadId={thread.id}
            lang={lang}
          />
        )}
      </div>
    </Card>
  );
}