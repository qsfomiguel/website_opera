import type { Metadata } from "next";

import { ProjetosPage } from "@/app/projetos/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects — Opera Studio",
  description: "Housing, public facilities and infrastructure in Portugal and the European Union.",
};

export default function EnProjetos() {
  return <ProjetosPage locale="en" />;
}
