import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatIntakeForm } from '@/components/ChatIntakeForm';
import {
  fetchChatSiteConfig,
  getChatSessionId,
  sendChatMessage,
  type ChatAction,
  type ChatIntakeState,
  type ChatMessage,
  type ChatSiteConfig,
} from '@/lib/chat-api';
import { ChatMessageBody } from '@/lib/format-chat-message';

const DEFAULT_STARTERS = [
  'Compare your monthly plans',
  'Why is Growth $249/mo recommended?',
  'I am ready to get started',
];

const AUTO_OPEN_MS = 1200;

type Props = {
  /** Registered site key — nexrena, fpusa, nicoloperena, ttag */
  siteKey?: string;
};

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

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="site-chat-send-icon">
      <path
        d="M12 19V5M5 12l7-7 7 7"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AssistantAvatar() {
  return (
    <div className="site-chat-avatar site-chat-avatar-ai" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function SiteChatWidget({ siteKey = 'nexrena' }: Props) {
  const dismissKey = `nexrena_chat_dismissed_${siteKey}`;
  const [config, setConfig] = useState<ChatSiteConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hp, setHp] = useState('');
  const [starters, setStarters] = useState(DEFAULT_STARTERS);
  const [intake, setIntake] = useState<ChatIntakeState | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const intakeRef = useRef<HTMLDivElement>(null);

  const welcome = config?.welcomeMessage ??
    'Hi — how can I help you today?';

  useEffect(() => {
    void fetchChatSiteConfig(siteKey).then(setConfig);
  }, [siteKey]);

  const dismissChat = useCallback(() => {
    setOpen(false);
    try {
      sessionStorage.setItem(dismissKey, '1');
    } catch {
      /* ignore */
    }
  }, [dismissKey]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(dismissKey)) return;
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => setOpen(true), AUTO_OPEN_MS);
    return () => window.clearTimeout(t);
  }, [dismissKey]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: newId(), role: 'assistant', content: welcome }]);
    }
  }, [open, messages.length, welcome]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 250);
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
      if (result.intake) setIntake(result.intake);
      if (result.suggestedReplies?.length) setStarters(result.suggestedReplies);
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
        .filter((m) => !(m.role === 'assistant' && m.content === welcome && history.length <= 2));

      try {
        const result = await sendChatMessage(apiMessages, { honeypot: hp, siteKey });
        applyChatResult(result);
        if (result.intake?.showForm || isIntakeTrigger(trimmed)) scrollToIntake();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not reach the assistant.');
      } finally {
        setSending(false);
      }
    },
    [applyChatResult, hp, messages, scrollToIntake, sending, siteKey, welcome],
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
        aria-label="Open Nexrena AI chat"
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
        </svg>
        <span className="site-chat-fab-label">Ask AI</span>
      </button>

      {open && (
        <div className="site-chat-root" role="presentation">
          <button type="button" className="site-chat-backdrop" aria-label="Close chat" onClick={dismissChat} />

          <section
            className="site-chat-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Nexrena AI assistant"
          >
            <header className="site-chat-header">
              <div className="site-chat-header-brand">
                <AssistantAvatar />
                <div className="min-w-0">
                  <p className="site-chat-title">{config?.assistantName ?? 'AI Assistant'}</p>
                  <p className="site-chat-subtitle">{config?.subtitle ?? config?.label ?? 'Website assistant'}</p>
                </div>
              </div>
              <button type="button" onClick={dismissChat} aria-label="Close chat" className="site-chat-close">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden width="20" height="20">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div ref={listRef} className="site-chat-messages">
              {messages.map((msg) =>
                msg.role === 'assistant' ? (
                  <article key={msg.id} className="site-chat-msg site-chat-msg-assistant">
                    <AssistantAvatar />
                    <div className="site-chat-msg-content">
                      <p className="site-chat-msg-label">{config?.assistantName ?? 'Assistant'}</p>
                      <div className="site-chat-msg-text">
                        <ChatMessageBody content={msg.content} />
                      </div>
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="site-chat-actions">{msg.actions.map((a, i) => renderAction(a, i === 0))}</div>
                      )}
                    </div>
                  </article>
                ) : (
                  <article key={msg.id} className="site-chat-msg site-chat-msg-user">
                    <div className="site-chat-msg-content">
                      <p className="site-chat-msg-text">{msg.content}</p>
                    </div>
                  </article>
                ),
              )}

              {intake?.showForm && !intake.submitted && (
                <article ref={intakeRef} className="site-chat-msg site-chat-msg-assistant">
                  <AssistantAvatar />
                  <div className="site-chat-msg-content site-chat-intake-wrap">
                    <ChatIntakeForm
                      sessionId={getChatSessionId(siteKey)}
                      siteKey={siteKey}
                      prefill={intake.prefilled}
                      onSuccess={onIntakeSuccess}
                      onError={setError}
                    />
                  </div>
                </article>
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
                <article className="site-chat-msg site-chat-msg-assistant">
                  <AssistantAvatar />
                  <div className="site-chat-msg-content">
                    <span className="site-chat-typing" aria-label="Assistant is typing">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </article>
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
              <div className="site-chat-composer">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 500))}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder={`Message ${config?.assistantName ?? 'AI'}…`}
                  disabled={sending}
                  maxLength={500}
                  aria-label="Message to assistant"
                  className="site-chat-composer-input"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={sending || !input.trim()}
                  className="site-chat-composer-send"
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </div>
              <p className="site-chat-disclaimer">
                AI can make mistakes. Verify on{' '}
                <a href={config?.links?.contact ?? '/contact/'}>contact</a>
                {config?.links?.schedule ? (
                  <>
                    {' '}
                    or <a href={config.links.schedule}>schedule a call</a>.
                  </>
                ) : (
                  '.'
                )}
              </p>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
