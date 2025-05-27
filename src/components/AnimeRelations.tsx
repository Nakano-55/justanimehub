/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, GitBranch, ImageOff } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Language } from '@/lib/i18n/types';

interface AnimeEntry {
  mal_id: number;
  title: string;
  images?: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  type?: string;
}

interface AnimeRelation {
  relation: string;
  entry: AnimeEntry[];
}

interface AnimeRelationsProps {
  animeId: number;
  lang: Language;
}

interface TranslationsType {
  relations: string;
  loading: string;
  error: string;
  noRelations: string;
  sequel: string;
  prequel: string;
  spinOff: string;
  adaptation: string;
  alternativeVersion: string;
  alternativeSetting: string;
  sideStory: string;
  summary: string;
  character: string;
  other: string;
  noImage: string;
  retryButton: string;
  manga: string;
  anime: string;
  imageAlt: {
    cover: (title: string) => string;
    placeholder: string;
  };
}

const translations: Record<Language, TranslationsType> = {
  en: {
    relations: 'Related Media',
    loading: 'Loading relations...',
    error: 'Failed to load relations',
    noRelations: 'No related media found',
    sequel: 'Sequel',
    prequel: 'Prequel',
    spinOff: 'Spin-off',
    adaptation: 'Adaptation',
    alternativeVersion: 'Alternative Version',
    alternativeSetting: 'Alternative Setting',
    sideStory: 'Side Story',
    summary: 'Summary',
    character: 'Character',
    other: 'Other',
    noImage: 'No image available',
    retryButton: 'Try Again',
    manga: 'Manga',
    anime: 'Anime',
    imageAlt: {
      cover: (title: string) => `Cover image for ${title}`,
      placeholder: 'Placeholder image for media without cover'
    }
  },
  id: {
    relations: 'Media Terkait',
    loading: 'Memuat relasi...',
    error: 'Gagal memuat relasi',
    noRelations: 'Tidak ada media terkait',
    sequel: 'Sekuel',
    prequel: 'Prekuel',
    spinOff: 'Spin-off',
    adaptation: 'Adaptasi',
    alternativeVersion: 'Versi Alternatif',
    alternativeSetting: 'Setting Alternatif',
    sideStory: 'Cerita Sampingan',
    summary: 'Ringkasan',
    character: 'Karakter',
    other: 'Lainnya',
    noImage: 'Tidak ada gambar',
    retryButton: 'Coba Lagi',
    manga: 'Manga',
    anime: 'Anime',
    imageAlt: {
      cover: (title: string) => `Gambar sampul untuk ${title}`,
      placeholder: 'Gambar placeholder untuk media tanpa sampul'
    }
  }
};

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, delay * 2));
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

export function AnimeRelations({ animeId, lang }: AnimeRelationsProps) {
  const [relations, setRelations] = useState<AnimeRelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  const fetchRelations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${animeId}/relations`);

      const validRelations = data.data.filter((relation: AnimeRelation) =>
        relation.entry && Array.isArray(relation.entry) && relation.entry.length > 0
      );

      const enrichedRelations = await Promise.all(validRelations.map(async (relation: AnimeRelation) => {
        const enrichedEntries = await Promise.all(relation.entry.map(async (entry: AnimeEntry) => {
          if (entry.type?.toLowerCase() === 'anime') {
            try {
              const animeData = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${entry.mal_id}/full`);
              return {
                ...entry,
                images: animeData.data.images,
                title: animeData.data.title
              };
            } catch (error) {
              console.error(`Error fetching details for anime ${entry.mal_id}:`, error);
              return entry;
            }
          } else if (entry.type?.toLowerCase() === 'manga') {
            try {
              const mangaData = await fetchWithRetry(`https://api.jikan.moe/v4/manga/${entry.mal_id}/full`);
              return {
                ...entry,
                images: mangaData.data.images,
                title: mangaData.data.title
              };
            } catch (error) {
              console.error(`Error fetching details for manga ${entry.mal_id}:`, error);
              return entry;
            }
          }
          return entry;
        }));

        return {
          ...relation,
          entry: enrichedEntries
        };
      }));

      setRelations(enrichedRelations || []);
    } catch (error) {
      console.error('Error fetching relations:', error);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelations();
  }, [animeId, lang]);

  const getRelationIcon = (relation: string) => {
    switch (relation.toLowerCase()) {
      case 'sequel':
        return <ArrowRight className="w-4 h-4" aria-hidden="true" />;
      case 'prequel':
        return <ArrowLeft className="w-4 h-4" aria-hidden="true" />;
      default:
        return <GitBranch className="w-4 h-4" aria-hidden="true" />;
    }
  };

  const getRelationLabel = (relation: string): string => {
    const relationMap: Record<string, keyof TranslationsType> = {
      'sequel': 'sequel',
      'prequel': 'prequel',
      'spin-off': 'spinOff',
      'adaptation': 'adaptation',
      'alternative version': 'alternativeVersion',
      'alternative setting': 'alternativeSetting',
      'side story': 'sideStory',
      'summary': 'summary',
      'character': 'character',
      'other': 'other',
    };

    const key = relationMap[relation.toLowerCase().trim()] || 'other';
    return t[key] as string;
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-8 text-center"
      >
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchRelations}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
          aria-label={t.retryButton}
        >
          {t.retryButton}
        </button>
      </motion.div>
    );
  }

  if (relations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 text-neutral-400"
      >
        {t.noRelations}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {relations.map((relation, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-lg font-medium">
            {getRelationIcon(relation.relation)}
            {getRelationLabel(relation.relation)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relation.entry.map((entry) => (
              <div
                key={entry.mal_id}
                className="bg-neutral-800 rounded-lg overflow-hidden transition-all group hover:ring-2 hover:ring-violet-500/50"
              >
                <div className="relative aspect-[3/4]">
                  {entry.images?.jpg?.large_image_url ? (
                    <Image
                      src={entry.images.jpg.large_image_url}
                      alt={t.imageAlt.cover(entry.title)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-neutral-800 flex items-center justify-center"
                      aria-label={t.imageAlt.placeholder}
                    >
                      <ImageOff className="w-8 h-8 text-neutral-600" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2 group-hover:text-violet-400 transition-colors">
                    {entry.title}
                  </h3>
                  {entry.type && (
                    <span className="text-sm text-neutral-400 mt-1 block">
                      {entry.type.toLowerCase() === 'manga' ? t.manga : t.anime}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {[...Array(2)].map((_, groupIndex) => (
      <div key={groupIndex} className="space-y-4">
        <div className="h-6 bg-neutral-800 rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, cardIndex) => (
            <div key={cardIndex} className="bg-neutral-800 rounded-lg overflow-hidden">
              <div className="aspect-[3/4] bg-neutral-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-neutral-700 rounded w-3/4" />
                <div className="h-3 bg-neutral-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);