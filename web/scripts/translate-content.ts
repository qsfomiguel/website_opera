/**
 * One-off bulk translation: fills every empty *_en field (projects, team,
 * site_content) from its Portuguese source via the same Google Translate
 * endpoint the admin's "Traduzir automaticamente" button uses. Safe to
 * re-run — only fills fields that are still empty.
 *
 * Usage: npx dotenv -e .env.local -- npx tsx scripts/translate-content.ts
 */
import { neon } from "@neondatabase/serverless";

import { getSiteContent, saveSiteContent } from "../src/lib/site-content";

const sql = neon(process.env.DATABASE_URL!);

async function translate(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate failed: status ${res.status}`);
  const data = (await res.json()) as [Array<[string, string]>];
  return data[0].map((chunk) => chunk[0]).join("");
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 5): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
    }
  }
  throw new Error("unreachable");
}

async function translateProjects() {
  const rows = (await sql`
    SELECT id, name, name_en, description, description_en FROM projects
    WHERE (description_en = '' AND description != '') OR (name_en = '' AND name != '')
  `) as { id: string; name: string; name_en: string; description: string; description_en: string }[];

  for (const row of rows) {
    const nameEn = row.name_en || (row.name ? await withRetry(() => translate(row.name)) : "");
    const descriptionEn =
      row.description_en || (row.description ? await withRetry(() => translate(row.description)) : "");
    await sql`UPDATE projects SET name_en = ${nameEn}, description_en = ${descriptionEn} WHERE id = ${row.id}`;
    console.log("translated project:", row.id);
  }
}

async function translateTeam() {
  const rows = (await sql`
    SELECT id, role, description FROM team WHERE role_en = '' OR description_en = ''
  `) as { id: string; role: string; description: string }[];

  for (const row of rows) {
    const [roleEn, descriptionEn] = await Promise.all([
      withRetry(() => translate(row.role)),
      withRetry(() => translate(row.description)),
    ]);
    await sql`UPDATE team SET role_en = ${roleEn}, description_en = ${descriptionEn} WHERE id = ${row.id}`;
    console.log("translated team member:", row.id);
  }
}

async function translateSiteContent() {
  const data = await getSiteContent();
  const patch: Record<string, unknown> = {};

  const simplePairs: [keyof typeof data, keyof typeof data][] = [
    ["heroAbout", "heroAboutEn"],
    ["scrollHint", "scrollHintEn"],
    ["footerAbout", "footerAboutEn"],
    ["sobreHeading", "sobreHeadingEn"],
    ["sobreBody", "sobreBodyEn"],
    ["equipaHeading", "equipaHeadingEn"],
    ["equipaIntro", "equipaIntroEn"],
    ["contactoHeading", "contactoHeadingEn"],
  ];
  for (const [ptKey, enKey] of simplePairs) {
    const pt = String(data[ptKey] ?? "");
    const en = String(data[enKey] ?? "");
    if (pt && !en) {
      patch[enKey] = await withRetry(() => translate(pt));
      console.log("translated site_content field:", enKey);
    }
  }

  if (data.contactReasons.length > 0 && data.contactReasonsEn.length === 0) {
    patch.contactReasonsEn = await Promise.all(
      data.contactReasons.map((r) => withRetry(() => translate(r))),
    );
    console.log("translated contactReasons");
  }

  if (data.sobreFacts.length > 0 && data.sobreFactsEn.length === 0) {
    patch.sobreFactsEn = await Promise.all(
      data.sobreFacts.map(async (f) => ({
        value: await withRetry(() => translate(f.value)),
        label: await withRetry(() => translate(f.label)),
      })),
    );
    console.log("translated sobreFacts");
  }

  if (Object.keys(patch).length > 0) {
    await saveSiteContent({ ...data, ...patch });
  } else {
    console.log("site_content: nothing to translate");
  }
}

async function main() {
  await translateSiteContent();
  await translateTeam();
  await translateProjects();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
