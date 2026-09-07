// Plain types + pure helpers shared by server and client code. No network
// calls or secrets here — lib/spotify.ts (server-only) is kept separate so
// client components never risk bundling it.

export type SearchType = "track" | "album";

interface Image {
  url: string;
}

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: Image[] };
}

export interface Album {
  id: string;
  name: string;
  artists: { name: string }[];
  images: Image[];
}

export interface CardProps {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
}

export function toCardProps(item: Track | Album, type: SearchType): CardProps {
  if (type === "track") {
    const t = item as Track;
    return {
      id: t.id,
      title: t.name,
      subtitle: t.artists.map((a) => a.name).join(", "),
      image: t.album.images[0]?.url,
    };
  }
  const a = item as Album;
  return {
    id: a.id,
    title: a.name,
    subtitle: a.artists.map((ar) => ar.name).join(", "),
    image: a.images[0]?.url,
  };
}
