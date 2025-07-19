'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Edit } from 'lucide-react';
import { useToast } from "./ui/use-toast";
import { useGamification } from './GamificationProvider';
import type { Language } from '@/lib/i18n/types';
import type { Database } from '@/lib/database.types';
import { POINTS } from '@/lib/gamification/points';

interface TranslationContributorProps {
  entityId: number;
  entityType: 'anime' | 'character';
  contentType: 'character_description' | 'anime_synopsis' | 'anime_background';
  originalText: string;
  currentLanguage: Language;
}

interface TranslationTexts {
  addTranslation: string;
  improveTranslation: string;
  helpImprove: string;
  originalText: string;
  yourTranslation: string;
  cancel: string;
  submit: string;
  submitting: string;
  success: string;
  review: string;
  error: string;
  loginRequired: string;
  duplicateError: string;
}

const translations: Record<Language, TranslationTexts> = {
  en: {
    addTranslation: 'Add English Version',
    improveTranslation: 'Improve English Version',
    helpImprove: 'Help improve the content in English.',
    originalText: 'Original Text',
    yourTranslation: 'Your Version',
    cancel: 'Cancel',
    submit: 'Submit',
    submitting: 'Submitting...',
    success: 'Content submitted successfully!',
    review: 'Your contribution will be reviewed before being published.',
    error: 'Failed to submit content',
    loginRequired: 'Please log in to contribute',
    duplicateError: 'A version in this language already exists and is under review'
  },
  id: {
    addTranslation: 'Tambah Versi Indonesia',
    improveTranslation: 'Perbaiki Versi Indonesia',
    helpImprove: 'Bantu tingkatkan konten dalam Bahasa Indonesia.',
    originalText: 'Teks Asli',
    yourTranslation: 'Versi Anda',
    cancel: 'Batal',
    submit: 'Kirim',
    submitting: 'Mengirim...',
    success: 'Konten berhasil dikirim!',
    review: 'Kontribusi Anda akan ditinjau sebelum dipublikasikan.',
    error: 'Gagal mengirim konten',
    loginRequired: 'Silakan masuk untuk berkontribusi',
    duplicateError: 'Versi dalam bahasa ini sudah ada dan sedang dalam peninjauan'
  }
};

export function TranslationContributor({
  entityId,
  entityType,
  contentType,
  originalText,
  currentLanguage,
}: TranslationContributorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const t = translations[currentLanguage];
  const { addPoints, checkAchievements } = useGamification();

  useEffect(() => {
    const fetchCurrentVersion = async () => {
      try {
        const { data, error } = await supabase
          .from('content_versions')
          .select('content')
          .eq('entity_id', entityId)
          .eq('entity_type', entityType)
          .eq('content_type', contentType)
          .eq('language', currentLanguage)
          .eq('status', 'approved')
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching version:', error);
          return;
        }

        setCurrentVersion(data?.content || null);
      } catch (error) {
        console.error('Error:', error);
        setCurrentVersion(null);
      }
    };

    fetchCurrentVersion();
  }, [entityId, entityType, contentType, currentLanguage, supabase]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(t.loginRequired);
      }

      // Check for existing pending or approved versions
      const { data: existingVersions, error: checkError } = await supabase
        .from('content_versions')
        .select('id, status')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .eq('content_type', contentType)
        .eq('language', currentLanguage)
        .in('status', ['pending', 'approved']);

      if (checkError) {
        console.error('Error checking versions:', checkError);
        throw new Error(t.error);
      }

      if (existingVersions && existingVersions.some(v => v.status === 'pending')) {
        throw new Error(t.duplicateError);
      }

      // Insert new version with original content
      const { data: newVersion, error: insertError } = await supabase
        .from('content_versions')
        .insert({
          entity_id: entityId,
          entity_type: entityType,
          content_type: contentType,
          language: currentLanguage,
          content: content.trim(),
          original_content: originalText,
          created_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting version:', insertError);
        throw new Error(t.error);
      }

      // Award points for content submission
      await addPoints(POINTS.CONTENT_SUBMISSION);
      await checkAchievements();

      // Create notification for admin
      await supabase.from('notifications').insert({
        user_id: user.id, // This will be replaced by admin ID in production
        type: 'content_pending',
        message: `New ${contentType} translation submitted for ${entityType} ID ${entityId}`,
        link: `/${currentLanguage}/admin/translations`,
        data: {
          versionId: newVersion.id,
          entityId,
          entityType,
          contentType,
          language: currentLanguage
        }
      });

      toast({ description: `${t.success} ${t.review}` });
      setIsOpen(false);
      setContent('');

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : t.error,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-400 hover:text-neutral-300"
        >
          <Edit className="w-4 h-4 mr-1" />
          {currentVersion ? t.improveTranslation : t.addTranslation}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[500px] mx-auto bg-neutral-900 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentVersion ? t.improveTranslation : t.addTranslation}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t.helpImprove} {t.review}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4 px-1">
          <div>
            <label className="text-sm font-medium block mb-2">
              {t.originalText}
            </label>
            <div className="p-3 rounded-md bg-neutral-800 text-sm text-neutral-300 max-h-32 overflow-y-auto">
              {originalText}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              {t.yourTranslation}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none min-h-[100px] resize-none"
              placeholder={`Enter content in ${currentLanguage === 'id' ? 'Indonesian' : 'English'}...`}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => setIsOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="bg-violet-600 hover:bg-violet-500 w-full sm:w-auto"
            >
              {isSubmitting ? t.submitting : t.submit}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}