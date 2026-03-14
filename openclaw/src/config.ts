function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

function optional(key: string, fallback = ''): string {
  return process.env[key] || fallback
}

export const config = {
  discord: {
    token: required('DISCORD_TOKEN'),
    clientId: required('DISCORD_CLIENT_ID'),
    guildId: required('DISCORD_GUILD_ID'),
  },
  channels: {
    operations: required('CHANNEL_OPERATIONS'),
    content: optional('CHANNEL_CONTENT'),
    sales: optional('CHANNEL_SALES'),
    clients: optional('CHANNEL_CLIENTS'),
  },
  bossId: required('BOSS_DISCORD_ID'),
  api: {
    url: optional('NEXRENA_API_URL', 'http://localhost:4000'),
    key: optional('NEXRENA_API_KEY'),
  },
  anthropic: {
    apiKey: required('ANTHROPIC_API_KEY'),
  },
  timezone: optional('TIMEZONE', 'America/New_York'),
} as const
