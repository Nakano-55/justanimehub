'use client';

import { AnimePage } from '@/components/AnimePage';
import { useLanguage } from '@/components/LanguageProvider';

const translations = {
  en: {
    title: 'Top Rated Anime',
    description: 'The highest rated anime of all time',
  },
  id: {
    title: 'Anime Rating Tertinggi',
    description: 'Anime dengan rating tertinggi sepanjang masa',
  },
} as const;

export default function TopRatedAnimePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const defaultFilters = {
    title: t.title,
    description: t.description,
    selectedSort: 'score',
  };

  return <AnimePage defaultFilters={defaultFilters} />;
}