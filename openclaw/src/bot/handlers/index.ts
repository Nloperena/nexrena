import { Interaction, Events, Client, Message } from 'discord.js'
import { handleStatus, handleStandup, handleMetrics } from './ops'
import { handleDraft } from './content'
import { handleResearch, handleProposal } from './sales'
import { handleAsk, handleMention } from './chat'

const HELP_TEXT = `**Claw Commands**

**/status** — Full pipeline, project, and invoice overview
**/standup** — Generate a daily standup on demand
**/metrics** — Financial snapshot (revenue, outstanding, overdue)
**/draft blog [topic]** — Draft a blog post
**/draft post [topic]** — Draft a LinkedIn/X social post
**/draft email [type] [client?]** — Draft an email (outreach, follow-up, invoice-reminder, check-in, welcome)
**/research [company]** — Generate a lead research brief
**/proposal [client]** — Draft a client proposal
**/ask [question]** — Ask me anything with full business context

You can also **@mention me** or **DM me** for free-form conversation.`

export function registerHandlers(client: Client) {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return

    try {
      switch (interaction.commandName) {
        case 'status':    return await handleStatus(interaction)
        case 'standup':   return await handleStandup(interaction)
        case 'metrics':   return await handleMetrics(interaction)
        case 'draft':     return await handleDraft(interaction)
        case 'research':  return await handleResearch(interaction)
        case 'proposal':  return await handleProposal(interaction)
        case 'ask':       return await handleAsk(interaction)
        case 'claw-help': {
          await interaction.reply(HELP_TEXT)
          return
        }
        default:
          await interaction.reply({ content: `Unknown command: ${interaction.commandName}`, ephemeral: true })
      }
    } catch (err) {
      console.error(`Unhandled error in command ${interaction.commandName}:`, err)
      const reply = interaction.deferred || interaction.replied
        ? interaction.followUp.bind(interaction)
        : interaction.reply.bind(interaction)
      await reply({ content: 'An unexpected error occurred.', ephemeral: true }).catch(console.error)
    }
  })

  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return

    const isMention = message.mentions.has(client.user!)
    const isDM = !message.guild

    if (isMention || isDM) {
      await handleMention(message)
    }
  })
}
