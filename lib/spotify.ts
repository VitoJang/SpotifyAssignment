// Server-only: talks to Spotify using the Client Credentials flow (app-level
// auth, no user login) since this app only needs public catalog search.
import type { Album, SearchType, Track } from "./spotify-types";

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET env vars");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`Spotify auth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  // ponytail: in-memory cache, resets per server instance/cold start — fine for
  // one app; move to a shared cache (Redis) only if deployed multi-instance
  // with heavy search traffic.
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // refresh 1min early
  };
  return cachedToken.token;
}

// Spotify Feb 2026: /search limit max is 10 (was 50). Larger values return
// 400 Invalid limit.
export const SEARCH_LIMIT = 10;

export async function searchSpotify(
  query: string,
  type: SearchType,
  offset = 0,
  limit = SEARCH_LIMIT,
): Promise<{ items: (Track | Album)[]; total: number }> {
  const token = await getAccessToken();
  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", query);
  url.searchParams.set("type", type);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Spotify search failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data[type === "track" ? "tracks" : "albums"];
}

// Exposed only so lib/spotify.test.ts can exercise the cache branches directly.
export const _internal = {
  getAccessToken,
  setCacheForTest(token: string, expiresAt: number) {
    cachedToken = { token, expiresAt };
  },
};
