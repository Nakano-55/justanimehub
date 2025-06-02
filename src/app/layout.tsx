import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JustAnimeHub",
  description: "A collaborative anime encyclopedia with multilingual support",
};

export default function RootLayout({
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

// import "./globals.css";
// import { Toaster } from "@/components/ui/toaster";
// import { ThemeProvider } from "@/components/ThemeProvider";
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "JustAnimeHub",
//   description: "A collaborative anime encyclopedia with multilingual support",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           {children}
//           <Toaster />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }