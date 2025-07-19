/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import {
  Users,
  Star,
  BookmarkCheck,
  Loader2,
  AlertTriangle,
  Trash2,
  FileText,
  Settings,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

const CHART_COLORS = ['#22c55e', '#ef4444', '#eab308'];

interface TranslationStats {
  approved: number;
  rejected: number;
  pending: number;
}

interface TopContributor {
  username: string;
  contributions: number;
}

interface AdminStats {
  totalUsers: number;
  totalReviews: number;
  totalBookmarks: number;
  pendingTranslations: number;
  translationStats: TranslationStats;
  topContributors: TopContributor[];
  recentReviews: Array<{
    id: string;
    rating: number;
    review: string | null;
    created_at: string;
    profiles?: {
      username: string | null;
      email: string | null;
    } | null;
  }>;
}

const translations = {
  en: {
    adminDashboard: 'Admin Dashboard',
    totalUsers: 'Total Users',
    totalReviews: 'Total Reviews',
    totalBookmarks: 'Total Bookmarks',
    recentReviews: 'Recent Reviews',
    monitorReviews: 'Monitor and moderate user reviews',
    anonymous: 'Anonymous',
    loading: 'Loading...',
    error: 'Failed to load admin dashboard',
    deleteSuccess: 'Review deleted successfully',
    deleteError: 'Failed to delete review',
    translationStatus: 'Content Status',
    topContributors: 'Top Contributors',
    approved: 'Approved',
    rejected: 'Rejected',
    pending: 'Pending',
    pendingTranslations: 'Pending Content',
    contentManagement: 'Review and approve community contributions',
    viewAll: 'View All',
    goToContent: 'Review Content',
    manageContent: 'Manage Content',
    adminSettings: 'Settings',
  },
  id: {
    adminDashboard: 'Dashboard Admin',
    totalUsers: 'Total Pengguna',
    totalReviews: 'Total Ulasan',
    totalBookmarks: 'Total Bookmark',
    recentReviews: 'Ulasan Terbaru',
    monitorReviews: 'Pantau dan moderasi ulasan pengguna',
    anonymous: 'Anonim',
    loading: 'Memuat...',
    error: 'Gagal memuat dashboard admin',
    deleteSuccess: 'Ulasan berhasil dihapus',
    deleteError: 'Gagal menghapus ulasan',
    translationStatus: 'Status Konten',
    topContributors: 'Kontributor Teratas',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    pending: 'Menunggu',
    pendingTranslations: 'Konten Menunggu',
    contentManagement: 'Tinjau dan setujui kontribusi komunitas',
    viewAll: 'Lihat Semua',
    goToContent: 'Tinjau Konten',
    manageContent: 'Kelola Konten',
    adminSettings: 'Pengaturan',
  },
} as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalReviews: 0,
    totalBookmarks: 0,
    pendingTranslations: 0,
    translationStats: {
      approved: 0,
      rejected: 0,
      pending: 0
    },
    topContributors: [],
    recentReviews: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { lang } = useLanguage();
  const t = translations[lang];
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const checkAdminAndFetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }

        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (adminError || !adminUser) {
          setIsAdmin(false);
          router.push('/');
          return;
        }

        setIsAdmin(true);

        // Fetch basic stats
        const [
          { count: userCount },
          { count: reviewCount },
          { count: bookmarkCount },
          { data: recentReviews }
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('reviews').select('id', { count: 'exact' }),
          supabase.from('bookmarks').select('id', { count: 'exact' }),
          supabase
            .from('reviews')
            .select(`
              id,
              rating,
              review,
              created_at,
              profiles (username, email)
            `)
            .order('created_at', { ascending: false })
            .limit(10)
        ]);

        // Fetch translation stats
        const { data: translations } = await supabase
          .from('content_versions')
          .select('status');

        const translationStats = {
          approved: translations?.filter(t => t.status === 'approved').length || 0,
          rejected: translations?.filter(t => t.status === 'rejected').length || 0,
          pending: translations?.filter(t => t.status === 'pending').length || 0
        };

        // Fetch top contributors
        const { data: contributors } = await supabase
          .from('content_versions')
          .select(`
            created_by,
            profiles (username, email)
          `)
          .eq('status', 'approved');

        const contributorCounts = contributors?.reduce((acc: Record<string, number>, curr) => {
          const id = curr.created_by;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {}) || {};

        const topContributors = Object.entries(contributorCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([id, count]) => ({
            username: contributors?.find(c => c.created_by === id)?.profiles?.username || 
                     contributors?.find(c => c.created_by === id)?.profiles?.email || 
                     t.anonymous,
            contributions: count
          }));

        setStats({
          totalUsers: userCount || 0,
          totalReviews: reviewCount || 0,
          totalBookmarks: bookmarkCount || 0,
          pendingTranslations: translationStats.pending || 0,
          recentReviews: recentReviews || [],
          translationStats,
          topContributors,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetchStats();
  }, [supabase, router, t.error, t.anonymous]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setStats(prev => ({
        ...prev,
        recentReviews: prev.recentReviews.filter(review => review.id !== reviewId),
        totalReviews: prev.totalReviews - 1,
      }));

      toast({
        description: t.deleteSuccess,
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Error',
        description: t.deleteError,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center">
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
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-xl text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const pieChartData = [
    { name: t.approved, value: stats.translationStats.approved },
    { name: t.rejected, value: stats.translationStats.rejected },
    { name: t.pending, value: stats.translationStats.pending },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-3xl font-bold">{t.adminDashboard}</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Link href={`/${lang}/admin/translations`}>
              <Button className="bg-violet-600 hover:bg-violet-500 w-full sm:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                {t.manageContent}
              </Button>
            </Link>
            <Link href={`/${lang}/admin/settings`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Settings className="w-4 h-4 mr-2" />
                {t.adminSettings}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Users className="w-5 h-5 text-blue-500" />
                {t.totalUsers}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl md:text-3xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Star className="w-5 h-5 text-yellow-500" />
                {t.totalReviews}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl md:text-3xl font-bold">{stats.totalReviews}</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BookmarkCheck className="w-5 h-5 text-green-500" />
                {t.totalBookmarks}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl md:text-3xl font-bold">{stats.totalBookmarks}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <PieChartIcon className="w-5 h-5 text-violet-500" />
                {t.translationStatus}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BarChartIcon className="w-5 h-5 text-violet-500" />
                {t.topContributors}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={stats.topContributors}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="username" width={100} />
                    <Tooltip />
                    <Bar dataKey="contributions" fill="#8b5cf6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-base md:text-lg">{t.recentReviews}</CardTitle>
              <CardDescription className="text-sm">
                {t.monitorReviews}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 md:space-y-4">
                {stats.recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 md:p-4 bg-neutral-800 rounded-lg gap-3 sm:gap-4"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium text-sm md:text-base break-words">
                          {review.profiles?.username || review.profiles?.email || t.anonymous}
                        </span>
                        <span className="text-xs md:text-sm text-neutral-400">
                          {formatDate(review.created_at)}
                        </span>
                        <div className="flex items-center text-yellow-500 text-sm">
                          <Star className="w-4 h-4" />
                          <span>{review.rating}/10</span>
                        </div>
                      </div>
                      <p className="text-neutral-300 text-sm md:text-base break-words line-clamp-3">{review.review}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/50 flex-shrink-0"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3 md:pb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <CardTitle className="text-base md:text-lg">{t.pendingTranslations}</CardTitle>
                <Link href={`/${lang}/admin/translations`}>
                  <Button variant="link" className="text-violet-400 hover:text-violet-300 p-0 h-auto text-sm">
                    {t.viewAll}
                  </Button>
                </Link>
              </div>
              <CardDescription className="text-sm">
                {t.contentManagement}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 bg-neutral-800 rounded-lg gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <FileText className="w-8 h-8 text-violet-500" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{stats.pendingTranslations}</p>
                    <p className="text-xs md:text-sm text-neutral-400">{t.pendingTranslations}</p>
                  </div>
                </div>
                <Link href={`/${lang}/admin/translations`}>
                  <Button className="bg-violet-600 hover:bg-violet-500 w-full sm:w-auto">
                    {t.goToContent}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}