import { Suspense, use } from 'react';
import { LanguageProvider } from '@/components/LanguageProvider';
import { TranslationProvider } from '@/components/TranslationProvider';
import { GamificationProvider } from '@/components/GamificationProvider';
import Navbar from '@/components/Navbar';
import { ClientLayout } from '@/components/ClientLayout';
import type { Language } from '@/lib/i18n/types';

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    lang: Language;
  }>;
}

export default function LangLayout({ children, params }: RootLayoutProps) {
  const { lang } = use(params);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LanguageProvider lang={lang}>
        <TranslationProvider>
          <GamificationProvider>
            <ClientLayout>
              <Navbar />
              <main className="pt-16">
                {children}
              </main>
            </ClientLayout>
          </GamificationProvider>
        </TranslationProvider>
      </LanguageProvider>
    </Suspense>
  );
}