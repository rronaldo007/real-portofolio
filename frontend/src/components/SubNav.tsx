import Link from "next/link";
import { Logo } from "./Logo";

/** Sticky top bar for sub-pages: R² mark on the left, a back link on the right. */
export function SubNav({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <nav
      className="sticky top-0 flex items-center justify-between"
      style={{ zIndex: 50, padding: "18px clamp(20px,5vw,64px)", background: "rgba(7,9,15,.72)", backdropFilter: "blur(13px)", borderBottom: "1px solid rgba(255,255,255,.07)" }}
    >
      <Link href="/" aria-label="Accueil">
        <Logo />
      </Link>
      <Link href={backHref} className="inline-flex items-center font-mono uppercase" style={{ gap: 9, fontSize: 12, letterSpacing: "0.16em", color: "#9aa1b8" }}>
        ← {backLabel}
      </Link>
    </nav>
  );
}
