import { ChatInputCommandInteraction } from 'discord.js'
import { ask } from '../../llm/client'
import { fetchSnapshot, buildFullContext } from '../../llm/context'
import { splitMessage } from '../../utils/formatters'

export async function handleDraft(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand()

  await interaction.deferReply()

  try {
    const snap = await fetchSnapshot()
    const context = buildFullContext(snap)
    let prompt: string

    switch (sub) {
      case 'blog': {
        const topic = interaction.options.getString('topic', true)
        prompt = `Draft a blog post for nexrena.com about: "${topic}".

Include:
- A compelling headline
- An engaging intro hook (2-3 sentences)
- 3-5 main sections with subheadings
- A conclusion with a CTA pointing to Nexrena's services

Write in the Nexrena brand voice: confident, technical but accessible, no buzzwords. Target audience is business owners who aren't developers. Aim for ~800 words.`
        break
      }

      case 'post': {
        const topic = interaction.options.getString('topic', true)
        prompt = `Draft a LinkedIn post about: "${topic}".

Write in Boss's voice — direct, knowledgeable, builder-mentality. No fluff or corporate speak.
Include a strong hook in the first line, keep it under 1300 characters, end with a soft CTA or question to drive engagement.
Suggest a relevant image or graphic description.`
        break
      }

      case 'email': {
        const type = interaction.options.getString('type', true)
        const client = interaction.options.getString('client')
        const clientNote = client ? ` for client "${client}"` : ''
        prompt = `Draft a ${type} email${clientNote}.

Type-specific instructions:
- outreach: Personalized cold outreach. Lead with their pain point, not our features. Short — 5-7 sentences max.
- follow-up: Following up on a proposal or previous conversation. Respectful but assertive. Include a clear ask.
- invoice-reminder: Professional payment reminder. Include placeholder for invoice number and amount.
- check-in: Post-project check-in. Warm tone, ask how things are going, subtly plant seeds for future work.
- welcome: Client onboarding welcome email. Set expectations, outline next steps, share what they need to provide.

Write as Nexrena (signed by Boss). Professional but personable.`
        break
      }

      default:
        await interaction.editReply(`Unknown draft type: ${sub}`)
        return
    }

    const response = await ask(prompt, context)
    for (const chunk of splitMessage(response)) {
      await interaction.followUp(chunk)
    }
  } catch (err) {
    console.error('draft handler error:', err)
    await interaction.editReply('Failed to generate draft.')
  }
}
