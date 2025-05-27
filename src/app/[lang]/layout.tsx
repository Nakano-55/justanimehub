import { Suspense } from 'react';
import { LanguageProvider } from '@/components/LanguageProvider';
import { TranslationProvider } from '@/components/TranslationProvider';
import { GamificationProvider } from '@/components/GamificationProvider';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ClientLayout } from '@/components/ClientLayout';
import type { Language } from '@/lib/i18n/types';

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: Language }>;
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LanguageProvider lang={lang}>
        <TranslationProvider>
          <GamificationProvider>
            <ClientLayout>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="pt-16 flex-1">{children}</main>
                <Footer />
              </div>
            </ClientLayout>
          </GamificationProvider>
        </TranslationProvider>
      </LanguageProvider>
    </Suspense>
  );
}