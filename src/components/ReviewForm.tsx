/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Star, Loader2 } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useGamification } from './GamificationProvider';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';
import { POINTS } from '@/lib/gamification/points';

interface ReviewFormProps {
  animeId: number;
  lang: Language;
  onReviewSubmitted: () => void;
  existingReview?: {
    rating: number;
    review: string | null;
  };
}

const translations = {
  en: {
    writeReview: 'Write a Review',
    updateReview: 'Update Review',
    rating: 'Rating',
    review: 'Review',
    submit: 'Submit Review',
    update: 'Update Review',
    placeholder: 'Share your thoughts about this anime...',
    success: 'Review submitted successfully!',
    updateSuccess: 'Review updated successfully!',
    error: 'Failed to submit review',
  },
  id: {
    writeReview: 'Tulis Ulasan',
    updateReview: 'Perbarui Ulasan',
    rating: 'Rating',
    review: 'Ulasan',
    submit: 'Kirim Ulasan',
    update: 'Perbarui Ulasan',
    placeholder: 'Bagikan pendapatmu tentang anime ini...',
    success: 'Ulasan berhasil dikirim!',
    updateSuccess: 'Ulasan berhasil diperbarui!',
    error: 'Gagal mengirim ulasan',
  },
} as const;

export function ReviewForm({ animeId, lang, onReviewSubmitted, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [review, setReview] = useState(existingReview?.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];
  const { addPoints, checkAchievements } = useGamification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to submit a review');

      const { error } = await supabase
        .from('reviews')
        .upsert({
          user_id: user.id,
          jikan_id: animeId,
          rating,
          review: review.trim() || null,
          language: lang,
        }, {
          onConflict: 'user_id,jikan_id,language'
        });

      if (error) throw error;

      // Award points for review submission
      if (!existingReview) {
        await addPoints(POINTS.REVIEW_SUBMISSION);
        await checkAchievements();
      }

      // Create notification for admin
      await supabase.from('notifications').insert({
        user_id: user.id, // This will be replaced by admin ID in production
        type: 'review',
        message: `New review submitted for anime ID ${animeId}`,
        link: `/${lang}/anime/${animeId}`,
        data: {
          animeId,
          rating,
          userId: user.id
        }
      });

      toast({
        description: existingReview ? t.updateSuccess : t.success,
      });

      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', {
        message: error?.message,
        context: { animeId, lang },
        error,
      });
      toast({
        title: 'Error',
        description: error?.message || t.error,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">
        {existingReview ? t.updateReview : t.writeReview}
      </h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">{t.rating}</label>
        <Select
          value={rating.toString()}
          onValueChange={(value) => setRating(parseInt(value))}
        >
          <SelectTrigger className="w-[180px] bg-neutral-900 border-neutral-700">
            <SelectValue>
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                {rating}/10
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-neutral-700">
            {[...Array(10)].map((_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  {i + 1}/10
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t.review}</label>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder={t.placeholder}
          className="h-32 bg-neutral-900 border-neutral-700 resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-violet-600 hover:bg-violet-500"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {existingReview ? t.update : t.submit}
      </Button>
    </form>
  );
}