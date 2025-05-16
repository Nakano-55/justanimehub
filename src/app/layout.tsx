import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JustAnimeHub",
  description: "A collaborative anime encyclopedia with multilingual support",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark">
      <body className="min-h-screen bg-neutral-950 text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}