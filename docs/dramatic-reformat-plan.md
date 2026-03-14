# Nexrena Dramatic Reformat Plan - Phase 2 (Awwwards Polish)

Based on the feedback that the sections below the fold need to feel more dramatically different and align with Clou/Beaucoup interactions, this plan overhauls the remaining homepage components to use highly interactive GSAP ScrollTrigger patterns and massive typography.

---

## 1. ManifestoStrip (Beaucoup Style)
**Goal:** Transform from a basic scrolling text block into a cinematic typography experience.
- **Change:** Switch to a dark theme (`var(--obsidian)`) to blend seamlessly with the sections above.
- **Interaction:** Use GSAP ScrollTrigger to scrub the opacity of the text. As the user scrolls down, the massive text "We build the digital engine. You run the business." lights up word-by-word tied directly to the scrollbar.
- **Typography:** Increase font size dramatically to fill the viewport.

## 2. ServiceStack (Clou Style)
**Goal:** Move away from overlapping sticky cards to a sleek, hover-driven interactive list.
- **Layout:** A clean, minimal list of services using massive typography (e.g., "Web Design", "SEO & Search Growth").
- **Interaction (Hover Reveal):** When the user hovers over a service name, a related image or video thumbnail smoothly scales up and reveals itself (either expanding inline or following the cursor). The non-hovered services dim (rack focus).
- **Style:** Minimal borders, no boxes. Just pure typography and fluid motion.

## 3. ProcessSticky (Horizontal Scroll)
**Goal:** Replace the vertical sticky cards with a premium GSAP horizontal scroll.
- **Interaction:** The section pins to the screen when reached. As the user continues to scroll down, the 4 process steps slide in horizontally from the right, creating a lateral timeline effect.
- **Style:** Large numbered steps (01, 02) with clean typography. This is a signature Awwwards interaction pattern that breaks the vertical monotony.

## 4. About Section (Cinematic Split)
**Goal:** Elevate from a standard text grid to a dramatic visual section.
- **Layout:** High-contrast split layout. 
- **Interaction:** A massive image with a parallax scroll effect on one side, and the about text gracefully sliding up on the other. 
- **Metrics:** Move the "04 Projects / 3 Verticals" badges into a sleeker, floating UI element within the section.

## 5. Testimonials
**Goal:** Remove the generic dot-slider in favor of an immersive quote display.
- **Layout:** Full-screen or very large block featuring a single, massive quote at a time.
- **Interaction:** GSAP-powered fading transitions between quotes. Minimalist controls (no basic dots, perhaps stylized arrows or auto-progressing lines).

---

### Implementation Details
- **Dependencies:** We will heavily utilize `gsap` and `gsap/ScrollTrigger`.
- **CSS Clean-up:** We will remove the native CSS `animation-timeline` (which can feel janky or unsupported in some browsers) and replace it entirely with GSAP for buttery-smooth performance across all devices.

---
*Please review this plan. If approved, I will immediately begin executing these dramatic changes.*