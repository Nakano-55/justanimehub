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
import type { Language } from '@/lib/i18n/types';
import type { Database } from '@/lib/database.types';

interface CharacterDescriptionProps {
  characterId: number;
  characterName: string;
  currentLanguage: Language;
}

interface DescriptionTexts {
  addDescription: string;
  improveDescription: string;
  helpImprove: string;
  characterName: string;
  yourDescription: string;
  cancel: string;
  submit: string;
  submitting: string;
  success: string;
  review: string;
  error: string;
  loginRequired: string;
  duplicateError: string;
  descriptionExists: string;
}

const translations: Record<Language, DescriptionTexts> = {
  en: {
    addDescription: 'Add English Description',
    improveDescription: 'Improve English Description',
    helpImprove: 'Add or improve the English description for this character.',
    characterName: 'Character Name',
    yourDescription: 'Your Description',
    cancel: 'Cancel',
    submit: 'Submit Description',
    submitting: 'Submitting...',
    success: 'Description submitted successfully!',
    review: 'Your contribution will be reviewed before being published.',
    error: 'Failed to submit description',
    loginRequired: 'Please log in to submit descriptions',
    duplicateError: 'A description for this character already exists and is under review',
    descriptionExists: 'An approved or pending description already exists for this character'
  },
  id: {
    addDescription: 'Tambah Deskripsi Indonesia',
    improveDescription: 'Perbaiki Deskripsi Indonesia',
    helpImprove: 'Tambah atau perbaiki deskripsi Indonesia untuk karakter ini.',
    characterName: 'Nama Karakter',
    yourDescription: 'Deskripsi Anda',
    cancel: 'Batal',
    submit: 'Kirim Deskripsi',
    submitting: 'Mengirim...',
    success: 'Deskripsi berhasil dikirim!',
    review: 'Kontribusi Anda akan ditinjau sebelum dipublikasikan.',
    error: 'Gagal mengirim deskripsi',
    loginRequired: 'Silakan masuk untuk mengirim deskripsi',
    duplicateError: 'Deskripsi untuk karakter ini sudah ada dan sedang dalam peninjauan',
    descriptionExists: 'Deskripsi yang disetujui atau tertunda sudah ada untuk karakter ini'
  }
};

export function CharacterDescription({
  characterId,
  characterName,
  currentLanguage,
}: CharacterDescriptionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDescription, setCurrentDescription] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const t = translations[currentLanguage];

  useEffect(() => {
    const fetchExistingDescription = async () => {
      try {
        const { data, error } = await supabase
          .from('content_versions')
          .select('content')
          .eq('entity_id', characterId)
          .eq('entity_type', 'character')
          .eq('content_type', 'character_description')
          .eq('language', currentLanguage)
          .eq('status', 'approved')
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching description:', error);
          return;
        }

        setCurrentDescription(data?.content || null);
      } catch (error) {
        console.error('Error:', error);
        setCurrentDescription(null);
      }
    };

    fetchExistingDescription();
  }, [characterId, currentLanguage, supabase]);

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
        .eq('entity_id', characterId)
        .eq('entity_type', 'character')
        .eq('content_type', 'character_description')
        .eq('language', currentLanguage)
        .in('status', ['pending', 'approved']);

      if (checkError) {
        console.error('Error checking versions:', checkError);
        throw new Error(t.error);
      }

      if (existingVersions && existingVersions.length > 0) {
        throw new Error(t.descriptionExists);
      }

      // Insert new version
      const { error: insertError } = await supabase
        .from('content_versions')
        .insert({
          entity_id: characterId,
          entity_type: 'character',
          content_type: 'character_description',
          language: currentLanguage,
          content: description.trim(),
          created_by: user.id,
          status: 'pending'
        });

      if (insertError) {
        console.error('Error while inserting description:', insertError);
        throw new Error(t.error);
      }

      toast({ description: `${t.success} ${t.review}` });
      setIsOpen(false);
      setDescription('');

    } catch (error) {
      console.error('Description submission error:', error);
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
          {currentDescription ? t.improveDescription : t.addDescription}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle>
            {currentDescription ? t.improveDescription : t.addDescription}
          </DialogTitle>
          <DialogDescription>
            {t.helpImprove} {t.review}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">
              {t.characterName}
            </label>
            <p className="mt-1 p-3 rounded-md bg-neutral-800 text-sm text-neutral-300">
              {characterName}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">
              {t.yourDescription}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none min-h-[100px]"
              placeholder={`Enter your description in ${currentLanguage === 'id' ? 'Indonesian' : 'English'}...`}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !description.trim()}
              className="bg-violet-600 hover:bg-violet-500"
            >
              {isSubmitting ? t.submitting : t.submit}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}