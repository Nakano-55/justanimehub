/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Loader2, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { POINTS } from '@/lib/gamification/points';
import type { Database } from '@/lib/database.types';
import type { Language as LanguageType } from '@/lib/i18n/types';

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

      // Get current version details
      const { data: currentVersion, error: checkError } = await supabase
        .from('content_versions')
        .select('*')
        .eq('id', id)
        .single();

      if (checkError) throw new Error('Failed to verify content status');
      if (!currentVersion) throw new Error('Content not found');

      // Update version status
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

      // Award points if approved
      if (newStatus === 'approved') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userPoints } = await supabase
            .from('user_points')
            .select('points')
            .eq('user_id', currentVersion.created_by)
            .single();

          // Update user points
          await supabase
            .from('user_points')
            .upsert({
              user_id: currentVersion.created_by,
              points: (userPoints?.points || 0) + POINTS.CONTENT_APPROVED,
              updated_at: new Date().toISOString(),
            });
        }
      }

      // Create notification for the content creator
      await supabase.from('notifications').insert({
        user_id: currentVersion.created_by,
        type: `content_${newStatus}`,
        message: `Your ${currentVersion.content_type.replace(/_/g, ' ')} translation for ${currentVersion.entity_type} has been ${newStatus}`,
        link: `/${currentVersion.language}/${currentVersion.entity_type}/${currentVersion.entity_id}`,
        data: {
          versionId: id,
          entityId: currentVersion.entity_id,
          entityType: currentVersion.entity_type,
          contentType: currentVersion.content_type,
          language: currentVersion.language
        }
      });

      toast({
        description: `Content ${newStatus} successfully`,
      });

      await fetchContent();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <span>Loading content...</span>
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
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Content Management</h1>
          <div className="flex gap-4">
            <Select
              value={selectedEntityType}
              onValueChange={(value) => setSelectedEntityType(value as EntityType)}
            >
              <SelectTrigger className="w-[200px] bg-neutral-900 border-neutral-700">
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                <SelectItem value="character">Characters</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as ContentType)}
            >
              <SelectTrigger className="w-[200px] bg-neutral-900 border-neutral-700">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                <SelectItem value="character_description">Character Descriptions</SelectItem>
                <SelectItem value="anime_synopsis">Anime Synopsis</SelectItem>
                <SelectItem value="anime_background">Anime Background</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedLanguage}
              onValueChange={(value) => setSelectedLanguage(value as Language)}
            >
              <SelectTrigger className="w-[180px] bg-neutral-900 border-neutral-700">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Indonesian</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as ContentStatus)}
            >
              <SelectTrigger className="w-[180px] bg-neutral-900 border-neutral-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800">
                <TableHead className="text-neutral-400 w-32">Content Type</TableHead>
                <TableHead className="text-neutral-400 w-24">Language</TableHead>
                <TableHead className="text-neutral-400">Content</TableHead>
                <TableHead className="text-neutral-400 w-40">Contributor</TableHead>
                <TableHead className="text-neutral-400 w-32">Status</TableHead>
                <TableHead className="text-neutral-400 w-40">Created At</TableHead>
                <TableHead className="text-neutral-400 w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-neutral-400 py-8">
                    No content found for the selected criteria
                  </TableCell>
                </TableRow>
              ) : (
                content.map((item) => (
                  <TableRow key={item.id} className="border-neutral-800">
                    <TableCell className="font-medium text-white">
                      <div className="flex flex-col gap-1">
                        <span>{item.content_type.replace(/_/g, ' ')}</span>
                        <Link
                          href={getEntityUrl(item.entity_type, item.entity_id, item.language)}
                          className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                          target="_blank"
                        >
                          View {item.entity_type}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-white">{item.language}</TableCell>
                    <TableCell className="text-neutral-300">
                      <div className="space-y-4">
                        {item.originalContent && (
                          <div className="bg-neutral-800 p-3 rounded-lg">
                            <div className="text-sm text-neutral-400 mb-2">Original Content:</div>
                            <div className="text-neutral-200">
                              {item.expanded
                                ? item.originalContent
                                : `${item.originalContent.slice(0, 200)}${
                                    item.originalContent.length > 200 ? '...' : ''
                                  }`}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-neutral-400 mb-2">New Content:</div>
                          <div>
                            {item.expanded
                              ? item.content
                              : `${item.content.slice(0, 200)}${
                                  item.content.length > 200 ? '...' : ''
                                }`}
                          </div>
                        </div>
                        {(item.content.length > 200 || (item.originalContent && item.originalContent.length > 200)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(item.id)}
                            className="text-neutral-400 hover:text-white"
                          >
                            {item.expanded ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                See Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                See More
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-300">
                      {item.profiles?.username || item.profiles?.email || 'Anonymous'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : item.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-neutral-300">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell>
                      {item.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-400 hover:text-green-300 hover:bg-neutral-800"
                            onClick={() => handleStatusUpdate(item.id, 'approved')}
                            disabled={isUpdating[item.id]}
                          >
                            {isUpdating[item.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-neutral-800"
                            onClick={() => handleStatusUpdate(item.id, 'rejected')}
                            disabled={isUpdating[item.id]}
                          >
                            {isUpdating[item.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}