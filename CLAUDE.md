# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm run dev            # dev server
npm run build           # production build (does NOT need real Spotify creds — the
                         # only route is fully dynamic via searchParams, nothing
                         # is statically prerendered against the live API)
npm start                # serve a production build
npm test                 # runs both self-checks (plain node:assert, no framework):
                          #   tsx lib/spotify.test.ts
                          #   tsx lib/spotify-types.test.ts
npx tsc --noEmit          # type-check (not wired into package.json)
```

Real Spotify credentials only matter at runtime (`npm run dev` / `npm start`), read from `.env` (gitignored): `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`.

## Architecture

Single-route Next.js App Router app: type a query, browse Spotify's public catalog (tracks or albums, one type at a time) with infinite scroll. No user login — Spotify Client Credentials flow (app-level token, not tied to a person).

**`lib/spotify.ts` vs `lib/spotify-types.ts` — this split is deliberate, not incidental.** `lib/spotify.ts` holds the only code that touches `SPOTIFY_CLIENT_SECRET` and calls Spotify's API (token fetch + in-memory cache, `searchSpotify()`); it must only ever be imported from server code (the page, the API route). `lib/spotify-types.ts` holds the plain types and the pure `toCardProps()` normalizer with zero network/secret code, safe to import from client components (`components/infinite-list.tsx` does). Keep new server-only logic out of the shared file, and don't import `lib/spotify.ts` from a client component — it pulls a needlessly large server module into the client bundle even though the secret itself won't leak.

`SEARCH_LIMIT = 10` in `lib/spotify.ts` is not arbitrary — Spotify's `/search` endpoint capped `limit` at 10 as of Feb 2026 (was 50); a higher value 400s.

**Search flow**: `app/page.tsx` is an async Server Component reading the `q`/`type` searchParams and calling `searchSpotify(query, type)` directly — this SSRs the first page of whichever tab is active (verify with `curl "/?q=x&type=track"` and grep the HTML for result markup, not with devtools network tab). Tabs are real `next/link`s that change `?type=`, not client state, so switching tabs is a fresh SSR, not a client fetch. `components/infinite-list.tsx` (client) takes over from there: it owns pagination past page one, hitting `app/api/search/route.ts` (the only JSON endpoint, `?q=&type=&offset=`) as the user scrolls. It's keyed by `` `${type}:${query}` `` in the parent so a new search/tab remounts it instead of needing manual state-reset logic.

**UI components come from two shadcn-CLI-compatible registries** (see `components.json`): the default shadcn registry (`components/ui/*`, e.g. `tabs.tsx` — built on Base UI, not Radix; note `render={<Link/>}` + `nativeButton={false}` instead of Radix's `asChild`) and `@react-bits` (`https://reactbits.dev/r/{name}.json`) for the animated pieces (`components/ShinyText.tsx`, `components/TiltedCard.tsx`, both using the `motion` package). Install new ones with `npx shadcn@latest add <name>` or `npx shadcn@latest add @react-bits/<Component>-TS-TW`; don't hand-port them from the react-bits site, the registry pull already gives the TS+Tailwind variant with deps wired.

**`app/globals.css` mixes two token namespaces on purpose**: hand-written custom properties for this app's own look (`--bg`, `--fg`, `--accent-color`, `--muted-text`) alongside shadcn/Tailwind v4's own tokens (`--background`, `--muted`, `--accent`, etc., under `@theme inline`). The app's own tokens are named to avoid colliding with shadcn's — `shadcn init` already once silently overwrote a same-named `--accent`/`--muted` pair and broke the button color. Don't rename the app's tokens back to the shorter `--accent`/`--muted` names.

**Reduced motion requires an explicit runtime check**, not just CSS: the `prefers-reduced-motion` media query in `globals.css` doesn't stop the Motion-library-driven animations in the react-bits components (they update via spring/rAF, not CSS transitions). `lib/use-reduced-motion.ts` exposes the real check; components pass it through as `disabled`/zero-amplitude props (see `components/animated-title.tsx`, `components/infinite-list.tsx`) rather than relying on the CSS rule alone.

**Testing convention**: no test framework. Non-trivial branch logic gets a co-located `<module>.test.ts` using plain `node:assert` and a `console.log(...": OK")`, run via `tsx`, wired into the `test` npm script.
