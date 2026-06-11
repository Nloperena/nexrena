import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { track } from '@vercel/analytics';
import { projectIntakeCta } from '@/data/cta';
import { CLIENT_PORTAL_EVENT, clientPortalHref, portalCopy, type PortalTab } from '@/data/portal';
import { ProjectIntakeForm } from '@/components/ProjectIntakeForm';

function safeTrack(eventName: string, data: Record<string, unknown> = {}) {
  try {
    track(eventName, data);
  } catch {
    // Ignore analytics failures.
  }
}

type Props = {
  defaultTab?: PortalTab;
  mode?: 'modal' | 'page';
};

export function ClientPortal({ mode = 'modal' }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(mode === 'page');
  const [source, setSource] = useState('unknown');
  const [intakeKey, setIntakeKey] = useState(0);

  const close = useCallback(() => {
    if (mode === 'page') return;
    safeTrack('client_portal_close', { source });
    setIsOpen(false);
  }, [mode, source]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: string; tab?: PortalTab }>).detail;
      const nextTab = detail?.tab ?? 'intake';

      if (nextTab === 'sign-in' || nextTab === 'sign-up') {
        window.location.href = clientPortalHref(nextTab);
        return;
      }

      setSource(detail?.source ?? 'unknown');
      setIsOpen(true);
      safeTrack('client_portal_open', { source: detail?.source ?? 'unknown', tab: 'intake' });
    };

    window.addEventListener(CLIENT_PORTAL_EVENT, open);
    return () => window.removeEventListener(CLIENT_PORTAL_EVENT, open);
  }, []);

  useEffect(() => {
    if (mode === 'page') return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen || mode === 'page') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close, mode]);

  const panel = (
    <div
      className={
        mode === 'page'
          ? 'mx-auto w-full max-w-3xl px-6 py-12 md:py-16'
          : 'relative ml-auto flex h-full w-full max-w-[680px] flex-col overflow-y-auto border-l border-[var(--slate-800)] bg-[var(--obsidian)] shadow-2xl'
      }
    >
      <div className={`border-b border-[var(--slate-800)] px-6 py-6 md:px-10 md:py-8 ${mode === 'page' ? 'rounded-t-lg' : ''}`}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold-dim)]">
              {portalCopy.eyebrow}
            </p>
            <h1 id="client-portal-title" className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] leading-tight text-[var(--warm-white)]">
              {projectIntakeCta.portalTitle}
            </h1>
            <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-[var(--slate-400)]">
              {projectIntakeCta.portalSubtitle}
            </p>
          </div>
          {mode === 'modal' && (
            <button
              type="button"
              onClick={close}
              className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-[var(--slate-400)] hover:text-[var(--gold)]"
            >
              Close
            </button>
          )}
        </div>

        <p className="mt-6 font-body text-sm text-[var(--slate-400)]">
          Already have an account?{' '}
          <a href={clientPortalHref('sign-in')} className="text-[var(--gold)] hover:underline">
            Sign in to the portal
          </a>
        </p>
      </div>

      <div className="flex-1 px-6 py-8 md:px-10 md:py-10">
        <ProjectIntakeForm
          key={intakeKey}
          source={source}
          onSuccess={() => {
            safeTrack('client_portal_intake_success', { source });
          }}
          onCreateAccount={() => {
            setIntakeKey((value) => value + 1);
            window.location.href = clientPortalHref('sign-up');
          }}
        />
      </div>
    </div>
  );

  if (!mounted) return null;
  if (mode === 'page') return panel;
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[5000] flex" role="dialog" aria-modal="true" aria-labelledby="client-portal-title">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(8,10,13,0.88)] backdrop-blur-sm"
        aria-label="Close client portal"
        onClick={close}
      />
      {panel}
    </div>,
    document.body,
  );
}

/** Back-compat export used in Layout.astro */
export function GrowthPlanPortal() {
  return <ClientPortal mode="modal" />;
}
