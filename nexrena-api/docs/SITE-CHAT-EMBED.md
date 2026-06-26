# Multi-site AI chat embed

Nexrena hosts one AI chat backend for all managed properties. Each site uses a **site key** registered in `nexrena-api/src/lib/sites.ts`.

## Managed sites

| Site key | Property | Chat intake | Form leads |
|----------|----------|-------------|------------|
| `nexrena` | nexrena.com | Nexrena Leads (`/leads`) | — |
| `fpusa` | furniturepackagesusa.com | Form submission → Joe / FPUSA | ✓ |
| `nicoloperena` | nicoloperena.com | Form submission → portfolio CRM | ✓ |
| `ttag` | thetwoazaleagroup.com | Form submission → Warren / TTAG | ✓ |

Ops inbox: **Site messages** (`/ai-chats`) shows AI transcripts + form leads + Nexrena contact leads.

## API

- `GET /api/chat/config?siteKey=fpusa` — widget branding (public)
- `POST /api/chat` — send messages (public, rate-limited)
  - Header: `X-Site-Key: fpusa` (or body `siteKey`)
  - Origin must match registered domain, or pass site key explicitly

## Astro / React embed (FPUSA, portfolio, TTAG)

1. Copy from `nexrena-web`:
   - `src/lib/chat-api.ts`
   - `src/components/SiteChatWidget.tsx`
   - `src/components/ChatIntakeForm.tsx`
   - `src/lib/format-chat-message.tsx`
   - Site chat CSS block from `src/styles/global.css` (`.site-chat-*`)

2. Set env:
   ```env
   PUBLIC_API_URL=https://nexrena-api-5dc54effaa9f.herokuapp.com
   ```

3. Mount in layout:
   ```astro
   ---
   import { SiteChatWidget } from '../components/SiteChatWidget';
   ---
   <SiteChatWidget client:only="react" siteKey="fpusa" />
   ```

   Portfolio:
   ```astro
   <SiteChatWidget client:only="react" siteKey="nicoloperena" />
   ```

4. Ensure the site origin is listed in `sites.ts` (already configured for production domains).

5. Form secret (optional hardening): set `FPUSA_FORM_SECRET` / `NICOLOPERENA_FORM_SECRET` on Heroku if using form POST endpoints separately.

## Portfolio CRM contact

Run once after deploy if needed:
```bash
heroku run node scripts/ensure-nicoloperena-contact.mjs -a nexrena-api
```

## Adding a new client site

1. Add entry to `SITES` in `sites.ts` with `contactId`, `origins`, `managedCategory: 'client'`, and `chat` config.
2. Add knowledge file under `sales-assistant/knowledge/` and register in `profiles.ts`.
3. Extend `site-prompts.ts` if the voice needs a custom base prompt.
4. Embed widget with the new `siteKey` on the client site.
5. Push Heroku — release runs `prisma db push`.
