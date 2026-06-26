import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatIntakeForm } from '@/components/ChatIntakeForm';
import {
  getChatSessionId,
  sendChatMessage,
  type ChatAction,
  type ChatIntakeState,
  type ChatMessage,
} from '@/lib/chat-api';
import { ChatMessageBody } from '@/lib/format-chat-message';

const WELCOME =
  'Hi — I can help you pick the right Nexrena plan. Monthly website care starts at $149/mo, and most businesses choose Growth at $249/mo.\n\nWhat are you looking for — a new site, more leads, or SEO?';

const STARTER_PROMPTS = [
  'Compare your monthly plans',
  'Why is Growth $249/mo recommended?',
  'I am ready to get started',
];

type ChatEntry = ChatMessage & {
  id: string;
  actions?: ChatAction[];
  suggestedReplies?: string[];
};

function newId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isIntakeTrigger(text: string): boolean {
  return /get started|send my (details|info|contact)|ready to start|submit/i.test(text);
}

export function SiteChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hp, setHp] = useState('');
  const [starters, setStarters] = useState(STARTER_PROMPTS);
  const [intake, setIntake] = useState<ChatIntakeState | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const intakeRef = useRef<HTMLDivElement>(null);

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
  }, [messages, sending, intake?.showForm]);

  const applyChatResult = useCallback(
    (result: {
      message: string;
      actions?: ChatAction[];
      suggestedReplies?: string[];
      intake?: ChatIntakeState;
    }) => {
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
      if (result.intake) {
        setIntake(result.intake);
      }
      if (result.suggestedReplies?.length) {
        setStarters(result.suggestedReplies);
      }
    },
    [],
  );

  const scrollToIntake = useCallback(() => {
    window.setTimeout(() => {
      intakeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }, []);

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
        applyChatResult(result);
        if (result.intake?.showForm || isIntakeTrigger(trimmed)) {
          scrollToIntake();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not reach the assistant.');
      } finally {
        setSending(false);
      }
    },
    [applyChatResult, hp, messages, scrollToIntake, sending],
  );

  const onIntakeAction = useCallback(
    (label: string) => {
      if (intake?.showForm) {
        scrollToIntake();
        return;
      }
      void submitText(label === 'Get started' ? 'I am ready to get started' : 'Send my details to Nexrena');
    },
    [intake?.showForm, scrollToIntake, submitText],
  );

  const onIntakeSuccess = useCallback(
    (message: string) => {
      setError(null);
      setIntake((prev) =>
        prev
          ? { ...prev, stage: 'submitted', showForm: false, submitted: true }
          : { stage: 'submitted', showForm: false, missingFields: [], submitted: true, prefilled: {} },
      );
      applyChatResult({
        message,
        suggestedReplies: ['Book a free call', 'Compare plans', 'Tell me about Growth plan'],
      });
    },
    [applyChatResult],
  );

  const send = useCallback(() => void submitText(input), [input, submitText]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const renderAction = (action: ChatAction, primary: boolean) => {
    if (action.type === 'intake') {
      return (
        <button
          key={action.href + action.label}
          type="button"
          className={`site-chat-action-btn${primary ? ' site-chat-action-primary' : ''}`}
          onClick={() => onIntakeAction(action.label)}
        >
          {action.label}
        </button>
      );
    }
    return (
      <a
        key={action.href + action.label}
        href={action.href}
        className={`site-chat-action-btn${primary ? ' site-chat-action-primary' : ''}`}
      >
        {action.label}
      </a>
    );
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
                <p className="site-chat-subtitle">Find your plan · from $149/mo</p>
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
                    {msg.role === 'assistant' ? (
                      <ChatMessageBody content={msg.content} />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="site-chat-actions">
                        {msg.actions.map((action, i) => renderAction(action, i === 0))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {intake?.showForm && !intake.submitted && (
                <div ref={intakeRef} className="site-chat-row">
                  <div className="site-chat-bubble site-chat-bubble-assistant site-chat-intake-wrap">
                    <ChatIntakeForm
                      sessionId={getChatSessionId()}
                      prefill={intake.prefilled}
                      onSuccess={onIntakeSuccess}
                      onError={setError}
                    />
                  </div>
                </div>
              )}

              {starters.length > 0 && !sending && messages.length <= 3 && (
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
