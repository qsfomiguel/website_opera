import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

import { ScrollProgress } from "@/components/scroll-progress";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Opera Studio",
  description:
    "Arquitetura, engenharia e reabilitação de habitação e infraestruturas públicas em Portugal e na União Europeia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt" className={`${robotoMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <ScrollProgress />
      </body>
    </html>
  );
}
