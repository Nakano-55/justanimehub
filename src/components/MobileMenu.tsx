'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Film, Bookmark, Info, ChevronRight, Heart, BookmarkCheck, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from './LanguageProvider';
import type { Language } from '@/lib/i18n/types';

interface MobileMenuProps {
  lang: Language;
  bookmarkCounts: {
    favorite: number;
    planned: number;
  };
}

const translations = {
  en: {
    menu: 'Menu',
    home: 'Home',
    anime: 'Anime',
    about: 'About Us',
    bookmarks: 'Bookmarks',
    allAnime: 'All Anime',
    popular: 'Most Popular',
    topRated: 'Top Rated',
    ongoing: 'Currently Airing',
    upcoming: 'Upcoming',
    movies: 'Best Movies',
    mostFavorited: 'Most Favorited',
    favorites: 'Favorites',
    planned: 'Plan to Watch',
    language: 'Language',
    english: 'English',
    indonesian: 'Indonesian'
  },
  id: {
    menu: 'Menu',
    home: 'Beranda',
    anime: 'Anime',
    about: 'Tentang Kami',
    bookmarks: 'Bookmark',
    allAnime: 'Semua Anime',
    popular: 'Paling Populer',
    topRated: 'Rating Tertinggi',
    ongoing: 'Sedang Tayang',
    upcoming: 'Akan Tayang',
    movies: 'Film Terbaik',
    mostFavorited: 'Paling Difavoritkan',
    favorites: 'Favorit',
    planned: 'Rencana Tonton',
    language: 'Bahasa',
    english: 'Inggris',
    indonesian: 'Indonesia'
  }
} as const;

export function MobileMenu({ lang, bookmarkCounts }: MobileMenuProps) {
  const pathname = usePathname();
  const { switchLanguage } = useLanguage();
  const t = translations[lang];

  const animeLinks = [
    { href: `/anime`, label: t.allAnime },
    { href: `/anime/popular`, label: t.popular },
    { href: `/anime/top-rated`, label: t.topRated },
    { href: `/anime/ongoing`, label: t.ongoing },
    { href: `/anime/upcoming`, label: t.upcoming },
    { href: `/anime/movies`, label: t.movies },
    { href: `/anime/favorites`, label: t.mostFavorited },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] sm:w-80 bg-neutral-900 border-neutral-800 p-0">
        <SheetHeader className="p-6 border-b border-neutral-800">
          <SheetTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500">
            {t.menu}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col py-2 overflow-y-auto max-h-[calc(100vh-5rem)]">
          <Link
            href={`/${lang}`}
            className={`flex items-center gap-3 px-6 py-4 hover:bg-neutral-800 transition-colors ${
              pathname === `/${lang}` ? 'text-violet-400 bg-violet-500/10' : 'text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            {t.home}
          </Link>

          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-2 text-neutral-400">
              <Film className="w-5 h-5" />
              {t.anime}
            </div>
            <div className="ml-8 space-y-2">
              {animeLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/${lang}${link.href}`}
                  className={`flex items-center gap-2 py-2 hover:text-violet-400 transition-colors ${
                    pathname === `/${lang}${link.href}` ? 'text-violet-400' : 'text-neutral-300'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href={`/${lang}/bookmark`}
            className={`flex items-center gap-3 px-6 py-4 hover:bg-neutral-800 transition-colors ${
              pathname === `/${lang}/bookmark` ? 'text-violet-400 bg-violet-500/10' : 'text-white'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="flex-1">{t.bookmarks}</span>
            {(bookmarkCounts.favorite > 0 || bookmarkCounts.planned > 0) && (
              <div className="flex gap-2">
                {bookmarkCounts.favorite > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 text-sm bg-red-500/20 text-red-400 rounded-full">
                    <Heart className="w-3 h-3" />
                    {bookmarkCounts.favorite}
                  </span>
                )}
                {bookmarkCounts.planned > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 text-sm bg-green-500/20 text-green-400 rounded-full">
                    <BookmarkCheck className="w-3 h-3" />
                    {bookmarkCounts.planned}
                  </span>
                )}
              </div>
            )}
          </Link>

          <Link
            href={`/${lang}/about`}
            className={`flex items-center gap-3 px-6 py-4 hover:bg-neutral-800 transition-colors ${
              pathname === `/${lang}/about` ? 'text-violet-400 bg-violet-500/10' : 'text-white'
            }`}
          >
            <Info className="w-5 h-5" />
            {t.about}
          </Link>

          <div className="px-6 py-4 border-t border-neutral-800">
            <div className="flex items-center gap-3 mb-2 text-neutral-400">
              <Globe className="w-5 h-5" />
              {t.language}
            </div>
            <div className="ml-8 space-y-2">
              <button
                onClick={() => switchLanguage('en')}
                className={`flex items-center gap-2 py-2 w-full text-left hover:text-violet-400 transition-colors ${
                  lang === 'en' ? 'text-violet-400' : 'text-neutral-300'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                🇺🇸 {t.english}
              </button>
              <button
                onClick={() => switchLanguage('id')}
                className={`flex items-center gap-2 py-2 w-full text-left hover:text-violet-400 transition-colors ${
                  lang === 'id' ? 'text-violet-400' : 'text-neutral-300'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                🇮🇩 {t.indonesian}
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}