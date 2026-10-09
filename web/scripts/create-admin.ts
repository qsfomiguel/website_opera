/**
 * Create or update an admin user (upsert — safe to re-run to reset a password).
 *
 * Usage: npx dotenv -e .env.local -- npx tsx scripts/create-admin.ts <username> <password>
 */
import { hashPassword } from "../src/lib/password";
import { upsertAdminUser } from "../src/lib/admin-users";

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.error("Usage: npx tsx scripts/create-admin.ts <username> <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  await upsertAdminUser(username, passwordHash);
  console.log(`Admin user "${username}" created/updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
