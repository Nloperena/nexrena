import cron from 'node-cron'
import { Client } from 'discord.js'
import { config } from '../config'
import { dailyStandup, weeklyBrief, weeklyWrap, monthlyFinance, followUpCheck } from './jobs'

export function startScheduler(client: Client) {
  const tz = config.timezone

  // Daily standup — 9:00 AM Mon-Fri
  cron.schedule('0 9 * * 1-5', () => dailyStandup(client), { timezone: tz })

  // Weekly ops brief — Monday 8:30 AM
  cron.schedule('30 8 * * 1', () => weeklyBrief(client), { timezone: tz })

  // Weekly wrap — Friday 4:00 PM
  cron.schedule('0 16 * * 5', () => weeklyWrap(client), { timezone: tz })

  // Monthly financial snapshot — 1st of each month, 9:00 AM
  cron.schedule('0 9 1 * *', () => monthlyFinance(client), { timezone: tz })

  // Follow-up checker — Daily 10:00 AM Mon-Fri
  cron.schedule('0 10 * * 1-5', () => followUpCheck(client), { timezone: tz })

  console.log(`Scheduler started (timezone: ${tz})`)
  console.log('  - Daily standup:    9:00 AM Mon-Fri')
  console.log('  - Weekly brief:     8:30 AM Monday')
  console.log('  - Weekly wrap:      4:00 PM Friday')
  console.log('  - Monthly finance:  9:00 AM 1st of month')
  console.log('  - Follow-up check:  10:00 AM Mon-Fri')
}
