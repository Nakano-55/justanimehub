'use client';

import { AnimePage } from '@/components/AnimePage';
import { useLanguage } from '@/components/LanguageProvider';

const translations = {
  en: {
    title: 'Currently Airing Anime',
    description: 'Anime series that are currently broadcasting',
  },
  id: {
    title: 'Anime Sedang Tayang',
    description: 'Seri anime yang sedang ditayangkan',
  },
} as const;

export default function OngoingAnimePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const defaultFilters = {
    title: t.title,
    description: t.description,
    endpoint: 'seasons/now', // Use the seasons/now endpoint to get currently airing anime
  };

  return <AnimePage defaultFilters={defaultFilters} />;
}