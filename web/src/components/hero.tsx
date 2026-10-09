import Image from "next/image";

import { categoryLabel } from "@/lib/categories";
import type { Project } from "@/lib/content-store";
import type { Locale } from "@/lib/i18n";

export function Hero({
  project,
  about,
  scrollHint,
  locale = "pt",
}: {
  project: Project;
  about: string;
  scrollHint: string;
  locale?: Locale;
}) {
  const name = locale === "pt" ? project.name : project.nameEn || project.name;

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden">
      <Image
        src={project.images[0]}
        alt={name}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/10 to-background/90" />

      <div className="relative flex justify-end px-6 pt-20 md:px-12 md:pt-36">
        <p className="max-w-xs text-right text-sm leading-relaxed text-foreground/90 md:max-w-sm md:text-base">
          {about}
        </p>
      </div>

      <div className="relative px-6 pb-10 md:px-12">
        <div className="mb-2 font-mono text-xs tracking-widest text-foreground/70">
          {[categoryLabel(project.category, locale), project.location].filter(Boolean).join(" · ")}
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-4xl">{name}</h1>
      </div>

      <p className="pointer-events-none absolute inset-x-0 bottom-10 text-center font-mono text-xs tracking-widest text-foreground/60">
        {scrollHint}
      </p>
    </section>
  );
}
