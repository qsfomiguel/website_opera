/**
 * One-off migration: loads the current content/*.json + public/{projects,team,uploads}
 * files into Postgres (Neon) + Vercel Blob. Safe to re-run — uploads use stable
 * pathnames (no random suffix) and DB writes are upserts.
 *
 * Usage: npx dotenv -e .env.local -- npx tsx scripts/migrate-to-db.ts
 */
import fs from "node:fs/promises";
import path from "node:path";

import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const PUBLIC_DIR = path.join(process.cwd(), "public");

const blobCache = new Map<string, string>();

async function uploadLocalPath(localPath: string): Promise<string> {
  if (!localPath || !localPath.startsWith("/")) return localPath;
  const cached = blobCache.get(localPath);
  if (cached) return cached;

  const filePath = path.join(PUBLIC_DIR, localPath);
  const data = await fs.readFile(filePath);
  const pathname = localPath.replace(/^\//, "");
  const blob = await put(pathname, data, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  blobCache.set(localPath, blob.url);
  return blob.url;
}

async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function migrateSchema() {
  const schema = await fs.readFile(path.join(process.cwd(), "scripts", "schema.sql"), "utf-8");
  const statements = schema.split(";").map((s) => s.trim()).filter(Boolean);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log("schema ready");
}

async function migrateSiteContent() {
  const raw = await fs.readFile(path.join(process.cwd(), "content", "site-content.json"), "utf-8");
  const content = JSON.parse(raw) as Record<string, string>;

  content.logoUrl = await uploadLocalPath(content.logoUrl);
  content.logoUrlLight = await uploadLocalPath(content.logoUrlLight);

  await sql.query(
    `INSERT INTO site_content (id, data) VALUES ('default', $1)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
    [JSON.stringify(content)],
  );
  console.log("site_content migrated");
}

async function migrateProjects() {
  const raw = await fs.readFile(path.join(process.cwd(), "content", "projects.json"), "utf-8");
  type RawProject = {
    id: string;
    name: string;
    location: string;
    category: string;
    description: string;
    images: string[];
    featured: boolean;
    featuredOrder: number | null;
    featuredPhotoCount: number;
    clientName?: string;
    year?: string;
    area?: string;
    budgetEstimate?: string;
  };
  const projects = JSON.parse(raw) as RawProject[];

  for (const project of projects) {
    const images = await mapConcurrent(project.images, 8, uploadLocalPath);
    await sql.query(
      `INSERT INTO projects
         (id, name, location, category, description, images, featured, featured_order,
          featured_photo_count, client_name, year, area, budget_estimate)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, location = EXCLUDED.location, category = EXCLUDED.category,
         description = EXCLUDED.description, images = EXCLUDED.images, featured = EXCLUDED.featured,
         featured_order = EXCLUDED.featured_order, featured_photo_count = EXCLUDED.featured_photo_count,
         client_name = EXCLUDED.client_name, year = EXCLUDED.year, area = EXCLUDED.area,
         budget_estimate = EXCLUDED.budget_estimate`,
      [
        project.id,
        project.name,
        project.location,
        project.category,
        project.description,
        JSON.stringify(images),
        project.featured,
        project.featuredOrder,
        project.featuredPhotoCount,
        project.clientName ?? "",
        project.year ?? "",
        project.area ?? "",
        project.budgetEstimate ?? "",
      ],
    );
    console.log("project migrated:", project.id);
  }
}

async function migrateTeam() {
  const raw = await fs.readFile(path.join(process.cwd(), "content", "team.json"), "utf-8");
  type RawMember = { id: string; name: string; role: string; photo: string; description: string };
  const team = JSON.parse(raw) as RawMember[];

  for (const member of team) {
    const photo = await uploadLocalPath(member.photo);
    await sql.query(
      `INSERT INTO team (id, name, role, photo, description) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, role = EXCLUDED.role, photo = EXCLUDED.photo,
         description = EXCLUDED.description`,
      [member.id, member.name, member.role, photo, member.description],
    );
    console.log("team member migrated:", member.id);
  }
}

async function main() {
  await migrateSchema();
  await migrateSiteContent();
  await migrateTeam();
  await migrateProjects();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
