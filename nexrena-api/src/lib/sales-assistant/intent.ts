import type { ChatIntent, KnowledgeCategory } from './types'

/** Maps user intent to knowledge categories for retrieval boost */
export const INTENT_CATEGORY_BOOST: Partial<Record<ChatIntent, KnowledgeCategory[]>> = {
  pricing: ['pricing', 'faq', 'objections'],
  services_overview: ['services', 'company'],
  web_design: ['services', 'portfolio', 'faq'],
  seo: ['services', 'faq', 'portfolio'],
  full_service: ['services', 'company'],
  waas: ['pricing', 'services', 'faq'],
  portfolio: ['portfolio'],
  objection: ['objections', 'company', 'pricing'],
  comparison: ['objections', 'pricing', 'faq'],
  timeline: ['services', 'faq', 'process'],
  maintenance: ['pricing', 'faq', 'services'],
  hosting: ['faq', 'pricing'],
  wordpress: ['services', 'faq', 'portfolio'],
  shopify: ['services', 'portfolio'],
  local_seo: ['faq', 'services', 'portfolio'],
  gbp: ['faq', 'services'],
  analytics: ['services', 'portfolio'],
  conversions: ['services', 'portfolio', 'company'],
  branding: ['services', 'company'],
  enterprise: ['pricing', 'services', 'portfolio'],
  local_business: ['pricing', 'services', 'faq'],
  discovery: ['process', 'company'],
  existing_customer: ['process', 'policies'],
}

type IntentRule = { intent: ChatIntent; patterns: RegExp[]; weight: number }

const RULES: IntentRule[] = [
  { intent: 'greeting', patterns: [/^(hi|hello|hey|good (morning|afternoon|evening)|howdy)\b/i], weight: 10 },
  { intent: 'existing_customer', patterns: [/\b(portal|login|billing|invoice|my account|client area)\b/i], weight: 12 },
  { intent: 'discovery', patterns: [/\b(schedule|book a call|discovery|get started|next step|talk to|speak with)\b/i], weight: 11 },
  { intent: 'pricing', patterns: [/\b(price|pricing|cost|how much|budget|rate|fee|afford|\$\d|monthly|per month)\b/i], weight: 10 },
  { intent: 'waas', patterns: [/\b(waas|website as a service|managed website|149|249|399|monthly plan)\b/i], weight: 11 },
  { intent: 'objection', patterns: [/\b(too expensive|not sure|skeptic|burned|trust|worried|concern|why should|convince)\b/i], weight: 10 },
  { intent: 'comparison', patterns: [/\b(vs\.?|versus|compare|better than|wix|squarespace|fiverr|upwork|other agency|competitor)\b/i], weight: 10 },
  { intent: 'wordpress', patterns: [/\b(wordpress|wp\b|elementor|divi)\b/i], weight: 11 },
  { intent: 'shopify', patterns: [/\b(shopify|e-?commerce store|online store)\b/i], weight: 10 },
  { intent: 'local_seo', patterns: [/\b(local seo|local search|near me|geo-target)\b/i], weight: 11 },
  { intent: 'gbp', patterns: [/\b(google business|gbp|google maps|business profile)\b/i], weight: 12 },
  { intent: 'seo', patterns: [/\b(seo|search engine|rank|ranking|organic|keyword|serp|backlink)\b/i], weight: 9 },
  { intent: 'web_design', patterns: [/\b(web design|website|redesign|rebuild|landing page|homepage|astro|next\.js)\b/i], weight: 9 },
  { intent: 'full_service', patterns: [/\b(full.?service|retainer|ongoing partnership|growth partner)\b/i], weight: 11 },
  { intent: 'portfolio', patterns: [/\b(case study|portfolio|work|example|client|forzabuilt|vito|rugged|furniture packages)\b/i], weight: 10 },
  { intent: 'timeline', patterns: [/\b(how long|timeline|weeks|when can|deadline|launch date|asap|urgent)\b/i], weight: 10 },
  { intent: 'maintenance', patterns: [/\b(maintenance|updates|edits|support after|monthly edits|care plan)\b/i], weight: 10 },
  { intent: 'hosting', patterns: [/\b(hosting|server|ssl|domain|vercel|aws)\b/i], weight: 10 },
  { intent: 'analytics', patterns: [/\b(analytics|google analytics|search console|tracking|ga4|metrics)\b/i], weight: 10 },
  { intent: 'conversions', patterns: [/\b(conversion|leads|mql|form|cta|funnel|pipeline)\b/i], weight: 9 },
  { intent: 'branding', patterns: [/\b(brand|branding|logo|rebrand|visual identity)\b/i], weight: 10 },
  { intent: 'enterprise', patterns: [/\b(enterprise|large company|500\+|multi-site|global|corporate)\b/i], weight: 10 },
  { intent: 'local_business', patterns: [/\b(local business|small business|contractor|clinic|salon|restaurant|plumber|hvac)\b/i], weight: 10 },
  { intent: 'ai_topic', patterns: [/\b(ai|artificial intelligence|chatgpt|gemini|automation bot)\b/i], weight: 8 },
  { intent: 'services_overview', patterns: [/\b(what do you (do|offer)|what does nexrena|who is nexrena for|services|capabilities|help with)\b/i], weight: 10 },
  { intent: 'off_topic', patterns: [/\b(recipe|weather|politics|crypto|stock|medical advice|legal advice)\b/i], weight: 15 },
]

export function classifyIntent(message: string, history: string[] = []): ChatIntent {
  const text = [message, ...history.slice(-2)].join(' ').toLowerCase()
  let best: ChatIntent = 'general'
  let bestScore = 0

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        const score = rule.weight + (pattern.test(message) ? 2 : 0)
        if (score > bestScore) {
          bestScore = score
          best = rule.intent
        }
      }
    }
  }

  return best
}

export function intentLabel(intent: ChatIntent): string {
  const labels: Record<ChatIntent, string> = {
    greeting: 'Greeting',
    pricing: 'Pricing inquiry',
    services_overview: 'Services overview',
    web_design: 'Web design & development',
    seo: 'SEO & search growth',
    full_service: 'Full-service growth',
    waas: 'Website-as-a-Service',
    portfolio: 'Portfolio & proof',
    objection: 'Objection handling',
    comparison: 'Competitive comparison',
    timeline: 'Timeline & delivery',
    maintenance: 'Maintenance & support',
    hosting: 'Hosting & infrastructure',
    wordpress: 'WordPress & migrations',
    shopify: 'Shopify & e-commerce',
    local_seo: 'Local SEO',
    gbp: 'Google Business Profile',
    analytics: 'Analytics & measurement',
    conversions: 'Conversion & leads',
    branding: 'Branding',
    ai_topic: 'AI capabilities',
    existing_customer: 'Existing client',
    enterprise: 'Enterprise buyer',
    local_business: 'Local / small business',
    discovery: 'Discovery & next steps',
    off_topic: 'Off-topic',
    general: 'General inquiry',
  }
  return labels[intent] ?? intent
}
