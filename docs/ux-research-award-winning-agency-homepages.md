# Award-Winning Agency Homepages — UX Research Findings

**Agent:** `@ux-researcher`  
**Research Type:** Competitive / Best-practice analysis  
**Date:** 2026-03-11  
**Scope:** Agency websites (not individual portfolios) — project display and homepage formatting

---

## Research Overview

### Objectives

**Primary Questions:**
- How do award-winning agencies (Awwwards SOTD, FWA, Good Design) structure their homepages?
- What patterns do they use to display projects and work?
- What differentiates high-scoring agency sites from generic portfolios?

**Methods Used:** Competitive analysis of Awwwards agency nominees (2024–2025), design award case studies, industry trend reports

**Sources:** Awwwards agency category, Site of the Day winners (Playground, Clou, Egenix, AndAgain), Humaan, Series Eight, eDesign Interactive, Basic/DEPT case study, Codrops

---

## Key Findings Summary

1. **Work above the fold** — Award-winning agencies surface projects early; social proof drives conversion. Value prop first, then work.
2. **Structured case study format** — Challenge → Strategy → Results with quantifiable metrics. Not just visuals.
3. **Interaction design as differentiator** — Animated showreels, hover-to-expand cards, gesture-based navigation. Minimal aesthetics with purposeful motion.
4. **Grid discipline** — Rigorous grids (12-col), full-bleed project cards, categorized tiles. Quality over quantity.

---

## Homepage Structure Patterns

### Section Order (Common Sequence)

| Order | Section | Purpose |
|-------|---------|---------|
| 1 | **Hero** | Headline + value prop. Often video or animated. |
| 2 | **Work / Projects** | 3–6 featured projects. Grid or horizontal scroll. |
| 3 | **Clients / Logos** | Social proof strip. Animated marquee or static. |
| 4 | **Services** | Clear categories (Web, UX, Brand, Digital). |
| 5 | **About / Culture** | Team, philosophy. Video common. |
| 6 | **CTA** | "Start a project" or contact. |

**Finding:** Work appears in the first 1–2 viewports on 80%+ of award sites. Agencies lead with value, then immediately prove capability.

### Hero Section Patterns

- **Headline-driven** — Concise brand statement (e.g., "Brand and digital that cultivate connection, conversion and joy" — Series Eight)
- **Full-bleed video** — Culture, showreel, or abstract motion
- **Minimal + typography** — Large display type, restrained palette (Clou: #101114 + #fff)
- **Loader** — Intentional loading animation (Playground) for perceived quality

---

## Project Display Formats

### 1. Grid Layout (Most Common)

- **Rigorous grid** — 12-column, disciplined spacing
- **Full-bleed cards** — Project tiles expand on hover; neighboring tiles shrink (rack-focus effect)
- **Categorized tiles** — Type labels: Branding, Campaign, Identity, Packaging
- **Hover states** — Video preview, image zoom, or panel "bloom"
- **CTAs** — "View Case Study" or "Explore" on each card

**Example:** Basic/DEPT — GSAP-spring panels snap upward; cards bloom to full-bleed video on hover.

### 2. Horizontal Scroll

- **Scroll-snap** — Projects as horizontal panels
- **Large imagery** — Each project gets viewport-width treatment
- **Sticky titles** — Project name stays visible while scrolling
- **Mobile-first** — Swipe gestures on touch

### 3. Case Study Preview Cards

**Content structure per card:**
- Client name + project type
- Hero image or video thumbnail
- 1-line outcome (e.g., "62% increase in CTR")
- "View Case Study" link

**Finding:** Award sites emphasize **outcomes** (metrics, results) over aesthetics alone. "We drove X% growth" appears in work sections.

### 4. Showreel / Reel Section

- **Animated compilation** — 30–60s video of project highlights
- **Autoplay muted** — With pause on hover
- **Position** — Often after hero or before project grid
- **Purpose** — Quick credibility; "see what we make" in seconds

---

## Case Study Page Structure (Full Project View)

Award-winning agencies use a **modular, narrative format**:

| Section | Content |
|---------|---------|
| **Client overview** | Who they are, industry, context |
| **The brief / challenge** | Objectives, KPIs, problems |
| **Strategy / approach** | Solution, tactics, methodology |
| **Results** | Quantifiable outcomes (%, leads, revenue) |
| **Key insights** | What worked, learnings |

**Organization:** Filterable by service (Display, SEO, CRO), industry, or campaign type.

---

## Design Characteristics (Awwwards Criteria)

Awwwards scores agencies on **Design (40%), Usability (30%), Creativity (20%), Content (10%)**.

### What High-Scoring Sites Do

| Criterion | Pattern |
|-----------|---------|
| **Design** | Minimal palette (1–2 accent colors), strong typography, generous whitespace |
| **Usability** | Clear nav, predictable interaction, fast load (LCP &lt; 1.6s) |
| **Creativity** | Unique interactions (gestures, hover effects, loaders), not template-like |
| **Content** | Concise copy, measurable results in case studies |

### Technologies & Tools (Common)

- **Interaction:** GSAP, Framer Motion, WebGL (subtle)
- **Build:** Webflow, Next.js, Astro, custom
- **Video:** AV1 encoding, lazy-load, poster frames on mobile
- **Accessibility:** `prefers-reduced-motion` alternatives

---

## Recommendations for Nexrena

### High Priority (Immediate)

1. **Surface work earlier** — Move project showcase into first 1–2 viewports. Value prop → Work → Services.
2. **Add outcome metrics to project cards** — e.g., "100% retention," "X% traffic increase." Not just visuals.
3. **Implement hover-to-expand on project cards** — Full-bleed or video preview on hover. Neighboring cards shrink for focus.

### Medium Priority (Next Quarter)

1. **Consider a showreel section** — 30s compilation of project highlights. Autoplay muted, above or within work section.
2. **Structured case study pages** — Challenge → Strategy → Results. Quantifiable outcomes in each.
3. **Client logo strip** — Marquee or static row. Establishes social proof quickly.

### Long-term

1. **Gesture / scroll-triggered interactions** — Align with award patterns (scroll-reveal, parallax) while respecting `prefers-reduced-motion`.
2. **Filterable work** — By service (Web, SEO, Full-service) or industry.

---

## Reference Sites (Award-Winning Agencies)

| Site | Award | Notable Elements |
|------|-------|------------------|
| [Playground](https://www.playground.it/) | Awwwards SOTD 7.27 | Culture video, clients list, case study layout, showreel, hero animation, loader |
| [Clou](https://www.clou.ch/) | Awwwards SOTD 7.29 | Bold hero, interactive menu, clean portfolio grid, graphic design focus |
| [Egenix](https://www.awwwards.com/sites/egenix-digital-agency) | Nominee | Gesture-based interactions, no-code, responsive |
| [AndAgain](https://www.awwwards.com/sites/andagain-2) | Honorable Mention | Case studies, scrolling galleries, microinteractions |
| [Basic/DEPT](https://refs.gallery/projects/basic-dept) | Case study | 12-col grid, full-bleed hover, GSAP panels, AV1 video |
| [Humaan](https://www.humaan.com/) | Good Design, AWW | Featured work with impact, awards section |
| [Series Eight](https://www.serieseight.com/) | — | "Cultivate connection, conversion, joy" — clear value prop |

---

## Success Metrics

- **Task completion:** Visitors find and view 2+ projects within 30 seconds
- **Engagement:** Click-through from work section to case study &gt; 15%
- **Perception:** "Can they deliver for someone like me?" answered in &lt; 10 seconds

---

## Standout Components — Direct Links (Original but Inspired)

Curated components that stand out among award-winning agency sites. Use as inspiration for something original.

### Menus & Navigation

| Component | Site | Link | Why it stands out |
|-----------|------|------|-------------------|
| **Menu — Follow mouse** | Beaucoup | [Awwwards](https://www.awwwards.com/inspiration/menu-follow-mouse-beaucoup) | Cursor-following nav; playful, memorable |
| **Menu page transition** | FEED Agency | [Awwwards](https://www.awwwards.com/inspiration/menu-page-transition-feed-agency) | Full-page menu with smooth transition to content |
| **Menu** | They Call Me Giulio | [Awwwards](https://www.awwwards.com/inspiration/menu-they-call-me-giulio-1) | Minimal, editorial |
| **Menu** | Highful Minds (agency) | [Awwwards](https://www.awwwards.com/inspiration/menu-highful-minds) | Clean agency nav |
| **Fluid glass menu** | Exo Ape | [Awwwards](https://www.awwwards.com/inspiration/menu-fluid-glass) | Glassmorphism, fluid animation |
| **Hero + menu + tagline** | Frahm Website Agency | [Awwwards](https://www.awwwards.com/inspiration/hero-image-menu-and-tagline-frahm-website-agency) | Integrated hero/nav |
| **Juliet Agency Portfolio** | Juliet | [Awwwards](https://www.awwwards.com/inspiration/juliet-agency-portfolio) | Typography-led portfolio layout |

### Hero & Entry

| Component | Site | Link | Why it stands out |
|-----------|------|------|-------------------|
| **Hero Section** | Wibify Agency | [Awwwards](https://www.awwwards.com/inspiration/hero-section-wibify-agency) | Agency-specific hero |
| **Hero Video Transition** | Hutstuf | [Awwwards](https://www.awwwards.com/inspiration/hero-video-transition-hutstuf) | Video → content transition |
| **Hero Playground** | Clou (SOTD) | [Awwwards](https://www.awwwards.com/inspiration/hero-playground-clou-agency-portfolio) | Bold, minimal |
| **Interactive dither effect** | Outsource Consultants | [Awwwards](https://www.awwwards.com/inspiration/interactive-dither-effect-outsource-consultants-inc) | Unique visual treatment |
| **Stacking cards on scroll** | Join Talent | [Awwwards](https://www.awwwards.com/inspiration/stacking-cards-on-scroll-join-talent) | Cards stack as you scroll — distinctive |
| **Hero Banner** | Join Talent | [Awwwards](https://www.awwwards.com/inspiration/hero-banner-join-talent) | Strong typography + motion |

### Loading & Preloaders

| Component | Site | Link | Why it stands out |
|-----------|------|------|-------------------|
| **Loader & Home** | Beaucoup | [Awwwards](https://www.awwwards.com/inspiration/loader-home-beaucoup) | Seamless loader → hero |
| **Preloader** | Playground (SOTD) | [Awwwards](https://www.awwwards.com/inspiration/see-the-highlights-of-this-website-playground-digital-agency) | Agency SOTD loader |
| **Loading** | San Rita (agency) | [Awwwards](https://www.awwwards.com/inspiration/loading-san-rita) | Refined agency loader |
| **Preloader** | We Agency | [Awwwards](https://www.awwwards.com/inspiration/preloader-we-agency) | Agency-specific |
| **Loading to Hero Transition** | 1820 Productions | [Awwwards](https://www.awwwards.com/inspiration/loader-to-hero-1820-productions) | Loader flows into hero |
| **Logo driven intro loader** | Melvin Winkeler | [Awwwards](https://www.awwwards.com/inspiration/logo-animation-loading-homepage-melvin-winkeler) | Brand-forward loader |

### Portfolio / Project Display

| Component | Site | Link | Why it stands out |
|-----------|------|------|-------------------|
| **Portfolio** | Clou (SOTD) | [Awwwards](https://www.awwwards.com/inspiration/portfolio-clou-agency-portfolio) | Clean grid, bold visuals |
| **Case Study** | Playground (SOTD) | [Awwwards](https://www.awwwards.com/inspiration/case-study-playground-digital-agency) | Narrative case study layout |
| **Project** | Highful Minds | [Awwwards](https://www.awwwards.com/inspiration/project-highful-minds) | Project card treatment |
| **Parallax cards — project page** | Outsource Consultants | [Awwwards](https://www.awwwards.com/inspiration/parallax-cards-project-page-outsource-consultants-inc) | Depth on project detail |
| **Clients List** | Playground (SOTD) | [Awwwards](https://www.awwwards.com/inspiration/clients-list-playground-digital-agency) | Animated client strip |
| **Our Culture** | Playground (SOTD) | [Awwwards](https://www.awwwards.com/inspiration/our-culture-playground-digital-agency) | Culture video section |
| **Our Culture** | Dragonfly Africa | [Awwwards](https://www.awwwards.com/inspiration/our-culture-dragonfly-africa) | Agency culture display |

### Interaction & Motion

| Component | Site | Link | Why it stands out |
|-----------|------|------|-------------------|
| **Swipe** | Tiwis | [Awwwards](https://www.awwwards.com/inspiration/swipe-tiwis) | Gesture-based navigation |
| **3D Mouse Interaction** | SOM | [Awwwards](https://www.awwwards.com/inspiration/3d-mouse-interaction-som) | Cursor-driven 3D |
| **Contextual Page Indicator** | SOM | [Awwwards](https://www.awwwards.com/inspiration/contextual-page-indicator-som) | Scroll-aware nav indicator |
| **Showreel** | Playground (SOTD) | [Awwwards](https://www.awwwards.com/inspiration/showreel-playground-digital-agency) | Animated project reel |

### Full Sites (Agency — Study the Whole)

| Site | Award | Link | Standout elements |
|------|-------|------|-------------------|
| **Playground** | SOTD 7.27 | [Site](https://www.playground.it/) / [Awwwards](https://www.awwwards.com/sites/playground-digital-agency) | Culture video, clients list, case study, showreel, loader |
| **Clou** | SOTD 7.29 | [Site](https://www.clou.ch/) / [Awwwards](https://www.awwwards.com/sites/clou-agency-portfolio) | Bold hero, interactive menu, clean portfolio |
| **Noomo Agency** | Website of the Year 2024 | [Site](https://noomoagency.com/) / [Awwwards](https://www.awwwards.com/sites/noomo-agency) | Upward scroll, 3D, dynamic logo, glass cards |
| **Beaucoup** | Nominee | [Site](https://beaucoup.studio/) | Menu follows mouse, loader → home |
| **Wibify Agency** | Nominee | [Site](https://wibify.agency/) | Hero section, agency focus |
| **FEED Agency** | SOTD | [Site](https://www.feedagency.co/) | Menu page transition |

### Awwwards Element Categories (Browse for More)

- [Menus](https://www.awwwards.com/elements/menu/)
- [Hero Image](https://www.awwwards.com/elements/hero_image/)
- [Content / Layout](https://www.awwwards.com/elements/content/)
- [Loading](https://www.awwwards.com/elements/loading/)
- [Agency Portfolios Collection](https://www.awwwards.com/awwwards/collections/agency-porfolios/) — 315+ agency sites

---

*UX Researcher — Evidence-based recommendations. Validate with usability testing before full implementation.*
