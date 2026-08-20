import type { ReactNode } from "react";
import { rgba } from "@/lib/accent";

/** Inline marks: **bold**, `code`, [label](href).
 *  Deliberately small — the copy comes from the admin, not from user input. */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Links live inside bold often enough that the marks must nest, so bold and
  // italic re-run this function on their own contents.
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let n = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <strong key={`${key}-b${n}`} style={{ color: "#eaecf5", fontWeight: 600 }}>
          {inline(m[1], `${key}-b${n}`)}
        </strong>,
      );
    } else if (m[2] !== undefined) {
      out.push(
        <em key={`${key}-i${n}`} style={{ fontStyle: "italic" }}>
          {inline(m[2], `${key}-i${n}`)}
        </em>,
      );
    } else if (m[3] !== undefined) {
      out.push(
        <code
          key={`${key}-c${n}`}
          className="font-mono"
          style={{ fontSize: "0.9em", color: "#cdd3e6", background: "rgba(255,255,255,.06)", borderRadius: 5, padding: "2px 6px" }}
        >
          {m[3]}
        </code>,
      );
    } else {
      out.push(
        <a key={`${key}-a${n}`} href={m[5]} target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "underline" }}>
          {inline(m[4], `${key}-a${n}`)}
        </a>,
      );
    }
    last = m.index + m[0].length;
    n += 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Renders the case-study body written in the admin. Supports ##/### headings,
 *  "- " bullets and the inline marks above. Anything else stays a paragraph. */
export function Markdown({ text, hex }: { text: string; hex: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let bullets: string[] = [];

  const flushPara = () => {
    if (!para.length) return;
    const key = `p${blocks.length}`;
    blocks.push(
      <p key={key} style={{ margin: "0 0 16px", fontSize: 16, lineHeight: 1.75, color: "#9aa1b8" }}>
        {inline(para.join(" "), key)}
      </p>,
    );
    para = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    const key = `u${blocks.length}`;
    blocks.push(
      <div key={key} className="flex flex-col" style={{ gap: 12, margin: "0 0 20px" }}>
        {bullets.map((b, n) => (
          <div key={n} className="flex items-start" style={{ gap: 13 }}>
            <span style={{ flex: "0 0 auto", width: 6, height: 6, marginTop: 9, borderRadius: "50%", background: hex, boxShadow: `0 0 7px ${rgba(hex, 0.8)}` }} />
            <span style={{ fontSize: 15.5, lineHeight: 1.65, color: "#9aa1b8" }}>{inline(b, `${key}-${n}`)}</span>
          </div>
        ))}
      </div>,
    );
    bullets = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushBullets();
      flushPara();
      continue;
    }
    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushBullets();
      flushPara();
      const big = heading[1].length === 2;
      blocks.push(
        <h3
          key={`h${blocks.length}`}
          className="font-serif italic"
          style={{
            margin: blocks.length ? "clamp(28px,3.5vw,40px) 0 14px" : "0 0 14px",
            fontWeight: 400,
            fontSize: big ? "clamp(22px,2.5vw,29px)" : "clamp(18px,2vw,22px)",
            color: "#eaecf5",
          }}
        >
          {heading[2]}
        </h3>,
      );
      continue;
    }
    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      flushBullets();
      flushPara();
      const key = `q${blocks.length}`;
      blocks.push(
        <blockquote
          key={key}
          style={{ margin: "0 0 18px", borderLeft: `3px solid ${rgba(hex, 0.5)}`, paddingLeft: 16, fontSize: 15.5, lineHeight: 1.7, color: "#aab0c6" }}
        >
          {inline(quote[1], key)}
        </blockquote>,
      );
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushPara();
      bullets.push(bullet[1]);
      continue;
    }
    flushBullets();
    para.push(line);
  }
  flushBullets();
  flushPara();

  return <>{blocks}</>;
}
