import { NEXRENA_API_URL } from './contact-api';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatAction = {
  type: 'link' | 'schedule' | 'contact';
  label: string;
  href: string;
};

export type ChatResponse = {
  message: string;
  configured: boolean;
  sessionId?: string;
  intent?: string;
  actions?: ChatAction[];
  suggestedReplies?: string[];
  leadScore?: number;
  grounded?: boolean;
};

const SESSION_KEY = 'nexrena_chat_session';

export function getChatSessionId(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function setChatSessionId(id: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, id);
}

export async function sendChatMessage(
  messages: ChatMessage[],
  options?: { honeypot?: string; sessionId?: string | null; pageUrl?: string },
): Promise<ChatResponse> {
  const res = await fetch(`${NEXRENA_API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      _hp: options?.honeypot ?? '',
      sessionId: options?.sessionId ?? getChatSessionId(),
      pageUrl: options?.pageUrl ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as ChatResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error || 'Chat request failed');
  }

  if (data.sessionId) {
    setChatSessionId(data.sessionId);
  }

  return data;
}
