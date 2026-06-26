import type { Metadata } from "next";
import { getPhotos } from "@/lib/api";
import { SubNav } from "@/components/SubNav";
import { GalleryGrid } from "@/components/GalleryGrid";

export const metadata: Metadata = {
  title: "Galerie — Rukundo Ronaldo",
  description: "Art & photographie — un second regard sur le monde.",
};

export default async function GalleryPage() {
  const photos = await getPhotos();
  const count = (photos.filter((p) => p.src).length || 12);

  return (
    <div className="relative" style={{ minHeight: "100vh", background: "#05060B" }}>
      <SubNav backHref="/" backLabel="back to home" />

      <section className="mx-auto" style={{ maxWidth: 1280, padding: "clamp(46px,7vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)" }}>
        <div className="flex items-end justify-between flex-wrap" style={{ gap: 16, marginBottom: "clamp(34px,5vw,56px)" }}>
          <div>
            <div className="flex items-center font-mono uppercase" style={{ gap: 10, fontSize: 12, letterSpacing: "0.22em", color: "#5b6178", marginBottom: 14 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2BF1FF", boxShadow: "0 0 8px #2BF1FF" }} />
              <span>07 /</span> <span style={{ color: "#2BF1FF" }}>gallery</span>
            </div>
            <h1 className="m-0 font-serif italic" style={{ fontWeight: 400, fontSize: "clamp(48px,8.5vw,118px)", lineHeight: 0.9, letterSpacing: "-0.01em", color: "#eaecf5" }}>
              Art and photography
            </h1>
          </div>
          <div className="text-right font-mono" style={{ fontSize: 12, letterSpacing: "0.14em", color: "#5b6178", paddingBottom: 8 }}>
            <div className="uppercase" style={{ marginBottom: 6 }}>a second lens on the world</div>
            <div style={{ color: "#2BF1FF" }}>{count} frames</div>
          </div>
        </div>

        <GalleryGrid photos={photos} />
      </section>
    </div>
  );
}
