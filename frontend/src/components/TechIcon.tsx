import {
  siCelery, siDjango, siDocker, siExpress, siFlask, siGit, siGithub, siGithubactions,
  siJavascript, siJest, siLinux, siMariadb, siMysql, siNodedotjs, siPostgresql, siPrisma,
  siPython, siReact, siReactquery, siRedis, siTailwindcss, siTypescript, siVite,
  type SimpleIcon,
} from "simple-icons";

/** tech_stack is free text in the admin, so match on a normalised key. */
const ICONS: Record<string, SimpleIcon> = {
  react: siReact,
  reactjs: siReact,
  typescript: siTypescript,
  ts: siTypescript,
  javascript: siJavascript,
  js: siJavascript,
  python: siPython,
  django: siDjango,
  drf: siDjango,
  djangorestframework: siDjango,
  djangochannels: siDjango,
  djangocotton: siDjango,
  flask: siFlask,
  celery: siCelery,
  redis: siRedis,
  mysql: siMysql,
  mariadb: siMariadb,
  postgresql: siPostgresql,
  postgres: siPostgresql,
  prisma: siPrisma,
  express: siExpress,
  expressjs: siExpress,
  node: siNodedotjs,
  nodejs: siNodedotjs,
  vite: siVite,
  tailwind: siTailwindcss,
  tailwindcss: siTailwindcss,
  tanstackquery: siReactquery,
  reactquery: siReactquery,
  jest: siJest,
  docker: siDocker,
  git: siGit,
  github: siGithub,
  githubactions: siGithubactions,
  cicd: siGithubactions,
  linux: siLinux,
};

const key = (label: string) => label.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Brand colours are picked for white backgrounds; the site is near-black, so
 *  lift anything too dark to stay readable. */
function readable(hex: string): string {
  const n = parseInt(hex, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (lum < 0.42) {
    const k = 0.42 / Math.max(lum, 0.04);
    r = Math.min(255, Math.round(r * k + 70));
    g = Math.min(255, Math.round(g * k + 70));
    b = Math.min(255, Math.round(b * k + 70));
  }
  return `rgb(${r},${g},${b})`;
}

export function TechIcon({ label, size = 15 }: { label: string; size?: number }) {
  const icon = ICONS[key(label)];
  if (!icon) return null;
  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={readable(icon.hex)}
      style={{ flex: "0 0 auto" }}
    >
      <path d={icon.path} />
    </svg>
  );
}

/** The stack list used on the project page: icon + name, one chip per tech. */
export function TechChips({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap" style={{ gap: 8 }}>
      {stack.map((s) => (
        <span
          key={s}
          className="inline-flex items-center font-mono"
          style={{
            gap: 7,
            fontSize: 12,
            color: "#cdd3e6",
            border: "1px solid rgba(255,255,255,.13)",
            background: "rgba(255,255,255,.03)",
            borderRadius: 7,
            padding: "6px 11px",
          }}
        >
          <TechIcon label={s} />
          {s}
        </span>
      ))}
    </div>
  );
}
