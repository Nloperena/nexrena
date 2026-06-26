import { NEXRENA_API_URL } from './contact-api';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatResponse = {
  message: string;
  configured: boolean;
};

export async function sendChatMessage(
  messages: ChatMessage[],
  honeypot = '',
): Promise<ChatResponse> {
  const res = await fetch(`${NEXRENA_API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, _hp: honeypot }),
  });

  const data = (await res.json().catch(() => ({}))) as ChatResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error || 'Chat request failed');
  }

  return data;
}
