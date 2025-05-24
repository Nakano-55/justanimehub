'use client';

import { useParams } from 'next/navigation';
import { ThreadDetail } from '@/components/ThreadDetail';
import { useLanguage } from '@/components/LanguageProvider';

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <ThreadDetail threadId={id as string} lang={lang} />
      </div>
    </div>
  );
}