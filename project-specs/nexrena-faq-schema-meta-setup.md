# Nexrena FAQ, Schema & Meta Audit — Project Specification

**Project:** nexrena-faq-schema-meta  
**Target:** nexrena-web (Astro)  
**Date:** 2025-03-10  
**Status:** Ready for pipeline

---

## 1. Overview

Implement the Sprint 4 polish items for the Nexrena agency website: a Resources FAQ page, structured data (Article + FAQPage schema), and a meta/OG audit for all new page types.

---

## 2. Requirements

### 2.1 FAQ Page (`/resources/faq`)

- **Route:** Create `src/pages/resources/faq.astro`
- **Content:** FAQ page with 8–12 Q&A pairs relevant to Nexrena's services (web design, SEO, full-service, B2B)
- **Layout:** Use existing Layout, PageHero, and section patterns from `/resources/index.astro`
- **Structure:** Each FAQ item has a question (heading) and answer (paragraph or short list)
- **Styling:** Match existing design system (obsidian background, gold accents, warm-white text)
- **Navigation:** Add FAQ link to Resources section (e.g., in `/resources/index.astro` as a second card or link)

### 2.2 Article Schema (Blog Posts)

- **Scope:** All blog post pages at `/resources/blog/[slug]`
- **Schema:** Add JSON-LD `Article` schema to the blog post layout
- **Required fields:** `@type`, `headline`, `datePublished`, `dateModified`, `author`, `publisher`
- **Publisher:** Use Nexrena as organization with name and logo
- **Placement:** In `<head>` or before `</body>`; use existing `Schema.astro` component pattern if present

### 2.3 FAQPage Schema

- **Scope:** `/resources/faq` page only
- **Schema:** Add JSON-LD `FAQPage` schema with `mainEntity` array of `Question`/`Answer` pairs
- **Data:** Must match the visible FAQ content on the page
- **Placement:** Same as Article schema

### 2.4 Meta & Open Graph Audit

- **Scope:** All page types: `/resources`, `/resources/blog`, `/resources/blog/[slug]`, `/resources/faq`, `/industries`, `/industries/[slug]`
- **Requirements per page:**
  - Unique `<title>` (max ~60 chars)
  - Unique `<meta name="description">` (max ~160 chars)
  - Open Graph: `og:title`, `og:description`, `og:type`, `og:url`
  - Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`
- **Dynamic pages:** Use content (title, description) from frontmatter or collection data
- **No placeholder text:** All meta must reflect actual page content

---

## 3. Technical Constraints

- **Stack:** Astro 5, existing components in `src/components/`
- **Content:** FAQ content can be inline in the page or in a data file; no new content collection required
- **Existing patterns:** Follow `Layout.astro`, `PageHero.astro`, `Schema.astro` conventions
- **URLs:** Use absolute URLs for `og:url` (e.g., `https://nexrena.com/resources/faq`); use `Astro.url` or site config

---

## 4. Out of Scope

- New content collections
- Blog post content creation
- Industry page content changes
- Design system changes
- Internal linking pass (separate task)

---

## 5. Success Criteria

| Item | Pass Condition |
|------|----------------|
| FAQ page | `/resources/faq` loads, displays 8+ Q&A pairs, matches design |
| FAQ link | Resources index links to FAQ |
| Article schema | Blog posts have valid Article JSON-LD |
| FAQPage schema | FAQ page has valid FAQPage JSON-LD |
| Meta audit | All listed page types have unique title, description, og, twitter |
| Validation | Article and FAQPage schema pass Google Rich Results Test (or equivalent) |

---

## 6. File Deliverables

| File | Purpose |
|------|---------|
| `src/pages/resources/faq.astro` | FAQ page |
| `src/pages/resources/index.astro` | Add FAQ link/card |
| `src/pages/resources/blog/[slug].astro` | Add Article schema |
| `src/layouts/Base.astro` or per-page | Meta/OG for each page type |
| Schema components or inline JSON-LD | Article, FAQPage |
