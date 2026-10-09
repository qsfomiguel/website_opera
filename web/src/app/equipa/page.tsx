import type { Metadata } from "next";
import Image from "next/image";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { t, type Locale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/site-content";
import { getTeam } from "@/lib/team-store";

export const metadata: Metadata = {
  title: "Equipa — Opera Studio",
  description: "A equipa multidisciplinar do Opera Studio — arquitetura e engenharia.",
};

export const dynamic = "force-dynamic";

export async function EquipaPage({ locale = "pt" }: { locale?: Locale } = {}) {
  const [team, content] = await Promise.all([getTeam(), getSiteContent()]);
  const ui = t(locale);

  const heading = locale === "pt" ? content.equipaHeading : content.equipaHeadingEn || content.equipaHeading;
  const intro = locale === "pt" ? content.equipaIntro : content.equipaIntroEn || content.equipaIntro;

  return (
    <>
      <SiteHeader locale={locale} pathSuffix="/equipa" />
      <main className="bg-[#f2ece0] px-6 pb-16 pt-24 md:px-12 md:pb-24 md:pt-40">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-xs tracking-widest text-[#3a3733]/60">{ui.team}</p>
          <h1 className="text-[1.75rem] font-medium tracking-tight text-[#3a3733] md:text-5xl">
            {heading}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-[#3a3733]/70">{intro}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {team.map((member) => {
            const role = locale === "pt" ? member.role : member.roleEn || member.role;
            const description =
              locale === "pt" ? member.description : member.descriptionEn || member.description;
            return (
              <div key={member.id} className="group relative">
                <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#3a3733]/10">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover grayscale"
                  />
                  {description ? (
                    <div className="pointer-events-none absolute inset-0 flex items-end bg-[#3a3733]/80 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <p className="text-xs leading-relaxed text-[#f2ece0]">{description}</p>
                    </div>
                  ) : null}
                </div>
                <h3 className="text-base font-medium tracking-tight text-[#3a3733]">
                  {member.name}
                </h3>
                <div className="mt-1 font-mono text-xs tracking-widest text-[#3a3733]/60">
                  {role}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}

export default function Equipa() {
  return <EquipaPage locale="pt" />;
}
