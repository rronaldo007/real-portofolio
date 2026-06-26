import type { Metadata } from "next";
import { Instrument_Serif, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Preloader } from "@/components/Preloader";

// Three type voices, self-hosted by next/font (no external request, no FOUT).
const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const sans = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rukundo Ronaldo — Développeur Fullstack",
  description:
    "Portfolio de Rukundo Ronaldo, développeur fullstack (Django) basé à Lyon. " +
    "Projets, parcours et formation — en route vers l'IA & la data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${serif.variable} ${sans.variable} ${mono.variable} antialiased`}
    >
      <body>
        <Preloader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
