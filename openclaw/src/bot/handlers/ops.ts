import { ChatInputCommandInteraction } from 'discord.js'
import { ask } from '../../llm/client'
import { fetchSnapshot, buildFullContext, buildStandupContext, buildFinancialContext } from '../../llm/context'
import { splitMessage } from '../../utils/formatters'

export async function handleStatus(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()
  try {
    const snap = await fetchSnapshot()
    const context = buildFullContext(snap)
    const response = await ask(
      'Give me a full status overview — active projects, pipeline health, invoice status, and anything that needs my attention. Be specific with names and numbers.',
      context,
    )
    for (const chunk of splitMessage(response)) {
      await interaction.followUp(chunk)
    }
  } catch (err) {
    console.error('status handler error:', err)
    await interaction.editReply('Failed to fetch status. Is the Nexrena API running?')
  }
}

export async function handleStandup(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()
  try {
    const snap = await fetchSnapshot()
    const context = buildStandupContext(snap)
    const response = await ask(
      'Generate today\'s daily standup. Use the standup format from your instructions. Be specific — reference real projects, deadlines, and numbers.',
      context,
    )
    for (const chunk of splitMessage(response)) {
      await interaction.followUp(chunk)
    }
  } catch (err) {
    console.error('standup handler error:', err)
    await interaction.editReply('Failed to generate standup.')
  }
}

export async function handleMetrics(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()
  try {
    const snap = await fetchSnapshot()
    const context = buildFinancialContext(snap)
    const response = await ask(
      'Generate a financial snapshot. Include total revenue collected, outstanding invoices, overdue amounts, and any recommendations. Be specific with invoice numbers and client names.',
      context,
    )
    for (const chunk of splitMessage(response)) {
      await interaction.followUp(chunk)
    }
  } catch (err) {
    console.error('metrics handler error:', err)
    await interaction.editReply('Failed to generate metrics.')
  }
}
