/**
 * Save the OPERA SVG logo (public/brand/) as the site logo in the database:
 * white for the header (dark backgrounds), black for the footer.
 *
 * Usage: npx dotenv -e .env.local -- npx tsx scripts/set-logo.ts
 */
import { getSiteContent, saveSiteContent } from "../src/lib/site-content";

const LOGO_FOR_DARK_BG = "/brand/opera-logo-white.svg";
const LOGO_FOR_LIGHT_BG = "/brand/opera-logo.svg";

async function main() {
  const current = await getSiteContent();
  await saveSiteContent({ ...current, logoUrl: LOGO_FOR_DARK_BG, logoUrlLight: LOGO_FOR_LIGHT_BG });
  console.log(`Logo saved: header ${LOGO_FOR_DARK_BG}, footer ${LOGO_FOR_LIGHT_BG}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
