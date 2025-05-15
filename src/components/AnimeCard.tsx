'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Star, Heart, BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import type { Anime } from '@/types/anime';
import type { Language } from '@/lib/i18n/types';
import type { Database } from '@/lib/database.types';
import { translations } from '@/types/anime';

interface AnimeCardProps {
  anime: Anime;
  index: number;
  lang: Language;
}

interface BookmarkState {
  favorite: boolean;
  planned: boolean;
}

export function AnimeCard({ anime, index, lang }: AnimeCardProps) {
  const t = translations[lang];
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const [bookmarkState, setBookmarkState] = useState<BookmarkState>({ favorite: false, planned: false });
  const [isLoading, setIsLoading] = useState<{ favorite: boolean; planned: boolean }>({ favorite: false, planned: false });
  
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: bookmarks } = await supabase
          .from('bookmarks')
          .select('category')
          .eq('entity_id', anime.mal_id)
          .eq('entity_type', 'anime')
          .eq('user_id', user.id);

        if (bookmarks) {
          setBookmarkState({
            favorite: bookmarks.some(b => b.category === 'favorite'),
            planned: bookmarks.some(b => b.category === 'planned')
          });
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [anime.mal_id, supabase]);

  const handleBookmark = async (category: 'favorite' | 'planned', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsLoading(prev => ({ ...prev, [category]: true }));
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication required',
          description: t.loginRequired,
          variant: 'destructive',
        });
        return;
      }

      const isBookmarked = bookmarkState[category];

      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('entity_id', anime.mal_id)
          .eq('entity_type', 'anime')
          .eq('user_id', user.id)
          .eq('category', category);

        if (error) throw error;
        setBookmarkState(prev => ({ ...prev, [category]: false }));
        toast({
          description: category === 'favorite' ? t.removedFromFavorites : t.removedFromWatchPlan,
        });
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            entity_id: anime.mal_id,
            entity_type: 'anime',
            user_id: user.id,
            category,
            title: anime.title,
            title_english: anime.title_english,
            image_url: anime.images.jpg.image_url,
          });

        if (error) throw error;
        setBookmarkState(prev => ({ ...prev, [category]: true }));
        toast({
          description: category === 'favorite' ? t.addedToFavorites : t.addedToWatchPlan,
        });
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast({
        title: 'Error',
        description: t.error,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [category]: false }));
    }
  };
  
  const formatRating = (rating: string = 'Unknown') => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative bg-neutral-800/50 backdrop-blur-sm rounded-xl hover:bg-neutral-700/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <Image
          src={anime.images.jpg.image_url}
          width={300}
          height={400}
          className="w-full h-[250px] object-cover transform group-hover:scale-105 transition-transform duration-300"
          alt={anime.title_english || anime.title}
          loading={index < 5 ? "eager" : "lazy"}
        />
        <div className="absolute top-2 right-2 flex gap-2 z-20">
          <button
            onClick={(e) => handleBookmark('favorite', e)}
            disabled={isLoading.favorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              bookmarkState.favorite 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-black/20 text-white hover:bg-red-500/20 hover:text-red-400'
            }`}
            title={bookmarkState.favorite ? t.removeFromFavorites : t.addToFavorites}
          >
            {isLoading.favorite ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Heart className={`w-5 h-5 ${bookmarkState.favorite ? 'fill-current' : ''}`} />
            )}
          </button>
          <button
            onClick={(e) => handleBookmark('planned', e)}
            disabled={isLoading.planned}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              bookmarkState.planned 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-black/20 text-white hover:bg-green-500/20 hover:text-green-400'
            }`}
            title={bookmarkState.planned ? t.removeFromWatchPlan : t.addToWatchPlan}
          >
            {isLoading.planned ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : bookmarkState.planned ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <BookmarkPlus className="w-5 h-5" />
            )}
          </button>
        </div>
        <Link
          href={`/${lang}/anime/${anime.mal_id}`}
          className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 z-10"
        >
          <span className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-center rounded-lg text-sm font-medium">
            {t.viewDetails}
          </span>
        </Link>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-medium line-clamp-2 group-hover:text-violet-400 transition-colors mb-2">
          {anime.title_english || anime.title}
        </h3>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center text-neutral-400">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span>{anime.score?.toFixed(1) || 'N/A'}</span>
          </div>

          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 2).map(genre => (
                <span
                  key={genre.mal_id}
                  className="text-xs px-2 py-1 bg-violet-600/30 rounded-full text-violet-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
            <div>
              <span className="block text-neutral-500">{t.rating}</span>
              {formatRating(anime.rating)}
            </div>
            {anime.episodes && (
              <div>
                <span className="block text-neutral-500">{t.episodes}</span>
                {anime.episodes}
              </div>
            )}
            {anime.status && (
              <div>
                <span className="block text-neutral-500">{t.status}</span>
                {anime.status}
              </div>
            )}
            {anime.year && (
              <div>
                <span className="block text-neutral-500">{t.year}</span>
                {anime.year}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}