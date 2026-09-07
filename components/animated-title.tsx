"use client";

import ShinyText from "@/components/ShinyText";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

// One deliberate moment: a slow light-sweep across the wordmark, like light
// catching a record's lacquer — everything else on the page stays still.
export function AnimatedTitle({ text }: { text: string }) {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <ShinyText
      text={text}
      disabled={reducedMotion}
      speed={2.5}
      delay={6}
      color="var(--fg)"
      shineColor="var(--accent-color)"
    />
  );
}
