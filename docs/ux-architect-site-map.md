# Nexrena Information Architecture — UX Architect Deliverable

**Agent:** @ux-architect  
**Date:** 2025-03-10  
**Status:** Approved for implementation

---

## 1. Site Map

### Current Structure

| Level | Path | Page Type | Status |
|-------|------|-----------|--------|
| 1 | `/` | Home | Live |
| 1 | `/about` | About | Live |
| 1 | `/services` | Services index | Live |
| 2 | `/services/web-design` | Service detail | Live |
| 2 | `/services/seo-growth` | Service detail | Live |
| 2 | `/services/full-service` | Service detail | Live |
| 1 | `/work` | Work index | Live |
| 2 | `/work/[slug]` | Case study | Live (4) |
| 1 | `/contact` | Contact | Live |

### Proposed Additions

| Level | Path | Page Type | Purpose |
|-------|------|-----------|---------|
| 1 | `/resources` | Resources index | Hub for blog and educational content |
| 2 | `/resources/blog` | Blog index | List of articles |
| 3 | `/resources/blog/[slug]` | Blog post | Individual article |
| 1 | `/industries` | Industries index | Hub for vertical-specific landing pages |
| 2 | `/industries/[slug]` | Industry landing | Vertical-specific (manufacturing, ecommerce, etc.) |

### Full Site Map (Post-Implementation)

```
/
├── /about
├── /services
│   ├── /services/web-design
│   ├── /services/seo-growth
│   └── /services/full-service
├── /work
│   └── /work/[slug]
├── /resources
│   └── /resources/blog
│       └── /resources/blog/[slug]
├── /industries
│   └── /industries/[slug]
└── /contact
```

---

## 2. Content Hierarchy Spec

### Home (`/`)
- **Primary:** Hero, value proposition, CTA
- **Secondary:** Marquee, manifesto, about teaser, services grid, work preview, process, testimonials, final CTA

### Services Index (`/services`)
- **Primary:** Hero, service cards with links to detail pages
- **Secondary:** Approach narrative, CTA

### Service Detail (`/services/[slug]`)
- **Primary:** Hero, problem/agitation, capabilities, outcomes, process, CTA
- **Secondary:** FAQ, tags, back link

### Work Index (`/work`)
- **Primary:** Case study grid
- **Secondary:** Filter/category context

### Case Study (`/work/[slug]`)
- **Primary:** Project hero, overview, metrics, deliverables
- **Secondary:** Related work, CTA

### Resources Index (`/resources`)
- **Primary:** Blog index with featured/latest posts
- **Secondary:** Category filters, CTA to contact

### Blog Post (`/resources/blog/[slug]`)
- **Primary:** Article title, body, author, date
- **Secondary:** Related posts, CTA, share

### Industries Index (`/industries`)
- **Primary:** Industry cards with links to landing pages
- **Secondary:** Value proposition for vertical focus, CTA

### Industry Landing (`/industries/[slug]`)
- **Primary:** Vertical-specific hero, pain points, solutions, case studies (filtered), CTA
- **Secondary:** Service links, testimonials by vertical

### Contact (`/contact`)
- **Primary:** Form, contact info
- **Secondary:** Context, hours, location

---

## 3. URL Structure Conventions

| Section | Pattern | Example | Notes |
|---------|---------|---------|------|
| Resources | `/resources` | `/resources` | Index only |
| Blog | `/resources/blog` | `/resources/blog` | Index |
| Blog post | `/resources/blog/[slug]` | `/resources/blog/b2b-web-design-trends` | Lowercase, hyphens |
| Industries | `/industries` | `/industries` | Index |
| Industry | `/industries/[slug]` | `/industries/manufacturing` | Lowercase, singular |

**Slug rules:**
- Lowercase only
- Hyphens for word separation
- No special characters
- Singular for industry names (manufacturing, not manufacturers)

---

## 4. Navigation Spec

### Primary Nav (Desktop)

| Order | Label | Link | Notes |
|-------|-------|------|-------|
| 1 | Work | /work | |
| 2 | Services | /services | |
| 3 | Industries | /industries | New |
| 4 | Resources | /resources | New |
| 5 | About | /about | |
| 6 | Contact | /contact | |

**CTA:** "Start a Project" → /contact

### Footer

**Columns:**
1. **Pages:** Work, Services, Industries, Resources, About, Contact
2. **Services:** Web Design, SEO, Full-Service (links to /services/[slug])
3. **Social:** LinkedIn, Twitter, etc.

### Internal Linking Rules

- Every new page should link back to at least one parent (e.g., blog post → /resources/blog)
- Industry pages should link to relevant services
- Service pages should link to relevant industry pages where applicable
- Blog posts should link to related services and case studies

---

## 5. Implementation Notes

1. **Content collections:** Add `blog` and `industries` to `src/content/config.ts`
2. **Routes:** Create `src/pages/resources/`, `src/pages/resources/blog/`, `src/pages/industries/`
3. **Nav:** Update `Nav.astro` and `Footer.astro` with new links
4. **Breadcrumbs:** Consider adding for /resources/blog/[slug] and /industries/[slug]
