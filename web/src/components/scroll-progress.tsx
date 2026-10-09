"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${Math.min(1, Math.max(0, progress))})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-6 top-1/2 z-40 hidden h-40 w-px -translate-y-1/2 bg-black/25 md:block">
      <div
        ref={fillRef}
        className="absolute inset-x-0 top-0 h-full origin-top bg-black"
        style={{ transform: "scaleY(0)" }}
      />
    </div>
  );
}
