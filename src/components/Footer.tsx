'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { Heart, Github, Twitter } from 'lucide-react';

const translations = {
  en: {
    about: 'About',
    contact: 'Contact',
    guidelines: 'Guidelines',
    api: 'API',
    legal: 'Legal',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    copyright: '© 2025 JustAnimeHub. All rights reserved.',
    poweredBy: 'Powered by',
    jikanApi: 'Jikan API',
    followUs: 'Follow Us',
    madeWith: 'Made with',
    by: 'by anime enthusiasts',
  },
  id: {
    about: 'Tentang',
    contact: 'Kontak',
    guidelines: 'Panduan',
    api: 'API',
    legal: 'Legal',
    terms: 'Ketentuan Layanan',
    privacy: 'Kebijakan Privasi',
    copyright: '© 2025 JustAnimeHub. Hak cipta dilindungi.',
    poweredBy: 'Didukung oleh',
    jikanApi: 'Jikan API',
    followUs: 'Ikuti Kami',
    madeWith: 'Dibuat dengan',
    by: 'oleh penggemar anime',
  },
} as const;

export function Footer() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <footer className="bg-neutral-900/50 backdrop-blur-sm border-t border-neutral-800 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">JustAnimeHub</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${lang}/about`}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {t.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/contact`}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {t.contact}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/contribute/guidelines`}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {t.guidelines}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t.legal}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${lang}/terms`}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {t.terms}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/privacy`}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {t.privacy}
                </Link>
              </li>
              <li>
                <a
                  href="https://jikan.moe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {t.api}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t.followUs}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span>{t.poweredBy}</span>
              <a
                href="https://jikan.moe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                {t.jikanApi}
              </a>
            </div>
            <div className="flex items-center gap-2 mt-4 text-neutral-400">
              <span>{t.madeWith}</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>{t.by}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-center text-neutral-400">{t.copyright}</p>
        </div>
      </div>
    </footer>
  );
}