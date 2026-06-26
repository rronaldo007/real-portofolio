import type { Metadata } from "next";
import { Instrument_Serif, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Preloader } from "@/components/Preloader";
import { getBootstrap } from "@/lib/api";

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

// Built from the DB so the social preview + favicon are Rukundo's own photo.
// metadataBase makes the relative /media/… path absolute for crawlers (og:image
// must be absolute). Falls back to static metadata if the API is unreachable.
export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rukundo-ronaldo.fr";
  const title = "Rukundo Ronaldo — Développeur Fullstack";
  const description =
    "Portfolio de Rukundo Ronaldo, développeur fullstack (Django) basé à Lyon. " +
    "Projets, parcours et formation — en route vers l'IA & la data.";

  let photo: string | null = null;
  let name = "Rukundo Ronaldo";
  try {
    const { settings } = await getBootstrap();
    photo = settings.photo;
    name = settings.full_name || name;
  } catch {
    // API down during render — ship the text metadata without the photo.
  }

  return {
    metadataBase: new URL(base),
    title,
    description,
    openGraph: {
      title,
      description,
      url: base,
      siteName: name,
      locale: "fr_FR",
      type: "website",
      images: photo ? [{ url: photo, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: photo ? [photo] : undefined,
    },
    icons: photo ? { icon: photo, apple: photo } : undefined,
  };
}

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
        {children}
      </body>
    </html>
  );
}
