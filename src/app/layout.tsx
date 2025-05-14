 
// // import Navbar from '@/components/Navbar';
// // import './globals.css';

// // export default function RootLayout({ children }: { children: React.ReactNode }) {
// //   return (
// //     <html lang="id">
// //       <body className="bg-neutral-950 text-white">
// //         <Navbar />
// //         <main className="pt-16">{children}</main>
// //       </body>
// //     </html>
// //   );
// // }

// import './globals.css';
// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import { TranslationProvider } from '@/components/TranslationProvider';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'JustAnimeHub',
//   description: 'Discover Your Favorite Anime!',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className}>
//         <TranslationProvider>
//           {children}
//         </TranslationProvider>
//       </body>
//     </html>
//   );
// }

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Tambahkan type untuk RootLayoutProps jika perlu
export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = params?.lang ?? 'en'; // fallback jika gak ada

  return (
    <html lang={lang} className="dark">
      <body className="min-h-screen bg-neutral-950 text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
