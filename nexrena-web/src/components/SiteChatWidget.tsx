import { useCallback, useEffect, useRef, useState } from 'react';
import {
  sendChatMessage,
  type ChatAction,
  type ChatMessage,
} from '@/lib/chat-api';

const WELCOME =
  "Hi — I'm Nexrena's digital consultant. I can help you figure out fit, services, pricing, and next steps. What are you working on?";

const STARTER_PROMPTS = [
  'What does Nexrena do?',
  'How much does a website cost?',
  'Can you share case study results?',
];

type ChatEntry = ChatMessage & {
  id: string;
  actions?: ChatAction[];
  suggestedReplies?: string[];
};

function newId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SiteChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hp, setHp] = useState('');
  const [starters, setStarters] = useState(STARTER_PROMPTS);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: newId(), role: 'assistant', content: WELCOME }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const submitText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const userMsg: ChatEntry = { id: newId(), role: 'user', content: trimmed };
      const history = [...messages, userMsg];
      setMessages(history);
      setInput('');
      setError(null);
      setSending(true);
      setStarters([]);

      const apiMessages: ChatMessage[] = history
        .filter((m) => m.id !== 'welcome-only')
        .map(({ role, content }) => ({ role, content }))
        .filter((m) => !(m.role === 'assistant' && m.content === WELCOME && history.length <= 2));

      try {
        const result = await sendChatMessage(apiMessages, { honeypot: hp });
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: 'assistant',
            content: result.message,
            actions: result.actions,
            suggestedReplies: result.suggestedReplies,
          },
        ]);
        if (result.suggestedReplies?.length) {
          setStarters(result.suggestedReplies);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not reach the assistant.');
      } finally {
        setSending(false);
      }
    },
    [hp, messages, sending],
  );

  const send = useCallback(() => void submitText(input), [input, submitText]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Nexrena consultant chat"
        aria-expanded={open}
        className="site-chat-fab"
        hidden={open}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="site-chat-fab-icon">
          <path
            d="M12 3C7.03 3 3 6.58 3 11c0 2.12.9 4.05 2.36 5.5L4 21l4.74-1.18A9.7 9.7 0 0 0 12 19c4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="11" r="1" fill="currentColor" />
          <circle cx="12" cy="11" r="1" fill="currentColor" />
          <circle cx="15.5" cy="11" r="1" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div className="site-chat-root" role="presentation">
          <button
            type="button"
            className="site-chat-backdrop"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
          />

          <section
            className="site-chat-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Nexrena digital consultant"
          >
            <header className="site-chat-header">
              <div className="site-chat-header-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path
                    d="M12 3C7.03 3 3 6.58 3 11c0 2.12.9 4.05 2.36 5.5L4 21l4.74-1.18A9.7 9.7 0 0 0 12 19c4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="site-chat-title">Nexrena Consultant</p>
                <p className="site-chat-subtitle">Web, SEO & growth advisory</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="site-chat-close"
              >
                −
              </button>
            </header>

            <div ref={listRef} className="site-chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`site-chat-row ${msg.role === 'user' ? 'site-chat-row-user' : ''}`}
                >
                  <div className={`site-chat-bubble site-chat-bubble-${msg.role}`}>
                    <p>{msg.content}</p>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="site-chat-actions">
                        {msg.actions.map((action) => (
                          <a
                            key={action.href + action.label}
                            href={action.href}
                            className="site-chat-action-btn"
                          >
                            {action.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {starters.length > 0 && !sending && messages.length <= 2 && (
                <div className="site-chat-starters">
                  {starters.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="site-chat-starter"
                      onClick={() => void submitText(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              {sending && (
                <div className="site-chat-row">
                  <div className="site-chat-bubble site-chat-bubble-assistant">
                    <span className="site-chat-typing" aria-label="Consultant is typing">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="site-chat-error" role="alert">
                {error}
              </p>
            )}

            <footer className="site-chat-footer">
              <input
                type="text"
                name="_hp"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="site-chat-hp"
              />
              <div className="site-chat-input-row">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 500))}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Ask about fit, pricing, SEO, timelines…"
                  disabled={sending}
                  maxLength={500}
                  aria-label="Message to consultant"
                  className="site-chat-input"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={sending || !input.trim()}
                  className="site-chat-send"
                >
                  Send
                </button>
              </div>
              <p className="site-chat-disclaimer">
                AI consultant — verify details on{' '}
                <a href="/contact/">contact</a> or{' '}
                <a href="/schedule/">schedule a call</a>.
              </p>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
