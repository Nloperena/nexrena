# Mobile UX Audit — Nexrena Operations

Audit date: June 2026. Mobile-first review of client portal + team/admin portal.

## Global

| Issue | Area | Severity |
|-------|------|----------|
| Desktop `nx-table` used on invoices, leads, CRM, expenses, proposals, service-requests, reports — horizontal overflow on small screens | Team pages | High |
| `grid-cols-3` stat rows without `grid-cols-1` fallback on several team pages | Team dashboard pages | High |
| Page headers (`PageHeader`) use large serif titles + gold rule — too tall on mobile | Both portals | Medium |
| Inconsistent page padding (mix of px-4, px-6, negative table margins) | Both | Medium |
| Filter tab rows overflow horizontally (invoices status filters) | Team invoices | High |
| No shared loading / empty / error component patterns | Both | Medium |
| Bottom nav active states present but subtle; client nav labels still say "Messages" not "Message Nico" | Client | Medium |

## Client portal

| Issue | Route / component | Severity |
|-------|-------------------|----------|
| Hero section heavy — large image column, long copy, duplicate CTAs | Home / `client-dashboard-hero` | Medium |
| Primary CTA says "Request help" not "Start a request" | Home hero | Low |
| Billing history shows all invoices equally — unpaid vs paid not separated; paid not collapsible on mobile | Billing | High |
| Files section title "Your files" — should feel like branded asset library ("Business assets") | Files | Low |
| Mobile header shows full view title at text-3xl — redundant with bottom nav context | Shell | Medium |
| Activity feed dense on small screens — date + label wrap awkwardly | Home | Low |
| Projects empty state lacks strong CTA when no projects | Requests tab | Medium |

## Team / admin portal

| Issue | Route / component | Severity |
|-------|-------------------|----------|
| `/` redirects to invoices — no mobile overview dashboard | Home | High |
| Mobile bottom tabs: Invoices, Messages, Leads — missing Work, Assets, aligned groups | Nav | High |
| Project cards: header row clips — action buttons overlap title on narrow screens | Projects | High |
| Project phase grid uses `grid-cols-2` inside accordion — cramped on mobile | Projects | Medium |
| Invoice table action buttons hidden until hover — unusable on touch | Invoices | High |
| Messages page stats OK but thread list needs clearer unread badges on mobile | Messages | Low |
| CRM / expenses / reports use dense tables without mobile card fallback | Admin | High |

## Accessibility

| Issue | Notes |
|-------|-------|
| Status conveyed mostly via color badges | StatusBadge adds label text; chips already have text |
| Focus rings present in portal/team CSS | Keep gold focus-visible |
| Tap targets mostly 44px+ in portal; team table actions too small | Fixed via card actions |

## Implemented fixes (this pass)

- Shared design tokens + `components/design-system/` primitives
- Client: simplified hero, "Start a request" / "Message Nico" copy, billing unpaid/paid split, shell header compaction
- Team: dashboard at `/`, regrouped mobile nav, invoice + project mobile cards, responsive stat grids
- Global: mobile card list pattern, overflow-x-hidden, consistent spacing tokens
