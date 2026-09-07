"use client";

import { useState } from "react";

interface Image {
  url: string;
}

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: Image[] };
}

interface Album {
  id: string;
  name: string;
  artists: { name: string }[];
  images: Image[];
}

interface SearchResponse {
  tracks?: { items: Track[] };
  albums?: { items: Album[] };
  error?: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data: SearchResponse = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Spotify Search</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs or albums..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="status">{error}</p>}

      {results?.tracks?.items && results.tracks.items.length > 0 && (
        <>
          <h2>Songs</h2>
          <div className="grid">
            {results.tracks.items.map((track) => (
              <div className="card" key={track.id}>
                <img src={track.album.images[0]?.url} alt={track.name} />
                <div className="card-info">
                  <div className="card-title">{track.name}</div>
                  <div className="card-subtitle">
                    {track.artists.map((a) => a.name).join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {results?.albums?.items && results.albums.items.length > 0 && (
        <>
          <h2>Albums</h2>
          <div className="grid">
            {results.albums.items.map((album) => (
              <div className="card" key={album.id}>
                <img src={album.images[0]?.url} alt={album.name} />
                <div className="card-info">
                  <div className="card-title">{album.name}</div>
                  <div className="card-subtitle">
                    {album.artists.map((a) => a.name).join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
