const MAX_MESSAGE_LENGTH = 2000

/** Split a long string into Discord-safe chunks at newline boundaries */
export function splitMessage(text: string, max = MAX_MESSAGE_LENGTH): string[] {
  if (text.length <= max) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= max) {
      chunks.push(remaining)
      break
    }

    let splitAt = remaining.lastIndexOf('\n', max)
    if (splitAt === -1 || splitAt < max * 0.5) splitAt = max

    chunks.push(remaining.slice(0, splitAt))
    remaining = remaining.slice(splitAt).trimStart()
  }

  return chunks
}

export function currency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function daysAgo(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function bold(s: string): string { return `**${s}**` }
export function code(s: string): string { return `\`${s}\`` }
export function codeBlock(s: string, lang = ''): string { return `\`\`\`${lang}\n${s}\n\`\`\`` }
