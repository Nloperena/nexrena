import { SlashCommandBuilder } from 'discord.js'

export const commands = [
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Full pipeline, project, and invoice overview'),

  new SlashCommandBuilder()
    .setName('standup')
    .setDescription('Generate a daily standup on demand'),

  new SlashCommandBuilder()
    .setName('metrics')
    .setDescription('Financial snapshot — revenue, outstanding, overdue'),

  new SlashCommandBuilder()
    .setName('draft')
    .setDescription('Draft content with Claw')
    .addSubcommand(sub =>
      sub.setName('blog')
        .setDescription('Draft a blog post')
        .addStringOption(o => o.setName('topic').setDescription('Blog topic').setRequired(true)),
    )
    .addSubcommand(sub =>
      sub.setName('post')
        .setDescription('Draft a LinkedIn/X social post')
        .addStringOption(o => o.setName('topic').setDescription('Post topic').setRequired(true)),
    )
    .addSubcommand(sub =>
      sub.setName('email')
        .setDescription('Draft an email')
        .addStringOption(o =>
          o.setName('type').setDescription('Email type').setRequired(true)
            .addChoices(
              { name: 'Outreach', value: 'outreach' },
              { name: 'Follow-up', value: 'follow-up' },
              { name: 'Invoice reminder', value: 'invoice-reminder' },
              { name: 'Check-in', value: 'check-in' },
              { name: 'Welcome', value: 'welcome' },
            ),
        )
        .addStringOption(o => o.setName('client').setDescription('Client name (optional)').setRequired(false)),
    ),

  new SlashCommandBuilder()
    .setName('research')
    .setDescription('Research a prospect and generate a lead brief')
    .addStringOption(o => o.setName('company').setDescription('Company name').setRequired(true)),

  new SlashCommandBuilder()
    .setName('proposal')
    .setDescription('Draft a proposal for a client')
    .addStringOption(o => o.setName('client').setDescription('Client or company name').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask Claw anything — free-form with full business context')
    .addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)),

  new SlashCommandBuilder()
    .setName('claw-help')
    .setDescription('List all Claw commands'),
]
