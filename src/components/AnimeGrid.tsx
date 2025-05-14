'use client';

import { useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AnimeCard } from './AnimeCard';
import { useAnimeData } from '@/hooks/useAnimeData';
import type { Language } from '@/lib/i18n/types';
import { translations } from '@/types/anime';

interface AnimeGridProps {
  lang: Language;
  endpoint: string;
}

export function AnimeGrid({ lang, endpoint }: AnimeGridProps) {
  const {
    animeList,
    isLoading,
    error,
    hasNextPage,
    currentPage,
    setPage,
    resetPage
  } = useAnimeData(endpoint);

  const t = translations[lang];

  // Reset page when endpoint changes
  useEffect(() => {
    console.log('🔄 Endpoint changed:', endpoint);
    resetPage();
  }, [endpoint, resetPage]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
        <AlertCircle className="w-12 h-12 mb-4 text-red-500" aria-hidden="true" />
        <p className="mb-4">{t.error}</p>
        <p className="text-sm text-neutral-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <span className="ml-3">{t.loading}</span>
        </div>
      ) : animeList.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          {t.noResults}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {animeList.map((anime, index) => (
              <AnimeCard
                key={`${anime.mal_id}-${currentPage}-${index}`}
                anime={anime}
                index={index}
                lang={lang}
              />
            ))}
          </div>

          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              {t.prev}
            </button>
            <span className="text-lg font-semibold">
              {currentPage}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={!hasNextPage || isLoading}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              {t.next}
            </button>
          </div>
        </>
      )}
    </div>
  );
}