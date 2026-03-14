import { ChatInputCommandInteraction, Message } from 'discord.js'
import { ask } from '../../llm/client'
import { fetchSnapshot, buildFullContext } from '../../llm/context'
import { splitMessage } from '../../utils/formatters'

export async function handleAsk(interaction: ChatInputCommandInteraction) {
  const question = interaction.options.getString('question', true)

  await interaction.deferReply()

  try {
    const snap = await fetchSnapshot()
    const context = buildFullContext(snap)
    const response = await ask(question, context)
    for (const chunk of splitMessage(response)) {
      await interaction.followUp(chunk)
    }
  } catch (err) {
    console.error('ask handler error:', err)
    await interaction.editReply('Something went wrong processing your question.')
  }
}

/** Handle @mention or DM messages (non-slash-command) */
export async function handleMention(message: Message) {
  if (message.author.bot) return

  const content = message.content
    .replace(/<@!?\d+>/g, '')
    .trim()

  if (!content) {
    await message.reply('What do you need? Hit me with a question or use `/claw-help` to see my commands.')
    return
  }

  try {
    if ('sendTyping' in message.channel) await message.channel.sendTyping()
    const snap = await fetchSnapshot()
    const context = buildFullContext(snap)
    const response = await ask(content, context)
    for (const chunk of splitMessage(response)) {
      await message.reply(chunk)
    }
  } catch (err) {
    console.error('mention handler error:', err)
    await message.reply('Something went wrong. Try again or check if the API is running.')
  }
}
