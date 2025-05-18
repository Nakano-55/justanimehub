'use client';

import { AnimePage } from '@/components/AnimePage';
import { useLanguage } from '@/components/LanguageProvider';

const translations = {
  en: {
    title: 'Most Popular Anime',
    description: 'Discover the most popular anime series, ranked by the community',
  },
  id: {
    title: 'Anime Paling Populer',
    description: 'Temukan seri anime paling populer, berdasarkan peringkat komunitas',
  },
} as const;

export default function PopularAnimePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const defaultFilters = {
    title: t.title,
    description: t.description,
    selectedSort: 'bypopularity',
  };

  return <AnimePage defaultFilters={defaultFilters} />;
}