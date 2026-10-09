import { Hero } from "@/components/hero";
import { ProjectsStack } from "@/components/projects-stack";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { getFeaturedProjects, getProjects } from "@/lib/content-store";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export async function HomePage({ locale = "pt" }: { locale?: Locale } = {}) {
  const featured = await getFeaturedProjects();
  const heroProject = featured[0] ?? (await getProjects())[0];
  const stackProjects = featured.length > 0 ? featured.slice(1) : [];
  const content = await getSiteContent();

  const about = locale === "pt" ? content.heroAbout : content.heroAboutEn || content.heroAbout;
  const scrollHint = locale === "pt" ? content.scrollHint : content.scrollHintEn || content.scrollHint;

  return (
    <>
      <SiteHeader showHome={false} locale={locale} />
      <main>
        {heroProject ? (
          <Hero project={heroProject} about={about} scrollHint={scrollHint} locale={locale} />
        ) : null}
        <ProjectsStack projects={stackProjects} locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}

export default function Home() {
  return <HomePage locale="pt" />;
}
