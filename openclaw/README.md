# OpenClaw — Nexrena AI Chief of Staff

A Discord bot powered by Claude that runs agency operations for Nexrena. Handles daily standups, content drafting, lead research, proposals, financial tracking, and general business intelligence — all grounded in real data from the Nexrena API.

## Architecture

```
Discord (slash commands, mentions, DMs)
    │
    ▼
OpenClaw Bot Service
    ├── Claude API (LLM intelligence)
    ├── Nexrena API (projects, contacts, invoices, leads)
    └── Scheduler (cron jobs for standups, briefs, follow-ups)
```

Claw reads live data from the existing `nexrena-api` (Express + Prisma + PostgreSQL) before every response, so answers are always grounded in real business data.

## Prerequisites

- Node.js 18+
- A running `nexrena-api` instance (the Express API in this repo)
- A Discord server you control
- An Anthropic API key (Claude)

## Setup

### 1. Create a Discord Bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application**, name it "Claw"
3. Go to **Bot** tab → click **Reset Token** → copy the token
4. Enable **Message Content Intent** under Bot → Privileged Gateway Intents
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Read Message History`, `Use Slash Commands`, `Embed Links`, `Attach Files`
6. Copy the generated URL and open it to invite the bot to your server

### 2. Set Up Discord Channels

Create these channels in your Discord server:
- `#operations` — daily standups, weekly briefs, financial snapshots
- `#content` — blog drafts, social posts, content calendar
- `#sales` — lead research, pipeline updates, proposals
- `#clients` — client-specific threads, onboarding, follow-ups

### 3. Get Channel & User IDs

Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode), then right-click channels and your own user to copy IDs.

### 4. Configure Environment

```bash
cp .env.example .env
```

Fill in all values in `.env`:
- `DISCORD_TOKEN` — from step 1
- `DISCORD_CLIENT_ID` — from the Discord Developer Portal (General Information → Application ID)
- `DISCORD_GUILD_ID` — right-click your server name → Copy Server ID
- `CHANNEL_OPERATIONS` — right-click #operations → Copy Channel ID
- `BOSS_DISCORD_ID` — right-click yourself → Copy User ID
- `NEXRENA_API_URL` — your API URL (default: `http://localhost:4000`)
- `NEXRENA_API_KEY` — the API key from nexrena-api's `.env`
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)

### 5. Install & Deploy Commands

```bash
npm install
npm run deploy-commands
```

### 6. Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

## Commands

| Command | Description |
|---------|-------------|
| `/status` | Full pipeline, project, and invoice overview |
| `/standup` | Generate a daily standup on demand |
| `/metrics` | Financial snapshot — revenue, outstanding, overdue |
| `/draft blog [topic]` | Draft a blog post |
| `/draft post [topic]` | Draft a LinkedIn/X social post |
| `/draft email [type] [client?]` | Draft an email (outreach, follow-up, invoice-reminder, check-in, welcome) |
| `/research [company]` | Generate a lead research brief |
| `/proposal [client]` | Draft a client proposal |
| `/ask [question]` | Ask Claw anything with full business context |
| `/claw-help` | List all commands |

You can also **@mention Claw** in any channel or **DM the bot** for free-form conversation.

## Scheduled Automations

| Job | Schedule | Channel |
|-----|----------|---------|
| Daily Standup | 9:00 AM Mon–Fri | #operations |
| Weekly Ops Brief | 8:30 AM Monday | #operations |
| Weekly Wrap | 4:00 PM Friday | #operations |
| Monthly Finance Snapshot | 9:00 AM 1st of month | #operations |
| Follow-up Checker | 10:00 AM Mon–Fri | #operations (only posts if issues found) |

All times are in the timezone configured via `TIMEZONE` env var (default: America/New_York).

## Deployment

Recommended hosts: Railway, Fly.io, Render, or any VPS. The bot needs to run 24/7 for scheduled jobs to fire.

```bash
npm run build
npm start
```

Set all `.env` variables as environment variables on your hosting platform.
