/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageProvider';
import { ContributionHistory } from '@/components/ContributionHistory';
import { UserPoints } from '@/components/UserPoints';
import { motion } from 'framer-motion';
import {
  User, Settings, Star, BookmarkCheck, Heart, Loader2, PenLine,
  Calendar, AlertCircle, Save, X, ChevronRight, Trophy, ImageOff
} from 'lucide-react';
import type { Database } from '@/lib/database.types';

const translations = {
  en: {
    profile: 'Profile',
    editProfile: 'Edit Profile',
    overview: 'Overview',
    reviews: 'Reviews',
    bookmarks: 'Bookmarks',
    settings: 'Settings',
    contributions: 'Contributions',
    achievements: 'Achievements',
    username: 'Username',
    fullName: 'Full Name',
    email: 'Email',
    joinDate: 'Join Date',
    save: 'Save Changes',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error loading profile',
    retry: 'Retry',
    loginRequired: 'Please sign in to view your profile',
    statsTitle: 'Your Stats',
    totalReviews: 'Total Reviews',
    averageRating: 'Average Rating',
    favoriteAnime: 'Favorite Anime',
    planToWatch: 'Plan to Watch',
    recentActivity: 'Recent Activity',
    noActivity: 'No recent activity',
    reviewedOn: 'Reviewed on',
    addedToFavorites: 'Added to Favorites',
    addedToPlanToWatch: 'Added to Plan to Watch',
    viewAll: 'View All',
    updateSuccess: 'Profile updated successfully',
    updateError: 'Failed to update profile',
    noReviews: 'No reviews yet',
    noBookmarks: 'No bookmarks yet',
    viewAnime: 'View Anime',
    rating: 'Rating',
    status: 'Status',
    addedOn: 'Added on',
    favorites: 'Favorites',
    planned: 'Plan to Watch',
  },
  id: {
    profile: 'Profil',
    editProfile: 'Edit Profil',
    overview: 'Ikhtisar',
    reviews: 'Ulasan',
    bookmarks: 'Bookmark',
    settings: 'Pengaturan',
    contributions: 'Kontribusi',
    achievements: 'Pencapaian',
    username: 'Username',
    fullName: 'Nama Lengkap',
    email: 'Email',
    joinDate: 'Tanggal Bergabung',
    save: 'Simpan Perubahan',
    cancel: 'Batal',
    loading: 'Memuat...',
    error: 'Gagal memuat profil',
    retry: 'Coba Lagi',
    loginRequired: 'Silakan masuk untuk melihat profil Anda',
    statsTitle: 'Statistik Anda',
    totalReviews: 'Total Ulasan',
    averageRating: 'Rating Rata-rata',
    favoriteAnime: 'Anime Favorit',
    planToWatch: 'Rencana Tonton',
    recentActivity: 'Aktivitas Terbaru',
    noActivity: 'Tidak ada aktivitas terbaru',
    reviewedOn: 'Diulas pada',
    addedToFavorites: 'Ditambahkan ke Favorit',
    addedToPlanToWatch: 'Ditambahkan ke Rencana Tonton',
    viewAll: 'Lihat Semua',
    updateSuccess: 'Profil berhasil diperbarui',
    updateError: 'Gagal memperbarui profil',
    noReviews: 'Belum ada ulasan',
    noBookmarks: 'Belum ada bookmark',
    viewAnime: 'Lihat Anime',
    rating: 'Rating',
    status: 'Status',
    addedOn: 'Ditambahkan pada',
    favorites: 'Favorit',
    planned: 'Rencana Tonton',
  },
} as const;

interface Review {
  id: string;
  jikan_id: number;
  rating: number;
  review: string | null;
  created_at: string;
  anime_title?: string;
  anime_image?: string;
}

interface BookmarkFromDB {
  id: string;
  entity_id: number;
  entity_type: 'anime' | 'character';
  category: string;
  created_at: string;
  user_id: string;
  title: string;
  title_english: string | null;
  image_url: string | null;
}

interface Bookmark extends Omit<BookmarkFromDB, 'category'> {
  category: 'favorite' | 'planned';
}

export default function ProfilePage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
  });
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    favoriteAnime: 0,
    planToWatch: 0,
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
        setFormData({
          username: profileData?.username || '',
          full_name: profileData?.full_name || '',
        });

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .eq('language', lang)
          .order('created_at', { ascending: false });

        if (reviewsData) {
          const reviewsWithAnime = await Promise.all(
            reviewsData.map(async (review) => {
              try {
                const response = await fetch(`https://api.jikan.moe/v4/anime/${review.jikan_id}`);
                if (!response.ok) {
                  if (response.status === 429) {
                    // Handle rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return {
                      ...review,
                      anime_title: `Anime #${review.jikan_id}`,
                      anime_image: null,
                    };
                  }
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return {
                  ...review,
                  anime_title: data.data?.title || `Anime #${review.jikan_id}`,
                  anime_image: data.data?.images?.jpg?.image_url || null,
                };
              } catch (error) {
                console.error('Error fetching anime details:', error);
                return {
                  ...review,
                  anime_title: `Anime #${review.jikan_id}`,
                  anime_image: null,
                };
              }
            })
          );
          setReviews(reviewsWithAnime);
        }

        // Fetch bookmarks
        const { data: bookmarksData } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (bookmarksData) {
          const bookmarks = bookmarksData.map(bookmark => ({
            ...bookmark,
            category: bookmark.category as 'favorite' | 'planned'
          }));
          setBookmarks(bookmarks);
        }

        // Update stats
        setStats({
          totalReviews: reviewsData?.length || 0,
          averageRating: reviewsData?.length ? 
            reviewsData.reduce((acc, rev) => acc + (rev.rating || 0), 0) / reviewsData.length : 
            0,
          favoriteAnime: bookmarksData?.filter(b => b.category === 'favorite').length || 0,
          planToWatch: bookmarksData?.filter(b => b.category === 'planned').length || 0,
        });

      } catch (error) {
        console.error('Error loading profile:', error);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, t.error, lang]);

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      toast({
        description: t.updateSuccess,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: t.updateError,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-xl font-bold text-red-500 mb-4">{error}</p>
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20">
            <User className="w-12 h-12 text-neutral-500 mb-4" />
            <p className="text-xl text-neutral-400">{t.loginRequired}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-8">
            <div className="h-48 bg-gradient-to-r from-violet-600 to-pink-600 rounded-lg" />
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-neutral-950">
                <Image
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username || profile.email}`}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-6 mb-4">
                <h1 className="text-3xl font-bold">
                  {profile.full_name || profile.username || 'Anonymous User'}
                </h1>
                <p className="text-neutral-400">{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-6 gap-4 bg-neutral-900 p-1">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{t.overview}</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="hidden md:inline">{t.reviews}</span>
                </TabsTrigger>
                <TabsTrigger value="bookmarks" className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4" />
                  <span className="hidden md:inline">{t.bookmarks}</span>
                </TabsTrigger>
                <TabsTrigger value="contributions" className="flex items-center gap-2">
                  <PenLine className="w-4 h-4" />
                  <span className="hidden md:inline">{t.contributions}</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden md:inline">{t.achievements}</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden md:inline">{t.settings}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900 rounded-lg p-6"
                  >
                    <h3 className="text-xl font-semibold mb-4">{t.statsTitle}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-neutral-400">{t.totalReviews}</p>
                        <p className="text-2xl font-bold flex items-center">
                          <PenLine className="w-5 h-5 mr-2 text-violet-500" />
                          {stats.totalReviews}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-neutral-400">{t.averageRating}</p>
                        <p className="text-2xl font-bold flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-500" />
                          {stats.averageRating.toFixed(1)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-neutral-400">{t.favoriteAnime}</p>
                        <p className="text-2xl font-bold flex items-center">
                          <Heart className="w-5 h-5 mr-2 text-red-500" />
                          {stats.favoriteAnime}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-neutral-400">{t.planToWatch}</p>
                        <p className="text-2xl font-bold flex items-center">
                          <BookmarkCheck className="w-5 h-5 mr-2 text-green-500" />
                          {stats.planToWatch}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-neutral-900 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">{t.recentActivity}</h3>
                      <Link
                        href={`/${lang}/bookmark`}
                        className="text-sm text-violet-400 hover:text-violet-300"
                      >
                        {t.viewAll}
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {[...reviews, ...bookmarks]
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 5)
                        .map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start space-x-3 text-sm"
                          >
                            {'rating' in activity ? (
                              <PenLine className="w-5 h-5 text-violet-500" />
                            ) : (
                              activity.category === 'favorite' ? (
                                <Heart className="w-5 h-5 text-red-500" />
                              ) : (
                                <BookmarkCheck className="w-5 h-5 text-green-500" />
                              )
                            )}
                            <div>
                              <Link
                                href={`/${lang}/${'rating' in activity ? 'anime' : activity.entity_type}/${
                                  'rating' in activity ? activity.jikan_id : activity.entity_id
                                }`}
                                className="font-medium hover:text-violet-400"
                              >
                                {'rating' in activity ? activity.anime_title : activity.title}
                              </Link>
                              <p className="text-neutral-400">
                                {'rating' in activity ? (
                                  <>
                                    {t.reviewedOn} {formatDate(activity.created_at)}
                                    {activity.rating && (
                                      <span className="ml-2 text-yellow-500">
                                        ({activity.rating}/10)
                                      </span>
                                    )}
                                  </>
                                ) : activity.category === 'favorite' ? (
                                  <>{t.addedToFavorites} {formatDate(activity.created_at)}</>
                                ) : (
                                  <>{t.addedToPlanToWatch} {formatDate(activity.created_at)}</>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-neutral-900 rounded-lg">
                      <PenLine className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                      <p className="text-neutral-400">{t.noReviews}</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-neutral-900 rounded-lg overflow-hidden"
                      >
                        <div className="flex">
                          <div className="relative w-48 h-32">
                            {review.anime_image ? (
                              <Image
                                src={review.anime_image}
                                alt={review.anime_title || ''}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                <ImageOff className="w-8 h-8 text-neutral-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Link
                                  href={`/${lang}/anime/${review.jikan_id}`}
                                  className="text-lg font-semibold hover:text-violet-400 flex items-center gap-2"
                                >
                                  {review.anime_title}
                                  <ChevronRight className="w-4 h-4" />
                                </Link>
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
                              <p className="text-neutral-300 mt-4">{review.review}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bookmarks" className="mt-6">
                <div className="space-y-6">
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-12 bg-neutral-900 rounded-lg">
                      <BookmarkCheck className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                      <p className="text-neutral-400">{t.noBookmarks}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {bookmarks.map((bookmark) => (
                        <motion.div
                          key={bookmark.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-neutral-900 rounded-lg overflow-hidden flex"
                        >
                          <div className="relative w-32 h-full">
                            {bookmark.image_url ? (
                              <Image
                                src={bookmark.image_url}
                                alt={bookmark.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                <ImageOff className="w-8 h-8 text-neutral-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-4">
                            <Link
                              href={`/${lang}/${bookmark.entity_type}/${bookmark.entity_id}`}
                              className="font-semibold hover:text-violet-400 flex items-center gap-2"
                            >
                              {bookmark.title}
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                            <div className="mt-2 flex items-center gap-2">
                              {bookmark.category === 'favorite' ? (
                                <span className="flex items-center gap-1 text-sm text-red-400">
                                  <Heart className="w-4 h-4" />
                                  {t.favorites}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-sm text-green-400">
                                  <BookmarkCheck className="w-4 h-4" />
                                  {t.planned}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400 mt-2">
                              {t.addedOn}: {formatDate(bookmark.created_at)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contributions" className="mt-6">
                <ContributionHistory lang={lang} />
              </TabsContent>

              <TabsContent value="achievements" className="mt-6">
                {profile && <UserPoints userId={profile.id} lang={lang} />}
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="bg-neutral-900 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">{t.editProfile}</h3>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="text-violet-400 hover:text-violet-300"
                      >
                        <PenLine className="w-4 h-4 mr-2" />
                        {t.editProfile}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t.username}
                      </label>
                      <Input
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={!isEditing}
                        className="bg-neutral-800 border-neutral-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t.fullName}
                      </label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={!isEditing}
                        className="bg-neutral-800 border-neutral-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t.email}
                      </label>
                      <Input
                        value={profile.email}
                        disabled
                        className="bg-neutral-800 border-neutral-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t.joinDate}
                      </label>
                      <div className="flex items-center text-neutral-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(profile.created_at)}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-3 mt-6">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              username: profile.username || '',
                              full_name: profile.full_name || '',
                            });
                          }}
                          disabled={isUpdating}
                        >
                          <X className="w-4 h-4 mr-2" />
                          {t.cancel}
                        </Button>
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={isUpdating}
                          className="bg-violet-600 hover:bg-violet-500"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {t.save}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}