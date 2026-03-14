# Autonomous Optimization Architect — Baseline & Boundaries

**Agent:** `@autonomous-optimization-architect`  
**Phase 1 Deliverable** — Nexrena Project  
**Date:** 2026-03-11

---

## 1. Current Production State

### External Dependencies (Cost & Failure Modes)

| Dependency | Type | Cost Model | Failure Mode | Circuit Breaker? |
|-------------|------|------------|--------------|------------------|
| **Vercel Analytics** | Client-side script | Free tier (Vercel) | Blocked by ad blockers; no user impact | N/A — non-critical |
| **Google Fonts** | Stylesheet | Free | Network failure → FOUT; site still renders | Fallback: system fonts |
| **Vercel Hosting** | CDN/Edge | Per-project | 5xx, timeout | Vercel handles; no app-level fallback |

### AI/LLM APIs in Production

**None.** The Nexrena stack is currently:
- **nexrena-web**: Static Astro site (no server-side API calls)
- **nexrena-ops**: Next.js with local JSON store (no external AI)
- **nexrena-next**: Next.js marketing site (no AI)

---

## 2. Hard Boundaries (When AI/APIs Are Added)

Before deploying any auto-routing or LLM integration, establish:

### Financial Guardrails

| Limit | Recommended Value | Rationale |
|-------|-------------------|-----------|
| **Max cost per execution** | $0.05 | Single request (e.g., contact form → AI summarization) |
| **Max cost per user session** | $0.50 | Chat, multi-turn, or heavy extraction |
| **Daily budget cap** | $20 | Circuit breaker trips; alert admin |
| **Retry cap** | 3 | No unbounded retries |

### Security Guardrails

| Rule | Implementation |
|------|----------------|
| **Timeout** | Every external request: 5s max |
| **Fallback** | Cheapest viable provider must be designated |
| **Anomaly halt** | 500% traffic spike → trip breaker, route to fallback |
| **402/429** | Immediate failover; no retry storm |

### Evaluation Criteria (Shadow Testing)

When shadow-testing a new model, use **mathematical scoring**:

```
Score = (5 × JSON_valid) + (3 × latency_bonus) + (-10 × hallucination)
```

- **JSON_valid**: 1 if output parses; 0 otherwise
- **latency_bonus**: 1 if < 2s; 0.5 if < 4s; 0 otherwise
- **hallucination**: 1 if output contradicts source; 0 otherwise

---

## 3. Fallback Mapping (Future)

When adding LLM providers, map:

| Primary | Fallback | Cost/1M (approx) | Use Case |
|---------|----------|------------------|----------|
| Claude 3.5 Sonnet | Gemini 1.5 Flash | $3 / $0.075 | Extraction, summarization |
| GPT-4o | GPT-4o-mini | $5 / $0.15 | Complex reasoning |
| Gemini 1.5 Pro | Gemini 1.5 Flash | $1.25 / $0.075 | Long context |

---

## 4. Next Steps (When AI Is Introduced)

1. **Phase 2**: Implement `optimization-router.ts` (see `src/lib/`)
2. **Phase 3**: Shadow-deploy 5% of traffic to experimental model
3. **Phase 4**: Telemetry — log cost-per-execution, latency, failure rate
4. **Phase 5**: Autonomous promotion when experimental model beats baseline by >10% at <50% cost

---

*Circuit breaker: No open-ended retries. No unbounded API calls. Every request has a timeout, retry cap, and fallback.*
