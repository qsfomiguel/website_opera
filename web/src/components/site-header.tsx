import Image from "next/image";
import Link from "next/link";

import { AnimatedLink } from "@/components/animated-link";
import { MobileNav } from "@/components/mobile-nav";
import { getImageDimensions, isSvg } from "@/lib/image-dimensions";
import { t, type Locale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/site-content";

export async function SiteHeader({
  showHome = true,
  locale = "pt",
  pathSuffix = "",
}: {
  showHome?: boolean;
  locale?: Locale;
  /** The current page's path below the locale root, e.g. "/projetos" or "/projetos/my-id". Empty string for the homepage. */
  pathSuffix?: string;
} = {}) {
  const { logoUrl, navAboutLabel, navAboutLabelEn } = await getSiteContent();
  const logoDimensions = await getImageDimensions(logoUrl);
  const ui = t(locale);
  const homeHref = locale === "pt" ? "/" : "/en";
  const prefix = locale === "pt" ? "" : "/en";
  const aboutLabel = locale === "pt" ? navAboutLabel : navAboutLabelEn || navAboutLabel;

  const navLinks = [
    { href: `${prefix}/projetos`, label: ui.projects },
    { href: `${prefix}/sobre`, label: aboutLabel },
    { href: `${prefix}/equipa`, label: ui.team },
    { href: `${prefix}/contacto`, label: ui.contact },
  ];

  const otherLocaleHref = locale === "pt" ? `/en${pathSuffix}` : pathSuffix || "/";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 via-black/15 to-transparent md:h-36" />
      <div className="relative flex w-full items-center justify-between px-6 py-4 md:px-12 md:py-5">
        <Link href={homeHref} className="block">
          {logoUrl && logoDimensions ? (
            <Image
              src={logoUrl}
              alt="Opera Studio"
              width={logoDimensions.width}
              height={logoDimensions.height}
              className="h-12 w-auto object-contain sm:h-16 md:h-32"
              unoptimized={isSvg(logoUrl)}
              priority
            />
          ) : (
            <span className="text-xl font-medium tracking-[0.15em] text-foreground sm:text-2xl md:text-4xl">
              OPERA
            </span>
          )}
        </Link>
        <nav className="hidden items-center gap-9 md:flex">
          {showHome ? (
            <AnimatedLink
              href={homeHref}
              className="font-mono text-xs tracking-widest text-foreground/80 hover:text-foreground"
            >
              {ui.home}
            </AnimatedLink>
          ) : null}
          {navLinks.map((link) => (
            <AnimatedLink
              key={link.href}
              href={link.href}
              className="font-mono text-xs tracking-widest text-foreground/80 hover:text-foreground"
            >
              {link.label}
            </AnimatedLink>
          ))}
          <Link
            href={otherLocaleHref}
            className="rounded-full border border-border px-3 py-1.5 font-mono text-xs tracking-widest text-foreground/80 transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            {locale === "pt" ? "EN" : "PT"}
          </Link>
        </nav>
        <MobileNav
          homeLink={showHome ? { href: homeHref, label: ui.home } : null}
          navLinks={navLinks}
          localeToggle={{ href: otherLocaleHref, label: locale === "pt" ? "EN" : "PT" }}
        />
      </div>
    </header>
  );
}
