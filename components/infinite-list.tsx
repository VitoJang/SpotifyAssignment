"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import TiltedCard from "@/components/TiltedCard";
import { toCardProps, type Album, type SearchType, type Track } from "@/lib/spotify-types";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

// Flat gray placeholder for the rare item with no artwork.
const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23888'/%3E%3C/svg%3E";

export function InfiniteList({
  query,
  type,
  initialItems,
  initialTotal,
}: {
  query: string;
  type: SearchType;
  initialItems: (Track | Album)[];
  initialTotal: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  // Items up to this count came from the server render — never hide them
  // behind a JS entrance animation, or a slow/no-JS hydration leaves the
  // (already-visible-in-the-HTML) results invisible. Only items loaded
  // afterward, via scroll, get the fade-in.
  const initialCountRef = useRef(initialItems.length);
  const reducedMotion = usePrefersReducedMotion();
  const hasMore = items.length < total;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore();
      },
      // Prefetch a bit before the fold; keep this modest so wide grids
      // don't treat the whole page as "already at the bottom."
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Re-subscribe when `items.length` changes. IntersectionObserver only
    // fires on *transitions*; on a 4-col grid each page adds little height
    // so the sentinel can stay intersecting and never re-fire. Calling
    // observe() again after a page loads re-checks and continues filling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, query, type, items.length]);

  async function loadMore() {
    // Sync lock: React state `loading` is too late to stop double IntersectionObserver fires.
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const offset = itemsRef.current.length;
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=${type}&offset=${offset}`,
      );
      const data = await res.json();
      const incoming = (data.items ?? []) as (Track | Album)[];
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id));
        const unique = incoming.filter((i) => !seen.has(i.id));
        return unique.length ? [...prev, ...unique] : prev;
      });
      if (typeof data.total === "number") setTotal(data.total);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <p className="status">No results.</p>;
  }

  return (
    <>
      <div className="grid">
        {items.map((item, i) => {
          const card = toCardProps(item, type);
          const isNewlyLoaded = i >= initialCountRef.current;
          const batchIndex = i - initialCountRef.current;
          return (
            <motion.div
              className="tile"
              key={card.id}
              initial={!isNewlyLoaded || reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.28,
                delay: reducedMotion ? 0 : Math.min(batchIndex, 9) * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <TiltedCard
                imageSrc={card.image ?? FALLBACK_IMAGE}
                altText={card.title}
                containerHeight="100%"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                scaleOnHover={reducedMotion ? 1 : 1.05}
                rotateAmplitude={reducedMotion ? 0 : 10}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent
                overlayContent={
                  <div className="tile-overlay">
                    <div className="tile-title">{card.title}</div>
                    <div className="tile-subtitle">{card.subtitle}</div>
                  </div>
                }
              />
            </motion.div>
          );
        })}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="load-more">
          {loading && (
            <>
              <span className="spinner" aria-hidden="true" />
              <span className="sr-only">Loading more results</span>
            </>
          )}
        </div>
      )}
    </>
  );
}
