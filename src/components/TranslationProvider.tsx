'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface ContentVersion {
  id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  created_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    email: string;
  } | null;
}

type EntityType = 'anime' | 'character';
type ContentType = 'character_description' | 'anime_synopsis' | 'anime_background';

interface TranslationContextType {
  getTranslation: (entityId: number, entityType: EntityType, contentType: ContentType, language: Language) => Promise<ContentVersion | null>;
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
    contentType: ContentType,
    language: Language
  ): Promise<ContentVersion | null> => {
    try {
      console.log('Fetching translation:', { entityId, entityType, contentType, language });
      
      const { data, error } = await supabase
        .from('content_versions')
        .select(`
          id, 
          content, 
          status, 
          created_by, 
          created_at,
          profiles (
            username,
            full_name,
            email
          )
        `)
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .eq('content_type', contentType)
        .eq('language', language)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.warn('No approved version found:', { error, query: { entityId, entityType, contentType, language } });
        return null;
      }

      return {
        id: data.id,
        content: data.content,
        status: data.status,
        created_by: data.created_by,
        created_at: data.created_at,
        profiles: data.profiles
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