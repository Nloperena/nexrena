import type { KnowledgeChunk } from '../types'

export const processKnowledge: KnowledgeChunk[] = [
  {
    id: 'process-discovery',
    category: 'process',
    title: 'Discovery process',
    content:
      'Discovery starts with understanding goals, constraints, current site/stack, and buyer journeys. For custom builds: architecture doc and conversion mapping in first 30 days. For WaaS: tier selection and intake. Next step: contact form at nexrena.com/contact or book at nexrena.com/schedule — Nico typically responds within one business day.',
    keywords: ['discovery', 'get started', 'first step', 'onboarding', 'kickoff'],
    source: 'nexrena.com/contact',
  },
  {
    id: 'process-schedule',
    category: 'process',
    title: 'Schedule a call',
    content:
      'Book a discovery call at nexrena.com/schedule. Best for discussing scope, fit, timeline, and whether WaaS or a custom project makes sense. Come prepared with your current site URL, goals, and rough timeline.',
    keywords: ['schedule', 'call', 'meeting', 'book', 'calendly', 'talk'],
    source: 'nexrena.com/schedule',
  },
  {
    id: 'process-contact',
    category: 'process',
    title: 'Contact and intake',
    content:
      'Contact form at nexrena.com/contact captures company, goals, budget range, and project type. Existing clients: sign in at nexrena.com/portal for billing, messages, and service requests.',
    keywords: ['contact', 'email', 'reach', 'form', 'intake'],
    source: 'nexrena.com/contact',
  },
  {
    id: 'process-web-build-phases',
    category: 'process',
    title: 'Web build phases',
    content:
      'Phase 1: Audit + Blueprint — conversion map, architecture decisions. Phase 2: System Build — design system, templates, performance, measurement. Phase 3: Launch + Iterate — QA, weekly optimization on priority pages. One senior operator end-to-end.',
    keywords: ['process', 'phases', 'how work', 'methodology'],
    source: 'nexrena.com/services/web-design',
  },
]

export const objectionsKnowledge: KnowledgeChunk[] = [
  {
    id: 'objection-expensive',
    category: 'objections',
    title: 'Too expensive objection',
    content:
      'WaaS starts at $149/mo — often less than fragmented hosting + freelancer edits + neglected SEO. Custom B2B builds ($10k–$50k+) reflect senior-operator delivery without agency overhead. We will recommend the smallest fit (e.g. Growth WaaS vs enterprise rebuild) if budget is tight.',
    keywords: ['expensive', 'too much', 'costly', 'afford', 'cheaper'],
    source: 'nexrena.com/pricing',
  },
  {
    id: 'objection-agency-burn',
    category: 'objections',
    title: 'Bad agency experience',
    content:
      'Common pain we solve: agencies that ship visuals not systems, audit PDFs never implemented, handoff queues. Nexrena difference: one accountable senior operator, fixes shipped to production, written handoff so your team can operate without dependency.',
    keywords: ['agency', 'burned', 'bad experience', 'trust', 'skeptical'],
    source: 'nexrena.com/about',
  },
  {
    id: 'objection-timeline',
    category: 'objections',
    title: 'Need it fast',
    content:
      'Realistic timelines: WaaS onboarding faster than full custom rebuild. Core B2B builds 6–8 weeks; rushing without strategy usually creates SEO and conversion debt. We will be honest if your deadline requires phased launch vs full scope.',
    keywords: ['urgent', 'asap', 'fast', 'rush', 'deadline'],
    source: 'nexrena.com/services',
  },
  {
    id: 'objection-diy',
    category: 'objections',
    title: 'Why not DIY or Fiverr',
    content:
      'DIY and low-cost freelancers work for simple presence; they rarely deliver conversion architecture, migration-safe SEO, or maintainable CMS governance. Nexrena fits when the site needs to generate qualified leads and stay maintained without you managing tech.',
    keywords: ['fiverr', 'upwork', 'diy', 'in-house', 'freelancer'],
    source: 'nexrena.com/pricing',
  },
  {
    id: 'objection-competitor',
    category: 'objections',
    title: 'Comparing agencies',
    content:
      'Compare on: who implements SEO fixes (us vs PDF), performance evidence (case studies with metrics), post-launch ownership model, and whether one senior operator owns delivery vs account-manager relay. We welcome technical buyers who ask hard questions.',
    keywords: ['compare', 'versus', 'competitor', 'other agency', 'why you'],
    source: 'nexrena.com/work',
  },
]

export const policiesKnowledge: KnowledgeChunk[] = [
  {
    id: 'policy-ai-disclaimer',
    category: 'policies',
    title: 'AI assistant limitations',
    content:
      'This assistant uses official Nexrena content but may make mistakes. Custom scope, legal terms, and final quotes require human review. For binding project quotes, use contact form or discovery call.',
    keywords: ['ai', 'chatbot', 'accuracy', 'disclaimer'],
    source: 'nexrena.com',
  },
  {
    id: 'policy-scope',
    category: 'policies',
    title: 'Scope boundaries',
    content:
      'Website plans include listed foundation items only. Additional pages, copywriting, advanced SEO, booking tools, automations, and custom features are add-ons or scoped projects with written quote before commitment.',
    keywords: ['scope', 'included', 'not included', 'extra'],
    source: 'nexrena.com/pricing',
  },
]
