export const SESSION_COOKIE_NAME = "opera_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set (see web/.env.local).");
  }
  return secret;
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bufToHex(sig);
}

export async function createSessionToken(username: string): Promise<string> {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${username}.${expires}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Usernames may contain dots, so parse from the right: sig and expires never do.
export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const sig = token.slice(lastDot + 1);
  const rest = token.slice(0, lastDot);

  const secondLastDot = rest.lastIndexOf(".");
  if (secondLastDot === -1) return null;
  const expires = rest.slice(secondLastDot + 1);
  const username = rest.slice(0, secondLastDot);
  if (!username) return null;

  if (Date.now() > Number(expires)) return null;
  const expectedSig = await hmac(`${username}.${expires}`);
  if (!timingSafeEqual(sig, expectedSig)) return null;
  return username;
}
