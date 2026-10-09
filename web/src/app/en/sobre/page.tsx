import type { Metadata } from "next";

import { SobrePage } from "@/app/sobre/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — Opera Studio",
  description:
    "Founded in 2023, Opera Studio designs and rehabilitates housing and public infrastructure in Portugal and the European Union.",
};

export default function EnSobre() {
  return <SobrePage locale="en" />;
}
