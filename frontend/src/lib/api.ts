import type { Bootstrap, Project, Photo } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

/** Server-side fetch with ISR revalidation (indexable + reasonably fresh). */
async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export const getBootstrap = () => getJSON<Bootstrap>("/bootstrap/");
export const getProject = (slug: string) => getJSON<Project>(`/projects/${slug}/`);
export const getProjects = () => getJSON<Project[]>("/projects/");
export const getPhotos = () => getJSON<Photo[]>("/photos/");

export { BASE as API_BASE };
