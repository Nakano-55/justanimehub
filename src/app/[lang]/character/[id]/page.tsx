/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { useTranslation } from '@/components/TranslationProvider';
import { TranslationContributor } from '@/components/TranslationContributor';
import { BookmarkButtons } from '@/components/BookmarkButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, AlertCircle, Star, Heart, Users } from 'lucide-react';

interface Character {
  mal_id: number;
  name: string;
  name_kanji: string | null;
  nicknames: string[];
  favorites: number;
  about: string | null;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
    };
  };
  anime: Array<{
    role: string;
    anime: {
      mal_id: number;
      title: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
    };
  }>;
  manga: Array<{
    role: string;
    manga: {
      mal_id: number;
      title: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
    };
  }>;
  voices: Array<{
    person: {
      mal_id: number;
      name: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
    };
    language: string;
  }>;
}

const translations = {
  en: {
    back: 'Back',
    loading: 'Loading character details...',
    error: 'Error loading character',
    retry: 'Retry',
    nicknames: 'Nicknames',
    about: 'About',
    animeAppearances: 'Anime Appearances',
    mangaAppearances: 'Manga Appearances',
    voiceActors: 'Voice Actors',
    role: 'Role',
    noDescription: 'No description available.',
    favorites: 'Favorites',
    language: 'Language',
    viewAnime: 'View Anime',
    viewManga: 'View Manga',
    contributeDescription: 'Contribute Description',
  },
  id: {
    back: 'Kembali',
    loading: 'Memuat detail karakter...',
    error: 'Gagal memuat karakter',
    retry: 'Coba Lagi',
    nicknames: 'Nama Lain',
    about: 'Tentang',
    animeAppearances: 'Muncul di Anime',
    mangaAppearances: 'Muncul di Manga',
    voiceActors: 'Pengisi Suara',
    role: 'Peran',
    noDescription: 'Belum ada deskripsi.',
    favorites: 'Favorit',
    language: 'Bahasa',
    viewAnime: 'Lihat Anime',
    viewManga: 'Lihat Manga',
    contributeDescription: 'Kontribusi Deskripsi',
  },
} as const;

async function fetchCharacterDetails(id: string): Promise<Character> {
  const response = await fetch(`https://api.jikan.moe/v4/characters/${id}/full`);
  if (!response.ok) throw new Error('Failed to fetch character details');
  const data = await response.json();
  return data.data;
}

export default function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const { getTranslation } = useTranslation();
  const [character, setCharacter] = useState<Character | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  useEffect(() => {
    async function loadCharacter() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCharacterDetails(id);
        setCharacter(data);

        if (lang !== 'en') {
          const translatedDesc = await getTranslation(
            parseInt(id),
            'character',
            'character_description',
            lang
          );
          setDescription(translatedDesc?.content || null);
        }
      } catch (err) {
        console.error('Error fetching character:', err);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCharacter();
  }, [id, lang, getTranslation, t.error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <span className="ml-2">{t.loading}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-xl text-red-500 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-violet-600 hover:bg-violet-500"
            >
              {t.retry}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="container mx-auto px-6">
        <div className="mb-4 md:mb-8">
          <Link
            href={`/${lang}/anime`}
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </Link>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-4 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="relative">
              <Image
                src={character.images.jpg.image_url}
                width={280}
                height={380}
                className="w-full rounded-lg shadow-lg"
                alt={character.name}
                priority
              />
            </div>

            <div className="bg-neutral-900 rounded-lg p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center text-xl md:text-2xl font-bold text-red-500">
                  <Heart className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                  <span className="break-all">{character.favorites.toLocaleString()}</span>
                </div>
                <p className="text-xs md:text-sm text-neutral-400">{t.favorites}</p>
              </div>

              <div className="flex justify-center">
                <BookmarkButtons 
                  entityId={character.mal_id}
                  entityType="character"
                  title={character.name}
                  imageUrl={character.images.jpg.image_url}
                  lang={lang}
                />
              </div>

              {character.nicknames.length > 0 && (
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-neutral-400 mb-2">
                    {t.nicknames}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {character.nicknames.map((nickname, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-violet-600/30 text-violet-300 text-xs"
                      >
                        {nickname}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 md:space-y-8 min-w-0">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold mb-2 break-words">{character.name}</h1>
                  {character.name_kanji && (
                    <p className="text-lg md:text-xl text-neutral-400 break-words">{character.name_kanji}</p>
                  )}
                </div>
              </div>
            </div>

            <Tabs defaultValue="about" className="w-full min-w-0">
              <div className="max-w-screen-lg mx-auto px-4">
                <TabsList className="bg-neutral-900 p-1 w-full flex justify-between gap-2">
                  <TabsTrigger 
                    value="about"
                    className="flex-1 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap"
                  >
                    <span>{t.about}</span>
                  </TabsTrigger>
                  {character.anime.length > 0 && (
                    <TabsTrigger 
                      value="anime"
                      className="flex-1 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">{t.animeAppearances}</span>
                      <span className="sm:hidden">Anime</span>
                    </TabsTrigger>
                  )}
                  {character.manga.length > 0 && (
                    <TabsTrigger 
                      value="manga"
                      className="flex-1 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">{t.mangaAppearances}</span>
                      <span className="sm:hidden">Manga</span>
                    </TabsTrigger>
                  )}
                  {character.voices.length > 0 && (
                    <TabsTrigger 
                      value="voices"
                      className="flex-1 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">{t.voiceActors}</span>
                      <span className="sm:hidden">Voices</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <TabsContent value="about" className="mt-4">
                <div className="bg-neutral-900 rounded-lg p-4 md:p-6">
                  <div className="space-y-4">
                    <h2 className="text-lg md:text-xl font-semibold">{t.about}</h2>
                    <p className="text-neutral-200 whitespace-pre-line break-words text-sm md:text-base text-justify">
                      {description || character.about || t.noDescription}
                    </p>
                    <TranslationContributor
                      entityId={character.mal_id}
                      entityType="character"
                      contentType="character_description"
                      originalText={character.about || ''}
                      currentLanguage={lang}
                    />
                  </div>
                </div>
              </TabsContent>

              {character.anime.length > 0 && (
                <TabsContent value="anime" className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {character.anime.map((appearance, index) => (
                      <Link
                        key={`${appearance.anime.mal_id}-${index}`}
                        href={`/${lang}/anime/${appearance.anime.mal_id}`}
                        className="bg-neutral-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-violet-500/50 transition-all"
                      >
                        <div className="relative aspect-[3/4]">
                          <Image
                            src={appearance.anime.images.jpg.image_url}
                            alt={appearance.anime.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                        <div className="p-2 md:p-4">
                          <h3 className="font-medium line-clamp-2 hover:text-violet-400 transition-colors text-xs md:text-sm">
                            {appearance.anime.title}
                          </h3>
                          <p className="text-xs md:text-sm text-neutral-400 mt-1">
                            {t.role}: {appearance.role}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </TabsContent>
              )}

              {character.manga.length > 0 && (
                <TabsContent value="manga" className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {character.manga.map((appearance, index) => (
                      <div
                        key={`${appearance.manga.mal_id}-${index}`}
                        className="bg-neutral-900 rounded-lg overflow-hidden"
                      >
                        <div className="relative aspect-[3/4]">
                          <Image
                            src={appearance.manga.images.jpg.image_url}
                            alt={appearance.manga.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                        <div className="p-2 md:p-4">
                          <h3 className="font-medium line-clamp-2 text-xs md:text-sm">
                            {appearance.manga.title}
                          </h3>
                          <p className="text-xs md:text-sm text-neutral-400 mt-1">
                            {t.role}: {appearance.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}

              {character.voices.length > 0 && (
                <TabsContent value="voices" className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {character.voices.map((voice, index) => (
                      <div
                        key={`${voice.person.mal_id}-${index}`}
                        className="bg-neutral-900 rounded-lg overflow-hidden"
                      >
                        <div className="relative aspect-[3/4]">
                          <Image
                            src={voice.person.images.jpg.image_url}
                            alt={voice.person.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                        <div className="p-2 md:p-4">
                          <h3 className="font-medium line-clamp-2 text-xs md:text-sm">
                            {voice.person.name}
                          </h3>
                          <p className="text-xs md:text-sm text-neutral-400 mt-1">
                            {t.language}: {voice.language}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}