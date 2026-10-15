import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

/** Gate for every admin page and server action. Server actions can be invoked
 * from any route, not just /admin, so a path-based guard alone isn't enough —
 * each action must check the session itself. Returns the logged-in username or
 * redirects to the login page. */
export async function requireAdmin(): Promise<string> {
  const cookieStore = await cookies();
  const username = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!username) redirect("/admin/login");
  return username;
}
