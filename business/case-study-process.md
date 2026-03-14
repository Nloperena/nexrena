# Case Study Creation Process

Every project should produce a case study. Case studies are your best sales asset. A prospect who reads a relevant case study is 3x more likely to book a call.

## When to Capture Data

### During the Project

- [ ] Screenshot the "before" state (homepage, key pages, Lighthouse score, Search Console data)
- [ ] Document baseline metrics on day 1 (traffic, conversion rate, page speed, rankings)
- [ ] Log key decisions and why you made them (these become the "approach" section)
- [ ] Screenshot progress milestones (Lighthouse improvements, ranking movement, design iterations)

### At Launch

- [ ] Run full Lighthouse audit and screenshot
- [ ] Record Core Web Vitals (LCP, INP, CLS)
- [ ] Document launch-day analytics snapshot

### 30/60/90 Days Post-Launch

- [ ] Pull traffic data vs. baseline
- [ ] Pull conversion data vs. baseline
- [ ] Pull ranking improvements (Search Console)
- [ ] Get a quote from the client (see below)

## The Case Study Template

Every case study on nexrena.com follows this structure. Use it.

```
---
title: "[Outcome-Focused Title]"
client: "[Company Name]"
vertical: "[Industry]"
year: [Year]
services:
  - [Service 1]
  - [Service 2]
metrics:
  - label: "[Metric Name]"
    value: "[Number]"
  - label: "[Metric Name]"
    value: "[Number]"
  - label: "[Metric Name]"
    value: "[Number]"
  - label: "[Metric Name]"
    value: "[Number]"
featured: true
order: [1-10]
---

[One paragraph context: who is the client and what do they do]

## The Problem

[2-3 paragraphs: What was broken? Why did it matter?
Be specific about the business impact, not just the technical issue.]

## The Approach

[2-3 paragraphs: What did you do? What strategic decisions did you make?
Focus on the WHY behind decisions, not just the WHAT.]

## The Result

[1-2 paragraphs: Specific metrics. Before/after.
End with a forward-looking statement about ongoing impact.]
```

## How to Get a Client Quote

Send this email 30 days after launch:

> Subject: Quick favor — 2 sentences about working with us?
>
> Hi [Name],
>
> We're putting together a quick summary of the [project name] project for our portfolio. Would you be willing to share 1–2 sentences about working with Nexrena?
>
> Something like what the experience was like, or what results you've noticed since launch. Totally in your own words — doesn't need to be polished.
>
> If you're comfortable, we'd also love to include your name and title. But anonymous quotes work too.
>
> Thanks!

**Pro tips:**
- Ask within 30 days while satisfaction is high
- Make it easy — "1-2 sentences" is less intimidating than "testimonial"
- If they say yes but don't follow through, send a draft for them to approve
- Even a Slack message or email response works — you can quote it with permission

## Metrics That Matter by Service Type

### Web Design Case Studies
- Lighthouse score (before/after)
- Page load speed (before/after)
- Bounce rate change
- Lead/conversion rate change
- Time on site change

### SEO Case Studies
- Organic traffic growth (% and absolute)
- Keyword ranking improvements (positions gained)
- Organic leads/conversions growth
- Domain authority change
- Specific keyword rankings (before/after)

### Full-Service Case Studies
- Revenue or pipeline impact
- Cost per acquisition change
- Multiple channel metrics combined
- Year-over-year growth

## Turning Case Studies Into Sales Assets

One case study becomes 5+ pieces of content:

1. **Website case study page** — Full version on nexrena.com/work/[slug]
2. **LinkedIn post** — Condensed result story (see LinkedIn playbook templates)
3. **Proposal proof point** — 3-line summary with key metric in proposals
4. **Sales conversation** — "We had a similar client in [industry] who saw [result]"
5. **Blog post** — Deeper dive on the strategy, linking back to the case study
6. **Email signature** — Rotate a featured stat: "Recent: +140% leads for Forzabuilt"

## Existing Case Studies (Reference)

| Client | File | Key Metric |
|--------|------|------------|
| Forzabuilt | `nexrena-web/src/content/work/forzabuilt.mdx` | +140% organic leads |
| VITO Fryfilter | `nexrena-web/src/content/work/vito-fryfilter.mdx` | +38% conversion, +85% intl revenue |
| Furniture Packages USA | `nexrena-web/src/content/work/furniture-packages-usa.mdx` | +210% organic traffic |
| Rugged Red | `nexrena-web/src/content/work/rugged-red.mdx` | +31% checkout completion |

Build on this library with every new client.
