import { ChatInputCommandInteraction } from 'discord.js'
import { ask } from '../../llm/client'
import { fetchSnapshot, buildFullContext } from '../../llm/context'
import { splitMessage } from '../../utils/formatters'

export async function handleResearch(interaction: ChatInputCommandInteraction) {
  const company = interaction.options.getString('company', true)

  await interaction.deferReply()

  try {
    const snap = await fetchSnapshot()
    const context = buildFullContext(snap)
    const prompt = `Research and generate a lead brief for the company: "${company}".

Since you may not have live web access, generate the best possible brief based on:
1. What you know about the company (if anything)
2. A framework for Boss to complete the research:
   - Company overview (fill in what you can, mark unknowns with [RESEARCH NEEDED])
   - Key decision-maker to target (title suggestions)
   - Current website assessment framework (what to look for)
   - Personalized outreach angle — why THIS company would benefit from Nexrena
   - Estimated budget range based on company type
   - Lead score (Hot / Warm / Cold) with reasoning
3. A suggested outreach message draft

If we already have this company in our CRM, reference that data.`

    const response = await ask(prompt, context)
    for (const chunk of splitMessage(response)) {
      await interaction.followUp(chunk)
    }
  } catch (err) {
    console.error('research handler error:', err)
    await interaction.editReply('Failed to generate research brief.')
  }
}

export async function handleProposal(interaction: ChatInputCommandInteraction) {
  const client = interaction.options.getString('client', true)

  await interaction.deferReply()

  try {
    const snap = await fetchSnapshot()
    const context = buildFullContext(snap)
    const prompt = `Draft a proposal for client: "${client}".

If this client exists in our CRM or has active/past projects, use that data to personalize the proposal.

Include these sections:
1. **Executive Summary** — 2-3 sentences on what we'll deliver and the expected outcome
2. **Understanding Your Needs** — reflect their situation and pain points
3. **Proposed Solution** — what we'll build, tech stack recommendations, key features
4. **Timeline & Milestones** — phased approach (Discovery → Design → Development → QA → Launch)
5. **Investment** — pricing with a range if scope isn't defined, or specific if we have project details
6. **Why Nexrena** — 3-4 differentiators
7. **Next Steps** — clear call to action

Write professionally but not corporate. Position Nexrena as a high-quality partner, not a commodity vendor.`

    const response = await ask(prompt, context)
    for (const chunk of splitMessage(response)) {
      await interaction.followUp(chunk)
    }
  } catch (err) {
    console.error('proposal handler error:', err)
    await interaction.editReply('Failed to generate proposal.')
  }
}
