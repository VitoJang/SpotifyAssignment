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
  const reducedMotion = usePrefersReducedMotion();
  const hasMore = items.length < total;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // loadMore reads latest length via itemsRef; omit it from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, query, type]);

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
    <motion.div
      key={type}
      initial={reducedMotion ? false : { opacity: 0, y: 12, filter: "brightness(0.92) saturate(0.85)" }}
      animate={{ opacity: 1, y: 0, filter: "brightness(1) saturate(1)" }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid">
        {items.map((item, i) => {
          const card = toCardProps(item, type);
          return (
            <motion.div
              className="tile"
              key={card.id}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.28,
                delay: reducedMotion ? 0 : Math.min(i, 9) * 0.04,
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
    </motion.div>
  );
}
