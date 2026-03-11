# Nexrena Award-Winning Redesign — UI Designer Spec

**Agent:** @ui-designer  
**Date:** 2025-03-10  
**Goal:** Cutting-edge scroll/sticky effects, trust signals, animations, and branding  
**Status:** Implemented

---

## 1. Design Principles

### Trust Through Motion
- **Scroll-driven storytelling** — Sections pin, reveal, and layer as the user scrolls
- **Animated trust signals** — Stats count up when in view; client names scroll
- **Sticky scroll architecture** — Multiple sections use `scroll-travel` + `sticky-pin` for premium feel

### Visual Language
- **Obsidian + Gold + Cream** — Existing palette preserved
- **Cormorant Garamond** (display) + **DM Sans** (body) + **DM Mono** (labels)
- **Grain texture** — Subtle film grain for depth
- **Diagonal cuts** — Section transitions with clip-path

### Accessibility
- All scroll animations respect `prefers-reduced-motion: reduce`
- IntersectionObserver fallback for browsers without `animation-timeline: view()`
- WCAG AA contrast maintained

---

## 2. Scroll & Sticky Architecture

### Implemented Patterns

| Section | Effect | Implementation |
|---------|--------|----------------|
| **ManifestoStrip** | 400vh scroll-travel, sticky pin, word-by-word reveal | `scroll-travel-4x`, `sticky-pin`, `animation-timeline: view()` |
| **ServiceStack** | 3 cards pin sequentially (stacked deck) | `scroll-travel-2x` per card, `sticky-pin` with offset |
| **ProcessSticky** | 4 steps pin and reveal on scroll | `scroll-travel-2x` per step, `sticky-pin` |
| **TrustSignals** | Animated stat counters + client marquee | IntersectionObserver count-up, CSS marquee |
| **About** | Scroll-driven fade, slide, scale | `scroll-fade-in`, `scroll-slide-up`, `scroll-scale-up` |
| **Work** | Full-viewport intro + horizontal scroll cards | `section-full`, `scroll-scale-up`, horizontal scroll |
| **Hero** | Parallax background layers | JS scroll-driven `translateY` on layers |

### CSS Scroll-Driven Classes (scroll.css)
- `.scroll-fade-in` — Fade + translateY on entry
- `.scroll-scale-up` — Scale 0.7→1 on entry
- `.scroll-slide-up` — Slide 4rem up on entry
- `.scroll-clip-reveal` — Clip-path left-to-right
- `.card-settle` — Card translateY on entry

---

## 3. Trust Signals Component

### Animated Stats
- **04** Projects Delivered
- **3** Industry Verticals
- **100%** Client Retention

Count-up animation triggers at 30% viewport intersection. Easing: cubic ease-out.

### Client Strip
- Horizontal marquee of client names (Forzabuilt, Rugged Red, Vito Fryfilter, Furniture Packages USA)
- Pause on hover
- Opacity transition on hover

---

## 4. Design Tokens Added

```css
/* Z-index sediment layers */
--z-section-1 through --z-section-6

/* Spacing (4px base) */
--space-2, --space-3, --space-4, --space-6, --space-8, --space-12, --space-16, --space-24

/* Section padding */
--section-pad-x: 5vw
```

---

## 5. Component Map

| Component | Location | Purpose |
|-----------|----------|---------|
| Hero | Home | Parallax, hero animation |
| Marquee | Home | Service strip |
| ManifestoStrip | Home | Sticky scroll, word reveal |
| About | Home | Scroll-fade, scroll-slide, scroll-scale |
| ServiceStack | Home | Sticky service cards (replaces Services) |
| TrustSignals | Home | Animated stats, client strip |
| Work | Home | Full-viewport intro, horizontal scroll |
| ProcessSticky | Home | Sticky process steps (replaces Process) |
| Testimonials | Home | Carousel |
| CTA | Home | Final CTA |

---

## 6. Browser Support

- **animation-timeline: view()** — Chrome 115+, Safari 18+, Firefox 133+
- **Fallback** — `.reveal` + IntersectionObserver for older browsers
- **Reduced motion** — All scroll animations disabled via `@media (prefers-reduced-motion: reduce)`

---

## 7. Future Enhancements

- [ ] Lenis smooth scroll (optional)
- [ ] GSAP ScrollTrigger for complex sequences (if CSS insufficient)
- [ ] Preloader with brand reveal
- [ ] Horizontal scroll for full Work gallery on inner page

---

*UI Designer — Redesign spec. Implemented 2025-03-10.*
