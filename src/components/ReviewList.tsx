/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { ReviewForm } from './ReviewForm';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];

interface Review extends ReviewRow {
  profiles: Pick<Profile, 'username' | 'full_name'>;
}

interface ReviewListProps {
  animeId: number;
  lang: Language;
}

const translations = {
  en: {
    reviews: 'Reviews',
    yourReview: 'Your Review',
    loading: 'Loading reviews...',
    noReviews: 'No reviews yet. Be the first to review!',
    error: 'Error loading reviews',
    anonymous: 'Anonymous',
    retry: 'Retry',
    loginToReview: 'Please sign in to write a review',
  },
  id: {
    reviews: 'Ulasan',
    yourReview: 'Ulasan Anda',
    loading: 'Memuat ulasan...',
    noReviews: 'Belum ada ulasan. Jadilah yang pertama mengulas!',
    error: 'Gagal memuat ulasan',
    anonymous: 'Anonim',
    retry: 'Coba Lagi',
    loginToReview: 'Silakan masuk untuk menulis ulasan',
  },
} as const;

export function ReviewList({ animeId, lang }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .eq('jikan_id', animeId)
        .eq('language', lang)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const typedData = (data || []) as Review[];

      if (session?.user) {
        const userReview = typedData.find(r => r.user_id === session.user.id);
        const otherReviews = typedData.filter(r => r.user_id !== session.user.id);
        setUserReview(userReview || null);
        setReviews(otherReviews);
      } else {
        setReviews(typedData);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, [supabase.auth]);

  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel('reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `jikan_id=eq.${animeId}`,
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [animeId, lang, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        <span className="ml-2">{t.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-red-400 mb-4">{error}</p>
        <Button
          onClick={fetchReviews}
          variant="outline"
          className="text-violet-400 hover:text-violet-300"
        >
          {t.retry}
        </Button>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const ReviewCard = ({ review }: { review: Review }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-neutral-800 rounded-lg p-6 space-y-4 hover:bg-neutral-700/50 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">
            {review.profiles?.username || review.profiles?.full_name || t.anonymous}
          </h4>
          <p className="text-sm text-neutral-400">
            {formatDate(review.created_at)}
          </p>
        </div>
        <div className="flex items-center text-yellow-500">
          <Star className="w-5 h-5 mr-1" />
          <span className="font-semibold">{review.rating}/10</span>
        </div>
      </div>
      {review.review && (
        <p className="text-neutral-300 whitespace-pre-line">{review.review}</p>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">{t.reviews}</h3>

      {isAuthenticated ? (
        <ReviewForm
          animeId={animeId}
          lang={lang}
          onReviewSubmitted={fetchReviews}
          existingReview={userReview ? {
            rating: userReview.rating,
            review: userReview.review,
          } : undefined}
        />
      ) : (
        <div className="text-center py-4 text-neutral-400">
          {t.loginToReview}
        </div>
      )}

      <div className="space-y-4">
        {userReview && (
          <div>
            <h4 className="text-lg font-semibold mb-3 text-violet-400">
              {t.yourReview}
            </h4>
            <ReviewCard review={userReview} />
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {reviews.length === 0 && !userReview && (
            <p className="text-center text-neutral-400 py-8">
              {t.noReviews}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}