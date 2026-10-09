import type { Metadata } from "next";

import { ContactoPage } from "@/app/contacto/page";
import { getSiteContent } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const { footerAddress1, footerAddress2, footerPhone, footerEmail } = await getSiteContent();
  return {
    title: "Contact — Opera Studio",
    description: [footerAddress1, footerAddress2, footerPhone, footerEmail].filter(Boolean).join(" · "),
  };
}

export const dynamic = "force-dynamic";

export default function EnContacto() {
  return <ContactoPage locale="en" />;
}
