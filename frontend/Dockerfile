# syntax=docker/dockerfile:1
# Production image for the Next.js frontend (the public :8000 origin).
# Uses Next's standalone output so the runtime stays small.

FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Pages are force-dynamic, so the build needs no live backend.
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8000 \
    HOSTNAME=0.0.0.0
# Standalone bundles a minimal server + its own node_modules; static assets and
# public/ are not included by Next, so copy them alongside the server.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
RUN useradd --uid 1000 --create-home appuser && chown -R appuser /app
USER appuser
EXPOSE 8000
# Sevalla/Heroku inject $PORT, which the standalone server honors.
CMD ["node", "server.js"]
