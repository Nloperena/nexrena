/**
 * Offline sales assistant test runner (no LLM required).
 * Run: npx tsx src/lib/sales-assistant/tests/run-tests.ts
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { classifyIntent } from '../intent'
import { retrieveKnowledge } from '../retrieval'
import { generateGroundedReply } from '../grounded-fallback'
import { isGenericFallback } from '../guardrails'

type TestQuestion = {
  id: string
  category: string
  question: string
}

const bankPath = join(__dirname, 'question-bank.json')

function loadQuestions(): TestQuestion[] {
  try {
    const raw = JSON.parse(readFileSync(bankPath, 'utf8')) as { questions: TestQuestion[] }
    return raw.questions
  } catch {
    console.error('Run generate-questions.ts first')
    process.exit(1)
  }
}

const CATEGORY_INTENT_MAP: Record<string, string[]> = {
  pricing: ['pricing', 'waas'],
  seo: ['seo', 'local_seo'],
  redesigns: ['web_design', 'timeline'],
  maintenance: ['maintenance', 'waas'],
  objections: ['objection', 'comparison'],
  comparisons: ['comparison', 'pricing'],
  hosting: ['hosting', 'waas'],
  wordpress: ['wordpress', 'web_design'],
  shopify: ['shopify', 'web_design'],
  timelines: ['timeline', 'web_design'],
  ai: ['ai_topic', 'general'],
  branding: ['branding', 'services_overview'],
  local_seo: ['local_seo', 'seo'],
  gbp: ['gbp', 'local_seo'],
  analytics: ['analytics', 'conversions'],
  conversions: ['conversions', 'web_design'],
  general: ['general', 'services_overview', 'greeting', 'discovery'],
}

function run() {
  const questions = loadQuestions()
  let passed = 0
  let failed = 0
  let intentWarnings = 0
  const failures: string[] = []

  for (const q of questions) {
    const intent = classifyIntent(q.question)
    const retrieval = retrieveKnowledge(q.question, intent)
    const reply = generateGroundedReply(q.question, intent, [{ role: 'user', content: q.question }])

    const allowedIntents = CATEGORY_INTENT_MAP[q.category] ?? ['general']
    const intentOk = allowedIntents.includes(intent) || intent === 'general'
    if (!intentOk) intentWarnings += 1

    const retrievalOk = retrieval.chunks.length > 0 && retrieval.topScore >= 2
    const replyOk = reply.length > 40 && !isGenericFallback(reply)

    if (retrievalOk && replyOk) {
      passed += 1
    } else {
      failed += 1
      failures.push(
        `${q.id} [${q.category}] intent=${intent} retrieval=${retrieval.topScore} replyLen=${reply.length}\n  Q: ${q.question}`,
      )
    }
  }

  console.log(`\nSales Assistant Test Results`)
  console.log(`Total: ${questions.length} | Passed: ${passed} | Failed: ${failed}`)
  console.log(`Intent warnings (non-blocking): ${intentWarnings}`)
  console.log(`Pass rate: ${((passed / questions.length) * 100).toFixed(1)}%`)

  if (failures.length) {
    console.log(`\nFirst 15 failures:`)
    failures.slice(0, 15).forEach((f) => console.log(f))
  }

  process.exit(failed > 0 ? 1 : 0)
}

run()
