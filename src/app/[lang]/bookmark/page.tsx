/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, BookmarkCheck, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface BookmarkData {
  id: string;
  entity_id: number;
  entity_type: 'anime' | 'character';
  category: 'favorite' | 'planned';
  created_at: string;
  user_id: string;
  title: string;
  title_english: string | null;
  image_url: string | null;
}

const translations = {
  en: {
    bookmarks: 'My Bookmarks',
    favorites: 'Favorites',
    planned: 'Plan to Watch',
    viewDetails: 'View Details',
    rating: 'Rating',
    episodes: 'Episodes',
    status: 'Status',
    year: 'Year',
    noBookmarks: 'No bookmarks found',
    loading: 'Loading bookmarks...',
    error: 'Failed to load bookmarks',
    retry: 'Retry',
    loginRequired: 'Please sign in to view your bookmarks',
    addedOn: 'Added on',
    favoritesList: 'Your Favorites',
    plannedList: 'Your Watch List',
    favoriteDescription: 'Content you love and want to remember',
    plannedDescription: 'Anime you plan to watch later',
    anime: 'Anime',
    characters: 'Characters',
  },
  id: {
    bookmarks: 'Bookmark Saya',
    favorites: 'Favorit',
    planned: 'Rencana Tonton',
    viewDetails: 'Lihat Detail',
    rating: 'Rating',
    episodes: 'Episode',
    status: 'Status',
    year: 'Tahun',
    noBookmarks: 'Tidak ada bookmark',
    loading: 'Memuat bookmark...',
    error: 'Gagal memuat bookmark',
    retry: 'Coba Lagi',
    loginRequired: 'Silakan masuk untuk melihat bookmark Anda',
    addedOn: 'Ditambahkan pada',
    favoritesList: 'Favorit Anda',
    plannedList: 'Daftar Tonton Anda',
    favoriteDescription: 'Konten yang Anda sukai dan ingin diingat',
    plannedDescription: 'Anime yang ingin Anda tonton nanti',
    anime: 'Anime',
    characters: 'Karakter',
  },
} as const;

const BookmarkCard = ({ bookmark, lang }: { bookmark: BookmarkData; lang: Language }) => {
  const t = translations[lang];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-neutral-800/50 backdrop-blur-sm rounded-xl hover:bg-neutral-700/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full overflow-hidden border border-neutral-700/50 hover:border-violet-500/50"
      layout
    >
      <div className="relative overflow-hidden">
        <Image
          src={bookmark.image_url || fallbackImage}
          width={300}
          height={400}
          className="w-full h-[250px] object-cover transform group-hover:scale-105 transition-transform duration-300"
          alt={bookmark.title_english || bookmark.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <Link
            href={`/${lang}/${bookmark.entity_type}/${bookmark.entity_id}`}
            className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-center rounded-lg text-sm font-medium transition-colors"
          >
            {t.viewDetails}
          </Link>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            bookmark.entity_type === 'anime' 
              ? 'bg-violet-500/20 text-violet-300' 
              : 'bg-pink-500/20 text-pink-300'
          }`}>
            {bookmark.entity_type === 'anime' ? t.anime : t.characters}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-neutral-800/50 to-neutral-900/50">
        <h3 className="text-lg font-medium line-clamp-2 group-hover:text-violet-400 transition-colors mb-2">
          {bookmark.title_english || bookmark.title}
        </h3>

        <div className="space-y-2 mt-auto">
          <div className="pt-2 mt-2 border-t border-neutral-700/50">
            <p className="text-xs text-neutral-400">
              {t.addedOn}: {formatDate(bookmark.created_at)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'favorite' | 'planned'>('favorite');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { lang } = useLanguage();
  const t = translations[lang];
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, [supabase]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAuthenticated(false);
          return;
        }

        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (bookmarkError) throw bookmarkError;

        setBookmarks(bookmarkData as BookmarkData[]);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBookmarks();

      const channel = supabase
        .channel('bookmark-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
          },
          () => {
            fetchBookmarks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, supabase, t.error]);

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t.loginRequired}</h2>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-violet-500 mb-4" />
            <p className="text-lg">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">{error}</h2>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
            >
              {t.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredBookmarks = bookmarks.filter(b => b.category === activeTab);
  const animeBookmarks = filteredBookmarks.filter(b => b.entity_type === 'anime');
  const characterBookmarks = filteredBookmarks.filter(b => b.entity_type === 'character');

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold border-l-4 border-violet-500 pl-3 mb-8">
          {t.bookmarks}
        </h1>

        <Tabs defaultValue="favorite" className="w-full" onValueChange={(value) => setActiveTab(value as 'favorite' | 'planned')}>
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
            <TabsTrigger
              value="favorite"
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${
                activeTab === 'favorite'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              <Heart className="w-4 h-4" />
              {t.favorites}
            </TabsTrigger>

            <TabsTrigger
              value="planned"
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${
                activeTab === 'planned'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              {t.planned}
            </TabsTrigger>
          </TabsList>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2 text-violet-400">
              {activeTab === 'favorite' ? (
                <>
                  <Heart className="w-6 h-6 text-red-500" />
                  {t.favoritesList}
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-6 h-6 text-green-400" />
                  {t.plannedList}
                </>
              )}
            </h2>
            <p className="text-neutral-400 text-sm">
              {activeTab === 'favorite' ? t.favoriteDescription : t.plannedDescription}
            </p>
          </div>

          {['favorite', 'planned'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {filteredBookmarks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  {tab === 'favorite' ? (
                    <Heart className="w-16 h-16 text-neutral-500 mb-4" />
                  ) : (
                    <BookmarkCheck className="w-16 h-16 text-neutral-500 mb-4" />
                  )}
                  <p className="text-neutral-400">{t.noBookmarks}</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-12">
                    {animeBookmarks.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                          <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                          {t.anime}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                          {animeBookmarks.map((bookmark) => (
                            <BookmarkCard
                              key={bookmark.id}
                              bookmark={bookmark}
                              lang={lang}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {characterBookmarks.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          {t.characters}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                          {characterBookmarks.map((bookmark) => (
                            <BookmarkCard
                              key={bookmark.id}
                              bookmark={bookmark}
                              lang={lang}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatePresence>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}