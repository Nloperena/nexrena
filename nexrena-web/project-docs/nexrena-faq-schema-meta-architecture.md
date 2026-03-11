# Nexrena FAQ, Schema & Meta — Technical Architecture

**Project:** nexrena-faq-schema-meta  
**Date:** 2025-03-10

---

## 1. Architecture Overview

Extend existing nexrena-web patterns. No new content collections. All deliverables use current Layout, PageHero, Schema, and design tokens.

---

## 2. File Map

| Deliverable | File | Pattern |
|-------------|------|---------|
| FAQ page | `src/pages/resources/faq.astro` | New page, mirror `resources/index.astro` |
| FAQ link | `src/pages/resources/index.astro` | Add second card to grid |
| FAQPage schema | `src/lib/schema.ts` + inline in faq.astro | Add `faqPageSchema()` helper |
| Article schema | `src/pages/resources/blog/[slug].astro` | Enhance existing inline schema |
| Twitter/OG | `src/components/layout/Layout.astro` | Add meta tags to head |
| Meta audit | Per-page | Verify Layout props (title, description) |

---

## 3. Schema Patterns

- **Article:** Use `lib/schema.ts` `articleSchema()` or extend inline; add `publisher`, `dateModified`
- **FAQPage:** Add `faqPageSchema(faqItems)` to `lib/schema.ts`; `mainEntity` = array of `{ question, answer }`
- **Layout:** Accept `schema` prop, render via `Schema.astro`

---

## 4. Meta Pattern

Layout.astro receives `title`, `description`. Add `og:image` (default `/og-default.png`), `twitter:card`, `twitter:title`, `twitter:description`. All pages using Layout inherit.

---

## 5. FAQ Content Structure

```ts
const faqItems = [
  { question: "...", answer: "..." },
  // 8–12 items
];
```

Inline in faq.astro or in `src/data/faq.ts`. No content collection.
