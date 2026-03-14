# OpenClaw — Nexrena Operational Stack

Everything Claw needs to run ops for Nexrena. 12 documents, organized into 4 layers.

## File Map

```
claw/
├── MEGA_PROMPT.md                          ← The brain (paste into Cowork)
├── NEXRENA_STATE.md                        ← Weekly business snapshot (YOU update this)
├── NEXRENA_PLAYBOOK.md                     ← Services, pricing, ICP, case studies (YOU update this)
├── NEXRENA_VOICE.md                        ← Brand voice + writing samples (YOU update this)
├── prompts/
│   └── SCHEDULED_TASK_PROMPTS.md           ← 8 ready-to-paste Cowork task prompts
├── templates/
│   ├── EMAIL_SEQUENCES.md                  ← 5 sequences: outreach, onboarding, post-launch, nurture, newsletter
│   ├── PROPOSAL_TEMPLATE.md               ← Full client proposal template
│   ├── CONTRACT_TEMPLATE.md               ← Service agreement (GET A LAWYER TO REVIEW)
│   └── DISCOVERY_AND_INTAKE.md            ← Sales call script + 30-question intake + post-call brief
└── reference/
    ├── COMPETITIVE_AND_PRICING.md         ← Market rates, pricing strategy, objection handling
    └── GOOGLE_SHEETS_STRUCTURES.md        ← Exact columns/formulas for all 5 Google Sheets
```

## Strategy: Start with A, Graduate to B

| Phase | What | Time | Where |
|-------|------|------|-------|
| **Phase 1** | Claude Cowork + scheduled tasks | This weekend | This directory |
| **Phase 2** | GitHub Actions for 24/7 cloud ops | Week 2-3 | `.github/workflows/` + `scripts/` |
| **Phase 3** | Custom Discord bot (optional) | Month 2+ | `openclaw/` |

---

## Phase 1: Claude Cowork (This Weekend)

### Step 1: Fill out the 3 context docs (1-2 hours)

This is the highest-leverage work. Everything else is infrastructure.

| File | What to fill in | Time |
|------|----------------|------|
| `NEXRENA_STATE.md` | Current projects, pipeline, financials, priorities | 30 min |
| `NEXRENA_PLAYBOOK.md` | Pricing (marked `[FILL IN]`), competitors, win/loss values | 30 min |
| `NEXRENA_VOICE.md` | 2-3 real writing samples (LinkedIn posts, client emails) | 15 min |

The playbook and voice docs are pre-filled with real data from your codebase (case studies, services, tech stack, brand copy). You just need to add the numbers and writing samples.

### Step 2: Set up Cowork

1. Open Claude Desktop (Pro or Max plan)
2. Connect Google Workspace (Gmail, Drive, Calendar)
3. Point Cowork at this `claw/` directory

### Step 3: Paste scheduled task prompts

Open `prompts/SCHEDULED_TASK_PROMPTS.md` — it has 8 ready-to-paste prompts:

| # | Task | Schedule | What it does |
|---|------|----------|-------------|
| 1 | Daily Standup | 9 AM ET, Mon-Fri | Priority tasks, deadlines, pipeline, revenue |
| 2 | Weekly Ops Brief | 8:30 AM ET, Monday | Full status, priorities, pipeline health, decisions needed |
| 3 | Weekly Wrap | 4 PM ET, Friday | What shipped, what slipped, next week preview |
| 4 | Content Pipeline | 8 PM ET, Sunday | 3 blog drafts + 5 LinkedIn + 5 tweets |
| 5 | Lead Research | On demand | 15 leads with website assessments and outreach angles |
| 6 | Monthly Finance | 9 AM ET, 1st of month | Revenue, expenses, overdue invoices, recommendations |
| 7 | Follow-up Checker | 10 AM ET, Mon-Fri | Flags overdue leads, invoices, and client responses |
| 8 | Proposal Generator | On demand | Full proposal from prospect details |

### Step 4: Create Google Sheets

Open `reference/GOOGLE_SHEETS_STRUCTURES.md` for exact column specs, formulas, and conditional formatting for:

1. **Master Project Tracker** — projects, phases, deadlines, budgets
2. **CRM / Lead Tracker** — pipeline, scoring, follow-up dates
3. **Content Calendar** — drafts, approvals, publishing schedule
4. **Revenue Tracker** — invoices, payments, overdue tracking
5. **Monthly P&L** — revenue vs expenses, margins, win rate

### Step 5: Calibrate (Week 1)

- Run each task manually, refine the prompts
- If content sounds off, add more samples to `NEXRENA_VOICE.md`
- If Claw is missing context, update `NEXRENA_STATE.md`

---

## Templates Claw Uses

When Claw needs to produce a deliverable, it references these:

| Template | When it's used |
|----------|---------------|
| `templates/PROPOSAL_TEMPLATE.md` | `/proposal` command or proposal generator task |
| `templates/EMAIL_SEQUENCES.md` | Drafting outreach, onboarding, follow-up, or nurture emails |
| `templates/CONTRACT_TEMPLATE.md` | After a deal is won (get a lawyer to review first!) |
| `templates/DISCOVERY_AND_INTAKE.md` | Before and after sales calls |

## Reference Material

| Reference | What it covers |
|-----------|---------------|
| `reference/COMPETITIVE_AND_PRICING.md` | Market rate benchmarks, pricing strategy, objection handling playbook |
| `reference/GOOGLE_SHEETS_STRUCTURES.md` | Exact specs for all 5 operational Google Sheets |

---

## Phase 2: GitHub Actions (Week 2-3)

For 24/7 cloud automation. Set 4 GitHub Secrets and it runs forever:

| Secret | Value |
|--------|-------|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `NEXRENA_API_URL` | Deployed nexrena-api URL |
| `NEXRENA_API_KEY` | API bearer token |
| `DISCORD_WEBHOOK_URL` | Discord #operations webhook URL |

Workflows live in `.github/workflows/`. The task runner is `scripts/claw_task.py`.

## Phase 3: Custom Discord Bot (Optional)

Full Discord bot with 10 slash commands lives in `openclaw/`. See `openclaw/README.md`.

---

## What to do right now

1. **Fill in `NEXRENA_STATE.md`** — your actual projects, pipeline, financials (30 min)
2. **Fill in `NEXRENA_PLAYBOOK.md`** — pricing and competitors (30 min)
3. **Add writing samples to `NEXRENA_VOICE.md`** (15 min)
4. **Set up Cowork** — paste mega prompt + first scheduled task (1-2 hrs)
5. **Create Google Sheets** — follow `reference/GOOGLE_SHEETS_STRUCTURES.md`
