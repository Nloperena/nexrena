# Nexrena Ops

Internal operations platform for Nexrena Digital Growth Agency.

## Modules
- **Dashboard** — Pipeline overview, revenue stats, active projects
- **CRM** — Contact management, deal pipeline (kanban + list view)
- **Projects** — Phase-based project tracking with task checklists
- **Invoices** — Create, send, and track invoices with one-click "Mark Paid"

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- localStorage (no backend required — swap to Supabase when ready)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or push to GitHub and connect at vercel.com — zero config needed.

## Upgrading to Supabase

When ready to add a real database:
1. Create a Supabase project at supabase.com
2. Replace the hooks in `lib/store.ts` with Supabase client calls
3. The types in `lib/types.ts` map directly to Postgres tables

## Brand
Fonts: Playfair Display (serif) + DM Sans (body)
Colors: Obsidian #0C0F12 · Gold #C9A96E · Slate #1E2530
