'use client';

import { AnimePage } from '@/components/AnimePage';
import { useLanguage } from '@/components/LanguageProvider';

const translations = {
  en: {
    title: 'Upcoming Anime',
    description: 'Most anticipated upcoming anime series',
  },
  id: {
    title: 'Anime Mendatang',
    description: 'Seri anime yang paling dinantikan',
  },
} as const;

export default function UpcomingAnimePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const defaultFilters = {
    title: t.title,
    description: t.description,
    endpoint: 'seasons/upcoming',
  };

  return <AnimePage defaultFilters={defaultFilters} />;
}