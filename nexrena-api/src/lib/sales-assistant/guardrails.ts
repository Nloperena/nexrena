/** Post-generation guardrails to reduce hallucination and off-brand output */

const BANNED_PHRASES = [
  /cutting.?edge synerg/i,
  /leverage our/i,
  /paradigm shift/i,
  /moving the needle/i,
  /low.?hanging fruit/i,
  /guaranteed (?:#1|first page|rankings)/i,
  /100% guarantee/i,
]

const INVENTED_PRICE = /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?:\s*(?:\/mo|per month|k|\+))?/g

const ALLOWED_PRICE_FRAGMENTS = [
  '149', '249', '399', '10,000', '15,000', '30,000', '50,000',
  '10k', '15k', '25k', '30k', '50k', '$149', '$249', '$399',
]

export function applyGuardrails(text: string, grounded: boolean): { text: string; flagged: boolean } {
  let flagged = false
  let out = text.trim()

  for (const pattern of BANNED_PHRASES) {
    if (pattern.test(out)) {
      flagged = true
      out = out.replace(pattern, '')
    }
  }

  if (grounded) {
    const prices = out.match(INVENTED_PRICE) ?? []
    for (const price of prices) {
      const allowed = ALLOWED_PRICE_FRAGMENTS.some((p) => price.includes(p.replace('$', '')))
      if (!allowed && !price.includes('1,500') && !price.includes('5,000') && !price.includes('8,000')) {
        flagged = true
        out = out.replace(price, '[custom quote required]')
      }
    }
  }

  out = out.replace(/\n{3,}/g, '\n\n').trim()
  return { text: out, flagged }
}

export function isGenericFallback(text: string): boolean {
  return /i'm here to help you learn about nexrena/i.test(text)
}
