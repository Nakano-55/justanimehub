'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface Contribution {
  id: string;
  entity_id: number;
  entity_type: 'anime' | 'character';
  content_type: string;
  language: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  rejected_at: string | null;
}

interface ContributionHistoryProps {
  lang: Language;
}

const translations = {
  en: {
    title: 'Contribution History',
    loading: 'Loading contributions...',
    error: 'Failed to load contributions',
    noContributions: 'No contributions yet',
    status: 'Status',
    type: 'Type',
    language: 'Language',
    date: 'Date',
    actions: 'Actions',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    viewContent: 'View Content',
    characterDescription: 'Character Description',
    animeSynopsis: 'Anime Synopsis',
    animeBackground: 'Anime Background',
  },
  id: {
    title: 'Riwayat Kontribusi',
    loading: 'Memuat kontribusi...',
    error: 'Gagal memuat kontribusi',
    noContributions: 'Belum ada kontribusi',
    status: 'Status',
    type: 'Tipe',
    language: 'Bahasa',
    date: 'Tanggal',
    actions: 'Aksi',
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    viewContent: 'Lihat Konten',
    characterDescription: 'Deskripsi Karakter',
    animeSynopsis: 'Sinopsis Anime',
    animeBackground: 'Latar Belakang Anime',
  }
} as const;

export function ContributionHistory({ lang }: ContributionHistoryProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error: fetchError } = await supabase
          .from('content_versions')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setContributions(data || []);
      } catch (err) {
        console.error('Error fetching contributions:', err);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributions();
  }, [supabase, t.error]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            <Clock className="w-3 h-3 mr-1" />
            {t.pending}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t.approved}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
            <XCircle className="w-3 h-3 mr-1" />
            {t.rejected}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'character_description':
        return t.characterDescription;
      case 'anime_synopsis':
        return t.animeSynopsis;
      case 'anime_background':
        return t.animeBackground;
      default:
        return type;
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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500 mr-2" />
        <span>{t.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-400">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400">
        {t.noContributions}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t.title}</h2>
      <div className="bg-neutral-900 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800">
              <TableHead className="text-neutral-400">{t.status}</TableHead>
              <TableHead className="text-neutral-400">{t.type}</TableHead>
              <TableHead className="text-neutral-400">{t.language}</TableHead>
              <TableHead className="text-neutral-400">{t.date}</TableHead>
              <TableHead className="text-neutral-400 text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributions.map((contribution) => (
              <TableRow
                key={contribution.id}
                className="border-neutral-800 hover:bg-neutral-800/50"
              >
                <TableCell>{getStatusBadge(contribution.status)}</TableCell>
                <TableCell>{getContentTypeLabel(contribution.content_type)}</TableCell>
                <TableCell className="uppercase">{contribution.language}</TableCell>
                <TableCell>{formatDate(contribution.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/${contribution.language}/${contribution.entity_type}/${contribution.entity_id}`}
                    className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300"
                  >
                    {t.viewContent}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}