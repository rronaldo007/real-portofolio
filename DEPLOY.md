# Deploy (v2) — Sevalla

v2 is **two services**: a Django backend (API + admin) and a Next.js frontend
(the public site). The frontend is the public origin and **proxies** `/api`,
`/admin`, `/static`, `/media` to the backend, so visitors only ever hit one URL.

```
rukundo-ronaldo.fr  ──>  frontend (Next, public)  ──proxy──>  backend (Django, internal)
                                                              SQLite on a persistent disk
```

## 1. Backend service (Django)

- **Build:** `backend/Dockerfile` (Gunicorn + WhiteNoise; runs `migrate` on start).
- **Port:** honors `$PORT`.
- **Persistent disk:** mount at `/app/data` (holds `db.sqlite3` + uploaded media).
- **Env:**
  | var | value |
  |---|---|
  | `DJANGO_SECRET_KEY` | a real secret |
  | `DJANGO_DEBUG` | `False` |
  | `DJANGO_ALLOWED_HOSTS` | the backend's internal host, `127.0.0.1` |
  | `DJANGO_CSRF_TRUSTED_ORIGINS` | `https://rukundo-ronaldo.fr` |
  | `DJANGO_CORS_ALLOWED_ORIGINS` | `https://rukundo-ronaldo.fr` |
  | `FRONTEND_REVALIDATE_URL` | `https://rukundo-ronaldo.fr/revalidate` |
  | `FRONTEND_REVALIDATE_SECRET` | a shared secret (same as the frontend's) |

`migrate` on start applies the additive v2 migrations to the existing prod DB
(adds Section/Photo/accent/phone fields, seeds the nav Sections). Existing
content is preserved; set per-project **accents/categories** in the admin
afterward (they default to violet).

## 2. Frontend service (Next.js) — the public one

- **Build:** `frontend/Dockerfile` (standalone; the build needs **no** backend).
- **Port:** honors `$PORT` (binds `0.0.0.0`).
- **Domain:** point `rukundo-ronaldo.fr` here.
- **Env:**
  | var | value |
  |---|---|
  | `BACKEND_ORIGIN` | the backend service's internal URL, e.g. `http://<backend-host>:<port>` (or its Sevalla URL if no private network) |
  | `REVALIDATE_SECRET` | same shared secret as the backend's `FRONTEND_REVALIDATE_SECRET` |

## 3. Go live

1. Merge `feature/v2-mission-control` → the branch Sevalla deploys (or point
   Sevalla at the branch). **This replaces the live site** — verify on a
   preview/staging URL first if possible.
2. Deploy the **backend** service, confirm `/admin/` works on its URL.
3. Deploy the **frontend** service with `BACKEND_ORIGIN` set; confirm the site,
   then `…/admin` (login proxies through), `…/api/bootstrap/`.

## Known caveats

- **CV download:** `SiteProfile.resume_url` is `/static/cv/...pdf`, but WhiteNoise
  hashes static filenames in production (`...<hash>.pdf`), so that path 404s.
  Fix before relying on the button: upload the CV via the admin as media and set
  `resume_url` to `/media/...`, or use an absolute external URL.
- **First deploy is untested against Sevalla** — the build is validated locally,
  but service-to-service networking / env may need one round of tweaks.
