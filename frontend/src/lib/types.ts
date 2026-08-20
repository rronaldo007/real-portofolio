// Mirrors the JSON shape served by the DRF backend (backend/api/serializers.py).

export type Accent = "violet" | "cyan" | "lime" | "pink";

export interface SiteSettings {
  logo_text: string;
  logo_super: string;
  full_name: string;
  tagline: string;
  bio: string;
  location: string;
  timezone: string;
  availability: string;
  lat: string;
  lon: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  twitter_url: string;
  hero_prefix: string;
  hero_heading: string;
  hero_sub: string;
  accent_color: string;
  cv: string | null;
  photo: string | null;
}

export interface Section {
  key: string;
  nav_label: string;
  number: number;
  title: string;
  accent: Accent;
  order: number;
}

export interface ProjectShot {
  src: string | null;
  caption: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
  unit: string;
}

export interface SectionMedia {
  kind: "image" | "document";
  src: string | null;
  caption: string;
  name: string;
  size: string;
}

export interface ProjectSection {
  title: string;
  body: string;
  src: string | null;
  caption: string;
  media: SectionMedia[];
}

export interface Project {
  slug: string;
  name: string;
  category: string;
  year: string;
  accent: Accent;
  summary: string;
  lead: string;
  overview: string;
  role: string;
  stack: string[];
  highlights: string[];
  cover: string | null;
  live_url: string;
  repo_url: string;
  badge: string;
  is_featured: boolean;
  sections: ProjectSection[];
  shots: ProjectShot[];
  metrics: ProjectMetric[];
}

export interface Experience {
  title: string;
  company: string;
  when: string;
  location: string;
  description: string;
  highlights: string[];
  tags: string[];
  accent: Accent;
}

export interface Education {
  title: string;
  institution: string;
  rncp_level: string;
  status: string;
  focus: string;
  when: string;
  description: string;
  accent: Accent;
  is_target: boolean;
}

export interface Skill {
  name: string;
  category: "backend" | "frontend" | "tooling";
  tier: "primary" | "frequent" | "occasional";
  favorite: boolean;
}

export interface Testimonial {
  quote: string;
  author: string;
  author_role: string;
}

export interface Photo {
  src: string | null;
  caption: string;
  taken: string;
  span: string;
}

export interface Bootstrap {
  settings: SiteSettings;
  sections: Section[];
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  testimonials: Testimonial[];
  photos: Photo[];
}

export const ACCENT_HEX: Record<Accent, string> = {
  violet: "#9b6bff",
  cyan: "#2bf1ff",
  lime: "#c6ff3a",
  pink: "#ff7ad9",
};
