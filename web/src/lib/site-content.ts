import { getSql } from "@/lib/db";

export type SiteContent = {
  heroAbout: string;
  heroAboutEn: string;
  scrollHint: string;
  scrollHintEn: string;
  footerAbout: string;
  footerAboutEn: string;
  footerAddress1: string;
  footerAddress2: string;
  footerPhone: string;
  footerEmail: string;
  footerInstagramUrl: string;
  footerMapsUrl: string;
  footerCopyright: string;
  /** Options shown in the "Razão de Contacto" select on the Contacto page. */
  contactReasons: string[];
  /** Color variant for dark backgrounds (header). */
  logoUrl: string;
  /** Color variant for light backgrounds (footer). */
  logoUrlLight: string;
  /** Group photo shown on the Sobre/About page. */
  aboutPhotoUrl: string;
  /** Award/certification badge images shown in the footer, next to the copyright line. */
  awardImages: string[];

  /** Nav tab label for the Sobre/About page. */
  navAboutLabel: string;
  navAboutLabelEn: string;

  sobreHeading: string;
  sobreHeadingEn: string;
  /** Paragraphs separated by a blank line. */
  sobreBody: string;
  sobreBodyEn: string;
  sobreFacts: { value: string; label: string }[];
  sobreFactsEn: { value: string; label: string }[];

  equipaHeading: string;
  equipaHeadingEn: string;
  equipaIntro: string;
  equipaIntroEn: string;

  contactoHeading: string;
  contactoHeadingEn: string;
  contactReasonsEn: string[];
};

const DEFAULT_CONTENT: SiteContent = {
  heroAbout:
    "Fundado em 2023 sobre trinta anos de prática em engenharia, o Opera projeta e reabilita habitação e infraestruturas públicas em Portugal e na União Europeia.",
  heroAboutEn:
    "Founded in 2023 on thirty years of engineering practice, Opera designs and rehabilitates housing and public infrastructure in Portugal and the European Union.",
  scrollHint: "Deslizar para mais",
  scrollHintEn: "Keep Scrolling",
  footerAbout:
    "Fundado em 2023, o Opera é um estúdio português que projeta e reabilita habitação e infraestruturas públicas em Portugal e na União Europeia.",
  footerAboutEn:
    "Founded in 2023, Opera is a Portuguese studio that designs and rehabilitates housing and public infrastructure in Portugal and the European Union.",
  footerAddress1: "Alameda da Música 27A",
  footerAddress2: "1750-044 Lisboa, Portugal",
  footerPhone: "+351 911 900 978",
  footerEmail: "info@operastudio.net",
  footerInstagramUrl: "https://www.instagram.com/operastudiolx/",
  footerMapsUrl: "https://www.google.com/maps/search/?api=1&query=Opera+Studio",
  footerCopyright: "© 2026 Opera Studio",
  contactReasons: [
    "Projetos de Arquitetura",
    "Projetos de Estruturas",
    "Projetos de Engenharia",
    "Certificação Energética",
    "Projetos de Eletricidade",
    "Projetos de Telecomunicações",
    "Projetos de Sustentabilidade",
    "Segurança Integrada",
    "Projetos de Acústica",
    "AVAC (Climatização)",
    "Projetos de Hidráulica",
    "Outros Projetos",
  ],
  logoUrl: "/brand/opera-logo-white.svg",
  logoUrlLight: "/brand/opera-logo.svg",
  aboutPhotoUrl: "",
  awardImages: [],

  navAboutLabel: "Sobre",
  navAboutLabelEn: "About",

  sobreHeading: "Engenharia e arquitetura, sob um único estúdio",
  sobreHeadingEn: "",
  sobreBody: [
    "A sociedade Opera Studio Lda, fundada em 2023, surgiu a partir dos sócios e técnicos da empresa de engenharia e construção “Genera Lda”, da qual acumulam mais de 30 anos de experiência em projetos de especialidades de engenharia. Desde 2007 que a Genera desenvolve também atividades de projetos de arquitetura em edifícios de habitações e serviços.",
    "Atualmente, a sociedade Opera Studio está focada em projetos de obras públicas de habitação e infraestruturas em Portugal e na União Europeia, com especial foco na reabilitação arquitetónica, estrutural e energética de edifícios. Trabalhamos exclusivamente com metodologias BIM, nível 2, e em processo de certificação ISO 19650. O paradigma da sustentabilidade é parte integrante do nosso processo de desenvolvimento e das soluções entregues.",
    "Temos em aprovação vários projetos do Fundo de Modernização da União Europeia, todos com um índice de racionalidade económica nas emissões de carbono evitadas inferior a 200€/tonCO₂. Em novembro de 2026 voltaremos ao Big 5 Global (Emiratos) com o objetivo de consolidar parcerias estratégicas para projetos de arquitetura e engenharia contemporânea. A Opera Studio irá inaugurar uma filial em Riade no primeiro trimestre de 2027, oferecendo serviços de arquitetura Archicad BIM e engenharia MEP/HVAC, para o Qiddiya, Red Sea Global e ROSHN.",
    "Temos experiência comprovada em projetos de larga escala: Rio 2016 (venues desportivas) e a cidade do Soyo com a Angola LNG (credora de carbono).",
  ].join("\n\n"),
  sobreBodyEn: "",
  sobreFacts: [
    { value: "2023", label: "Estúdio fundado" },
    { value: "30+", label: "Anos de prática combinada" },
    { value: "BIM Nível 2", label: "ISO 19650 em curso" },
    { value: "2027", label: "Filial em Riade" },
  ],
  sobreFactsEn: [],

  equipaHeading: "A nossa equipa",
  equipaHeadingEn: "",
  equipaIntro: "Uma equipa multidisciplinar de arquitetura e engenharia, reunida sob um único estúdio.",
  equipaIntroEn: "",

  contactoHeading: "Como podemos ajudar?",
  contactoHeadingEn: "",
  contactReasonsEn: [],
};

export async function getSiteContent(): Promise<SiteContent> {
  const sql = getSql();
  const rows = (await sql`SELECT data FROM site_content WHERE id = 'default'`) as {
    data: Partial<SiteContent>;
  }[];
  return { ...DEFAULT_CONTENT, ...(rows[0]?.data ?? {}) };
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO site_content (id, data) VALUES ('default', ${JSON.stringify(content)})
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
  `;
}
