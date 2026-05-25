# Attaching a custom domain (OVH DNS → Sevalla)

How `rukundo-ronaldo.fr` was pointed at the Sevalla app `real-portofolio-71e88`.
Registrar/DNS: **OVH**. Host: **Sevalla** (Kinsta; custom hostnames run through **Cloudflare**).

**Decision:** the **apex** `rukundo-ronaldo.fr` is the primary/canonical URL. `www` is
optional and was **not** set up (bare apex is the modern norm for a personal site). See
"Adding www later" at the bottom if it's ever wanted.

The default `*.sevalla.app` URL keeps working as a fallback either way.

## Steps

### 1. Sevalla — add the custom domain
App → **Domains** → **Add custom domain** → enter `rukundo-ronaldo.fr` (no wildcard).
Sevalla immediately shows the DNS records to create. For a Cloudflare-backed custom
hostname these are:

| Purpose | Type | Name | Value (example — use what Sevalla shows) |
|---------|------|------|------------------------------------------|
| Ownership | TXT | `_cf-custom-hostname` | `1e7bca5c-2381-410e-869f-051a13820795` |
| SSL (Let's Encrypt) | TXT | `_acme-challenge` | `iNsgX9slccPgKWfjTKGC3ImzjbpG5XCBHU32QpUYY0E` |
| Point domain | A | `@` (apex) | `162.159.141.232` |

Notes:
- Sevalla issues an **A record** (a Cloudflare edge IP), so the apex works fine — no
  "can't CNAME the apex" problem.
- The `_acme-challenge` record may only appear **after** ownership is validated — reopen
  "Show DNS records" / hit "Refresh records" to reveal it.
- Tokens are per-domain and can rotate; always copy the live values from Sevalla.

### 2. OVH — edit the DNS zone  ⚠️ use TEXT MODE
OVH domain → **DNS zone**. The default zone has the apex pointed at OVH parking
(`@ A 213.186.33.5`) and a `www A 213.186.33.5` + parking TXTs.

You must **change the apex A** to Sevalla's IP and **add the two TXT** records. Leave
`MX`, `SPF`, and `ftp` records alone (email/other).

> **Gotcha that cost us time:** OVH's **"Add an entry" / "Edit the entry"** form is an
> ODS (web-component) widget that is flaky to drive (and easy to fill without ever
> reaching the final confirm — changes silently don't save). The reliable path is:
>
> **Actions on my zone → Edit in text mode** → edit the BIND text directly → **Import**.
> A green "configuration will be imported" banner = success. This committed every time.

Resulting apex lines in text mode (whitespace is flexible):

```
        IN A     162.159.141.232
        IN TXT     "v=spf1 include:mx.ovh.com -all"
        IN TXT     "1|www.rukundo-ronaldo.fr"
_cf-custom-hostname IN TXT "1e7bca5c-2381-410e-869f-051a13820795"
_acme-challenge IN TXT "iNsgX9slccPgKWfjTKGC3ImzjbpG5XCBHU32QpUYY0E"
```

### 3. Verify DNS reached OVH's authoritative nameservers
Don't trust your local resolver (it caches — see gotcha below). Query OVH directly:

```bash
dig +short @ns14.ovh.net rukundo-ronaldo.fr A          # → 162.159.141.232
dig +short @ns14.ovh.net _cf-custom-hostname.rukundo-ronaldo.fr TXT
dig +short @ns14.ovh.net _acme-challenge.rukundo-ronaldo.fr TXT
```

### 4. Sevalla — verify + SSL
Domains → **Show DNS records → Refresh records**. Status goes
**Verification → Active** as Sevalla validates the TXT records and Let's Encrypt issues
the cert. Typically a few minutes to ~30 min after DNS is live.

### 5. Sevalla — make the apex primary
Domains → apex row → **Open menu → Make primary domain → Continue**. This makes
`rukundo-ronaldo.fr` canonical; non-primary custom domains 301-redirect to it.

### 6. Django — allow the new host, then redeploy
The app rejects unknown hosts (`DEBUG=False`). In Sevalla **Environment variables**,
update (comma-separated, keep the `.sevalla.app` value):

- `DJANGO_ALLOWED_HOSTS` → `real-portofolio-71e88.sevalla.app,rukundo-ronaldo.fr,www.rukundo-ronaldo.fr`
- `DJANGO_CSRF_TRUSTED_ORIGINS` → `https://real-portofolio-71e88.sevalla.app,https://rukundo-ronaldo.fr,https://www.rukundo-ronaldo.fr`

Then **Deploy** (env-var changes need a redeploy). Settings support for this is already in
`config/settings.py` (`SECURE_PROXY_SSL_HEADER` + env-driven `CSRF_TRUSTED_ORIGINS`); the
local reference copy lives in the gitignored `.env.production`.

## Verifying it's actually live (and the #1 false alarm)

**Stale DNS cache.** The old OVH record had a 3600s (1h) TTL, so your own machine/browser
keeps resolving the *old* parking IP for up to an hour after the change — making the site
look broken ("connection reset" / parking page) when it's actually fine for everyone else.

Don't trust a plain browser visit until your cache expires. Instead:

```bash
# what the world sees (public resolvers)
dig +short @1.1.1.1 rukundo-ronaldo.fr A      # → 162.159.141.232

# fetch bypassing local cache by forcing the IP
curl -sS -o /dev/null -w "%{http_code} ssl:%{ssl_verify_result}\n" \
  --resolve rukundo-ronaldo.fr:443:162.159.141.232 https://rukundo-ronaldo.fr/
# → 200 ssl:0   (ssl_verify_result 0 = cert valid)
```

To test in a real browser before your cache clears: use a phone on mobile data, or an
incognito window after an OS DNS flush.

## Adding www later (optional)
1. Sevalla → Add custom domain `www.rukundo-ronaldo.fr` → copy its records (an A to a
   Sevalla IP + `_cf-custom-hostname.www` + `_acme-challenge.www` TXTs).
2. OVH text mode: repoint `www A` to that IP and add the two `www` TXTs.
3. Wait for Verification → Active. Since the apex is primary, Sevalla auto-301s
   `www → rukundo-ronaldo.fr`.

## See also
- `.claude/docs/` (this folder) and `CLAUDE.md` for the deploy overview.
- Deploy/runtime details: `Dockerfile` (binds gunicorn to `$PORT`; Sevalla ingress = 8080),
  persistent SQLite disk at `/app/data`, build strategy = **Dockerfile** (not Nixpacks).
