import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AnimatedLink } from "@/components/animated-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { t, type Locale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Sobre — Opera Studio",
  description:
    "Fundado em 2023, o Opera Studio projeta e reabilita habitação e infraestruturas públicas em Portugal e na União Europeia.",
};

export const dynamic = "force-dynamic";

export async function SobrePage({ locale = "pt" }: { locale?: Locale } = {}) {
  const content = await getSiteContent();
  const ui = t(locale);
  const prefix = locale === "pt" ? "" : "/en";

  const heading = locale === "pt" ? content.sobreHeading : content.sobreHeadingEn || content.sobreHeading;
  const body = locale === "pt" ? content.sobreBody : content.sobreBodyEn || content.sobreBody;
  const facts = locale === "pt" ? content.sobreFacts : content.sobreFactsEn.length > 0 ? content.sobreFactsEn : content.sobreFacts;
  const paragraphs = body.split("\n\n").filter(Boolean);

  return (
    <>
      <SiteHeader locale={locale} pathSuffix="/sobre" />
      <main className="px-6 pb-16 pt-24 md:px-12 md:pb-24 md:pt-40">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-xs tracking-widest text-muted-foreground">{ui.about}</p>
          <h1 className="text-[1.75rem] font-medium tracking-tight text-foreground md:text-5xl">
            {heading}
          </h1>
        </div>

        {content.aboutPhotoUrl ? (
          <div className="relative mb-20 aspect-[16/9] w-full overflow-hidden bg-secondary">
            <Image
              src={content.aboutPhotoUrl}
              alt="Opera Studio team"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <div className="mb-20 max-w-3xl space-y-6 text-base leading-relaxed text-foreground/90 md:text-lg">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mb-20 grid grid-cols-2 gap-8 border-y border-border py-10 md:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <div className="mb-2 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                {fact.value}
              </div>
              <div className="font-mono text-xs tracking-widest text-muted-foreground">
                {fact.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href={`${prefix}/equipa`}
            className="rounded-full border border-border px-5 py-2.5 font-mono text-xs tracking-widest text-foreground/90 transition-colors hover:border-foreground/40"
          >
            {ui.team}
          </Link>
          <Link
            href={`${prefix}/contacto`}
            className="rounded-full border border-border px-5 py-2.5 font-mono text-xs tracking-widest text-foreground/90 transition-colors hover:border-foreground/40"
          >
            {ui.contact}
          </Link>
          <AnimatedLink
            href={`${prefix}/projetos`}
            showArrow
            className="ml-2 self-center font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
          >
            {ui.seeProjects}
          </AnimatedLink>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}

export default function Sobre() {
  return <SobrePage locale="pt" />;
}
