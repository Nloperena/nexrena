/**
 * Generates 250+ realistic visitor questions for sales assistant QA.
 * Run: npx tsx src/lib/sales-assistant/tests/generate-questions.ts
 */
import { writeFileSync } from 'fs'
import { join } from 'path'

type TestQuestion = {
  id: string
  category: string
  question: string
  expectIntent?: string
  mustMention?: string[]
}

const categories: Record<string, string[]> = {
  pricing: [
    'How much does a website cost?',
    'What are your monthly website plans?',
    'Is $249 per month realistic for a local business?',
    'Do you have anything under $200 a month?',
    'What does the $399 Lead Engine plan include?',
    'Is there a setup fee for WaaS?',
    'Why is there a 12-month minimum?',
    'Can I pay yearly instead of monthly?',
    'How much for a 10-page B2B site?',
    'What does a $30k project typically include?',
    'Do you offer payment plans on custom builds?',
    'What is included in the Growth plan at $249?',
    'How do project builds compare to WaaS pricing?',
    'We have a budget of around 15k — what can we get?',
    'Our budget is 50k+ — is that enterprise territory?',
    'Are hosting and maintenance included in the monthly price?',
    'What counts as a monthly edit?',
    'If I cancel after 12 months what happens?',
    'Can we buy the source files if we leave?',
    'Do you publish prices or is everything custom quote?',
    'How much would SEO cost per month?',
    'Is full-service growth on a retainer?',
    'What is the cheapest way to work with Nexrena?',
    'We are a startup — can we afford you?',
    'Compare your pricing to hiring a freelancer',
  ],
  seo: [
    'What does your SEO service include?',
    'How long until SEO results show up?',
    'Can you fix technical SEO on our existing site?',
    'Do you guarantee first page rankings?',
    'We lost rankings after a redesign — can you help?',
    'Do you do keyword research?',
    'Will you write blog content for SEO?',
    'How is Nexrena SEO different from an audit PDF?',
    'Do you handle redirects during migration?',
    'Can you improve Core Web Vitals?',
    'Do you set up Google Search Console?',
    'What SEO work did you do for Forzabuilt?',
    'We need local SEO for Florida — do you do that?',
    'How do you measure SEO success?',
    'Do you do link building?',
    'Can SEO be added to a WaaS plan?',
    'We rank for brand terms only — can you fix that?',
    'Technical SEO vs content — which do you prioritize?',
    'Do you support international SEO and hreflang?',
    'How often do you report on SEO progress?',
  ],
  redesigns: [
    'We need a full website redesign — where do we start?',
    'How long does a B2B redesign take?',
    'Can you redesign without losing our Google rankings?',
    'We are on WordPress and want something faster',
    'Our site looks outdated — what is the process?',
    'Do you migrate content from our old site?',
    'We need a rebrand and new site together',
    'Can you rebuild our homepage first then expand?',
    'What happens in discovery for a redesign?',
    'We have 200+ product pages — can you handle that?',
    'How do you approach information architecture?',
    'Do you use Astro or Next.js for rebuilds?',
    'Can you embed our existing Shopify store?',
    'We need a headless CMS — do you support Sanity?',
    'What does handoff look like after launch?',
    'Do you train our team on the new CMS?',
    'Our agency left us with a mess — can you take over?',
    'We need better conversion paths on our site',
    'Can you audit our current site before quoting?',
    'Timeline for an 8-week redesign — realistic?',
  ],
  maintenance: [
    'Do you offer website maintenance after launch?',
    'What is included in ongoing support?',
    'How many hours of edits come with Growth plan?',
    'Can you update our site monthly?',
    'Who handles plugin and security updates?',
    'We need someone to manage our WordPress updates',
    'Is maintenance included in WaaS?',
    'What if we need a new page mid-contract?',
    'Do you monitor site speed ongoing?',
    'Can we move from a project to a care plan?',
    'What is Website as a Service exactly?',
    'We want launch and forget — is that WaaS?',
    'How fast do you respond to support requests?',
    'Do Lead Engine clients get priority support?',
    'What happens if our site goes down?',
  ],
  objections: [
    'You seem expensive compared to Fiverr',
    'We got burned by an agency before',
    'Why should I trust a solo operator?',
    'Can you prove ROI on website investment?',
    'We need this live in 2 weeks — can you do it?',
    'Our CEO wants cheapest option',
    'We already have an in-house developer',
    'Why not just use Wix?',
    'We are not sure we need a new site yet',
    'How do I know SEO will actually work?',
    'What if Nexrena is not the right fit?',
    'Do you lock us into proprietary tech?',
    'We had a bad experience with SEO vendors',
    'Is a 12-month contract too long for us?',
    'Can you beat this quote from another agency?',
  ],
  comparisons: [
    'Nexrena vs a traditional agency',
    'How are you different from Webflow experts?',
    'WaaS vs hiring a full-time web person',
    'Compare Launch vs Growth plan',
    'Shopify theme vs custom build — your take?',
    'WordPress vs Astro for our manufacturing site',
    'Do you compete with Squarespace?',
    'Why pick Nexrena over a local web shop?',
    'Full-service vs web design only — which fits us?',
    'Retainer vs one-time project — pros and cons?',
  ],
  hosting: [
    'Do you include hosting?',
    'Where are sites hosted — Vercel?',
    'Do we own our domain?',
    'Is SSL included?',
    'Can you migrate our DNS?',
    'What about email hosting?',
    'Do WaaS plans include security monitoring?',
    'Can we use our own hosting provider?',
    'What uptime do you target?',
    'How do you handle backups?',
  ],
  wordpress: [
    'Can you work with our WordPress site?',
    'Do you migrate off WordPress?',
    'We use Elementor — can you improve it?',
    'WordPress is slow — can you fix performance?',
    'Will you maintain our WordPress plugins?',
    'Can you preserve URLs when leaving WordPress?',
    'Is WordPress still a good choice for B2B?',
    'We need WooCommerce help',
    'Our WordPress site was hacked — can you help?',
    'Migrate WordPress to headless — do you do that?',
  ],
  shopify: [
    'Do you build Shopify stores?',
    'Can you customize our Shopify theme?',
    'We need headless Shopify — experience?',
    'Shopify vs custom e-commerce for our brand?',
    'Tell me about the VITO Fryfilter Shopify work',
    'Can you improve Shopify conversion rate?',
    'Do you integrate Stripe outside Shopify?',
    'International Shopify setup — can you help?',
    'Shopify SEO improvements',
    'We outgrew our Shopify theme',
  ],
  timelines: [
    'How fast can you launch a new site?',
    'What is a realistic timeline for SEO?',
    'We need something before trade show season',
    'Can WaaS launch faster than a custom build?',
    'How long is discovery?',
    'When can we book a kickoff?',
    '6 weeks for a 5-page site — doable?',
    'Enterprise timeline for portal build?',
    'What delays projects most often?',
    'Can you start next month?',
  ],
  ai: [
    'Do you use AI in your builds?',
    'Can you add an AI chatbot to our site?',
    'Is this chat powered by AI?',
    'Do you offer AI automation for leads?',
    'Can AI help with content creation?',
    'What AI tools does Nexrena use internally?',
  ],
  branding: [
    'Do you do logo design?',
    'We need a full rebrand with the website',
    'Is branding included in WaaS?',
    'Can you refresh our visual identity?',
    'Brand guidelines with the new site?',
    'Do you only do web or branding too?',
  ],
  local_seo: [
    'We are a local HVAC company — can you help?',
    'Do you do local SEO for contractors?',
    'We need to rank in Orlando and Kissimmee',
    'Local landing pages for multiple cities?',
    'How do you help service area businesses?',
    'Local SEO for a dental clinic',
    'We get calls from Google Maps — can you improve that?',
    'Multi-location local SEO strategy',
    'Do you create city-specific service pages?',
    'Local SEO vs national SEO — what fits us?',
  ],
  gbp: [
    'Can you optimize our Google Business Profile?',
    'Google Maps listing help?',
    'Is GBP setup included in Growth plan?',
    'Our Google Business listing is wrong',
    'Do you manage reviews on Google?',
    'Google Business Profile vs website SEO',
  ],
  analytics: [
    'Do you set up Google Analytics?',
    'Can you help us track form submissions?',
    'GA4 setup included?',
    'How do you measure website ROI?',
    'Conversion tracking for our ads',
    'Dashboard for marketing metrics?',
    'Do you use Search Console reporting?',
    'Can you fix our broken analytics?',
  ],
  conversions: [
    'Our site gets traffic but no leads',
    'How do you improve conversion rate?',
    'We need more qualified MQLs from the website',
    'Can you redesign our contact funnel?',
    'Landing page for a specific campaign?',
    'Quote form optimization',
    'What did Forzabuilt achieve for leads?',
    'B2B lead capture best practices?',
    'How many leads should we expect?',
    'CTA and form strategy for manufacturers',
  ],
  general: [
    'What does Nexrena do?',
    'Who is Nexrena for?',
    'Tell me about your company',
    'Where are you located?',
    'Who runs Nexrena?',
    'Do you work with manufacturers?',
    'Can you share client testimonials?',
    'Show me case studies',
    'How do I get started?',
    'Can I schedule a discovery call?',
    'What industries do you specialize in?',
    'Are you taking new clients?',
    'What is full-service digital growth?',
    'Do you work with ecommerce brands?',
    'Professional services website experience?',
    'How do I contact Nico?',
    'What is your discovery process?',
    'Client portal login?',
    'I am an existing client — billing question',
    'What tech stack do you prefer?',
  ],
}

const questions: TestQuestion[] = []
let n = 0

for (const [category, list] of Object.entries(categories)) {
  for (const question of list) {
    n += 1
    questions.push({
      id: `q-${String(n).padStart(3, '0')}`,
      category,
      question,
    })
  }
}

// Variations to exceed 250
const extras = [
  'pricing', 'seo', 'redesigns', 'maintenance', 'objections',
].flatMap((cat) =>
  (categories[cat] ?? []).slice(0, 5).map((q, i) => ({
    category: cat,
    question: q.replace('?', '') + ' for a manufacturing company?',
    suffix: `-mfg-${i}`,
  })),
)

// Extra paraphrases to exceed 250 test cases
const paraphraseTemplates = [
  { cat: 'pricing', templates: ['What would we pay for {x}?', 'Ballpark cost for {x}?', 'Is {x} in our budget at $20k?'] },
  { cat: 'seo', templates: ['Help with {x}', 'Need advice on {x}', 'Our issue: {x}'] },
  { cat: 'general', templates: ['Quick question about {x}', 'Curious about {x}', 'Tell me more about {x}'] },
]

const seeds = ['website redesign', 'local SEO', 'monthly website plan', 'manufacturing site', 'lead generation']

for (const { cat, templates } of paraphraseTemplates) {
  for (const seed of seeds) {
    for (const tpl of templates) {
      n += 1
      questions.push({
        id: `q-${String(n).padStart(3, '0')}`,
        category: cat,
        question: tpl.replace('{x}', seed),
      })
    }
  }
}

const outPath = join(__dirname, 'question-bank.json')
writeFileSync(outPath, JSON.stringify({ version: 1, count: questions.length, questions }, null, 2))
console.log(`Wrote ${questions.length} questions to ${outPath}`)
