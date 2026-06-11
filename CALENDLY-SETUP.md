# Calendly setup for Nexrena

Basic embed scheduling for the client portal (`nexrena-ops`) and marketing site (`nexrena-web`). No Calendly API key is required.

## 1. Create a Calendly account

Sign up at [calendly.com](https://calendly.com) with your Nexrena email.

## 2. Create an event type

Create a **Discovery call** event (recommended: 30 minutes). Copy the scheduling link, e.g.:

`https://calendly.com/nicoloperena/discovery`

## 3. Set environment variables on Vercel

Add the same scheduling URL to both projects:

| Project | Variable | Example |
|---------|----------|---------|
| nexrena-ops (portal) | `NEXT_PUBLIC_CALENDLY_URL` | `https://calendly.com/nicoloperena/discovery` |
| nexrena-web (marketing) | `PUBLIC_CALENDLY_URL` or `NEXT_PUBLIC_CALENDLY_URL` | same URL |

Optional on both:

| Variable | Values | Default |
|----------|--------|---------|
| `CALENDLY_EMBED_STYLE` | `inline` or `popup` | `inline` |

Redeploy after changing env vars.

## 4. Where it appears

**Client portal** (`nexrena-ops.vercel.app`)

- Sidebar nav: **Book a call** (between Messages and Billing)
- Home quick action: **Schedule with Nico**
- Dedicated schedule view with inline embed (or popup button when `CALENDLY_EMBED_STYLE=popup`)
- Logged-in clients get name and email prefilled on the Calendly form

**Marketing site** (`nexrena.com`)

- Nav: **Book a call** (when URL is set)
- Contact page: **Book a call** in the “Prefer to talk?” section
- Homepage footer CTA section: **Book a call**
- `/schedule/` — full inline Calendly embed page

If `NEXT_PUBLIC_CALENDLY_URL` / `PUBLIC_CALENDLY_URL` is not set, Book a call controls are hidden and a `mailto:NicholasL@Nexrena.com` fallback is shown instead.

## 5. Local development

Copy examples:

- `nexrena-ops/.env.local.example` → `.env.local`
- `nexrena-web/.env.example` → `.env`

Set your scheduling URL and run `npm run dev` in each app.
