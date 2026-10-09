"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { animate, createScope, type Scope } from "animejs";

type Mode = "full" | "left" | "right";

const MODE_ORDER: Mode[] = ["full", "left", "right"];

function getModes(count: number, seed: string): Mode[] {
  let prev: Mode | null = null;
  const modes: Mode[] = [];
  for (let i = 0; i < count; i++) {
    let hash = i * 2654435761;
    for (let c = 0; c < seed.length; c++) {
      hash = (hash ^ seed.charCodeAt(c)) * 16777619;
    }
    const options = MODE_ORDER.filter((m) => m !== prev);
    const mode = options[Math.abs(hash) % options.length];
    modes.push(mode);
    prev = mode;
  }
  return modes;
}

export function ProjectGallery({
  images,
  alt,
  seed,
}: {
  images: string[];
  alt: string;
  seed: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);

  useEffect(() => {
    scope.current = createScope({ root: root.current! }).add(() => {
      const items = root.current!.querySelectorAll<HTMLElement>(".gallery-item");
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              animate(entry.target, {
                opacity: [0, 1],
                translateY: [24, 0],
                scale: [1.02, 1],
                duration: 1000,
                ease: "outQuint",
              });
              observer.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0 },
      );
      items.forEach((item) => observer.observe(item));
      return () => observer.disconnect();
    });
    return () => scope.current?.revert();
  }, []);

  const modes = getModes(images.length, seed);

  return (
    <div ref={root} className="flex flex-col gap-16 pb-24 md:gap-24">
      {images.map((image, i) => {
        const mode = modes[i];
        if (mode === "full") {
          return (
            <div key={image} className="gallery-item relative aspect-[4/3] w-full opacity-0 sm:aspect-[16/9] md:aspect-[21/9]">
              <Image
                src={image}
                alt={alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          );
        }
        return (
          <div
            key={image}
            className={`gallery-item flex opacity-0 px-6 md:px-12 ${mode === "left" ? "justify-start" : "justify-end"}`}
          >
            <div className="relative aspect-[4/3] w-full max-w-2xl md:aspect-[16/10]">
              <Image
                src={image}
                alt={alt}
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
