import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { track } from '@vercel/analytics';
import { projectIntakeCta, GROWTH_PORTAL_EVENT } from '@/data/cta';
import { ProjectIntakeForm } from '@/components/ProjectIntakeForm';

function safeTrack(eventName: string, data: Record<string, unknown> = {}) {
  try {
    track(eventName, data);
  } catch {
    // Ignore analytics failures.
  }
}

export function GrowthPlanPortal() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState('unknown');

  const close = useCallback(() => {
    safeTrack('growth_plan_portal_close', { source });
    setIsOpen(false);
  }, [source]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: string }>).detail;
      const nextSource = detail?.source ?? 'unknown';
      setSource(nextSource);
      setIsOpen(true);
      safeTrack('growth_plan_portal_open', { source: nextSource });
    };

    window.addEventListener(GROWTH_PORTAL_EVENT, open);
    return () => window.removeEventListener(GROWTH_PORTAL_EVENT, open);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[5000] flex" role="dialog" aria-modal="true" aria-labelledby="growth-plan-title">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(8,10,13,0.88)] backdrop-blur-sm"
        aria-label="Close project intake form"
        onClick={close}
      />

      <div className="relative ml-auto flex h-full w-full max-w-[640px] flex-col overflow-y-auto border-l border-[var(--slate-800)] bg-[var(--obsidian)] shadow-2xl">
        <div className="relative flex items-start justify-between gap-6 border-b border-[var(--slate-800)] px-6 py-6 md:px-10 md:py-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold-dim)]">
              {projectIntakeCta.portalEyebrow}
            </p>
            <h2 id="growth-plan-title" className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] leading-tight text-[var(--warm-white)]">
              {projectIntakeCta.portalTitle}
            </h2>
            <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-[var(--slate-400)]">
              {projectIntakeCta.portalSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-[var(--slate-400)] hover:text-[var(--gold)]"
          >
            Close
          </button>
        </div>

        <div className="relative flex-1 px-6 py-8 md:px-10 md:py-10">
          <ProjectIntakeForm source={source} onSuccess={close} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
