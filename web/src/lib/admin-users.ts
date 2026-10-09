import { getSql } from "@/lib/db";

export type AdminUser = {
  username: string;
  passwordHash: string;
};

export async function findAdminUser(username: string): Promise<AdminUser | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT username, password_hash FROM admin_users WHERE username = ${username}
  `) as { username: string; password_hash: string }[];
  if (rows.length === 0) return null;
  return { username: rows[0].username, passwordHash: rows[0].password_hash };
}

export async function upsertAdminUser(username: string, passwordHash: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO admin_users (username, password_hash)
    VALUES (${username}, ${passwordHash})
    ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;
}

export async function deleteAdminUser(username: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM admin_users WHERE username = ${username}`;
}

export async function listAdminUsernames(): Promise<string[]> {
  const sql = getSql();
  const rows = (await sql`SELECT username FROM admin_users ORDER BY username`) as {
    username: string;
  }[];
  return rows.map((r) => r.username);
}
