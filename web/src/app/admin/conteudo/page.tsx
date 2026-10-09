import Link from "next/link";

import { updateSiteContent } from "@/app/admin/actions";
import { AboutPhotoUpload } from "@/components/admin/about-photo-upload";
import { AwardImagesUpload } from "@/components/admin/award-images-upload";
import { LogoUpload } from "@/components/admin/logo-upload";
import { SiteContentForm } from "@/components/admin/site-content-form";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function SiteContentPage() {
  const content = await getSiteContent();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href="/admin"
        className="mb-10 inline-block font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Admin
      </Link>
      <h1 className="mb-10 text-3xl font-medium tracking-tight text-foreground">
        Textos do site
      </h1>

      <div className="mb-10 border-b border-border pb-10">
        <LogoUpload currentUrlDark={content.logoUrl} currentUrlLight={content.logoUrlLight} />
      </div>

      <div className="mb-10 border-b border-border pb-10">
        <AboutPhotoUpload currentUrl={content.aboutPhotoUrl} />
      </div>

      <div className="mb-10 border-b border-border pb-10">
        <AwardImagesUpload images={content.awardImages} />
      </div>

      <SiteContentForm action={updateSiteContent} content={content} />
    </main>
  );
}
