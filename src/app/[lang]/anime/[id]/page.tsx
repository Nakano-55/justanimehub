/* eslint-disable @typescript-eslint/no-explicit-any */
 
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
  producers: string;
  source: string;
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
  relations: string;
  staff: string;
  openingThemes: string;
  endingThemes: string;
  position: string;
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
    producers: 'Producers',
    source: 'Source',
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
    discussions: 'Discussions',
    relations: 'Relations',
    staff: 'Staff',
    openingThemes: 'Opening Themes',
    endingThemes: 'Ending Themes',
    position: 'Position'
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
    producers: 'Produser',
    source: 'Sumber',
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
    discussions: 'Diskusi',
    relations: 'Relasi',
    staff: 'Staf',
    openingThemes: 'Tema Pembuka',
    endingThemes: 'Tema Penutup',
    position: 'Posisi'
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
  producers: Array<{ name: string }>;
  source: string;
  genres: Array<{ name: string }>;
  themes: Array<{ name: string }>;
  demographics: Array<{ name: string }>;
  trailer?: { youtube_id: string };
  type: string;
  theme?: {
    openings: string[];
    endings: string[];
  };
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

interface StaffMember {
  person: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  positions: string[];
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
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<{
    synopsis: { content: string; contributor?: string; date?: string } | null;
    background: { content: string; contributor?: string; date?: string } | null;
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
          fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/pictures`),
          fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/staff`)
        ]);

        const staffData = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/staff`);

        setAnime(animeData.data);
        setCharacters(charactersData.data);
        setStaff(staffData.data);
        setPictures(picturesData.data);

        // Always check for user translations, regardless of language
        if (animeData.data) {
          const [synopsisTrans, backgroundTrans] = await Promise.all([
            getTranslation(parseInt(id), 'anime', 'anime_synopsis', lang),
            getTranslation(parseInt(id), 'anime', 'anime_background', lang)
          ]);

          const formatContributor = (translation: any) => {
            if (!translation) return null;
            
            const contributorName = translation.profiles?.username || 
                                  translation.profiles?.full_name || 
                                  translation.profiles?.email || 
                                  'Anonymous';
            
            const contributionDate = new Date(translation.created_at).toLocaleDateString(
              lang === 'id' ? 'id-ID' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' }
            );

            return {
              content: translation.content,
              contributor: contributorName,
              date: contributionDate
            };
          };
          setTranslations({
            synopsis: formatContributor(synopsisTrans),
            background: formatContributor(backgroundTrans)
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
      <div className="sticky top-20 left-0 w-full z-[100] px-4 md:px-8 mb-4 overflow-hidden">
        <Link
          href={`/${lang}/anime`}
          className="inline-flex items-center gap-2 px-3 py-2 md:px-4 bg-neutral-900/80 backdrop-blur-sm rounded-lg text-white hover:bg-neutral-800/80 transition-colors text-sm md:text-base"
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

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-4 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="relative -mt-32 z-10 md:-mt-32">
              <Image
                src={anime.images.jpg.large_image_url}
                width={280}
                height={380}
                className="w-full rounded-lg shadow-lg"
                alt={anime.title}
                priority
              />
            </div>

            <div className="bg-neutral-900 rounded-lg p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center text-xl md:text-2xl font-bold text-yellow-500 mb-1">
                  <Star className="w-5 h-5 md:w-6 mr-2" />
                  {anime.score || 'N/A'}
                </div>
                <p className="text-xs md:text-sm text-neutral-400">
                  {anime.scored_by ? `${formatNumber(anime.scored_by)} ${t.ratings}` : 'No ratings yet'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
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

            <div className="bg-neutral-900 rounded-lg p-4 md:p-6 space-y-3 md:space-y-4">
              <h3 className="font-semibold text-base md:text-lg">{t.information}</h3>

              <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <div className="flex items-start">
                  <Tv className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-neutral-400">{t.type}</p>
                    <p className="font-medium">{anime.type || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Play className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-neutral-400">{t.episodes}</p>
                    <p className="font-medium">{anime.episodes || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-neutral-400">{t.duration}</p>
                    <p className="font-medium">{anime.duration || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-neutral-400">{t.status}</p>
                    <p className="font-medium">{anime.status || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-neutral-400">{t.season}</p>
                    <p className="font-medium">
                      {anime.season ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : t.unknown}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CalendarDays className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-neutral-400">{t.broadcast}</p>
                    <p className="font-medium">{anime.broadcast?.string || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Building2 className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
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
                  <Building2 className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-neutral-400">{t.producers}</p>
                    <div className="font-medium">
                      {anime.producers && anime.producers.length > 0
                        ? anime.producers.map(producer => producer.name).join(', ')
                        : t.unknown
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-neutral-400">{t.source}</p>
                    <p className="font-medium">{anime.source || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Globe className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-neutral-400">{t.rating}</p>
                    <p className="font-medium">{formatRating(anime.rating)}</p>
                  </div>
                </div>

                {anime.theme && (anime.theme.openings.length > 0 || anime.theme.endings.length > 0) && (
                  <>
                    {anime.theme.openings.length > 0 && (
                      <div className="flex items-start">
                        <Video className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                        <div>
                          <p className="text-neutral-400">{t.openingThemes}</p>
                          <div className="font-medium space-y-1">
                            {anime.theme.openings.slice(0, 3).map((opening, index) => (
                              <p key={index} className="text-sm">{opening}</p>
                            ))}
                            {anime.theme.openings.length > 3 && (
                              <p className="text-xs text-neutral-500">
                                +{anime.theme.openings.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {anime.theme.endings.length > 0 && (
                      <div className="flex items-start">
                        <Video className="w-4 h-4 mr-2 mt-1 text-neutral-400 flex-shrink-0" />
                        <div>
                          <p className="text-neutral-400">{t.endingThemes}</p>
                          <div className="font-medium space-y-1">
                            {anime.theme.endings.slice(0, 3).map((ending, index) => (
                              <p key={index} className="text-sm">{ending}</p>
                            ))}
                            {anime.theme.endings.length > 3 && (
                              <p className="text-xs text-neutral-500">
                                +{anime.theme.endings.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-8 min-w-0">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {anime.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
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
                <h2 className="text-lg md:text-2xl text-neutral-400">{anime.title_english}</h2>
              )}
              <h3 className="text-base md:text-xl text-neutral-500 mt-1">{anime.title_japanese}</h3>
            </div>

            <div className="space-y-3 min-w-0">
              {anime.genres.length > 0 && (
                <div>
                  <h4 className="text-xs md:text-sm text-neutral-400 mb-2">{t.genres}</h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map(genre => (
                      <Badge key={genre.name} variant="secondary" className="bg-violet-600/30 text-violet-300 text-xs">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {anime.themes && anime.themes.length > 0 && (
                <div>
                  <h4 className="text-xs md:text-sm text-neutral-400 mb-2">{t.themes}</h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.themes.map(theme => (
                      <Badge key={theme.name} variant="secondary" className="bg-blue-600/30 text-blue-300 text-xs">
                        {theme.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {anime.demographics && anime.demographics.length > 0 && (
                <div>
                  <h4 className="text-xs md:text-sm text-neutral-400 mb-2">{t.demographics}</h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.demographics.map(demo => (
                      <Badge key={demo.name} variant="secondary" className="bg-green-600/30 text-green-300 text-xs">
                        {demo.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Tabs defaultValue="synopsis" className="w-full min-w-0">
              <div className="w-full px-2 md:px-0 overflow-x-auto">
                <TabsList className="bg-neutral-900 p-1 min-w-max flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
                  <TabsTrigger 
                    value="synopsis"
                    className="flex-shrink-0 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap px-3 py-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden md:inline">{t.synopsis}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="background"
                    className="flex-shrink-0 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap px-3 py-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden md:inline">{t.background}</span>
                  </TabsTrigger>
                {characters.length > 0 && (
                    <TabsTrigger 
                      value="characters"
                      className="flex-shrink-0 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap px-3 py-2"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden md:inline">{t.characters}</span>
                    </TabsTrigger>
                )}
                {staff.length > 0 && (
                  <TabsTrigger 
                    value="staff"
                    className="flex-shrink-0 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap px-3 py-2"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden md:inline">{t.staff}</span>
                  </TabsTrigger>
                )}
                  <TabsTrigger 
                    value="relations"
                    className="flex-shrink-0 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap px-3 py-2"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span className="hidden md:inline">{t.relations}</span>
                  </TabsTrigger>
                {anime.trailer?.youtube_id && (
                    <TabsTrigger 
                      value="trailer"
                      className="flex-shrink-0 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap px-3 py-2"
                    >
                      <PlaySquare className="w-4 h-4" />
                      <span className="hidden md:inline">{t.trailer}</span>
                    </TabsTrigger>
                )}
                  <TabsTrigger 
                    value="reviews"
                    className="flex-shrink-0 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap px-3 py-2"
                  >
                    <Star className="w-4 h-4" />
                    <span className="hidden md:inline">{t.reviews}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="discussions"
                    className="flex-shrink-0 flex items-center justify-center gap-1 md:gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-colors text-xs md:text-sm whitespace-nowrap px-3 py-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden md:inline">{t.discussions}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="synopsis" className="mt-4">
                <div className="bg-neutral-900 rounded-lg p-4 md:p-6 mx-2 md:mx-0">
                  <p className="text-neutral-200 leading-relaxed whitespace-pre-line text-sm md:text-base text-justify">
                    {translations.synopsis?.content || anime.synopsis}
                  </p>
                  {translations.synopsis && (
                    <div className="mt-4 pt-4 border-t border-neutral-800">
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <span>
                          {lang === 'en' ? 'Contributor' : 'Kontributor'}: 
                        </span>
                        <span className="text-violet-400 font-medium">
                          {translations.synopsis.contributor}
                        </span>
                        <span>•</span>
                        <span>{translations.synopsis.date}</span>
                      </div>
                    </div>
                  )}
                  <TranslationContributor
                    entityId={anime.mal_id}
                    entityType="anime"
                    contentType="anime_synopsis"
                    originalText={anime.synopsis}
                    currentLanguage={lang}
                  />
                </div>
              </TabsContent>

              <TabsContent value="background" className="mt-4">
                <div className="bg-neutral-900 rounded-lg p-4 md:p-6 mx-2 md:mx-0">
                  {translations.background?.content || anime.background ? (
                    <>
                      <p className="text-neutral-200 leading-relaxed whitespace-pre-line text-sm md:text-base text-justify">
                        {translations.background?.content || anime.background}
                      </p>
                      {translations.background && (
                        <div className="mt-4 pt-4 border-t border-neutral-800">
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <span>
                              {lang === 'en' ? 'Contributor' : 'Kontributor'}: 
                            </span>
                            <span className="text-violet-400 font-medium">
                              {translations.background.contributor}
                            </span>
                            <span>•</span>
                            <span>{translations.background.date}</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-neutral-400 text-center py-8">
                      {lang === 'en' ? 'No background information available.' : 'Tidak ada informasi latar belakang.'}
                    </p>
                  )}
                  <TranslationContributor
                    entityId={anime.mal_id}
                    entityType="anime"
                    contentType="anime_background"
                    originalText={anime.background || ''}
                    currentLanguage={lang}
                  />
                </div>
              </TabsContent>

              {characters.length > 0 && (
                <TabsContent value="characters" className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 px-2 md:px-0">
                    {currentCharacters.map((char) => (
                      <Link
                        key={char.character.mal_id}
                        href={`/${lang}/character/${char.character.mal_id}`}
                        className="group"
                      >
                        <Card className="bg-neutral-900 border-neutral-800 overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
                          <CardContent className="p-0">
                            <div className="relative aspect-[3/4] overflow-hidden">
                              <Image
                                src={char.character.images.jpg.image_url}
                                alt={char.character.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-2 md:p-4">
                              <h4 className="font-semibold text-xs md:text-sm mb-1 group-hover:text-violet-400 transition-colors line-clamp-2">
                                {char.character.name}
                              </h4>
                              <p className="text-xs md:text-sm text-neutral-400 line-clamp-1">{char.role}</p>
                              {char.voice_actors?.length > 0 && (
                                <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-neutral-800">
                                  <p className="text-xs text-neutral-500 mb-1 hidden md:block">{t.voiceActors}</p>
                                  {char.voice_actors.slice(0, 2).map((va, index) => (
                                    <div key={index} className="flex items-center text-xs text-neutral-400 line-clamp-1">
                                      <span className="truncate">{va.person.name}</span>
                                      <span className="mx-1">•</span>
                                      <span className="truncate">{va.language}</span>
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
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 text-xs md:text-sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.previous}</span>
                      </Button>
                      <span className="text-xs md:text-sm whitespace-nowrap">
                        {t.page} {currentPage} {t.of} {totalPages}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 text-xs md:text-sm"
                      >
                        <span className="hidden sm:inline">{t.next}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TabsContent>
              )}

              {staff.length > 0 && (
                <TabsContent value="staff" className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 px-2 md:px-0">
                    {staff.map((staffMember) => (
                      <Card key={staffMember.person.mal_id} className="bg-neutral-900 border-neutral-800 overflow-hidden">
                        <CardContent className="p-0">
                          <div className="relative aspect-[3/4] overflow-hidden">
                            <Image
                              src={staffMember.person.images.jpg.image_url}
                              alt={staffMember.person.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            />
                          </div>
                          <div className="p-2 md:p-4">
                            <h4 className="font-semibold text-xs md:text-sm mb-1 line-clamp-2">
                              {staffMember.person.name}
                            </h4>
                            <div className="space-y-1">
                              {staffMember.positions.slice(0, 2).map((position, index) => (
                                <p key={index} className="text-xs md:text-sm text-neutral-400 line-clamp-1">
                                  {position}
                                </p>
                              ))}
                              {staffMember.positions.length > 2 && (
                                <p className="text-xs text-neutral-500">
                                  +{staffMember.positions.length - 2} more
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="relations" className="mt-4">
                <div className="bg-neutral-900 rounded-lg p-4 md:p-6 mx-2 md:mx-0">
                  <AnimeRelations animeId={parseInt(id)} lang={lang} />
                </div>
              </TabsContent>

              {anime.trailer?.youtube_id && (
                <TabsContent value="trailer" className="mt-4">
                  <div className="bg-neutral-900 rounded-lg p-4 md:p-6 mx-2 md:mx-0">
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
                <div className="bg-neutral-900 rounded-lg p-4 md:p-6 mx-2 md:mx-0">
                  <ReviewList animeId={parseInt(id)} lang={lang} />
                </div>
              </TabsContent>

              <TabsContent value="discussions" className="mt-4">
                <div className="bg-neutral-900 rounded-lg p-4 md:p-6 mx-2 md:mx-0">
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