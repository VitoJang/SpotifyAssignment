// Minimal self-check for the token-cache logic in lib/spotify.ts.
// Run with: npm test
import assert from "node:assert";
import { _internal } from "./spotify";

async function main() {
  process.env.SPOTIFY_CLIENT_ID = "test-id";
  process.env.SPOTIFY_CLIENT_SECRET = "test-secret";

  let fetchCalls = 0;
  (global as any).fetch = async () => {
    fetchCalls++;
    return {
      ok: true,
      json: async () => ({ access_token: "new-token", expires_in: 3600 }),
    } as Response;
  };

  // Cached token not yet expired -> no network call, returns cached value.
  _internal.setCacheForTest("cached-token", Date.now() + 100_000);
  const stillCached = await _internal.getAccessToken();
  assert.strictEqual(stillCached, "cached-token");
  assert.strictEqual(fetchCalls, 0, "should not fetch while cache is valid");

  // Expired cache -> refetches and replaces the token.
  _internal.setCacheForTest("stale-token", Date.now() - 1_000);
  const refreshed = await _internal.getAccessToken();
  assert.strictEqual(refreshed, "new-token");
  assert.strictEqual(fetchCalls, 1, "should fetch exactly once when cache is expired");

  console.log("lib/spotify.test.ts: OK");
}

main();
