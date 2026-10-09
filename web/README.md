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

## Admin access (local network deploy)

The admin area (`/admin`) is gated by username + password, checked against an `admin_users` table in Postgres (password hashes only — never stored in plaintext). There is no public sign-up page; admins are created from the command line.

On the server where you deploy, set in `.env.local` (never committed):

```
DATABASE_URL="..."
SESSION_SECRET="long-random-string"
```

Generate a strong `SESSION_SECRET`:

```bash
openssl rand -hex 32
```

Apply the schema (creates `admin_users` and the other tables if missing):

```bash
psql "$DATABASE_URL" -f scripts/schema.sql
```

Create an admin user:

```bash
npx dotenv -e .env.local -- npx tsx scripts/create-admin.ts <username> <password>
```

Re-running the command with the same username updates its password (upsert). Then build and start the app:

```bash
npm run build
npm start
```

Log in at `/admin/login` with that username and password. The session is a signed cookie valid for 12h, verified in `src/lib/session.ts`.
