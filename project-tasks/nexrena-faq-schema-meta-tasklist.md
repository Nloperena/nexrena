# Nexrena FAQ, Schema & Meta — Task List

**Project:** nexrena-faq-schema-meta  
**Source:** project-specs/nexrena-faq-schema-meta-setup.md  
**Created:** 2025-03-10

---

## Tasks (quote EXACT requirements from spec)

### [x] Task 1: Create FAQ page (`src/pages/resources/faq.astro`)

- Route: `/resources/faq`
- Content: 8–12 Q&A pairs relevant to Nexrena's services (web design, SEO, full-service, B2B)
- Layout: Use existing Layout, PageHero, and section patterns from `/resources/index.astro`
- Structure: Each FAQ item has question (heading) and answer (paragraph or short list)
- Styling: Match existing design system (obsidian background, gold accents, warm-white text)
- Meta: Unique title and description for SEO

### [x] Task 2: Add FAQ link to Resources index

- File: `src/pages/resources/index.astro`
- Add FAQ as second card or link in the Resources section grid (alongside Blog card)
- Link to `/resources/faq`

### [x] Task 3: Add FAQPage schema to FAQ page

- Scope: `/resources/faq` only
- JSON-LD `FAQPage` schema with `mainEntity` array of `Question`/`Answer` pairs
- Data must match visible FAQ content on page
- Use Layout's `schema` prop or Schema.astro component

### [x] Task 4: Enhance Article schema on blog posts

- File: `src/pages/resources/blog/[slug].astro`
- Add required fields per spec: `dateModified`, `publisher` (Nexrena org with name and logo)
- Ensure Article schema is complete and valid

### [x] Task 5: Add Twitter Card meta to Layout

- File: `src/components/layout/Layout.astro`
- Add: `twitter:card`, `twitter:title`, `twitter:description`
- Add `og:image` if missing (use default or pass through)
- Ensure all pages using Layout get Twitter meta

### [x] Task 6: Meta/OG audit for all page types

- Verify each page type has unique title (~60 chars), description (~160 chars), og:title, og:description, og:type, og:url, twitter:card, twitter:title, twitter:description
- Pages: `/resources`, `/resources/blog`, `/resources/blog/[slug]`, `/resources/faq`, `/industries`, `/industries/[slug]`
- Dynamic pages: use content from frontmatter/collection
- No placeholder text; all meta must reflect actual content
