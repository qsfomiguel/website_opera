This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Cloudflare Workers

The app runs on Cloudflare Workers through the [OpenNext adapter](https://opennext.js.org/cloudflare) (`wrangler.jsonc`, `open-next.config.ts`). It still uses Neon Postgres and Vercel Blob; only the Next.js server moves to Cloudflare. The compressed Worker is ~1.6 MiB, under the 3 MiB Workers Free limit.

Set the secrets once (or in the Cloudflare dashboard → Worker → Settings → Variables and Secrets):

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put SESSION_SECRET
npx wrangler secret put BLOB_READ_WRITE_TOKEN
```

Build and deploy:

```bash
npm run deploy
```

`npm run preview` runs the Worker locally (needs the same variables in `.dev.vars`). OpenNext warns that Windows builds are not fully supported; if a build misbehaves, use WSL or let Cloudflare build from GitHub (Workers Builds, build command `npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare deploy`, root directory `web`).

Custom domain: the domain's DNS must be on Cloudflare (change the nameservers at the registrar and check the imported MX/TXT records first), then Worker → Settings → Domains & Routes → add the domain.

Image optimization is off (`images.unoptimized`), since Workers have no built-in optimizer. The logo upload in `/admin` processes the image in the browser (`src/lib/process-logo.ts`), since Workers can't run `python3`.

## Deploy on a local network (LAN)

Run the production build on a machine on your network; other devices on that same network reach it by IP. The app still talks to the same cloud Postgres (Neon) and Vercel Blob storage used elsewhere — only the Next.js server itself runs locally, there's no local database to stand up.

### 1. Env vars

Set these in `.env.local` on that machine (never commit this file):

```
DATABASE_URL="..."          # Neon Postgres connection string
SESSION_SECRET="..."        # openssl rand -hex 32
BLOB_READ_WRITE_TOKEN="..." # Vercel Blob — needed for image uploads in /admin
```

### 2. Build and start, bound to the LAN

```bash
npm install
npm run build
npx next start -H 0.0.0.0 -p 3000
```

`-H 0.0.0.0` makes the server listen on every network interface instead of just `localhost`.

### 3. Find the machine's LAN IP

```bash
# macOS
ipconfig getifaddr en0
# Linux
hostname -I
```

Other devices on the same network open `http://<that-ip>:3000`. If nothing loads, check the machine's firewall allows inbound connections on that port.

### 4. Keep it running

`next start` stops when its terminal closes. To keep it up across disconnects/reboots, run it under a process manager, e.g.:

```bash
npx pm2 start "npm start" --name opera-web
pm2 save
```

### Note: `/admin` login needs HTTPS

The admin session cookie is marked `secure` whenever `NODE_ENV=production` (which `next start` sets automatically), and browsers drop `secure` cookies on a plain `http://` connection — so logging in at `/admin/login` over a bare LAN IP won't persist the session. The public site pages are unaffected. To use `/admin` on the LAN, put a reverse proxy with a local/self-signed TLS cert in front (e.g. Caddy, nginx) and access the site through that instead.

## Admin users

The admin area (`/admin`) is gated by username + password, checked against an `admin_users` table in Postgres (password hashes only — never stored in plaintext). There is no public sign-up page; admins are created from the command line.

Apply the schema once (creates `admin_users` and the other tables if missing):

```bash
psql "$DATABASE_URL" -f scripts/schema.sql
```

Create an admin user:

```bash
npx dotenv -e .env.local -- npx tsx scripts/create-admin.ts <username> <password>
```

Re-running the command with the same username updates its password (upsert). Log in at `/admin/login` with that username and password — the session is a signed cookie valid for 12h, verified in `src/lib/session.ts`.

### Logo

The OPERA logo lives in `public/brand/` as outlined SVGs with a transparent background (white for the header, black for the footer). Save it as the site logo in the database:

```bash
npx dotenv -e .env.local -- npx tsx scripts/set-logo.ts
```

To rebuild the SVGs from another font file (e.g. a licensed Futura BT), run `scripts/make-logo.py` (needs `python3 -m pip install fonttools`):

```bash
python3 scripts/make-logo.py <font.ttf> 300 public/brand/opera-logo.svg "#000"
python3 scripts/make-logo.py <font.ttf> 300 public/brand/opera-logo-white.svg "#fff"
```
