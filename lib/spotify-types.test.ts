// Minimal self-check for the track/album -> card normalization branch.
// Run with: npm test
import assert from "node:assert";
import { toCardProps, type Album, type Track } from "./spotify-types";

const track: Track = {
  id: "t1",
  name: "Song A",
  artists: [{ name: "Artist A" }, { name: "Artist B" }],
  album: { images: [{ url: "http://img/track.jpg" }] },
};
const trackCard = toCardProps(track, "track");
assert.strictEqual(trackCard.title, "Song A");
assert.strictEqual(trackCard.subtitle, "Artist A, Artist B");
assert.strictEqual(trackCard.image, "http://img/track.jpg");

const album: Album = {
  id: "a1",
  name: "Album A",
  artists: [{ name: "Artist C" }],
  images: [{ url: "http://img/album.jpg" }],
};
const albumCard = toCardProps(album, "album");
assert.strictEqual(albumCard.title, "Album A");
assert.strictEqual(albumCard.subtitle, "Artist C");
assert.strictEqual(albumCard.image, "http://img/album.jpg");

console.log("lib/spotify-types.test.ts: OK");
