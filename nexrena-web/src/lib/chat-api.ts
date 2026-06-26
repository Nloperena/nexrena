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

export type ChatSiteConfig = {
  siteKey: string;
  label: string;
  assistantName: string;
  subtitle: string;
  welcomeMessage: string;
  links: Record<string, string | undefined>;
};

export type ChatResponse = {
  message: string;
  configured: boolean;
  sessionId?: string;
  siteKey?: string;
  intent?: string;
  actions?: ChatAction[];
  suggestedReplies?: string[];
  leadScore?: number;
  grounded?: boolean;
  intake?: ChatIntakeState;
};

function sessionStorageKey(siteKey: string) {
  return `nexrena_chat_session_${siteKey}`;
}

export function getChatSessionId(siteKey = 'nexrena'): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(sessionStorageKey(siteKey));
}

export function setChatSessionId(id: string, siteKey = 'nexrena'): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(sessionStorageKey(siteKey), id);
}

export async function fetchChatSiteConfig(siteKey: string): Promise<ChatSiteConfig | null> {
  const res = await fetch(`${NEXRENA_API_URL}/api/chat/config?siteKey=${encodeURIComponent(siteKey)}`);
  if (!res.ok) return null;
  return res.json() as Promise<ChatSiteConfig>;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  options?: { honeypot?: string; sessionId?: string | null; pageUrl?: string; siteKey?: string },
): Promise<ChatResponse> {
  const siteKey = options?.siteKey ?? 'nexrena';
  const res = await fetch(`${NEXRENA_API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Site-Key': siteKey,
    },
    body: JSON.stringify({
      messages,
      siteKey,
      _hp: options?.honeypot ?? '',
      sessionId: options?.sessionId ?? getChatSessionId(siteKey),
      pageUrl: options?.pageUrl ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as ChatResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error || 'Chat request failed');
  }

  if (data.sessionId) {
    setChatSessionId(data.sessionId, siteKey);
  }

  return data;
}

export async function submitChatIntake(payload: {
  siteKey?: string;
  sessionId?: string | null;
  name: string;
  email: string;
  company?: string;
  message?: string;
  honeypot?: string;
}): Promise<ChatResponse> {
  const siteKey = payload.siteKey ?? 'nexrena';
  const res = await fetch(`${NEXRENA_API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Site-Key': siteKey,
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Submitting my contact details through chat.' }],
      siteKey,
      sessionId: payload.sessionId ?? getChatSessionId(siteKey),
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
    setChatSessionId(data.sessionId, siteKey);
  }

  return data;
}
