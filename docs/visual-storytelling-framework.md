# Nexrena Visual Storytelling Framework

**Agents:** @visual-storyteller @image-prompt-engineer @whimsy-injector  
**Date:** 2025-03-10  
**Purpose:** Visual narrative strategy, AI image prompts, and whimsy integration for Nexrena brand storytelling

---

## 1. Visual Narrative Arc

### Story Structure

| Phase | Setup | Conflict | Resolution |
|-------|------|----------|------------|
| **Emotion** | Curiosity, ambition | Frustration, friction | Confidence, clarity |
| **Visual** | Before state — complexity, noise | Tension — stalled growth | After state — flow, precision |
| **Protagonist** | Mid-market company (manufacturer, ecommerce, professional services) | Same, stuck in technical debt or weak search | Same, equipped with growth engine |

### Emotional Journey Map

```
[Curiosity]  →  "We need to grow but something's off"
       ↓
[Recognition] →  "Our site/search isn't working for us"
       ↓
[Tension]    →  "Sales is chasing leads instead of closing"
       ↓
[Hope]       →  "There's a better way"
       ↓
[Resolution] →  "We built something that compounds"
       ↓
[Delight]    →  Whimsy: discovery moments, subtle personality
```

---

## 2. Brand Visual Language

| Element | Value | Use |
|---------|-------|-----|
| **Obsidian** | #0C0F12 | Primary dark, depth, premium |
| **Gold** | #C9A96E | Accent, warmth, achievement |
| **Cream** | #F5F0E8 | Light sections, contrast |
| **Warm White** | #FDFCFA | Typography, clarity |
| **Slate** | #7A8A9E | Secondary text, subtlety |

**Mood:** Premium, engineered, warm. Not cold tech — human-scale growth.  
**Whimsy touch:** Gold used sparingly for moments of delight (hover states, achievements, Easter eggs).

---

## 3. AI Image Prompts — Production Ready

### Hero / Homepage

**Prompt (Midjourney / DALL·E / Flux):**
```
Abstract representation of digital growth: obsidian black background (#0C0F12), 
thin gold wireframe lines (#C9A96E) forming a rising graph or circuit pattern, 
soft cream gradient (#F5F0E8) emerging from bottom third, minimal and premium, 
no people, editorial photography style, shallow depth of field on foreground 
elements, shot on 85mm f/1.8, inspired by luxury brand campaigns, 8k, 
commercial advertising quality, subtle grain texture
```

**Negative prompt:** cluttered, busy, stock photo, generic tech imagery, blue/purple gradients

---

### Services — Web Design

**Prompt:**
```
Minimal product photography: single premium laptop or tablet displaying 
a clean B2B website interface on obsidian dark screen, gold accent line 
on UI element, cream/white typography, soft studio lighting from 45 degrees 
camera left, large softbox creating gentle gradient, shot on 50mm f/2.8, 
focus on screen content, shallow depth of field on edges, warm ambient 
fill, editorial quality, no people
```

---

### Services — SEO Growth

**Prompt:**
```
Conceptual image: abstract search or discovery metaphor — obsidian 
background, gold filament or thread forming upward path or branching 
structure, cream light at top suggesting destination, minimal, 
fine art photography aesthetic, shot on macro lens, selective focus, 
subtle grain, cinematic color grade, inspired by Peter Lindbergh 
minimalism
```

---

### Services — Full-Service

**Prompt:**
```
Split or layered composition: left side obsidian dark with subtle 
gold wireframe, right side cream/light with warm gradient, thin 
gold seam connecting both, representing partnership and integration, 
minimal, architectural photography style, 35mm lens, deep focus, 
premium brand aesthetic
```

---

### Industries — Manufacturing

**Prompt:**
```
Industrial manufacturing environment, abstracted: machinery silhouettes 
or geometric forms in obsidian and slate, single gold accent — 
perhaps a control panel light or precision tool — suggesting 
technical precision, soft natural light from high window, 
documentary style, 50mm, shallow depth of field, warm tones
```

---

### Industries — E-Commerce

**Prompt:**
```
E-commerce growth metaphor: product packaging or parcel in cream 
and obsidian, gold ribbon or detail, clean uncluttered background, 
soft studio lighting, lifestyle product photography, 85mm f/2, 
premium brand aesthetic, no text visible
```

---

### Industries — Professional Services

**Prompt:**
```
Professional environment, abstracted: leather-bound materials or 
premium desk surface in obsidian and cream, gold pen or detail, 
soft window light, editorial photography, 50mm, shallow depth of 
field, trust and authority mood, no faces
```

---

### Blog / Resources

**Prompt:**
```
Editorial flat lay: notebook, pen, gold accent object, obsidian 
surface, cream paper, subtle grain, natural light from side, 
documentary style, 35mm, shallow depth of field, warm and 
approachable, content creation mood
```

---

## 4. Whimsy Integration

### Subtle Whimsy (Already Present)
- **Easter egg wordmark** — Footer hover on "Nexrena" letters
- **Custom cursor** — Magnetic hover on interactive elements
- **Scroll progress bar** — Visible progress feedback

### Recommended Additions

| Location | Whimsy Element | Purpose |
|----------|----------------|---------|
| **404 page** | "This page went on vacation. Let's get you back on track." | Error state delight |
| **Form success** | Brief gold highlight or subtle animation on submit | Success celebration |
| **Blog post end** | "Made it to the end? You're officially a growth nerd." | Discovery whimsy |
| **Contact CTA** | Microcopy: "Ready to build something that compounds?" | Personality |
| **Loading states** | "Sprinkling some digital magic..." | Reduce perceived wait |

### Whimsy Taxonomy for Nexrena

- **Subtle:** Hover states, gold accent reveals, scroll-triggered fades
- **Interactive:** Magnetic buttons, cursor feedback, Easter egg footer
- **Discovery:** Hidden 404 copy, blog post end easter, Konami code (optional)
- **Contextual:** Industry-specific microcopy, service-specific CTAs

---

## 5. Cross-Platform Adaptation

| Platform | Format | Primary Use |
|----------|--------|-------------|
| **Website** | Hero, section backgrounds, cards | Narrative-driven visuals |
| **LinkedIn** | 1200×627, 1080×1080 | Professional, editorial |
| **Blog** | 1200×630 OG, featured images | Article thumbnails |
| **Social** | Vertical 9:16 for stories | Behind-the-scenes, process |

---

## 6. Implementation Notes

- **Accessibility:** All images require alt text. Decorative visuals: `alt=""`.
- **Performance:** Use WebP, lazy loading, responsive srcset.
- **Consistency:** Stick to obsidian/gold/cream palette in all generated assets.
- **Whimsy:** Test with reduced-motion users; ensure no critical info is hidden.

---

*Next: Generate assets using prompts above, then integrate into `nexrena-web/public/images/` with appropriate naming (e.g., `hero-abstract.webp`, `services-web-design.webp`).*
