import type { Metadata } from "next";

import { ProjectFilterGrid } from "@/components/project-filter-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProjects } from "@/lib/content-store";
import { t, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projetos — Opera Studio",
  description: "Habitação, equipamentos públicos e infraestruturas em Portugal e na União Europeia.",
};

const COPY = {
  pt: {
    heading: "Trabalho selecionado",
    intro:
      "Habitação, equipamentos públicos e infraestruturas em Portugal — arquitetura e engenharia sob um único estúdio.",
  },
  en: {
    heading: "Selected work",
    intro:
      "Housing, public facilities and infrastructure in Portugal — architecture and engineering under a single studio.",
  },
} as const;

export async function ProjetosPage({ locale = "pt" }: { locale?: Locale } = {}) {
  const projects = await getProjects();
  const ui = t(locale);
  const copy = COPY[locale];

  return (
    <>
      <SiteHeader locale={locale} pathSuffix="/projetos" />
      <main className="bg-[#f2ece0] px-6 pb-16 pt-24 md:px-12 md:pb-24 md:pt-40">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-xs tracking-widest text-[#3a3733]/60">{ui.projects}</p>
          <h1 className="text-[1.75rem] font-medium tracking-tight text-[#3a3733] md:text-5xl">
            {copy.heading}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-[#3a3733]/70">{copy.intro}</p>
        </div>
        <ProjectFilterGrid projects={projects} locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}

export default function Projetos() {
  return <ProjetosPage locale="pt" />;
}
