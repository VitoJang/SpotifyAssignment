# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The builder shares this link with a small group — friends, and people evaluating their work (e.g. reviewing a portfolio). Their job: search Spotify's public catalog for songs and albums, browse tabbed results, and scroll for more, with no account or login of their own required.

## Product Purpose

A working, polished demonstration of building a real search experience against a third-party API (Spotify): type a query, get server-rendered results for songs or albums, keep scrolling for more. It exists to be shared as evidence of the builder's craft, not to serve daily music discovery at scale.

## Positioning

Not competing with a music app — the differentiation is against other portfolio demos. It goes past "it works" into "it feels right": results are server-rendered (shareable, bookmarkable URLs, not a client-side spinner-then-fetch), motion is deliberate and tuned (respects reduced motion, restrained rather than decorative-everywhere), and the Spotify API integration keeps credentials server-side correctly rather than the common shortcut of leaking them to the browser.

## Operating Context

A single page, opened via a shared link on desktop or mobile. No visitor login or Spotify account needed — the app authenticates to Spotify itself (Client Credentials flow, app-level token) and proxies search for every visitor.

## Capabilities and Constraints

- Search covers Spotify's public catalog only: tracks and albums, one type at a time via tabs. No per-user Spotify login, no access to anyone's personal library, saved tracks, or playback.
- Pagination is infinite-scroll, capped at Spotify's `/search` `limit` of 10 per request (a real API constraint, not a product choice).
- Requires a real Spotify Client ID/Secret to run, held server-side only.
- Because the app's own Spotify app credentials serve every visitor, the shared rate limit is pooled across everyone who has the link — undecided whether that ever needs addressing at this audience size.
- No test framework: non-trivial logic gets a small `node:assert` self-check run via `tsx`.

## Evidence on Hand

None. No user testimonials, usage data, or case studies exist — future work must not invent any.

## Product Principles

- It has to actually work end-to-end against the live Spotify API — a demo that's broken or backed by fake data undercuts the point of showing it.
- Craft is the point, not a bonus: visitors are implicitly evaluating the builder, so motion, accessibility, and performance decisions carry as much weight as the search feature itself.
- Never expose Spotify credentials to the browser — the demo's credibility depends on this being done right, not just on the feature working.
- Stay scoped to public catalog search. Adding user login / personal libraries would prove a different (OAuth consent) skill than this demo is built to show, for a cost and risk disproportionate to a shared link.

## Accessibility & Inclusion

No formal standard was set, but the current build already treats it as a baseline worth getting right for a craft-focused piece: real `prefers-reduced-motion` handling (including for JS-driven motion, not just CSS), visible keyboard focus states, and touch-safe interaction gating are expected of new work here, not optional polish.
