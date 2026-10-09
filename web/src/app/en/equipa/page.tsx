import type { Metadata } from "next";

import { EquipaPage } from "@/app/equipa/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team — Opera Studio",
  description: "Opera Studio's multidisciplinary architecture and engineering team.",
};

export default function EnEquipa() {
  return <EquipaPage locale="en" />;
}
