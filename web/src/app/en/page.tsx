import type { Metadata } from "next";

import { HomePage } from "@/app/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Opera Studio",
  description:
    "Opera designs and rehabilitates housing and public infrastructure in Portugal and the European Union.",
};

export default function EnHome() {
  return <HomePage locale="en" />;
}
