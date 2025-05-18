'use client';

import { AnimePage } from '@/components/AnimePage';
import { useLanguage } from '@/components/LanguageProvider';

const translations = {
  en: {
    title: 'Best Anime Movies',
    description: 'The highest rated anime movies of all time',
  },
  id: {
    title: 'Film Anime Terbaik',
    description: 'Film anime dengan rating tertinggi sepanjang masa',
  },
} as const;

export default function AnimeMoviesPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const defaultFilters = {
    title: t.title,
    description: t.description,
    selectedType: 'movie',
    selectedSort: 'score',
  };

  return <AnimePage defaultFilters={defaultFilters} />;
}