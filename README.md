# Spotify Search

A Next.js take-home demo: search Spotify’s public catalog for **songs** or **albums**, with shareable URLs, infinite scroll, and deliberate motion. No visitor login — the app uses Spotify’s Client Credentials flow server-side.

## Live demo

**Deployed URL:** [https://spotify-assignment-ax6pbezfi-vitojibom-hotmailcoms-projects.vercel.app/](https://spotify-assignment-ax6pbezfi-vitojibom-hotmailcoms-projects.vercel.app/)

> Note: URLs that include a deployment hash (like `…-ax6pbezfi-…`) are often **preview** deployments and may show Vercel’s login page to outsiders. For interviewers, prefer the stable **Production** domain from the Vercel project (e.g. `spotify-assignment.vercel.app` or a custom domain) with Deployment Protection off for Production if you want the link to be public.

Spotify credentials are **not** in the repo. They are set as project environment variables in the Vercel dashboard:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

Those vars are available only to the server at runtime (page SSR + `/api/search`). The browser never sees them. Anyone with the deploy URL can search; they don’t need their own Spotify app.

After changing env vars on Vercel, **redeploy** so the new values take effect.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # or .env — both are gitignored
# fill in SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET from
# https://developer.spotify.com/dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test          # small node:assert self-checks (token cache + types)
npm run build     # production build
```

## How it works

- **Server Component page** reads `/?q=…&type=track|album`, calls Spotify, and SSRs the first page of results (refresh and back/forward keep the query).
- **Tabs** are real links, not client-only state — each switch is a fresh SSR for that type.
- **Infinite scroll** loads further pages via `/api/search?q=&type=&offset=` (`limit` is capped at **10** — Spotify’s Feb 2026 `/search` max).
- **Secrets stay on the server** in `lib/spotify.ts` (token + search). Client code only imports pure types/helpers from `lib/spotify-types.ts`.

## Design & tooling notes (Claude Code)

This project was built with [Claude Code](https://claude.ai/code), guided by agent skills rather than unconstrained codegen.

### Ponytail

A “lazy senior” / YAGNI skill used to keep diffs small and avoid over-engineering:

- Prefer native form GET + `searchParams` over a client search state machine for the first page.
- One type at a time for infinite scroll (tabs) instead of three independent cursors.
- Small `node:assert` self-checks instead of a heavy test framework.
- Explicit tradeoff comments where a shortcut has a known ceiling (e.g. in-memory token cache).

### Impeccable

A design / product craft skill used for UI quality:

- Design-oriented review on layout, motion, and readability (card overlays, tab affordances, reduced-motion).
- Prefer restrained motion that respects `prefers-reduced-motion` over decoration everywhere.

Together: **ponytail** kept the architecture small; **impeccable** kept the surface intentional. AI assisted implementation and review; product and security choices (server-only secrets, URL-driven search) were deliberate.

## Project layout

```
app/page.tsx              # SSR search + tabs
app/api/search/route.ts   # JSON pagination for infinite scroll
lib/spotify.ts            # Client Credentials + search (server-only)
lib/spotify-types.ts      # Shared types / card mapping (client-safe)
components/infinite-list.tsx
```

## Out of scope

OAuth / user libraries, playback, and per-visitor Spotify accounts — out of scope for this demo.