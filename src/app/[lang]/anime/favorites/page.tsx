'use client';

import { AnimePage } from '@/components/AnimePage';
import { useLanguage } from '@/components/LanguageProvider';

const translations = {
  en: {
    title: 'Most Favorited Anime',
    description: 'Anime series with the most favorites from the community',
  },
  id: {
    title: 'Anime Paling Difavoritkan',
    description: 'Seri anime dengan favorit terbanyak dari komunitas',
  },
} as const;

export default function MostFavoritedAnimePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const defaultFilters = {
    title: t.title,
    description: t.description,
    selectedSort: 'favorite',
  };

  return <AnimePage defaultFilters={defaultFilters} />;
}