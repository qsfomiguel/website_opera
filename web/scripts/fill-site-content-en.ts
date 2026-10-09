/**
 * One-off: fills the site_content English fields added this session with
 * hand-written translations (the Google Translate endpoint was rate-limited).
 * Only fills fields that are still empty — safe to re-run.
 *
 * Usage: npx dotenv -e .env.local -- npx tsx scripts/fill-site-content-en.ts
 */
import { getSiteContent, saveSiteContent } from "../src/lib/site-content";

async function main() {
  const current = await getSiteContent();

  const sobreBodyEn = [
    "Opera Studio Lda, founded in 2023, was formed by the partners and technical staff of the engineering and construction firm “Genera Lda”, who bring together more than 30 years of experience in specialist engineering projects. Since 2007, Genera has also developed architectural projects for housing and service buildings.",
    "Opera Studio is currently focused on public works projects for housing and infrastructure in Portugal and the European Union, with particular emphasis on the architectural, structural and energy rehabilitation of buildings. We work exclusively with BIM methodologies, level 2, and are in the process of ISO 19650 certification. Sustainability is an integral part of our development process and the solutions we deliver.",
    "We have several projects pending approval under the European Union's Modernisation Fund, all with a cost-effectiveness ratio for avoided carbon emissions below €200/tonCO₂. In November 2026 we will return to Big 5 Global (UAE) to consolidate strategic partnerships for contemporary architecture and engineering projects. Opera Studio will open a branch in Riyadh in the first quarter of 2027, offering Archicad BIM architecture and MEP/HVAC engineering services for Qiddiya, Red Sea Global and ROSHN.",
    "We have proven experience in large-scale projects: Rio 2016 (sports venues) and the city of Soyo with Angola LNG (carbon credit).",
  ].join("\n\n");

  const patch = {
    sobreHeadingEn: current.sobreHeadingEn || "Engineering and architecture, under a single studio",
    sobreBodyEn: current.sobreBodyEn || sobreBodyEn,
    sobreFactsEn:
      current.sobreFactsEn.length > 0
        ? current.sobreFactsEn
        : [
            { value: "2023", label: "Studio founded" },
            { value: "30+", label: "Years of combined practice" },
            { value: "BIM Level 2", label: "ISO 19650 in progress" },
            { value: "2027", label: "Riyadh branch" },
          ],
    equipaHeadingEn: current.equipaHeadingEn || "Our team",
    equipaIntroEn:
      current.equipaIntroEn ||
      "A multidisciplinary architecture and engineering team, brought together under a single studio.",
    contactoHeadingEn: current.contactoHeadingEn || "How can we help?",
    contactReasonsEn:
      current.contactReasonsEn.length > 0
        ? current.contactReasonsEn
        : [
            "Architecture Projects",
            "Structural Projects",
            "Engineering Projects",
            "Energy Certification",
            "Electrical Projects",
            "Telecommunications Projects",
            "Sustainability Projects",
            "Integrated Security",
            "Acoustics Projects",
            "HVAC (Climate Control)",
            "Hydraulic Projects",
            "Other Projects",
          ],
  };

  await saveSiteContent({ ...current, ...patch });
  console.log("site_content EN fields filled");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
