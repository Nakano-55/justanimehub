/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/chechbox';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Copy,
} from 'lucide-react';

interface Example {
  title: string;
  content: string;
  why: string;
}

interface ExampleSection {
  title: string;
  items: Example[];
}

interface Section {
  title: string;
  items: string[];
}

interface TranslationType {
  title: string;
  subtitle: string;
  examples: {
    title: string;
    good: ExampleSection;
    bad: ExampleSection;
  };
  sections: {
    general: Section;
    format: Section;
    content: Section;
    prohibited: Section;
    workflow: Section;
    quality: Section;
  };
  tips: {
    title: string;
    items: string[];
  };
  copy: string;
  copied: string;
}

const translations = {
  en: {
    title: 'Contribution Guidelines',
    subtitle: 'Help us build a better anime community by following these guidelines',
    examples: {
      title: 'Examples',
      good: {
        title: 'Good Contributions',
        items: [
          {
            title: 'Clear and Concise',
            content: 'The anime explores themes of friendship and growth through its well-developed characters.',
            why: 'Specific, focused, and objective description'
          },
          {
            title: 'Properly Formatted',
            content: 'The story takes place in a futuristic Tokyo. The protagonist, Akira, discovers he has unique abilities that set him apart from others.',
            why: 'Well-structured with clear paragraph breaks'
          }
        ]
      },
      bad: {
        title: 'Poor Contributions',
        items: [
          {
            title: 'Too Subjective',
            content: 'This is literally the BEST anime ever!!! You HAVE to watch it!!!',
            why: 'Overly emotional and lacks objective information'
          },
          {
            title: 'Poorly Formatted',
            content: 'the story is about a boy who gets powers and fights bad guys...its really cool and has awesome fight scenes!!!!!!',
            why: 'Poor grammar, formatting, and lack of detail'
          }
        ]
      }
    },
    sections: {
      general: {
        title: 'General Guidelines',
        items: [
          'Write in clear, simple language that\'s easy to understand',
          'Be respectful and constructive in your contributions',
          'Avoid duplicate submissions',
          'Check your spelling and grammar before submitting'
        ]
      },
      format: {
        title: 'Formatting Guidelines',
        items: [
          'Use proper paragraphs with clear breaks between ideas',
          'Keep sentences concise and to the point',
          'Use appropriate capitalization and punctuation',
          'Avoid excessive formatting or special characters'
        ]
      },
      content: {
        title: 'Content Guidelines',
        items: [
          'Focus on factual, objective information',
          'Avoid personal opinions or subjective statements',
          'Include relevant details but avoid unnecessary information',
          'Cite sources when possible'
        ]
      },
      prohibited: {
        title: 'Prohibited Content',
        items: [
          'Spoilers without proper warnings',
          'Offensive or discriminatory language',
          'Personal information or private details',
          'Promotional or commercial content'
        ]
      },
      workflow: {
        title: 'Contribution Workflow',
        items: [
          'Submit translations in the target language',
          'Wait for moderator review (usually within 24-48 hours)',
          'Receive notification when your contribution is approved/rejected',
          'If rejected, users may submit a revised version based on the platform guidelines'
        ]
      },
      quality: {
        title: 'Quality Standards',
        items: [
          'Maintain consistency with existing content style',
          'Ensure translations are culturally appropriate',
          'Use proper terminology for anime-specific terms',
          'Verify accuracy against original source material'
        ]
      },
      review: {
        title: 'Review Process',
        items: [
          'All contributions are reviewed by our moderation team',
          'Reviews typically take 24-48 hours to complete',
          'You will receive email notifications about review status',
          'Approved content becomes immediately visible to all users'
        ]
      }
    },
    tips: {
      title: 'Pro Tips',
      items: [
        'Use official translations as reference when available',
        'Consider cultural context when translating',
        'Keep a glossary of common terms',
        'Review your translation after a short break'
      ]
    },
    copy: 'Copy',
    copied: 'Copied!'
  },
  id: {
    title: 'Pedoman Kontribusi',
    subtitle: 'Bantu kami membangun komunitas anime yang lebih baik dengan mengikuti pedoman ini',
    examples: {
      title: 'Contoh',
      good: {
        title: 'Kontribusi yang Baik',
        items: [
          {
            title: 'Jelas dan Ringkas',
            content: 'Anime ini mengeksplorasi tema persahabatan dan pertumbuhan melalui karakter-karakter yang dikembangkan dengan baik.',
            why: 'Deskripsi yang spesifik, fokus, dan objektif'
          },
          {
            title: 'Format yang Tepat',
            content: 'Cerita ini berlatar di Tokyo masa depan. Protagonis, Akira, menemukan bahwa dia memiliki kemampuan unik yang membedakannya dari yang lain.',
            why: 'Terstruktur dengan baik dengan jeda paragraf yang jelas'
          }
        ]
      },
      bad: {
        title: 'Kontribusi yang Buruk',
        items: [
          {
            title: 'Terlalu Subjektif',
            content: 'Ini LITERALLY anime TERBAIK!!! Kalian HARUS nonton!!!',
            why: 'Terlalu emosional dan kurang informasi objektif'
          },
          {
            title: 'Format Buruk',
            content: 'ceritanya tentang anak yg dapet kekuatan trus berantem sama penjahat...seru bgt ada adegan berantem keren!!!!!!',
            why: 'Tata bahasa buruk, format tidak tepat, dan kurang detail'
          }
        ]
      }
    },
    sections: {
      general: {
        title: 'Pedoman Umum',
        items: [
          'Tulis dalam bahasa yang jelas dan mudah dipahami',
          'Bersikap hormat dan konstruktif dalam kontribusi Anda',
          'Hindari pengiriman duplikat',
          'Periksa ejaan dan tata bahasa sebelum mengirim'
        ]
      },
      format: {
        title: 'Pedoman Format',
        items: [
          'Gunakan paragraf yang tepat dengan jeda yang jelas antar ide',
          'Buat kalimat yang ringkas dan tepat sasaran',
          'Gunakan kapitalisasi dan tanda baca yang tepat',
          'Hindari format berlebihan atau karakter khusus'
        ]
      },
      content: {
        title: 'Pedoman Konten',
        items: [
          'Fokus pada informasi faktual dan objektif',
          'Hindari opini pribadi atau pernyataan subjektif',
          'Sertakan detail yang relevan tapi hindari informasi yang tidak perlu',
          'Cantumkan sumber jika memungkinkan'
        ]
      },
      prohibited: {
        title: 'Konten yang Dilarang',
        items: [
          'Spoiler tanpa peringatan yang tepat',
          'Bahasa yang ofensif atau diskriminatif',
          'Informasi pribadi atau detail privat',
          'Konten promosi atau komersial'
        ]
      },
      workflow: {
        title: 'Alur Kerja Kontribusi',
        items: [
          'Kirim terjemahan dalam bahasa target',
          'Tunggu peninjauan moderator (biasanya 24-48 jam)',
          'Terima notifikasi saat kontribusi disetujui/ditolak',
          'Jika ditolak, pengguna dapat mengirim ulang versi terjemahan lain sesuai kebijakan yang berlaku.'
        ]
      },
      quality: {
        title: 'Standar Kualitas',
        items: [
          'Pertahankan konsistensi dengan gaya konten yang ada',
          'Pastikan terjemahan sesuai secara budaya',
          'Gunakan terminologi yang tepat untuk istilah khusus anime',
          'Verifikasi akurasi terhadap materi sumber asli'
        ]
      },
      review: {
        title: 'Proses Review',
        items: [
          'Semua kontribusi ditinjau oleh tim moderasi kami',
          'Review biasanya memakan waktu 24-48 jam',
          'Anda akan menerima notifikasi email tentang status review',
          'Konten yang disetujui langsung terlihat oleh semua pengguna'
        ]
      }
    },
    tips: {
      title: 'Tips Pro',
      items: [
        'Gunakan terjemahan resmi sebagai referensi jika tersedia',
        'Pertimbangkan konteks budaya saat menerjemahkan',
        'Buat daftar istilah umum',
        'Tinjau terjemahan Anda setelah istirahat sejenak'
      ]
    },
    copy: 'Salin',
    copied: 'Tersalin!'
  }
} as const;

export default function GuidelinesPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(text);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl text-neutral-400">{t.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <ThumbsUp className="w-6 h-6 text-green-500" />
                {t.examples.good.title}
              </h2>
              <div className="space-y-6">
                {t.examples.good.items.map((example: Example, index: number) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-medium text-green-400">{example.title}</h3>
                    <div className="bg-neutral-800 rounded-lg p-4 relative group">
                      <p className="text-neutral-300">{example.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopy(example.content)}
                      >
                        {copiedExample === example.content ? (
                          <span className="text-green-400">{t.copied}</span>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-neutral-500">{example.why}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <ThumbsDown className="w-6 h-6 text-red-500" />
                {t.examples.bad.title}
              </h2>
              <div className="space-y-6">
                {t.examples.bad.items.map((example: Example, index: number) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-medium text-red-400">{example.title}</h3>
                    <div className="bg-neutral-800 rounded-lg p-4">
                      <p className="text-neutral-300">{example.content}</p>
                    </div>
                    <p className="text-sm text-neutral-500">{example.why}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {Object.entries(t.sections).map(([key, section]: [string, Section]) => (
              <Card key={key} className="bg-neutral-900 border-neutral-800 p-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  {key === 'prohibited' ? (
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  ) : key === 'quality' ? (
                    <CheckCircle2 className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <CheckCircle2 className={`w-6 h-6 ${
                      key === 'general' ? 'text-green-500' :
                      key === 'format' ? 'text-violet-500' :
                      'text-blue-500'
                    }`} />
                  )}
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.items.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-neutral-300">
                      {key === 'prohibited' ? (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      ) : key === 'quality' ? (
                        <span className="text-yellow-500">•</span>
                      ) : (
                        <span className={
                          key === 'general' ? 'text-green-500' :
                          key === 'format' ? 'text-violet-500' :
                          'text-blue-500'
                        }>•</span>
                      )}
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <h2 className="text-2xl font-semibold mb-4">{t.sections.workflow.title}</h2>
              <div className="space-y-4">
                {t.sections.workflow.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center">
                      {index + 1}
                    </div>
                    <p className="text-neutral-300">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                {t.sections.review.title}
              </h2>
              <ul className="space-y-3">
                {t.sections.review.items.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-neutral-300">
                    <CheckCircle2 className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <h2 className="text-2xl font-semibold mb-4">{t.tips.title}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {t.tips.items.map((tip, index) => (
                <div key={index} className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-neutral-300">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}