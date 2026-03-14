"""
Claw scheduled task runner for GitHub Actions.
Pulls live data from the Nexrena API, generates output via Claude, posts to Discord webhook.
"""

import os
import json
import requests
import anthropic


def get_env(key: str) -> str:
    val = os.environ.get(key)
    if not val:
        raise RuntimeError(f"Missing env var: {key}")
    return val


def fetch_api(path: str) -> list:
    url = get_env("NEXRENA_API_URL")
    key = get_env("NEXRENA_API_KEY")
    try:
        res = requests.get(
            f"{url}/api{path}",
            headers={"Authorization": f"Bearer {key}"},
            timeout=15,
        )
        res.raise_for_status()
        return res.json()
    except Exception as e:
        print(f"API fetch {path} failed: {e}")
        return []


def build_context(task: str) -> str:
    projects = fetch_api("/projects")
    contacts = fetch_api("/contacts")
    invoices = fetch_api("/invoices")
    leads = fetch_api("/leads")

    sections = []

    active_projects = [p for p in projects if p.get("status") not in ("delivered", "on_hold")]
    if active_projects:
        lines = ["### Active Projects"]
        for p in active_projects:
            deadline = f" — due {p['endDate']}" if p.get("endDate") else ""
            lines.append(f"- **{p['name']}** ({p['clientName']}) — {p['status']} — ${p.get('value', 0):,.0f}{deadline}")
        sections.append("\n".join(lines))

    active_contacts = [c for c in contacts if c.get("stage") not in ("won", "lost")]
    if active_contacts:
        lines = ["### Sales Pipeline"]
        for c in active_contacts:
            lines.append(f"- **{c['name']}** @ {c['company']} — {c['stage']} — est. ${c.get('value', 0):,.0f}")
        sections.append("\n".join(lines))
    elif task in ("standup", "weekly-brief"):
        sections.append("### Sales Pipeline\nPipeline is empty — consider an outreach sprint.")

    overdue = [i for i in invoices if i.get("status") == "overdue"]
    sent = [i for i in invoices if i.get("status") == "sent"]
    if overdue:
        lines = ["### Overdue Invoices"]
        for i in overdue:
            total = sum(l["quantity"] * l["rate"] for l in i.get("lineItems", []))
            lines.append(f"- {i['number']} — {i['clientName']} — ${total:,.0f} — due {i['dueDate']}")
        sections.append("\n".join(lines))
    if sent:
        lines = ["### Awaiting Payment"]
        for i in sent:
            total = sum(l["quantity"] * l["rate"] for l in i.get("lineItems", []))
            lines.append(f"- {i['number']} — {i['clientName']} — ${total:,.0f} — due {i['dueDate']}")
        sections.append("\n".join(lines))

    if leads[:10]:
        lines = ["### Recent Leads"]
        for l in leads[:10]:
            company = f" @ {l['company']}" if l.get("company") else ""
            lines.append(f"- **{l['name']}**{company} — {l['email']} — {l['createdAt'][:10]}")
        sections.append("\n".join(lines))

    return "\n\n".join(sections) if sections else "No data available from the API."


TASK_PROMPTS = {
    "standup": (
        "Generate today's daily standup. Use this format:\n\n"
        "**Today's Pulse — [today's date]**\n"
        "**PRIORITY:** [Top 3 things needing attention]\n"
        "**DEADLINES:** [Anything due within 48 hours]\n"
        "**WAITING ON:** [Anything blocked]\n"
        "**PIPELINE:** [Quick lead/deal status]\n"
        "**FYI:** [Reminders, suggestions]\n\n"
        "Be specific — use real project names, client names, invoice numbers, and amounts."
    ),
    "weekly-brief": (
        "Generate the Monday Weekly Ops Brief. Include:\n"
        "- Active projects + status\n"
        "- This week's priorities (ranked)\n"
        "- 7-day deadline lookahead\n"
        "- Blockers or decisions needed\n"
        "- Revenue pipeline snapshot\n"
        "- Leads going cold\n"
        "Be specific and actionable."
    ),
    "weekly-wrap": (
        "Generate the Friday Weekly Wrap. Include:\n"
        "- What got done this week\n"
        "- What slipped and why\n"
        "- Next week preview\n"
        "- Client follow-ups needed\n"
        "- Wins to celebrate\n"
        "Be honest about what slipped."
    ),
    "monthly-finance": (
        "Generate the Monthly Financial Snapshot. Include:\n"
        "- Revenue collected last month\n"
        "- Outstanding invoices with amounts\n"
        "- Overdue breakdown\n"
        "- Upcoming expected revenue\n"
        "- Patterns or concerns\n"
        "- Recommendations"
    ),
    "follow-up-check": (
        "Check for anything needing follow-up:\n"
        "- Overdue invoices\n"
        "- Stale leads (no update 5+ days)\n"
        "- Stalled projects\n"
        "If everything looks good, say so briefly."
    ),
}

SYSTEM_PROMPT = (
    "You are Claw — the autonomous Chief of Staff for Nexrena, a web and app development agency. "
    "You work for Boss (the founder/lead dev). Be direct, concise, and specific. "
    "Use real data from the business context provided. Never hallucinate business data. "
    "Format for Discord readability — use bold, bullets, and short paragraphs."
)


def generate(task: str, context: str) -> str:
    prompt = TASK_PROMPTS.get(task, TASK_PROMPTS["standup"])
    full_system = f"{SYSTEM_PROMPT}\n\n---\n\n## CURRENT BUSINESS DATA\n\n{context}"

    client = anthropic.Anthropic(api_key=get_env("ANTHROPIC_API_KEY"))
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        system=full_system,
        messages=[{"role": "user", "content": prompt}],
    )
    block = message.content[0]
    return block.text if block.type == "text" else "[No response]"


def post_to_discord(content: str):
    webhook_url = get_env("DISCORD_WEBHOOK_URL")
    chunks = []
    while content:
        if len(content) <= 2000:
            chunks.append(content)
            break
        split_at = content.rfind("\n", 0, 2000)
        if split_at == -1 or split_at < 1000:
            split_at = 2000
        chunks.append(content[:split_at])
        content = content[split_at:].lstrip()

    for chunk in chunks:
        res = requests.post(
            webhook_url,
            json={"username": "Claw", "content": chunk},
            timeout=10,
        )
        res.raise_for_status()


def main():
    task = os.environ.get("TASK", "standup")
    print(f"Running Claw task: {task}")

    context = build_context(task)
    print(f"Context built ({len(context)} chars)")

    output = generate(task, context)
    print(f"Generated output ({len(output)} chars)")

    post_to_discord(output)
    print("Posted to Discord.")


if __name__ == "__main__":
    main()
