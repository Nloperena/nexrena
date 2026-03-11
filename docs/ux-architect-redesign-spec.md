# Nexrena Award-Winning Redesign — UX Architect Spec

**Agent:** @ux-architect  
**Date:** 2025-03-10  
**Goal:** General redesign toward Awwwards/Webflow award-winning quality  
**Status:** Specification — ready for phased implementation

---

## 1. Current State Assessment

### What Works
- **Brand palette:** Obsidian, gold, cream — premium, distinctive
- **Typography:** Cormorant Garamond + DM Sans — editorial, readable
- **Custom cursor:** Already in place
- **Scroll progress bar:** Already in place
- **Marquee:** Service strip — good momentum
- **ManifestoStrip:** Scroll-driven word reveal — award-adjacent
- **Section transitions:** Diagonal-cut, grain — texture and depth
- **Project hero objects:** Singular focus, on-brand imagery

### Gaps vs. Award-Winning Sites
| Pattern | Current | Target |
|---------|---------|--------|
| **Page transitions** | None (hard navigation) | Smooth fade/morph between routes |
| **Hero impact** | Good, but static after load | Scroll-triggered parallax, layered depth |
| **Work presentation** | Table + bento grid | Horizontal scroll gallery or full-bleed cards |
| **Section rhythm** | Consistent padding | Varied viewport-driven sections (full-screen, split) |
| **Navigation** | Standard fixed nav | Minimal, morphing, or creative reveal |
| **Micro-interactions** | Basic hover | Cursor-follow, magnetic buttons, staggered reveals |
| **Typography scale** | Solid | Bolder — larger hero, more contrast |
| **Preloader** | None | Brief branded load (optional) |

---

## 2. Award-Winning Design Patterns to Adopt

### A. Scroll-Driven Storytelling
- **Parallax layers** in hero (background, mid, foreground)
- **Scroll-triggered reveals** with stagger (already partial via `.reveal`)
- **Full-viewport sections** for key moments (manifesto, work intro)
- **Horizontal scroll** for work/projects (optional — high impact)

### B. Layout & Structure
- **Broken grid** — asymmetric sections, overlapping elements
- **Full-bleed imagery** — edge-to-edge where appropriate
- **Generous negative space** — or controlled density, not both randomly
- **Section numbers/labels** — "01 / Work", "02 / Services" (already in ManifestoStrip)

### C. Motion & Interaction
- **Page transitions** — Astro View Transitions or similar
- **Magnetic buttons** — already present
- **Staggered list reveals** — on scroll into view
- **Hover previews** — work index already has floating preview
- **Smooth scroll** — `scroll-behavior: smooth` (already set)

### D. Typography & Hierarchy
- **Larger hero type** — push `text-hero` toward 160px+ on large screens
- **Stronger contrast** — warm-white on obsidian, gold accents
- **Display vs. body** — clearer separation (Cormorant for display, DM Sans for body — already done)
- **Line-height** — tighter on display, looser on body

### E. Navigation
- **Minimal header** — logo + hamburger, or logo + 2–3 links + CTA
- **Full-screen overlay menu** — on open (already have mobile overlay)
- **Sticky with blur** — already implemented on scroll
- **Optional:** Morphing nav (transparent → solid on scroll)

---

## 3. Redesign Direction

### Design Principles
1. **Premium, not playful** — B2B, growth infrastructure, serious
2. **Editorial, not generic** — Magazine-like rhythm, strong typography
3. **Depth through layers** — Parallax, grain, gradients
4. **Intentional motion** — Every animation has purpose
5. **Consistent branding** — Obsidian, gold, cream throughout

### Layout Philosophy
- **Home:** Hero → Marquee → Manifesto (full-screen) → About (split) → Services (cards) → Work (horizontal or bento) → Process → Testimonials → CTA
- **Inner pages:** PageHero (full or short) → Content → CTA
- **Work detail:** Hero with project object → Challenge/Solution/Outcome → Next project

---

## 4. Key UX Changes (Prioritized)

### Phase 1 — Foundation (High Impact, Lower Effort)
1. **Page transitions** — Add Astro View Transitions API
2. **Hero parallax** — Layer background/mid/foreground with different scroll speeds
3. **Typography bump** — Increase hero and h1 scale
4. **Section rhythm** — Add 1–2 full-viewport sections (e.g., manifesto, work intro)

### Phase 2 — Work & Navigation
5. **Work section** — Consider horizontal scroll for projects (or enhanced bento with hover states)
6. **Navigation** — Refine overlay menu, add desktop mega or minimal links
7. **Staggered reveals** — Ensure all key sections use `.reveal` + IntersectionObserver

### Phase 3 — Polish
8. **Preloader** — Optional 1–2s branded load
9. **Micro-interactions** — Refine cursor states, button hovers
10. **Performance** — Lazy load below-fold images, optimize animations

---

## 5. Technical Implementation Notes

### Astro View Transitions
```html
<!-- In Layout.astro head -->
<ViewTransitions />
```
- Enables smooth fade/slide between page navigations
- Requires `transition:animate` or custom swap

### Parallax (Hero)
- Use `transform: translateY()` based on `scrollY`
- Or CSS `animation-timeline: view()` for scroll-driven
- Keep subtle — 10–20% movement max

### Horizontal Scroll (Work)
- `overflow-x: auto` on container
- `display: flex` with `flex-shrink: 0` cards
- Snap points: `scroll-snap-type: x mandatory`
- Or use a library (e.g., Lenis + horizontal section)

### Full-Viewport Sections
- `min-height: 100vh` or `min-height: 100dvh`
- `display: flex; align-items: center; justify-content: center`
- Content centered, optional scroll indicator

---

## 6. CSS Architecture Additions

### New Utility Classes (Suggested)
```css
/* Full viewport section */
.section-full {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(80px, 12vw, 140px) 5vw;
}

/* Horizontal scroll container */
.scroll-horizontal {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: 2rem;
  padding: 0 5vw;
}

.scroll-horizontal > * {
  flex-shrink: 0;
  scroll-snap-align: start;
}

/* Parallax layer */
.parallax-layer {
  will-change: transform;
}
```

### Typography Scale (Proposed Bump)
```css
--text-hero:   clamp(80px, 12vw, 160px);  /* was 72px–140px */
--text-h1:     clamp(52px, 7vw, 110px);   /* was 48px–96px */
```

---

## 7. File Structure Impact

| Area | Change |
|------|--------|
| `Layout.astro` | Add ViewTransitions, optional preloader |
| `Hero.astro` | Add parallax layers, bump type scale |
| `Work.astro` | Consider horizontal scroll variant |
| `global.css` | Add `.section-full`, `.scroll-horizontal`, typography bump |
| `animations.css` | Parallax keyframes or scroll-driven |
| New | `Preloader.astro` (optional) |

---

## 8. Success Criteria

- [ ] Page transitions feel smooth (no jarring full reload)
- [ ] Hero has perceptible depth (parallax or layered motion)
- [ ] Typography feels bolder, more editorial
- [ ] At least one full-viewport section creates "moment"
- [ ] Work section feels intentional (horizontal or enhanced bento)
- [ ] Navigation is minimal, premium, accessible
- [ ] Performance: LCP < 2.5s, CLS < 0.1
- [ ] Accessibility: Keyboard nav, reduced-motion respect

---

## 9. Implementation Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Foundation | ✅ Done | ClientRouter, hero parallax, typography bump, section-full |
| Phase 2 — Work & Nav | ✅ Done | Horizontal scroll work section, staggered reveals |
| Phase 3 — Polish | Pending | Optional preloader, micro-interactions |

## 10. Next Steps

1. **Test** — Performance (LCP, CLS), accessibility, cross-browser
2. **Phase 3** — Optional preloader, refine micro-interactions
3. **Iterate** — Navigation refinements based on feedback

---

*ArchitectUX Agent — Redesign specification. Phase 1 & 2 implemented 2025-03-10.*
