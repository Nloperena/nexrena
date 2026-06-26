import type { ReactNode } from 'react';

const PRICE_RE = /(\$\d{1,3}(?:,\d{3})*(?:\/mo)?\+?)/g;
const PLAN_RE = /(Launch Website Plan|Growth Website Plan|Lead Engine Plan|Growth plan|Launch plan)/gi;

function highlightInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  const combined = new RegExp(
    `${PRICE_RE.source}|${PLAN_RE.source}`,
    'gi',
  );

  for (const match of text.matchAll(combined)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    parts.push(
      <strong key={`${idx}-${match[0]}`} className="site-chat-emphasis">
        {match[0]}
      </strong>,
    );
    last = idx + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

export function ChatMessageBody({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());

  if (paragraphs.length <= 1) {
    return <p>{highlightInline(content.replace(/\n+/g, ' ').trim())}</p>;
  }

  return (
    <>
      {paragraphs.map((para) => (
        <p key={para.slice(0, 40)}>{highlightInline(para.trim())}</p>
      ))}
    </>
  );
}
