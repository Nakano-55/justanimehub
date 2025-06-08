/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useLanguage } from '@/components/LanguageProvider';
import { AuthButton } from '@/components/AuthButton';
import { UserMenu } from '@/components/UserMenu';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '@/components/NotificationBell';
import { MobileMenu } from '@/components/MobileMenu';
import { motion } from 'framer-motion';
import { Heart, BookmarkCheck, ChevronDown, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database } from '@/lib/database.types';

const translations = {
  en: {
    home: 'Home',
    anime: 'Anime',
    about: 'About Us',
    bookmarks: 'Bookmarks',
    favorites: 'Favorites',
    planned: 'Plan to Watch',
    allAnime: 'All Anime',
    popular: 'Most Popular',
    topRated: 'Top Rated',
    ongoing: 'Currently Airing',
    upcoming: 'Upcoming',
    movies: 'Best Movies',
    mostFavorited: 'Most Favorited'
  },
  id: {
    home: 'Beranda',
    anime: 'Anime',
    about: 'Tentang Kami',
    bookmarks: 'Bookmark',
    favorites: 'Favorit',
    planned: 'Rencana Tonton',
    allAnime: 'Semua Anime',
    popular: 'Paling Populer',
    topRated: 'Rating Tertinggi',
    ongoing: 'Sedang Tayang',
    upcoming: 'Akan Tayang',
    movies: 'Film Terbaik',
    mostFavorited: 'Paling Difavoritkan'
  },
} as const;

export default function Navbar() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const t = translations[lang];
  const [user, setUser] = useState<any>(null);
  const [bookmarkCounts, setBookmarkCounts] = useState({ favorite: 0, planned: 0 });
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const fetchBookmarkCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('category')
        .eq('user_id', user.id);

      if (bookmarks) {
        const counts = {
          favorite: bookmarks.filter(b => b.category === 'favorite').length,
          planned: bookmarks.filter(b => b.category === 'planned').length,
        };
        setBookmarkCounts(counts);
      }
    };

    fetchBookmarkCounts();

    const channel = supabase
      .channel('bookmark-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookmarks',
      }, () => {
        fetchBookmarkCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const isAnimeRoute = pathname.startsWith(`/${lang}/anime`);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full top-0 z-50 glass-dark"
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold"
          >
            <Link href={`/${lang}`} className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 transition-all duration-300">
              JustAnimeHub
            </Link>
          </motion.div>

          <div className="flex items-center gap-4 md:gap-8">
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 text-lg">
              <Link
                href={`/${lang}`}
                className={`nav-link ${
                  pathname === `/${lang}` ? 'text-violet-400' : 'text-white'
                }`}
              >
                {t.home}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center gap-2 ${
                  isAnimeRoute ? 'text-violet-400' : 'text-white'
                } hover:text-violet-400 transition-colors`}>
                  {t.anime}
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-neutral-900 border-neutral-800">
                  <DropdownMenuItem asChild>
                    <Link href={`/${lang}/anime`} className="dropdown-menu-item">
                      {t.allAnime}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${lang}/anime/popular`} className="dropdown-menu-item">
                      {t.popular}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${lang}/anime/top-rated`} className="dropdown-menu-item">
                      {t.topRated}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${lang}/anime/ongoing`} className="dropdown-menu-item">
                      {t.ongoing}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${lang}/anime/upcoming`} className="dropdown-menu-item">
                      {t.upcoming}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${lang}/anime/movies`} className="dropdown-menu-item">
                      {t.movies}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${lang}/anime/favorites`} className="dropdown-menu-item">
                      {t.mostFavorited}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href={`/${lang}/bookmark`}
                className={`nav-link flex items-center gap-2 ${
                  pathname === `/${lang}/bookmark` ? 'text-violet-400' : 'text-white'
                }`}
              >
                <span>{t.bookmarks}</span>
                {(bookmarkCounts.favorite > 0 || bookmarkCounts.planned > 0) && (
                  <div className="flex gap-2 text-sm">
                    {bookmarkCounts.favorite > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                        <Heart className="w-3 h-3" />
                        {bookmarkCounts.favorite}
                      </span>
                    )}
                    {bookmarkCounts.planned > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                        <BookmarkCheck className="w-3 h-3" />
                        {bookmarkCounts.planned}
                      </span>
                    )}
                  </div>
                )}
              </Link>

              <Link
                href={`/${lang}/about`}
                className={`nav-link flex items-center gap-2 ${
                  pathname === `/${lang}/about` ? 'text-violet-400' : 'text-white'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>{t.about}</span>
              </Link>
            </div>
            
            {/* Common Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Language Switcher - Show on desktop, hide on mobile */}
              <div className="hidden md:flex">
                <LanguageSwitcher currentLang={lang} />
              </div>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <NotificationBell lang={lang} />
                  <UserMenu email={user.email} />
                </div>
              ) : (
                <AuthButton />
              )}
              <MobileMenu lang={lang} bookmarkCounts={bookmarkCounts} />
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}