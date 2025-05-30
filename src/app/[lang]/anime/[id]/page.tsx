/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from 'react';
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
import { AnimeRelations } from '@/components/AnimeRelations';
import { DiscussionList } from '@/components/DiscussionList';
import { ReviewList } from '@/components/ReviewList';
import {
  Star, Clock, Calendar, Play, Users, Trophy, Heart, Info,
  Globe, Video, Tv, CalendarDays, CircleUserRound, Building2,
  ChevronLeft, ChevronRight, ArrowLeft, User, GitBranch,
  MessageSquare, FileText, PlaySquare, BookOpen
} from 'lucide-react';
import { Language } from '@/lib/i18n/types';
import { Card, CardContent } from '@/components/ui/card';

interface PageTranslations {
  back: string;
  loading: string;
  error: string;
  retry: string;
  ratings: string;
  rank: string;
  popularity: string;
  members: string;
  favorites: string;
  information: string;
  type: string;
  episodes: string;
  duration: string;
  status: string;
  season: string;
  broadcast: string;
  studios: string;
  rating: string;
  genres: string;
  themes: string;
  demographics: string;
  synopsis: string;
  background: string;
  characters: string;
  trailer: string;
  voiceActors: string;
  unknown: string;
  previous: string;
  next: string;
  page: string;
  of: string;
  reviews: string;
  discussions: string;
}

const pageTranslations: Record<Language, PageTranslations> = {
  en: {
    back: 'Back to List',
    loading: 'Loading anime details...',
    error: 'Error',
    retry: 'Retry',
    ratings: 'ratings',
    rank: 'Rank',
    popularity: 'Popularity',
    members: 'Members',
    favorites: 'Favorites',
    information: 'Information',
    type: 'Type',
    episodes: 'Episodes',
    duration: 'Duration',
    status: 'Status',
    season: 'Season',
    broadcast: 'Broadcast',
    studios: 'Studios',
    rating: 'Rating',
    genres: 'Genres',
    themes: 'Themes',
    demographics: 'Demographics',
    synopsis: 'Synopsis',
    background: 'Background',
    characters: 'Characters',
    trailer: 'Trailer',
    voiceActors: 'Voice Actors',
    unknown: 'Unknown',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    reviews: 'Reviews',
    discussions: 'Discussions'
  },
  id: {
    back: 'Kembali ke Daftar',
    loading: 'Memuat detail anime...',
    error: 'Error',
    retry: 'Coba Lagi',
    ratings: 'penilaian',
    rank: 'Peringkat',
    popularity: 'Popularitas',
    members: 'Anggota',
    favorites: 'Favorit',
    information: 'Informasi',
    type: 'Tipe',
    episodes: 'Episode',
    duration: 'Durasi',
    status: 'Status',
    season: 'Musim',
    broadcast: 'Siaran',
    studios: 'Studio',
    rating: 'Rating',
    genres: 'Genre',
    themes: 'Tema',
    demographics: 'Demografi',
    synopsis: 'Sinopsis',
    background: 'Latar Belakang',
    characters: 'Karakter',
    trailer: 'Trailer',
    voiceActors: 'Pengisi Suara',
    unknown: 'Tidak diketahui',
    previous: 'Sebelumnya',
    next: 'Selanjutnya',
    page: 'Halaman',
    of: 'dari',
    reviews: 'Ulasan',
    discussions: 'Diskusi'
  }
};

interface AnimeDetails {
  mal_id: number;
  title: string;
  title_japanese: string;
  title_english?: string;
  images: { jpg: { image_url: string; large_image_url: string } };
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  status: string;
  episodes: number;
  duration: string;
  rating: string;
  synopsis: string;
  background?: string;
  year: number;
  season: string;
  broadcast?: { string: string };
  studios: Array<{ name: string }>;
  genres: Array<{ name: string }>;
  themes: Array<{ name: string }>;
  demographics: Array<{ name: string }>;
  trailer?: { youtube_id: string };
  type: string;
}

interface Character {
  character: {
    mal_id: number;
    name: string;
    images: { jpg: { image_url: string } };
  };
  role: string;
  voice_actors: Array<{
    person: { name: string };
    language: string;
  }>;
}

interface Picture {
  jpg: {
    large_image_url: string;
  };
}

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const { getTranslation } = useTranslation();
  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<{
    synopsis: string | null;
    background: string | null;
  }>({
    synopsis: null,
    background: null
  });

  const t = pageTranslations[lang];
  const charactersPerPage = 25;
  const totalPages = Math.ceil(characters.length / charactersPerPage);
  const currentCharacters = characters.slice(
    (currentPage - 1) * charactersPerPage,
    currentPage * charactersPerPage
  );

  useEffect(() => {
    async function fetchAnimeDetails() {
      try {
        setIsLoading(true);
        setError(null);

        const [animeData, charactersData, picturesData] = await Promise.all([
          fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/full`),
          fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/characters`),
          fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/pictures`)
        ]);

        setAnime(animeData.data);
        setCharacters(charactersData.data);
        setPictures(picturesData.data);

        if (lang !== 'en' && animeData.data) {
          const [synopsisTrans, backgroundTrans] = await Promise.all([
            getTranslation(parseInt(id), 'anime', 'anime_synopsis', lang),
            getTranslation(parseInt(id), 'anime', 'anime_background', lang)
          ]);

          setTranslations({
            synopsis: synopsisTrans?.content || null,
            background: backgroundTrans?.content || null
          });
        }
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError('Failed to load anime details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchAnimeDetails();
    }
  }, [id, lang, getTranslation]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatRating = (rating: string = 'Unknown'): string => {
    const ratingMap: { [key: string]: string } = {
      'G': 'All Ages',
      'PG': 'Children',
      'PG-13': 'Teens 13+',
      'R': 'Violence & Profanity',
      'R+': 'Mild Nudity',
      'Rx': 'Hentai',
    };
    return ratingMap[rating] || rating;
  };

  const getBackgroundImage = (): string => {
    if (pictures && pictures.length > 0) {
      const coverUrl = anime?.images.jpg.large_image_url;
      const differentPicture = pictures.find(pic => pic.jpg.large_image_url !== coverUrl);
      return differentPicture?.jpg.large_image_url || coverUrl || '';
    }
    return anime?.images.jpg.large_image_url || '';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-16">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{t.error}</h2>
          <p className="text-lg mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
            >
              {t.retry}
            </button>
            <Link
              href={`/${lang}/anime`}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg inline-block"
            >
              {t.back}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !anime) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-16">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="sticky top-20 left-0 w-full z-[100] px-4 md:px-8 mb-4">
        <Link
          href={`/${lang}/anime`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/80 backdrop-blur-sm rounded-lg text-white hover:bg-neutral-800/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>
      </div>

      <div className="relative w-full h-[400px] -mt-16">
        <Image
          src={getBackgroundImage()}
          fill
          className="object-cover blur-sm"
          alt="background"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-[320px_1fr] gap-8">
          <div className="space-y-6">
            <div className="relative -mt-32 z-10">
              <Image
                src={anime.images.jpg.large_image_url}
                width={320}
                height={450}
                className="rounded-lg shadow-2xl"
                alt={anime.title}
                priority
              />
            </div>

            <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center text-3xl font-bold text-yellow-500 mb-1">
                  <Star className="w-8 h-8 mr-2" />
                  {anime.score || 'N/A'}
                </div>
                <p className="text-sm text-neutral-400">
                  {anime.scored_by ? `${formatNumber(anime.scored_by)} ${t.ratings}` : 'No ratings yet'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-neutral-400">{t.rank}</p>
                  <p className="font-semibold flex items-center">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                    #{anime.rank || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-400">{t.popularity}</p>
                  <p className="font-semibold flex items-center">
                    <Users className="w-4 h-4 mr-1 text-blue-500" />
                    #{anime.popularity || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-400">{t.members}</p>
                  <p className="font-semibold flex items-center">
                    <CircleUserRound className="w-4 h-4 mr-1 text-green-500" />
                    {anime.members ? formatNumber(anime.members) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-400">{t.favorites}</p>
                  <p className="font-semibold flex items-center">
                    <Heart className="w-4 h-4 mr-1 text-red-500" />
                    {anime.favorites ? formatNumber(anime.favorites) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">{t.information}</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <Tv className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.type}</p>
                    <p className="font-medium">{anime.type || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Play className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.episodes}</p>
                    <p className="font-medium">{anime.episodes || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.duration}</p>
                    <p className="font-medium">{anime.duration || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.status}</p>
                    <p className="font-medium">{anime.status || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.season}</p>
                    <p className="font-medium">
                      {anime.season ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : t.unknown}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CalendarDays className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.broadcast}</p>
                    <p className="font-medium">{anime.broadcast?.string || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Building2 className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.studios}</p>
                    <div className="font-medium">
                      {anime.studios.length > 0
                        ? anime.studios.map(studio => studio.name).join(', ')
                        : t.unknown
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Globe className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.rating}</p>
                    <p className="font-medium">{formatRating(anime.rating)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {anime.title}
              </h1>
              <div className="flex gap-2 mb-4">
                <BookmarkButtons 
                  entityId={anime.mal_id}
                  entityType="anime"
                  title={anime.title}
                  titleEnglish={anime.title_english}
                  imageUrl={anime.images.jpg.large_image_url}
                  lang={lang}
                />
              </div>
              {anime.title_english && anime.title_english !== anime.title && (
                <h2 className="text-2xl text-neutral-400">{anime.title_english}</h2>
              )}
              <h3 className="text-xl text-neutral-500 mt-1">{anime.title_japanese}</h3>
            </div>

            <div className="space-y-3">
              {anime.genres.length > 0 && (
                <div>
                  <h4 className="text-sm text-neutral-400 mb-2">{t.genres}</h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map(genre => (
                      <Badge key={genre.name} variant="secondary" className="bg-violet-600/30 text-violet-300">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {anime.themes && anime.themes.length > 0 && (
                <div>
                  <h4 className="text-sm text-neutral-400 mb-2">{t.themes}</h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.themes.map(theme => (
                      <Badge key={theme.name} variant="secondary" className="bg-blue-600/30 text-blue-300">
                        {theme.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {anime.demographics && anime.demographics.length > 0 && (
                <div>
                  <h4 className="text-sm text-neutral-400 mb-2">{t.demographics}</h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.demographics.map(demo => (
                      <Badge key={demo.name} variant="secondary" className="bg-green-600/30 text-green-300">
                        {demo.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Tabs defaultValue="synopsis" className="w-full">
              <TabsList className="bg-neutral-900">
                <TabsTrigger value="synopsis" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t.synopsis}
                </TabsTrigger>
                {anime.background && (
                  <TabsTrigger value="background" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t.background}
                  </TabsTrigger>
                )}
                {characters.length > 0 && (
                  <TabsTrigger value="characters" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t.characters}
                  </TabsTrigger>
                )}
                <TabsTrigger value="relations" className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Relations
                </TabsTrigger>
                {anime.trailer?.youtube_id && (
                  <TabsTrigger value="trailer" className="flex items-center gap-2">
                    <PlaySquare className="w-4 h-4" />
                    {t.trailer}
                  </TabsTrigger>
                )}
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {t.reviews}
                </TabsTrigger>
                <TabsTrigger value="discussions" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t.discussions}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="synopsis" className="mt-4">
                <div className="bg-neutral-900 rounded-lg p-6">
                  <p className="text-neutral-200 leading-relaxed whitespace-pre-line">
                    {translations.synopsis || anime.synopsis}
                  </p>
                  <TranslationContributor
                    entityId={anime.mal_id}
                    entityType="anime"
                    contentType="anime_synopsis"
                    originalText={anime.synopsis}
                    currentLanguage={lang}
                  />
                </div>
              </TabsContent>

              {anime.background && (
                <TabsContent value="background" className="mt-4">
                  <div className="bg-neutral-900 rounded-lg p-6">
                    <p className="text-neutral-200 leading-relaxed whitespace-pre-line">
                      {translations.background || anime.background}
                    </p>
                    <TranslationContributor
                      entityId={anime.mal_id}
                      entityType="anime"
                      contentType="anime_background"
                      originalText={anime.background}
                      currentLanguage={lang}
                    />
                  </div>
                </TabsContent>
              )}

              {characters.length > 0 && (
                <TabsContent value="characters" className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {currentCharacters.map((char) => (
                      <Link
                        key={char.character.mal_id}
                        href={`/${lang}/character/${char.character.mal_id}`}
                        className="group"
                      >
                        <Card className="bg-neutral-900 border-neutral-800 overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
                          <CardContent className="p-0">
                            <div className="relative aspect-[3/4]">
                              <Image
                                src={char.character.images.jpg.image_url}
                                alt={char.character.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-sm mb-1 group-hover:text-violet-400 transition-colors">
                                {char.character.name}
                              </h4>
                              <p className="text-sm text-neutral-400">{char.role}</p>
                              {char.voice_actors?.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-neutral-800">
                                  <p className="text-xs text-neutral-500 mb-1">{t.voiceActors}</p>
                                  {char.voice_actors.slice(0, 2).map((va, index) => (
                                    <div key={index} className="flex items-center text-xs text-neutral-400">
                                      <span>{va.person.name}</span>
                                      <span className="mx-1">•</span>
                                      <span>{va.language}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <Button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {t.previous}
                      </Button>
                      <span className="text-sm">
                        {t.page} {currentPage} {t.of} {totalPages}
                      </span>
                      <Button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1"
                      >
                        {t.next}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TabsContent>
              )}

              <TabsContent value="relations" className="mt-4">
                <div className="bg-neutral-900 rounded-lg p-6">
                  <AnimeRelations animeId={parseInt(id)} lang={lang} />
                </div>
              </TabsContent>

              {anime.trailer?.youtube_id && (
                <TabsContent value="trailer" className="mt-4">
                  <div className="bg-neutral-900 rounded-lg p-6">
                    <div className="relative pb-[56.25%]">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
                        title="Trailer"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="reviews" className="mt-4">
                <div className="bg-neutral-900 rounded-lg p-6">
                  <ReviewList animeId={parseInt(id)} lang={lang} />
                </div>
              </TabsContent>

              <TabsContent value="discussions" className="mt-4">
                <div className="bg-neutral-900 rounded-lg p-6">
                  <DiscussionList animeId={parseInt(id)} lang={lang} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}