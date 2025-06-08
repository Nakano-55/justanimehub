/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Loader2, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Calendar, User, FileText, Globe, Eye } from 'lucide-react';
import type { Database } from '@/lib/database.types';

type ContentVersion = Database['public']['Tables']['content_versions']['Row'];
type ContentStatus = 'pending' | 'approved' | 'rejected' | 'all';
type ContentType = 'character_description' | 'anime_synopsis' | 'anime_background';
type EntityType = 'anime' | 'character';
type Language = 'en' | 'id';

interface ContentVersionWithProfile extends ContentVersion {
  profiles?: {
    username: string | null;
    email: string | null;
  } | null;
  originalContent?: string | null;
  expanded?: boolean;
}

const translations = {
  en: {
    contentManagement: 'Content Management',
    filterBy: 'Filter by',
    entityType: 'Entity Type',
    contentType: 'Content Type',
    language: 'Language',
    status: 'Status',
    characters: 'Characters',
    anime: 'Anime',
    characterDescriptions: 'Character Descriptions',
    animeSynopsis: 'Anime Synopsis',
    animeBackground: 'Anime Background',
    english: 'English',
    indonesian: 'Indonesian',
    allContent: 'All Content',
    pendingReview: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    loading: 'Loading content...',
    error: 'Error loading content',
    retry: 'Retry',
    noContent: 'No content found for the selected criteria',
    contributor: 'Contributor',
    createdAt: 'Created',
    viewEntity: 'View',
    approve: 'Approve',
    reject: 'Reject',
    originalContent: 'Original Content',
    newContent: 'New Content',
    seeMore: 'See More',
    seeLess: 'See Less',
    anonymous: 'Anonymous',
    contentApproved: 'Content approved successfully',
    contentRejected: 'Content rejected successfully',
    errorUpdating: 'Failed to update content status',
    pending: 'Pending',
    itemsFound: 'items found'
  },
  id: {
    contentManagement: 'Manajemen Konten',
    filterBy: 'Filter berdasarkan',
    entityType: 'Tipe Entitas',
    contentType: 'Tipe Konten',
    language: 'Bahasa',
    status: 'Status',
    characters: 'Karakter',
    anime: 'Anime',
    characterDescriptions: 'Deskripsi Karakter',
    animeSynopsis: 'Sinopsis Anime',
    animeBackground: 'Latar Belakang Anime',
    english: 'Inggris',
    indonesian: 'Indonesia',
    allContent: 'Semua Konten',
    pendingReview: 'Menunggu Review',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    loading: 'Memuat konten...',
    error: 'Gagal memuat konten',
    retry: 'Coba Lagi',
    noContent: 'Tidak ada konten yang ditemukan untuk kriteria yang dipilih',
    contributor: 'Kontributor',
    createdAt: 'Dibuat',
    viewEntity: 'Lihat',
    approve: 'Setujui',
    reject: 'Tolak',
    originalContent: 'Konten Asli',
    newContent: 'Konten Baru',
    seeMore: 'Lihat Lebih',
    seeLess: 'Lihat Kurang',
    anonymous: 'Anonim',
    contentApproved: 'Konten berhasil disetujui',
    contentRejected: 'Konten berhasil ditolak',
    errorUpdating: 'Gagal memperbarui status konten',
    pending: 'Menunggu',
    itemsFound: 'item ditemukan'
  }
} as const;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentVersionWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});
  const [selectedStatus, setSelectedStatus] = useState<ContentStatus>('pending');
  const [selectedType, setSelectedType] = useState<ContentType>('character_description');
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('character');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const t = translations['en']; // You can make this dynamic based on user preference

  useEffect(() => {
    fetchContent();
  }, [selectedStatus, selectedType, selectedLanguage, selectedEntityType]);

  async function fetchContent() {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthorized');

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (adminError || !adminUser) throw new Error('Unauthorized: Admin access required');

      let query = supabase
        .from('content_versions')
        .select(`
          *,
          profiles (
            username,
            email
          )
        `)
        .eq('content_type', selectedType)
        .eq('entity_type', selectedEntityType)
        .eq('language', selectedLanguage)
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch original content for each item
      const contentWithOriginal = await Promise.all((data || []).map(async (item) => {
        let originalContent = item.original_content;
        
        if (!originalContent) {
          try {
            const { data: originalVersion } = await supabase
              .from('content_versions')
              .select('content')
              .eq('entity_id', item.entity_id)
              .eq('entity_type', item.entity_type)
              .eq('content_type', item.content_type)
              .eq('language', 'en')
              .eq('status', 'approved')
              .single();

            originalContent = originalVersion?.content || null;
          } catch (error) {
            console.warn('No approved version found for:', item.entity_id);
          }
        }

        return {
          ...item,
          originalContent,
          expanded: false,
        };
      }));

      setContent(contentWithOriginal);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError(error instanceof Error ? error.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, newStatus: 'approved' | 'rejected') {
    try {
      setIsUpdating(prev => ({ ...prev, [id]: true }));

      const { data: currentVersion, error: checkError } = await supabase
        .from('content_versions')
        .select('*')
        .eq('id', id)
        .single();

      if (checkError) throw new Error('Failed to verify content status');
      if (!currentVersion) throw new Error('Content not found');

      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === 'rejected' ? { rejected_at: new Date().toISOString() } : {})
      };

      const { error: updateError } = await supabase
        .from('content_versions')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        description: newStatus === 'approved' ? t.contentApproved : t.contentRejected,
      });

      await fetchContent();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : t.errorUpdating,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  }

  const toggleExpand = (id: string) => {
    setContent(prevContent =>
      prevContent.map(item =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  const getEntityUrl = (entityType: EntityType, entityId: number, language: string) => {
    return `/${language}/${entityType}/${entityId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const ContentCard = ({ item }: { item: ContentVersionWithProfile }) => (
    <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-violet-500 flex-shrink-0" />
              <span className="truncate">
                {item.content_type.replace(/_/g, ' ')}
              </span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {item.language.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={`text-xs border ${getStatusColor(item.status)}`}>
                {item.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.entity_type}
              </Badge>
            </div>
          </div>
          <Link
            href={getEntityUrl(item.entity_type, item.entity_id, item.language)}
            target="_blank"
            className="flex-shrink-0"
          >
            <Button variant="outline" size="sm" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              {t.viewEntity}
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contributor and Date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-neutral-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.profiles?.username || item.profiles?.email || t.anonymous}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{formatDate(item.created_at)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {item.originalContent && (
            <div className="bg-neutral-800 p-3 rounded-lg">
              <div className="text-sm text-neutral-400 mb-2 font-medium">{t.originalContent}:</div>
              <div className="text-neutral-200 text-sm leading-relaxed">
                {item.expanded
                  ? item.originalContent
                  : `${item.originalContent.slice(0, 150)}${
                      item.originalContent.length > 150 ? '...' : ''
                    }`}
              </div>
            </div>
          )}
          
          <div className="bg-neutral-800/50 p-3 rounded-lg border border-violet-500/20">
            <div className="text-sm text-violet-400 mb-2 font-medium">{t.newContent}:</div>
            <div className="text-neutral-200 text-sm leading-relaxed">
              {item.expanded
                ? item.content
                : `${item.content.slice(0, 150)}${
                    item.content.length > 150 ? '...' : ''
                  }`}
            </div>
          </div>

          {(item.content.length > 150 || (item.originalContent && item.originalContent.length > 150)) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpand(item.id)}
              className="text-neutral-400 hover:text-white w-full"
            >
              {item.expanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  {t.seeLess}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  {t.seeMore}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Actions */}
        {item.status === 'pending' && (
          <div className="flex gap-2 pt-2 border-t border-neutral-800">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-500"
              onClick={() => handleStatusUpdate(item.id, 'approved')}
              disabled={isUpdating[item.id]}
            >
              {isUpdating[item.id] ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  {t.approve}
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => handleStatusUpdate(item.id, 'rejected')}
              disabled={isUpdating[item.id]}
            >
              {isUpdating[item.id] ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <X className="w-4 h-4 mr-1" />
                  {t.reject}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" aria-hidden="true" />
          <span>{t.loading}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-bold text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-500"
          >
            {t.retry}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{t.contentManagement}</h1>
          {content.length > 0 && (
            <div className="text-sm text-neutral-400">
              {content.length} {t.itemsFound}
            </div>
          )}
        </div>

        {/* Filters */}
        <Card className="bg-neutral-900 border-neutral-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t.filterBy}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.entityType}</label>
                <Select
                  value={selectedEntityType}
                  onValueChange={(value) => setSelectedEntityType(value as EntityType)}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-700">
                    <SelectItem value="character">{t.characters}</SelectItem>
                    <SelectItem value="anime">{t.anime}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.contentType}</label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as ContentType)}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-700">
                    <SelectItem value="character_description">{t.characterDescriptions}</SelectItem>
                    <SelectItem value="anime_synopsis">{t.animeSynopsis}</SelectItem>
                    <SelectItem value="anime_background">{t.animeBackground}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.language}</label>
                <Select
                  value={selectedLanguage}
                  onValueChange={(value) => setSelectedLanguage(value as Language)}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-700">
                    <SelectItem value="en">{t.english}</SelectItem>
                    <SelectItem value="id">{t.indonesian}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.status}</label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as ContentStatus)}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-700">
                    <SelectItem value="all">{t.allContent}</SelectItem>
                    <SelectItem value="pending">{t.pendingReview}</SelectItem>
                    <SelectItem value="approved">{t.approved}</SelectItem>
                    <SelectItem value="rejected">{t.rejected}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Display - Consistent card layout across all screen sizes */}
        {content.length === 0 ? (
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400">{t.noContent}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {content.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}