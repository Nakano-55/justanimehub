'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Language, TranslationContextType } from '@/lib/i18n/types';

const LanguageContext = createContext<TranslationContextType>({
  lang: 'en',
  switchLanguage: () => {},
});

export function LanguageProvider({
  children,
  lang,
}: {
  children: ReactNode;
  lang: Language;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = useCallback((newLang: Language) => {
    // Get the current path segments
    const segments = pathname.split('/');
    
    // Replace the language segment (first segment after the initial slash)
    segments[1] = newLang;
    
    // Reconstruct the path
    const newPath = segments.join('/');
    
    // Navigate to the new path
    router.push(newPath);
  }, [pathname, router]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        switchLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);