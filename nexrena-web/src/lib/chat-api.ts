import { NEXRENA_API_URL } from './contact-api';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatAction = {
  type: 'link' | 'schedule' | 'contact' | 'intake';
  label: string;
  href: string;
};

export type ChatIntakePrefill = {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
};

export type ChatIntakeState = {
  stage: 'none' | 'collecting' | 'ready' | 'submitted';
  showForm: boolean;
  missingFields: Array<'name' | 'email' | 'company'>;
  submitted: boolean;
  leadId?: string;
  prefilled: ChatIntakePrefill;
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
  intake?: ChatIntakeState;
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

export async function submitChatIntake(payload: {
  sessionId?: string | null;
  name: string;
  email: string;
  company?: string;
  message?: string;
  honeypot?: string;
}): Promise<ChatResponse> {
  const res = await fetch(`${NEXRENA_API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Submitting my contact details through chat.' }],
      sessionId: payload.sessionId ?? getChatSessionId(),
      pageUrl: typeof window !== 'undefined' ? window.location.pathname : undefined,
      _hp: payload.honeypot ?? '',
      intakeSubmit: {
        name: payload.name,
        email: payload.email,
        company: payload.company,
        message: payload.message,
      },
    }),
  });

  const data = (await res.json().catch(() => ({}))) as ChatResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error || 'Intake submission failed');
  }

  if (data.sessionId) {
    setChatSessionId(data.sessionId);
  }

  return data;
}
