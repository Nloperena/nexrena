import { Client, TextChannel } from 'discord.js'
import { config } from '../config'
import { ask } from '../llm/client'
import { fetchSnapshot, buildStandupContext, buildFullContext, buildFinancialContext } from '../llm/context'
import { splitMessage } from '../utils/formatters'

async function postToChannel(client: Client, channelId: string, content: string) {
  const channel = await client.channels.fetch(channelId)
  if (!channel?.isTextBased()) {
    console.error(`Channel ${channelId} is not a text channel or doesn't exist`)
    return
  }
  for (const chunk of splitMessage(content)) {
    await (channel as TextChannel).send(chunk)
  }
}

export async function dailyStandup(client: Client) {
  console.log('[cron] Running daily standup...')
  try {
    const snap = await fetchSnapshot()
    const context = buildStandupContext(snap)
    const response = await ask(
      "Generate today's daily standup. Use your standup format. Be specific — use real project names, client names, invoice numbers, and dollar amounts from the data. Tag Boss if any decisions are needed.",
      context,
    )
    await postToChannel(client, config.channels.operations, response)
    console.log('[cron] Daily standup posted.')
  } catch (err) {
    console.error('[cron] Daily standup failed:', err)
  }
}

export async function weeklyBrief(client: Client) {
  console.log('[cron] Running weekly ops brief...')
  try {
    const snap = await fetchSnapshot()
    const context = buildFullContext(snap)
    const response = await ask(
      `Generate the Monday Weekly Ops Brief. Include:
- Active projects + status
- This week's priorities (ranked by impact)
- Deadlines approaching (7-day lookahead)
- Blockers or decisions needed from Boss (<@${config.bossId}>)
- Revenue pipeline snapshot (total pipeline value, expected closes)
- Any leads going cold that need attention

Be specific and actionable. Use real data.`,
      context,
    )
    await postToChannel(client, config.channels.operations, response)
    console.log('[cron] Weekly brief posted.')
  } catch (err) {
    console.error('[cron] Weekly brief failed:', err)
  }
}

export async function weeklyWrap(client: Client) {
  console.log('[cron] Running weekly wrap...')
  try {
    const snap = await fetchSnapshot()
    const context = buildFullContext(snap)
    const response = await ask(
      `Generate the Friday Weekly Wrap. Include:
- What got done this week (delivered projects, invoices sent/paid, leads progressed)
- What slipped and why (stale projects, missed follow-ups)
- Next week preview
- Any client follow-ups needed over the weekend
- Wins to celebrate

Be honest about what slipped — that's how we improve.`,
      context,
    )
    await postToChannel(client, config.channels.operations, response)
    console.log('[cron] Weekly wrap posted.')
  } catch (err) {
    console.error('[cron] Weekly wrap failed:', err)
  }
}

export async function monthlyFinance(client: Client) {
  console.log('[cron] Running monthly financial snapshot...')
  try {
    const snap = await fetchSnapshot()
    const context = buildFinancialContext(snap)
    const response = await ask(
      `Generate the Monthly Financial Snapshot. Include:
- Revenue collected last month
- Total outstanding invoices
- Overdue breakdown with specific invoice numbers and amounts
- Upcoming expected revenue from active projects
- Any patterns or concerns (e.g., late-paying clients, pricing trends)
- Recommendations

Use real invoice and project data. Be specific with numbers.`,
      context,
    )
    await postToChannel(client, config.channels.operations, response)
    console.log('[cron] Monthly finance posted.')
  } catch (err) {
    console.error('[cron] Monthly finance failed:', err)
  }
}

export async function followUpCheck(client: Client) {
  console.log('[cron] Running follow-up check...')
  try {
    const snap = await fetchSnapshot()
    const context = buildFullContext(snap)
    const response = await ask(
      `Check for anything that needs follow-up attention. Look for:
- Overdue invoices (any invoice past due date)
- Stale leads (contacted/proposal stage with no update in 5+ days)
- Projects with no progress in 5+ days
- Any client onboarding steps that might be stalled

If everything looks good, say so briefly. If there are issues, be specific about what needs action and suggest next steps. Tag <@${config.bossId}> only if something is urgent.`,
      context,
    )

    const isClean = response.toLowerCase().includes('everything looks good') || response.toLowerCase().includes('nothing urgent')
    if (!isClean) {
      await postToChannel(client, config.channels.operations, response)
    }
    console.log('[cron] Follow-up check done.')
  } catch (err) {
    console.error('[cron] Follow-up check failed:', err)
  }
}
