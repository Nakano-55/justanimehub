/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { Book, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Language } from '@/lib/i18n/types';

interface PageProps {
  params: Promise<{
    lang: Language;
  }>;
}

const translations = {
  en: {
    welcome: 'Welcome to JustAnimeHub',
    subtitle: 'A collaborative anime encyclopedia with multilingual support. Discover, learn, and contribute to the world of anime in English and Indonesian.',
    browseAnime: 'Browse Anime',
    startContributing: 'Start Contributing',
    features: {
      database: {
        title: 'Comprehensive Database',
        description: 'Access detailed information about thousands of anime series, movies, and characters',
      },
      multilingual: {
        title: 'Multilingual Support',
        description: 'Read and contribute content in both English and Indonesian languages',
      },
      community: {
        title: 'Community Driven',
        description: 'Join our community of contributors and help build the most comprehensive anime resource',
      },
    },
  },
  id: {
    welcome: 'Selamat Datang di JustAnimeHub',
    subtitle: 'Ensiklopedia anime kolaboratif dengan dukungan multibahasa. Temukan, pelajari, dan berkontribusi dalam dunia anime dalam Bahasa Inggris dan Indonesia.',
    browseAnime: 'Jelajahi Anime',
    startContributing: 'Mulai Berkontribusi',
    features: {
      database: {
        title: 'Database Lengkap',
        description: 'Akses informasi detail tentang ribuan seri anime, film, dan karakter',
      },
      multilingual: {
        title: 'Dukungan Multibahasa',
        description: 'Baca dan berkontribusi konten dalam Bahasa Inggris dan Indonesia',
      },
      community: {
        title: 'Digerakkan Komunitas',
        description: 'Bergabung dengan komunitas kontributor kami dan bantu membangun sumber daya anime terlengkap',
      },
    },
  },
} as const;

const FeatureCard = ({ icon: Icon, title, description }: {
  icon: typeof Book;
  title: string;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="bg-neutral-900/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-800 hover:border-violet-500/50 transition-all duration-300"
  >
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="p-3 bg-violet-500/10 rounded-lg">
        <Icon className="w-8 h-8 text-violet-400" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-neutral-400">{description}</p>
    </div>
  </motion.div>
);

export default function HomePage({ params }: PageProps) {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-start justify-center text-center px-4 pt-24">
        <Image
          src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80"
          fill
          className="object-cover"
          alt="Anime background"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/90 to-neutral-950"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500">
            {t.welcome}
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${lang}/anime`}
              className="px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg text-lg font-medium transition-colors"
            >
              {t.browseAnime}
            </Link>
            <Link
              href={`/${lang}/contribute/guidelines`}
              className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-lg font-medium transition-colors"
            >
              {t.startContributing}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-8 px-4 flex-1 flex items-start">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Book}
              title={t.features.database.title}
              description={t.features.database.description}
            />
            <FeatureCard
              icon={Globe}
              title={t.features.multilingual.title}
              description={t.features.multilingual.description}
            />
            <FeatureCard
              icon={Users}
              title={t.features.community.title}
              description={t.features.community.description}
            />
          </div>
        </div>
      </section>
    </div>
  );
}