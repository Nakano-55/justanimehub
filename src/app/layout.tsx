import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = params?.lang ?? 'en';

  return (
    <html lang={lang} className="dark">
      <body className="min-h-screen bg-neutral-950 text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}