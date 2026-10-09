import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnimatedLink } from "@/components/animated-link";
import { ProjectGallery } from "@/components/project-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { categoryLabel } from "@/lib/categories";
import { getProject, getProjects } from "@/lib/content-store";
import { t, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return {};
  return {
    title: `${project.name} — Opera Studio`,
    description: project.description || [project.category, project.location].filter(Boolean).join(" · "),
  };
}

export async function ProjectPage({
  params,
  locale = "pt",
}: {
  params: Promise<{ id: string }>;
  locale?: Locale;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const ui = t(locale);
  const prefix = locale === "pt" ? "" : "/en";
  const name = locale === "pt" ? project.name : project.nameEn || project.name;
  const description = locale === "pt" ? project.description : project.descriptionEn || project.description;

  const allProjects = await getProjects();
  const idx = allProjects.findIndex((p) => p.id === project.id);
  const nextProject = allProjects.length > 1 ? allProjects[(idx + 1) % allProjects.length] : null;

  const [heroImage, sideImage, ...restImages] = project.images;
  const galleryImages = description && sideImage ? restImages : project.images.slice(1);

  return (
    <>
      <SiteHeader locale={locale} pathSuffix={`/projetos/${project.id}`} />
      <main className="bg-[#f2ece0]">
        <div className="px-6 pt-20 md:px-12 md:pt-36">
          <AnimatedLink
            href={`${prefix}/projetos`}
            className="font-mono text-xs tracking-widest text-[#3a3733]/70 hover:text-[#3a3733]"
          >
            ← {ui.projects}
          </AnimatedLink>
        </div>

        {heroImage ? (
          <div className="relative mt-8 aspect-[4/3] w-full sm:aspect-[16/9] md:aspect-[21/9]">
            <Image
              src={heroImage}
              alt={name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="px-6 pb-14 pt-16 md:px-12 md:pb-20 md:pt-24">
          <h1 className="max-w-4xl text-[1.9rem] font-medium tracking-tight text-[#3a3733] md:text-6xl">
            {name}
          </h1>

          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-[#3a3733]/15 pt-8 sm:grid-cols-4">
            {project.category ? (
              <div>
                <div className="mb-2 font-mono text-xs tracking-widest text-[#3a3733]/60">
                  {ui.category}
                </div>
                <div className="text-sm text-[#3a3733]">{categoryLabel(project.category, locale)}</div>
              </div>
            ) : null}
            {project.location ? (
              <div>
                <div className="mb-2 font-mono text-xs tracking-widest text-[#3a3733]/60">
                  {ui.location}
                </div>
                <div className="text-sm text-[#3a3733]">{project.location}</div>
              </div>
            ) : null}
          </div>

          {project.clientName || project.year || project.area || project.budgetEstimate ? (
            <div className="mt-8 border-t border-[#3a3733]/15 pt-8">
              <div className="mb-6 font-mono text-xs tracking-widest text-[#3a3733]/60">
                {ui.specifications}
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {project.clientName ? (
                  <div>
                    <div className="mb-2 font-mono text-xs tracking-widest text-[#3a3733]/60">
                      {ui.client}
                    </div>
                    <div className="text-sm text-[#3a3733]">{project.clientName}</div>
                  </div>
                ) : null}
                {project.year ? (
                  <div>
                    <div className="mb-2 font-mono text-xs tracking-widest text-[#3a3733]/60">
                      {ui.year}
                    </div>
                    <div className="text-sm text-[#3a3733]">{project.year}</div>
                  </div>
                ) : null}
                {project.area ? (
                  <div>
                    <div className="mb-2 font-mono text-xs tracking-widest text-[#3a3733]/60">
                      {ui.area}
                    </div>
                    <div className="text-sm text-[#3a3733]">{project.area}</div>
                  </div>
                ) : null}
                {project.budgetEstimate ? (
                  <div>
                    <div className="mb-2 font-mono text-xs tracking-widest text-[#3a3733]/60">
                      {ui.budgetEstimate}
                    </div>
                    <div className="text-sm text-[#3a3733]">{project.budgetEstimate}</div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {description ? (
            sideImage ? (
              <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
                <p className="text-base leading-relaxed text-[#3a3733]/90 md:text-2xl">{description}</p>
                <div className="relative aspect-[4/3] w-full md:aspect-[16/11]">
                  <Image
                    src={sideImage}
                    alt={name}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ) : (
              <p className="mt-16 max-w-3xl text-base leading-relaxed text-[#3a3733]/90 md:text-2xl">
                {description}
              </p>
            )
          ) : null}
        </div>

        {galleryImages.length > 0 ? (
          <ProjectGallery images={galleryImages} alt={name} seed={project.id} />
        ) : null}

        {nextProject ? (
          <div className="border-t border-[#3a3733]/15 px-6 py-24 text-center md:px-12">
            <div className="font-mono text-xs tracking-widest text-[#3a3733]/60">
              {ui.nextProject}
            </div>
            <h2 className="mt-4 text-2xl font-medium tracking-tight text-[#3a3733] md:text-4xl">
              {locale === "pt" ? nextProject.name : nextProject.nameEn || nextProject.name}
            </h2>
            <Link
              href={`${prefix}/projetos/${nextProject.id}`}
              className="mt-8 inline-block rounded-full border border-[#3a3733]/30 px-6 py-3 font-mono text-xs tracking-widest text-[#3a3733] transition-colors hover:border-[#3a3733]"
            >
              {ui.viewProject}
            </Link>
          </div>
        ) : null}
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}

export default function ProjectDetail(props: { params: Promise<{ id: string }> }) {
  return <ProjectPage {...props} locale="pt" />;
}
