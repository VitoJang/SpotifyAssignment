import { searchSpotify } from "@/lib/spotify";

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
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q?.trim() ?? "";

  let results: SearchResponse | null = null;
  let error: string | null = null;
  if (query) {
    try {
      results = await searchSpotify(query);
    } catch (err) {
      console.error(err);
      error = "Search failed";
    }
  }

  return (
    <main>
      <h1>Spotify Search</h1>
      <form>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search songs, albums, or artists..."
        />
        <button type="submit">Search</button>
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
