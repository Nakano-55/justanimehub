'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface ContentVersion {
  id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
}

type EntityType = 'anime' | 'character';
type ContentType = 'character_description' | 'anime_synopsis' | 'anime_background';

interface TranslationContextType {
  getTranslation: (entityId: number, entityType: EntityType, field: ContentType, language: Language) => Promise<ContentVersion | null>;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
  getTranslation: async () => null,
  isLoading: true,
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  const getTranslation = async (
    entityId: number,
    entityType: EntityType,
    field: ContentType,
    language: Language
  ): Promise<ContentVersion | null> => {
    try {
      console.log('Fetching translation:', { entityId, entityType, field, language });
      
      const { data, error } = await supabase
        .from('content_versions')
        .select('id, content, status')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .eq('content_type', field)
        .eq('language', language)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.warn('No approved version found:', { error, query: { entityId, entityType, field, language } });
        return null;
      }

      return {
        id: data.id,
        content: data.content,
        status: data.status
      };
    } catch (error) {
      console.error('Error fetching translation:', error);
      return null;
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <TranslationContext.Provider value={{ getTranslation, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => useContext(TranslationContext);