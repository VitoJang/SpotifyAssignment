import Link from "next/link";
import { AnimatedTitle } from "@/components/animated-title";
import { InfiniteList } from "@/components/infinite-list";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchSpotify } from "@/lib/spotify";
import type { Album, SearchType, Track } from "@/lib/spotify-types";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const type: SearchType = params.type === "album" ? "album" : "track";

  let items: (Track | Album)[] = [];
  let total = 0;
  let error: string | null = null;
  if (query) {
    try {
      ({ items, total } = await searchSpotify(query, type));
    } catch (err) {
      console.error(err);
      error = "Search failed";
    }
  }

  const tabHref = (t: SearchType) =>
    `/?${new URLSearchParams({ ...(query && { q: query }), type: t })}`;

  return (
    <main data-type={type}>
      <h1>
        <AnimatedTitle text="Spotify Search" />
      </h1>
      <form>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search songs or albums..."
        />
        <input type="hidden" name="type" value={type} />
        <button type="submit">Search</button>
      </form>

      <Tabs value={type}>
        <TabsList className="mb-4">
          <TabsTrigger
            value="track"
            nativeButton={false}
            className="data-active:bg-[var(--accent-color)] data-active:text-[var(--accent-ink)] data-active:shadow-none dark:data-active:bg-[var(--accent-color)] dark:data-active:text-[var(--accent-ink)]"
            render={<Link href={tabHref("track")}>Songs</Link>}
          />
          <TabsTrigger
            value="album"
            nativeButton={false}
            className="data-active:bg-[var(--accent-color)] data-active:text-[var(--accent-ink)] data-active:shadow-none dark:data-active:bg-[var(--accent-color)] dark:data-active:text-[var(--accent-ink)]"
            render={<Link href={tabHref("album")}>Albums</Link>}
          />
        </TabsList>
      </Tabs>

      {error && <p className="status">{error}</p>}

      {query && !error && (
        <InfiniteList
          key={`${type}:${query}`}
          query={query}
          type={type}
          initialItems={items}
          initialTotal={total}
        />
      )}
    </main>
  );
}
