import Image from "next/image";
import Link from "next/link";

import { getImageDimensions, isSvg } from "@/lib/image-dimensions";
import { t, type Locale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/site-content";

export async function SiteFooter({ locale = "pt" }: { locale?: Locale } = {}) {
  const content = await getSiteContent();
  const logoDimensions = await getImageDimensions(content.logoUrlLight);
  const ui = t(locale);
  const prefix = locale === "pt" ? "" : "/en";

  const aboutLabel = locale === "pt" ? content.navAboutLabel : content.navAboutLabelEn || content.navAboutLabel;

  const navLinks = [
    { href: `${prefix}/projetos`, label: ui.projects },
    { href: `${prefix}/sobre`, label: aboutLabel },
    { href: `${prefix}/equipa`, label: ui.team },
    { href: `${prefix}/contacto`, label: ui.contact },
  ];

  const footerAbout = locale === "pt" ? content.footerAbout : content.footerAboutEn || content.footerAbout;

  return (
    <footer className="border-t border-[#3a3733]/15 bg-white px-6 pb-10 pt-16 md:px-12">
      <div className="mb-10 flex justify-end">
        <a
          href="#"
          className="font-mono text-xs tracking-widest text-[#3a3733]/70 hover:text-[#3a3733]"
        >
          {ui.backToTop}
        </a>
      </div>

      <div className="grid grid-cols-1 gap-10 border-t border-[#3a3733]/15 pt-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="max-w-xs font-mono text-xs leading-relaxed text-[#3a3733]/70">
            {footerAbout}
          </p>
        </div>

        <div>
          <div className="mb-3 font-mono text-xs tracking-widest text-[#3a3733]">{ui.studio}</div>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-mono text-xs text-[#3a3733]/70 hover:text-[#3a3733]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 font-mono text-xs tracking-widest text-[#3a3733]">{ui.contact}</div>
          <ul className="space-y-2 font-mono text-xs text-[#3a3733]/70">
            <li>{content.footerAddress1}</li>
            <li>{content.footerAddress2}</li>
            <li>{content.footerPhone}</li>
            <li>{content.footerEmail}</li>
          </ul>
          <a
            href={content.footerMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-mono text-xs text-[#3a3733]/70 underline underline-offset-4 hover:text-[#3a3733]"
          >
            {ui.viewOnMaps}
          </a>
        </div>

        <div>
          <div className="mb-3 font-mono text-xs tracking-widest text-[#3a3733]">{ui.social}</div>
          <ul className="space-y-2">
            <li>
              <a
                href={content.footerInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[#3a3733]/70 hover:text-[#3a3733]"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 border-t border-[#3a3733]/15 pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        {content.logoUrlLight && logoDimensions ? (
          <Image
            src={content.logoUrlLight}
            alt="Opera Studio"
            width={logoDimensions.width}
            height={logoDimensions.height}
            // A stacked (roughly square) logo needs more height than a one-line wordmark to stay legible.
            className={`${logoDimensions.height > logoDimensions.width / 2 ? "h-14" : "h-7"} w-auto object-contain`}
            unoptimized={isSvg(content.logoUrlLight)}
          />
        ) : (
          <span className="text-sm font-medium tracking-[0.15em] text-[#3a3733]">OPERA</span>
        )}
        <div className="flex items-center gap-4">
          <div className="font-mono text-xs text-[#3a3733]/70">{content.footerCopyright}</div>
          {content.awardImages.length > 0 ? (
            <div className="flex items-center gap-3">
              {content.awardImages.map((url) => (
                <div key={url} className="relative h-8 w-8 shrink-0">
                  <Image src={url} alt="" fill sizes="32px" className="object-contain" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
