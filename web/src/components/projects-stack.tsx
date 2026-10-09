"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { animate, createScope, type Scope } from "animejs";

import { AnimatedLink } from "@/components/animated-link";
import { categoryLabel } from "@/lib/categories";
import type { Project } from "@/lib/content-store";
import { t, type Locale } from "@/lib/i18n";

const justifyClasses = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const;

/** Mobile has no room for the desktop left/center/right stagger to read as
 * size variation, so each alignment also gets its own mobile width — rows
 * still feel varied instead of collapsing to one uniform card width. */
const mobileWidthClasses = {
  left: "w-[78vw]",
  center: "w-[88vw]",
  right: "w-[70vw]",
} as const;

type Align = keyof typeof justifyClasses;

const ALIGN_ORDER: Align[] = ["left", "center", "right"];

function getAligns(projects: Project[]): Align[] {
  let prev: Align | null = null;
  return projects.map((project, index) => {
    let hash = index * 2654435761;
    for (let i = 0; i < project.id.length; i++) {
      hash = (hash ^ project.id.charCodeAt(i)) * 16777619;
    }
    const options = ALIGN_ORDER.filter((a) => a !== prev);
    const align = options[Math.abs(hash) % options.length];
    prev = align;
    return align;
  });
}

export function ProjectsStack({ projects, locale = "pt" }: { projects: Project[]; locale?: Locale }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const aligns = useMemo(() => getAligns(projects), [projects]);
  const ui = t(locale);
  const prefix = locale === "pt" ? "" : "/en";

  useEffect(() => {
    scope.current = createScope({ root: root.current! }).add(() => {
      const rows = root.current!.querySelectorAll<HTMLElement>(".project-row");

      const reveal = (row: HTMLElement) => {
        const imageWraps = row.querySelectorAll<HTMLElement>(".project-image-wrap");

        animate(row, {
          opacity: [0, 1],
          duration: 900,
          ease: "outQuint",
        });

        imageWraps.forEach((wrap, j) => {
          animate(wrap, {
            scale: [1.04, 1],
            translateY: [24, 0],
            duration: 1500,
            delay: j * 80,
            ease: "outQuint",
          });
        });
      };

      // IntersectionObserver, not anime's scroll-event-based onScroll: it reports
      // the real current visibility state regardless of how the scroll happened
      // (fast flick, Page Down, scrollbar drag), so a row can never get scrolled
      // past before its one-shot "enter" trigger fires and get stuck invisible.
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              reveal(entry.target as HTMLElement);
              observer.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0 },
      );

      rows.forEach((row) => observer.observe(row));

      return () => observer.disconnect();
    });
    return () => scope.current?.revert();
  }, []);

  return (
    <div className="bg-[#f2ece0] px-6 py-20 md:px-12 md:py-28">
      <div ref={root} className="mx-auto flex max-w-[1600px] flex-col gap-10">
        {projects.map((project, projectIndex) => {
          const count = Math.min(project.featuredPhotoCount || 1, project.images.length || 1, 3);
          const shown = project.images.slice(0, count);
          const align = aligns[projectIndex];
          const name = locale === "pt" ? project.name : project.nameEn || project.name;

          return (
            <div key={project.id} className="project-row opacity-0">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 md:mb-8">
                <div>
                  <div className="mb-2 font-mono text-xs tracking-widest text-[#3a3733]/60">
                    {[categoryLabel(project.category, locale), project.location]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <h3 className="text-xl font-medium tracking-tight text-[#3a3733] md:text-3xl">
                    {name}
                  </h3>
                </div>
                <AnimatedLink
                  href={`${prefix}/projetos/${project.id}`}
                  showArrow
                  className="font-mono text-xs tracking-widest text-[#3a3733]/70 hover:text-[#3a3733]"
                >
                  {ui.viewProject}
                </AnimatedLink>
              </div>
              <div className={`flex flex-nowrap gap-6 ${justifyClasses[align]}`}>
                {shown.map((image, i) => (
                  <div
                    key={image}
                    className={`project-image-wrap relative h-[38vh] ${mobileWidthClasses[align]} min-w-0 max-w-[560px] overflow-hidden sm:w-[60vw] md:h-[52vh] md:w-[38vw]`}
                  >
                    <Image
                      src={image}
                      alt={name}
                      fill
                      sizes="(min-width: 768px) 45vw, 90vw"
                      priority={projectIndex === 0 && i === 0}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
