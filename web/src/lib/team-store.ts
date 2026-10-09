import { getSql } from "@/lib/db";
import { slugify } from "@/lib/content-store";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  roleEn: string;
  photo: string;
  description: string;
  descriptionEn: string;
  sortOrder: number;
};

type TeamRow = {
  id: string;
  name: string;
  role: string;
  role_en: string;
  photo: string;
  description: string;
  description_en: string;
  sort_order: number;
};

function fromRow(row: TeamRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    roleEn: row.role_en,
    photo: row.photo,
    description: row.description,
    descriptionEn: row.description_en,
    sortOrder: row.sort_order,
  };
}

export async function getTeam(): Promise<TeamMember[]> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM team ORDER BY sort_order ASC, name ASC`) as TeamRow[];
  return rows.map(fromRow);
}

export async function getTeamMember(id: string): Promise<TeamMember | undefined> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM team WHERE id = ${id}`) as TeamRow[];
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function saveTeamMember(member: TeamMember): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO team (id, name, role, role_en, photo, description, description_en, sort_order)
    VALUES (
      ${member.id}, ${member.name}, ${member.role}, ${member.roleEn},
      ${member.photo}, ${member.description}, ${member.descriptionEn}, ${member.sortOrder}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, role = EXCLUDED.role, role_en = EXCLUDED.role_en,
      photo = EXCLUDED.photo, description = EXCLUDED.description,
      description_en = EXCLUDED.description_en, sort_order = EXCLUDED.sort_order
  `;
}

export async function deleteTeamMemberRow(id: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM team WHERE id = ${id}`;
}

export async function nextTeamSortOrder(): Promise<number> {
  const team = await getTeam();
  return team.reduce((max, m) => Math.max(max, m.sortOrder), 0) + 1;
}

export async function moveTeamMember(id: string, direction: "up" | "down"): Promise<void> {
  const team = await getTeam();
  const idx = team.findIndex((m) => m.id === id);
  if (idx === -1) return;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= team.length) return;

  const a = team[idx];
  const b = team[swapWith];
  const tmp = a.sortOrder;
  a.sortOrder = b.sortOrder;
  b.sortOrder = tmp;

  await Promise.all([saveTeamMember(a), saveTeamMember(b)]);
}

export async function uniqueTeamId(name: string): Promise<string> {
  const base = slugify(name) || "membro";
  const team = await getTeam();
  const existingIds = new Set(team.map((m) => m.id));
  if (!existingIds.has(base)) return base;
  let i = 2;
  while (existingIds.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
