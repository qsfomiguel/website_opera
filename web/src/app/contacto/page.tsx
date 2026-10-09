import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { t, type Locale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const { footerAddress1, footerAddress2, footerPhone, footerEmail } = await getSiteContent();
  return {
    title: "Contacto — Opera Studio",
    description: [footerAddress1, footerAddress2, footerPhone, footerEmail].filter(Boolean).join(" · "),
  };
}

export const dynamic = "force-dynamic";

export async function ContactoPage({ locale = "pt" }: { locale?: Locale } = {}) {
  const content = await getSiteContent();
  const ui = t(locale);

  const heading =
    locale === "pt" ? content.contactoHeading : content.contactoHeadingEn || content.contactoHeading;
  const reasons =
    locale === "pt"
      ? content.contactReasons
      : content.contactReasonsEn.length > 0
        ? content.contactReasonsEn
        : content.contactReasons;

  return (
    <>
      <SiteHeader locale={locale} pathSuffix="/contacto" />
      <main className="px-6 pb-16 pt-24 md:px-12 md:pb-24 md:pt-40">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">
          <div>
            <p className="mb-4 font-mono text-xs tracking-widest text-muted-foreground">
              {ui.contact}
            </p>
            <h1 className="mb-10 text-[1.75rem] font-medium tracking-tight text-foreground md:text-5xl">
              {heading}
            </h1>

            <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
              <div>
                <div className="mb-1 font-mono text-xs tracking-widest text-foreground/80">
                  {ui.address}
                </div>
                {content.footerAddress1}
                <br />
                {content.footerAddress2}
              </div>
              <div>
                <div className="mb-1 font-mono text-xs tracking-widest text-foreground/80">
                  {ui.phone}
                </div>
                {content.footerPhone}
              </div>
              <div>
                <div className="mb-1 font-mono text-xs tracking-widest text-foreground/80">
                  {ui.email}
                </div>
                {content.footerEmail}
              </div>
            </div>
          </div>

          <ContactForm reasons={reasons} locale={locale} />
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}

export default function Contacto() {
  return <ContactoPage locale="pt" />;
}
