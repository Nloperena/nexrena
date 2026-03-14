import 'dotenv/config'
import { Events } from 'discord.js'
import { config } from './config'
import { createClient } from './bot/client'
import { registerHandlers } from './bot/handlers'
import { startScheduler } from './scheduler'

const client = createClient()

client.once(Events.ClientReady, (c) => {
  console.log(`\nClaw online. Logged in as ${c.user.tag}`)
  console.log(`Guild: ${config.discord.guildId}`)
  console.log(`Operations channel: ${config.channels.operations}\n`)

  startScheduler(client)
})

registerHandlers(client)

client.login(config.discord.token)

process.on('SIGINT', () => {
  console.log('\nClaw shutting down...')
  client.destroy()
  process.exit(0)
})
