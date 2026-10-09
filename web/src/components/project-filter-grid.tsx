"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { animate, createScope, stagger, type Scope } from "animejs";

import { categoryLabel, sortCategories } from "@/lib/categories";
import type { Project } from "@/lib/content-store";
import { t, type Locale } from "@/lib/i18n";

export function ProjectFilterGrid({ projects, locale = "pt" }: { projects: Project[]; locale?: Locale }) {
  const ui = t(locale);
  const prefix = locale === "pt" ? "" : "/en";
  const [active, setActive] = useState<string>(ui.all);
  const gridRef = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return [ui.all, ...sortCategories(Array.from(set))];
  }, [projects, ui.all]);

  const filtered = useMemo(
    () => (active === ui.all ? projects : projects.filter((p) => p.category === active)),
    [projects, active, ui.all],
  );

  useEffect(() => {
    if (!gridRef.current) return;
    scope.current = createScope({ root: gridRef.current }).add(() => {
      const cards = gridRef.current!.querySelectorAll<HTMLElement>(".project-card");
      animate(cards, {
        opacity: [0, 1],
        translateY: [32, 0],
        duration: 700,
        delay: stagger(35),
        ease: "outQuad",
      });
    });
    return () => scope.current?.revert();
  }, [filtered]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-baseline gap-8 border-b border-[#3a3733]/15 pb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={`font-mono text-xs tracking-widest transition-colors ${
              active === cat
                ? "text-[#3a3733]"
                : "text-[#3a3733]/60 hover:text-[#3a3733]/80"
            }`}
          >
            {cat === ui.all ? cat : categoryLabel(cat, locale)}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-[#3a3733]/60">
          {ui.projectsCount(filtered.length)}
        </span>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => {
          const name = locale === "pt" ? project.name : project.nameEn || project.name;
          return (
            <Link
              key={project.id}
              href={`${prefix}/projetos/${project.id}`}
              className="project-card group relative block aspect-[4/3] overflow-hidden"
            >
              <Image
                src={project.images[0]}
                alt={name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="mb-1 font-mono text-[11px] tracking-widest text-foreground/70">
                  {[categoryLabel(project.category, locale), project.location].filter(Boolean).join(" · ")}
                </div>
                <h3 className="text-lg font-medium tracking-tight text-foreground">{name}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
