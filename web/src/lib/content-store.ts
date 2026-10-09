import { getSql } from "@/lib/db";

export type Project = {
  id: string;
  name: string;
  nameEn: string;
  location: string;
  category: string;
  description: string;
  descriptionEn: string;
  images: string[];
  featured: boolean;
  featuredOrder: number | null;
  featuredPhotoCount: number;
  /** "Dono de Obra" */
  clientName: string;
  /** "Ano" */
  year: string;
  /** "Área" */
  area: string;
  /** "Estimativa de Custo de Empreitada" */
  budgetEstimate: string;
  /** Manual display order across the whole projects list — lower sorts first. */
  sortOrder: number;
};

type ProjectRow = {
  id: string;
  name: string;
  name_en: string;
  location: string;
  category: string;
  description: string;
  description_en: string;
  images: string[];
  featured: boolean;
  featured_order: number | null;
  featured_photo_count: number;
  client_name: string;
  year: string;
  area: string;
  budget_estimate: string;
  sort_order: number;
};

function fromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    location: row.location,
    category: row.category,
    description: row.description,
    descriptionEn: row.description_en,
    images: row.images,
    featured: row.featured,
    featuredOrder: row.featured_order,
    featuredPhotoCount: row.featured_photo_count,
    clientName: row.client_name,
    year: row.year,
    area: row.area,
    budgetEstimate: row.budget_estimate,
    sortOrder: row.sort_order,
  };
}

export async function getProjects(): Promise<Project[]> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM projects ORDER BY sort_order ASC, name ASC`) as ProjectRow[];
  return rows.map(fromRow);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM projects WHERE id = ${id}`) as ProjectRow[];
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function saveProject(project: Project): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO projects
      (id, name, name_en, location, category, description, description_en, images, featured, featured_order,
       featured_photo_count, client_name, year, area, budget_estimate, sort_order)
    VALUES (
      ${project.id}, ${project.name}, ${project.nameEn}, ${project.location}, ${project.category},
      ${project.description}, ${project.descriptionEn}, ${JSON.stringify(project.images)}, ${project.featured},
      ${project.featuredOrder}, ${project.featuredPhotoCount}, ${project.clientName},
      ${project.year}, ${project.area}, ${project.budgetEstimate}, ${project.sortOrder}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, name_en = EXCLUDED.name_en, location = EXCLUDED.location, category = EXCLUDED.category,
      description = EXCLUDED.description, description_en = EXCLUDED.description_en,
      images = EXCLUDED.images, featured = EXCLUDED.featured,
      featured_order = EXCLUDED.featured_order, featured_photo_count = EXCLUDED.featured_photo_count,
      client_name = EXCLUDED.client_name, year = EXCLUDED.year, area = EXCLUDED.area,
      budget_estimate = EXCLUDED.budget_estimate, sort_order = EXCLUDED.sort_order
  `;
}

export async function deleteProjectRow(id: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM projects WHERE id = ${id}`;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects();
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
}

/** New projects are inserted before the current first one, per the studio's
 * preference to see newly added work at the top of the list. */
export async function nextProjectSortOrder(): Promise<number> {
  const projects = await getProjects();
  return projects.reduce((min, p) => Math.min(min, p.sortOrder), 0) - 1;
}

export async function moveProject(id: string, direction: "up" | "down"): Promise<void> {
  const projects = await getProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= projects.length) return;

  const a = projects[idx];
  const b = projects[swapWith];
  const tmp = a.sortOrder;
  a.sortOrder = b.sortOrder;
  b.sortOrder = tmp;

  await Promise.all([saveProject(a), saveProject(b)]);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function uniqueId(name: string, location: string): Promise<string> {
  const base = slugify(`${name}-${location}`) || "projeto";
  const projects = await getProjects();
  const existingIds = new Set(projects.map((p) => p.id));
  if (!existingIds.has(base)) return base;
  let i = 2;
  while (existingIds.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
