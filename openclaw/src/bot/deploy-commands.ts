import 'dotenv/config'
import { REST, Routes } from 'discord.js'
import { config } from '../config'
import { commands } from './commands'

const rest = new REST({ version: '10' }).setToken(config.discord.token)

async function deploy() {
  const body = commands.map(c => c.toJSON())

  console.log(`Deploying ${body.length} slash commands to guild ${config.discord.guildId}...`)

  await rest.put(
    Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
    { body },
  )

  console.log('Slash commands deployed.')
}

deploy().catch(console.error)
