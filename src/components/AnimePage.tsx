/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { AnimeGrid } from '@/components/AnimeGrid';
import { useAnimeFilters, type PageDefaultFilters } from '@/hooks/useAnimeFilters';
import { useLanguage } from '@/components/LanguageProvider';
import { translations } from '@/types/anime';
import type { Language } from '@/lib/i18n/types';

interface AnimePageProps {
  defaultFilters: PageDefaultFilters;
}

export function AnimePage({ defaultFilters }: AnimePageProps) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const { filters, buildEndpoint } = useAnimeFilters(defaultFilters);

  return (
    <div className="container mx-auto px-6">
      <div className="flex items-center justify-between mt-6 mb-8">
        <h1 className="text-3xl font-bold border-l-4 border-violet-500 pl-3">
          {defaultFilters.title || t.animeList}
        </h1>
      </div>

      {defaultFilters.description && (
        <p className="text-neutral-400 mb-8">{defaultFilters.description}</p>
      )}

      <AnimeGrid 
        lang={lang}
        endpoint={buildEndpoint()}
      />
    </div>
  );
}