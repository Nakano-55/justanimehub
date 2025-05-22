'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { motion } from 'framer-motion';
import { Globe, Users, MessageSquare, Star, Trophy, HandPlatter as Translate, BookOpen, Heart, ChevronRight } from 'lucide-react';

const translations = {
  en: {
    title: 'About JustAnimeHub',
    subtitle: 'A Community-Driven Multilingual Anime Platform',
    description: 'JustAnimeHub is more than just another anime website. We\'re building a collaborative platform where anime enthusiasts can contribute translations, share insights, and engage in meaningful discussions in both English and Indonesian.',
    mission: {
      title: 'Our Mission',
      text: 'To break down language barriers in the anime community by creating a platform where fans can access and contribute to high-quality anime content in multiple languages.',
    },
    features: {
      title: 'What Makes Us Different',
      items: [
        {
          icon: 'Globe',
          title: 'Multilingual Support',
          description: 'Access content in English and Indonesian, with a seamless language switching experience.',
        },
        {
          icon: 'Translate',
          title: 'Community Translations',
          description: 'Contribute translations and help make anime content accessible to more people.',
        },
        {
          icon: 'Users',
          title: 'Active Community',
          description: 'Join discussions, share reviews, and connect with fellow anime enthusiasts.',
        },
        {
          icon: 'Trophy',
          title: 'Gamification',
          description: 'Earn points and achievements for your contributions to the community.',
        },
        {
          icon: 'BookOpen',
          title: 'Comprehensive Database',
          description: 'Detailed information about anime series, movies, and characters.',
        },
        {
          icon: 'Heart',
          title: 'Personalized Experience',
          description: 'Create lists, bookmark favorites, and track what you want to watch.',
        },
      ],
    },
    contribute: {
      title: 'How to Contribute',
      description: 'There are many ways to contribute to JustAnimeHub:',
      items: [
        'Submit translations for anime descriptions and character information',
        'Write thoughtful reviews and ratings',
        'Participate in community discussions',
        'Help improve existing translations',
      ],
    },
    cta: {
      title: 'Join Our Community',
      description: 'Start contributing to make anime more accessible for everyone.',
      button: 'Get Started',
    },
  },
  id: {
    title: 'Tentang JustAnimeHub',
    subtitle: 'Platform Anime Multibahasa yang Digerakkan Komunitas',
    description: 'JustAnimeHub lebih dari sekadar situs anime biasa. Kami membangun platform kolaboratif di mana penggemar anime dapat berkontribusi dalam terjemahan, berbagi wawasan, dan terlibat dalam diskusi bermakna dalam bahasa Inggris dan Indonesia.',
    mission: {
      title: 'Misi Kami',
      text: 'Menghapus hambatan bahasa dalam komunitas anime dengan menciptakan platform di mana penggemar dapat mengakses dan berkontribusi pada konten anime berkualitas tinggi dalam berbagai bahasa.',
    },
    features: {
      title: 'Apa yang Membuat Kami Berbeda',
      items: [
        {
          icon: 'Globe',
          title: 'Dukungan Multibahasa',
          description: 'Akses konten dalam bahasa Inggris dan Indonesia, dengan pengalaman pergantian bahasa yang mulus.',
        },
        {
          icon: 'Translate',
          title: 'Terjemahan Komunitas',
          description: 'Berkontribusi dalam terjemahan dan bantu membuat konten anime lebih mudah diakses.',
        },
        {
          icon: 'Users',
          title: 'Komunitas Aktif',
          description: 'Bergabung dalam diskusi, berbagi ulasan, dan terhubung dengan sesama penggemar anime.',
        },
        {
          icon: 'Trophy',
          title: 'Gamifikasi',
          description: 'Dapatkan poin dan pencapaian untuk kontribusi Anda pada komunitas.',
        },
        {
          icon: 'BookOpen',
          title: 'Database Lengkap',
          description: 'Informasi detail tentang seri anime, film, dan karakter.',
        },
        {
          icon: 'Heart',
          title: 'Pengalaman Personal',
          description: 'Buat daftar, tandai favorit, dan lacak apa yang ingin Anda tonton.',
        },
      ],
    },
    contribute: {
      title: 'Cara Berkontribusi',
      description: 'Ada banyak cara untuk berkontribusi di JustAnimeHub:',
      items: [
        'Kirim terjemahan untuk deskripsi anime dan informasi karakter',
        'Tulis ulasan dan rating yang bermanfaat',
        'Berpartisipasi dalam diskusi komunitas',
        'Bantu memperbaiki terjemahan yang ada',
      ],
    },
    cta: {
      title: 'Bergabung dengan Komunitas Kami',
      description: 'Mulai berkontribusi untuk membuat anime lebih mudah diakses untuk semua.',
      button: 'Mulai Sekarang',
    },
  },
} as const;

const iconComponents = {
  Globe,
  Users,
  MessageSquare,
  Star,
  Trophy,
  Translate,
  BookOpen,
  Heart,
};

export default function AboutPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80"
            fill
            className="object-cover opacity-20"
            alt="Anime background"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/90 to-neutral-950"></div>
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl text-neutral-300 mb-4">
              {t.subtitle}
            </p>
            <p className="text-lg text-neutral-400">
              {t.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-neutral-900/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-6">{t.mission.title}</h2>
            <p className="text-lg text-neutral-300">{t.mission.text}</p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">{t.features.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feature, index) => {
              const Icon = iconComponents[feature.icon as keyof typeof iconComponents];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-neutral-900/50 rounded-xl p-6 hover:bg-neutral-800/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-violet-500/10 rounded-lg">
                      <Icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-neutral-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contribute Section */}
      <section className="py-16 bg-neutral-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold mb-4">{t.contribute.title}</h2>
              <p className="text-lg text-neutral-300">{t.contribute.description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-800/50 rounded-xl p-6"
            >
              <ul className="space-y-4">
                {t.contribute.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-neutral-300">
                    <ChevronRight className="w-5 h-5 text-violet-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">{t.cta.title}</h2>
            <p className="text-lg text-neutral-300 mb-8">{t.cta.description}</p>
            <Link
              href={`/${lang}/contribute/guidelines`}
              className="inline-flex items-center px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg text-lg font-medium transition-colors"
            >
              {t.cta.button}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}