# Nexrena Sales Assistant — Architecture

Production AI digital consultant for nexrena.com. Replaces ~80% of initial sales consultation while staying grounded in official content.

## 1. Overall architecture

```
Visitor (SiteChatWidget)
    → POST /api/chat { messages, sessionId, pageUrl }
        → spam guard + rate limit
        → sales-assistant orchestrator
            ├── intent classification (keyword rules)
            ├── qualification extraction (conversation)
            ├── knowledge retrieval (scored chunks)
            ├── prompt assembly (base + intent overlay + context)
            ├── Gemini generateContent (optional)
            ├── grounded fallback (retrieval-based)
            ├── guardrails (banned phrases, price check)
            ├── action + suggestion builder
            └── analytics (Postgres)
```

**Design critique:** Keyword intent + lexical retrieval avoids vector DB ops cost on Heroku for v1, but will miss paraphrases. Upgrade path: embed chunks in pgvector or Pinecone when gap logs exceed threshold.

## 2. Knowledge structure

| Layer | Location | Source of truth |
|-------|----------|-----------------|
| Company | `knowledge/company.ts` | nexrena.com/about |
| Services | `knowledge/services.ts` | nexrena.com/services |
| Pricing | `knowledge/pricing.ts` | nexrena.com/pricing (WaaS + projects) |
| Portfolio | `knowledge/portfolio.ts` | nexrena.com/work |
| FAQs | `knowledge/faqs.ts` | nexrena.com/resources/faq |
| Process | `knowledge/process.ts` | contact, schedule, delivery |
| Objections | `knowledge/process.ts` | pricing + about positioning |
| Policies | `knowledge/process.ts` | scope + AI disclaimer |

Chunks: `{ id, category, title, content, keywords[], source }`.

**Critique:** Duplicated from marketing TS files — add CI sync script from `nexrena-web/src/data/*.ts` to prevent drift.

## 3. Prompt hierarchy

1. **Base system prompt** (`prompts/system.ts`) — consultant persona, voice, anti-patterns
2. **Intent overlay** — pricing, objection, discovery, etc.
3. **Injected KNOWLEDGE CONTEXT** — top 5 retrieved chunks
4. **VISITOR SIGNALS** — extracted qualification
5. **RECOMMENDATION HINTS** — rule-based service matches

**Critique:** Single LLM call keeps latency low; no tool-calling loop yet. Future: explicit `schedule_call` tool when leadScore > 60.

## 4. Retrieval design

Priority order matches official content tiers:

1. Official Nexrena chunks (all modules)
2. Intent category boost (pricing intent → pricing + faq + objections)
3. Keyword + token overlap scoring

Hallucination prevention: system prompt requires grounding; guardrails flag unknown dollar amounts; low retrieval score logs `ChatKnowledgeGap`.

**Upgrade:** Hybrid BM25 + embeddings; cite chunk IDs in UI.

## 5. Guardrails

- Banned hype / guarantee phrases
- Price allowlist for published tiers
- Generic fallback detection → force grounded reply
- Honeypot + rate limits (existing `chat-spam-guard.ts`)
- maxOutputTokens: 550, temperature: 0.45

## 6. Sales framework

**Consultative flow:** Answer → qualify (one question) → recommend → CTA.

**Objection handling:** Acknowledge → evidence from portfolio/pricing → smallest honest fit.

**Trust:** Real metrics (Forzabuilt 28 MQLs, VITO +38% CVR), testimonials, transparent limits.

## 7. Conversation flows

| Persona | Intent routing | Typical path |
|---------|----------------|--------------|
| Pricing | `pricing`, `waas` | Publish tiers → fit question → Growth vs project |
| Objections | `objection`, `comparison` | Acknowledge → proof → schedule |
| Redesign | `web_design`, `timeline` | Process → migration SEO → case study |
| SEO | `seo`, `local_seo` | Ship fixes narrative → timeline honesty |
| Local business | `local_business`, `waas` | WaaS tiers → Growth recommended |
| Enterprise | `enterprise` | Custom scope → discovery call |
| Existing client | `existing_customer` | Portal redirect |
| Technical buyer | `wordpress`, `shopify`, `hosting` | Stack specifics from KB |
| Non-technical | `waas`, `general` | Plain language, managed care |

## 8. Lead qualification framework

Fields (extracted naturally): company, industry, goals, timeline, budget, decisionMaker, currentWebsite, painPoint.

Lead score 0–100 from field weights + high-intent intents.

Next question selector asks one missing high-value field — never interrogation list.

## 9. Testing suite

- `tests/generate-questions.ts` — 250+ questions across 17 categories
- `tests/run-tests.ts` — offline pass: intent plausibility, retrieval score ≥ 2, non-generic reply

Run: `npm run test:sales-assistant`

**Production gate:** Run before deploy; with `GEMINI_API_KEY`, spot-check 20 live prompts for tone.

## 10. Continuous improvement roadmap

| Signal | Storage | Action |
|--------|---------|--------|
| User messages | `chat_turns` | Review weekly |
| Low retrieval | `chat_knowledge_gaps` | Add KB chunks |
| Flagged outputs | `chat_turns.flagged` | Tune guardrails |
| Lead score distribution | `chat_sessions.leadScore` | Optimize CTAs |
| Intent distribution | `chat_turns.intent` | Expand overlays |

**Analytics queries:** Top unresolved gaps, conversion to `/schedule` clicks (add UTM on action buttons), sessions with leadScore ≥ 50 without contact.

**Monthly:** Export gaps → update KB → re-run test suite → adjust prompts.

## API response shape

```json
{
  "message": "...",
  "configured": true,
  "sessionId": "sess_...",
  "intent": "pricing",
  "actions": [{ "type": "schedule", "label": "Book discovery call", "href": "/schedule/" }],
  "suggestedReplies": ["..."],
  "qualification": { "goals": "more leads" },
  "leadScore": 32,
  "grounded": false
}
```

## Env vars

- `GEMINI_API_KEY` — LLM (optional; grounded fallback always works)
- `GEMINI_MODEL` — default `gemini-2.0-flash`
- `DATABASE_URL` — analytics persistence

## Known limitations

1. Gemini key must be unrestricted for server-side Heroku calls
2. In-memory session state resets on dyno restart (qualification also in Postgres via turns)
3. Internal `business/pricing-guide.md` retainers not in public KB — intentionally excluded
4. No streaming yet
