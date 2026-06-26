import type { Bootstrap, Project, Photo } from "./types";

// Server-side only: fetch the Django backend directly at its internal origin
// (the browser uses /api on this app's origin, proxied via next.config rewrites).
const BASE = `${process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8001"}/api`;

/** Server-side fetch with ISR revalidation (indexable + reasonably fresh).
 *  On-demand revalidation (admin save -> /revalidate) keeps it fresh sooner. */
async function getJSON<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { next: { revalidate: 300 } });
  } catch (e) {
    throw new Error(`Backend unreachable at ${BASE}${path}: ${(e as Error).message}`);
  }
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export const getBootstrap = () => getJSON<Bootstrap>("/bootstrap/");
export const getProject = (slug: string) => getJSON<Project>(`/projects/${slug}/`);
export const getProjects = () => getJSON<Project[]>("/projects/");
export const getPhotos = () => getJSON<Photo[]>("/photos/");
