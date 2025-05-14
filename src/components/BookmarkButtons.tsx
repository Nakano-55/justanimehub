 
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Loader2, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface BookmarkButtonsProps {
  entityId: number;
  entityType: 'anime' | 'character';
  title: string;
  titleEnglish?: string | null;
  imageUrl: string;
  lang: Language;
}

const translations = {
  en: {
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    addToWatchPlan: 'Plan to Watch',
    removeFromWatchPlan: 'Remove from Plan',
    authRequired: 'Please sign in to bookmark',
    error: 'Failed to update bookmark',
    addedToFavorites: 'Added to Favorites',
    removedFromFavorites: 'Removed from Favorites',
    addedToWatchPlan: 'Added to Watch Plan',
    removedFromWatchPlan: 'Removed from Watch Plan',
  },
  id: {
    addToFavorites: 'Tambah ke Favorit',
    removeFromFavorites: 'Hapus dari Favorit',
    addToWatchPlan: 'Rencana Tonton',
    removeFromWatchPlan: 'Hapus dari Rencana',
    authRequired: 'Silakan masuk untuk menandai',
    error: 'Gagal memperbarui bookmark',
    addedToFavorites: 'Ditambahkan ke Favorit',
    removedFromFavorites: 'Dihapus dari Favorit',
    addedToWatchPlan: 'Ditambahkan ke Rencana Tonton',
    removedFromWatchPlan: 'Dihapus dari Rencana Tonton',
  },
} as const;

export function BookmarkButtons({ 
  entityId, 
  entityType,
  title, 
  titleEnglish, 
  imageUrl, 
  lang 
}: BookmarkButtonsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isLoadingPlanned, setIsLoadingPlanned] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('category')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .eq('user_id', user.id);

      if (bookmarks) {
        setIsFavorite(bookmarks.some(b => b.category === 'favorite'));
        setIsPlanned(bookmarks.some(b => b.category === 'planned'));
      }
    };

    checkBookmarkStatus();
  }, [entityId, entityType, supabase]);

  const handleBookmark = async (category: 'favorite' | 'planned') => {
    const isActive = category === 'favorite' ? isFavorite : isPlanned;
    const setLoading = category === 'favorite' ? setIsLoadingFavorite : setIsLoadingPlanned;
    const setStatus = category === 'favorite' ? setIsFavorite : setIsPlanned;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication required',
          description: t.authRequired,
          variant: 'destructive',
        });
        return;
      }

      if (isActive) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('entity_id', entityId)
          .eq('entity_type', entityType)
          .eq('user_id', user.id)
          .eq('category', category);

        if (error) throw error;
        setStatus(false);
        toast({
          description: category === 'favorite' ? t.removedFromFavorites : t.removedFromWatchPlan,
        });
      } else {
        // Add bookmark with details
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            entity_id: entityId,
            entity_type: entityType,
            user_id: user.id,
            category,
            title,
            title_english: titleEnglish,
            image_url: imageUrl,
          });

        if (error) throw error;
        setStatus(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={isFavorite ? "secondary" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => handleBookmark('favorite')}
        disabled={isLoadingFavorite}
      >
        {isLoadingFavorite ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        )}
        {isFavorite ? t.removeFromFavorites : t.addToFavorites}
      </Button>

      {entityType === 'anime' && (
        <Button
          variant={isPlanned ? "secondary" : "outline"}
          size="sm"
          className="gap-2"
          onClick={() => handleBookmark('planned')}
          disabled={isLoadingPlanned}
        >
          {isLoadingPlanned ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlanned ? (
            <BookmarkCheck className="h-4 w-4 text-green-500" />
          ) : (
            <BookmarkPlus className="h-4 w-4" />
          )}
          {isPlanned ? t.removeFromWatchPlan : t.addToWatchPlan}
        </Button>
      )}
    </div>
  );
}