# Nexrena SEO Strategy & Keyword Map — SEO Specialist Deliverable

**Agent:** @seo-specialist  
**Date:** 2025-03-10  
**Inputs:** UX Architect site map, Nexrena brand (mid-size B2B, Web Design & SEO)  
**Status:** Approved for implementation

---

## 1. Keyword Map

### Primary Keywords (High Intent, Brand-Aligned)

| Keyword | Intent | Target Page | Priority |
|---------|--------|-------------|----------|
| B2B web design agency | Commercial | /services/web-design | P0 |
| SEO for manufacturers | Commercial | /industries/manufacturing | P0 |
| B2B SEO agency | Commercial | /services/seo-growth | P0 |
| digital growth agency | Commercial | /, /about | P0 |
| web design Orlando | Local | /contact, /about | P1 |
| B2B website design | Commercial | /services/web-design | P0 |
| headless CMS web design | Commercial | /services/web-design | P1 |
| ecommerce SEO | Commercial | /industries/ecommerce | P0 |
| professional services marketing | Commercial | /industries/professional-services | P1 |

### Secondary Keywords (Supporting Content)

| Keyword | Intent | Target Page | Priority |
|---------|--------|-------------|----------|
| B2B conversion optimization | Informational | /resources/blog | P1 |
| Core Web Vitals B2B | Informational | /resources/blog | P1 |
| website redesign process | Informational | /resources/blog | P1 |
| technical SEO audit | Commercial | /services/seo-growth | P1 |
| full-service digital agency | Commercial | /services/full-service | P0 |

### Long-Tail Keywords (Blog / FAQ)

| Keyword | Intent | Target Page |
|---------|--------|-------------|
| how long does a website redesign take | Informational | /resources/blog, FAQ |
| SEO for manufacturers 2025 | Informational | /resources/blog |
| B2B vs B2C web design | Informational | /resources/blog |
| when to hire a web design agency | Informational | /resources/blog |

---

## 2. Content Gap Analysis

### High-Intent Topics Not Yet Covered

1. **Industry-specific landing pages** — No vertical pages (manufacturing, ecommerce, professional services). Competitors rank for "SEO for [industry]" and "[industry] web design."
2. **Blog / resources** — No indexable content beyond service and case study pages. Missing topical authority and long-tail opportunities.
3. **FAQ content** — No dedicated FAQ page. Missing featured snippet opportunities for "how long," "how much," "when to" queries.
4. **Local SEO** — Orlando/Kissimmee area. Minimal local schema or location-specific content.

### Recommended Gaps to Fill

| Gap | Priority | Page Type | Est. Impact |
|-----|----------|-----------|-------------|
| Industry landing pages | High | /industries/[slug] | 3 new indexable pages, commercial intent |
| Blog content | High | /resources/blog/[slug] | 10+ pages, topical authority |
| FAQ page | Medium | /resources/faq or /faq | Featured snippets, long-tail |
| Local schema | Medium | Site-wide | Local pack visibility |

---

## 3. Topic Clusters

### Cluster 1: Web Design & Development
- **Pillar:** /services/web-design
- **Supporting:** /resources/blog/headless-web-design, /resources/blog/b2b-website-redesign-checklist, /resources/blog/core-web-vitals

### Cluster 2: SEO & Search Growth
- **Pillar:** /services/seo-growth
- **Supporting:** /resources/blog/seo-for-manufacturers, /resources/blog/b2b-seo-strategy, /resources/blog/technical-seo-audit

### Cluster 3: Industry Verticals
- **Pillar:** /industries/manufacturing
- **Supporting:** /industries/ecommerce, /industries/professional-services, /resources/blog/[industry]-specific

### Cluster 4: Agency Process
- **Pillar:** /about
- **Supporting:** /resources/blog/website-redesign-process, /resources/blog/working-with-digital-agency, /resources/faq

---

## 4. Technical SEO Checklist

### Site-Wide
- [ ] XML sitemap includes all new routes (Astro built-in)
- [ ] Robots.txt allows /resources, /industries
- [ ] Canonical URLs on all pages
- [ ] Organization schema (JSON-LD) on homepage

### New Page Types
- [ ] **Blog:** Article schema (headline, datePublished, author, image)
- [ ] **Industries:** WebPage schema, breadcrumb list
- [ ] **FAQ:** FAQPage schema if FAQ section exists

### Meta & Open Graph
- [ ] Unique title per page (max 60 chars)
- [ ] Unique meta description per page (max 160 chars)
- [ ] og:image for blog posts (1200x630)

### Core Web Vitals
- [ ] LCP < 2.5s, INP < 200ms, CLS < 0.1 (maintain current performance)

---

## 5. URL Recommendations

| Page Type | URL Pattern | Example |
|-----------|-------------|---------|
| Blog index | /resources/blog | /resources/blog |
| Blog post | /resources/blog/[slug] | /resources/blog/b2b-website-redesign-checklist |
| Industries index | /industries | /industries |
| Industry | /industries/[slug] | /industries/manufacturing |
| FAQ | /resources/faq | /resources/faq |

**Optional (Phase 2):**
- /services/web-design/industries/manufacturing — Combined service + industry (defer for later)
