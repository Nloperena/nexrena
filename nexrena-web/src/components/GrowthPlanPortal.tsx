import { useEffect, useState, type FormEvent } from 'react';
import { track } from '@vercel/analytics';
import { submitLead } from '@/lib/contact-api';

declare global {
  interface Window {
    openGrowthPlanPortal?: (source?: string) => void;
  }
}

const inputClass =
  'w-full bg-[var(--slate-800)] border border-[var(--slate-700)] text-[var(--warm-white)] font-body px-4 py-3 outline-none focus:border-[var(--gold)] transition-colors';

function safeTrack(eventName: string, data: Record<string, unknown> = {}) {
  try {
    track(eventName, data);
  } catch {
    // Ignore analytics failures.
  }
}

export function GrowthPlanPortal() {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState('unknown');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.openGrowthPlanPortal = (nextSource = 'unknown') => {
      setSource(nextSource);
      setIsOpen(true);
      setStatus('idle');
      setError(null);
      safeTrack('growth_plan_portal_open', { source: nextSource });
    };

    const onClick = (event: MouseEvent) => {
      const trigger = (event.target as HTMLElement | null)?.closest('[data-growth-plan-portal]');
      if (!trigger) return;
      event.preventDefault();
      const zone =
        (trigger as HTMLElement).dataset.ctaZone ||
        (trigger as HTMLElement).dataset.ctaRole ||
        'unknown';
      window.openGrowthPlanPortal?.(zone);
    };

    document.addEventListener('click', onClick);
    return () => {
      delete window.openGrowthPlanPortal;
      document.removeEventListener('click', onClick);
    };
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
  }, [isOpen, source]);

  const close = () => {
    safeTrack('growth_plan_portal_close', { source });
    setIsOpen(false);
    setStatus('idle');
    setError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus('sending');

    const form = event.currentTarget;
    const fd = new FormData(form);
    if (fd.get('website')) return;

    const payload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      company: String(fd.get('company') ?? '').trim() || undefined,
      budget: String(fd.get('budget') ?? '').trim() || undefined,
      projectType: String(fd.get('type') ?? '').trim() || undefined,
      message: String(fd.get('message') ?? '').trim(),
    };

    safeTrack('growth_plan_portal_submit_attempt', {
      source,
      projectType: payload.projectType ?? 'unspecified',
    });

    try {
      await submitLead(payload);
      setStatus('success');
      form.reset();
      safeTrack('growth_plan_portal_submit_success', {
        source,
        projectType: payload.projectType ?? 'unspecified',
      });
    } catch {
      setStatus('error');
      setError('Something went wrong. Please email NicholasL@Nexrena.com directly.');
      safeTrack('growth_plan_portal_submit_error', { source });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex" role="dialog" aria-modal="true" aria-labelledby="growth-plan-title">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(8,10,13,0.88)] backdrop-blur-sm"
        aria-label="Close growth plan form"
        onClick={close}
      />

      <div className="relative ml-auto flex h-full w-full max-w-[640px] flex-col overflow-y-auto border-l border-[var(--slate-800)] bg-[var(--obsidian)] shadow-2xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 80% 10%, rgba(201,169,110,0.18), transparent 45%), linear-gradient(180deg, rgba(12,15,18,0.2), rgba(12,15,18,0.95))',
          }}
        />

        <div className="relative flex items-start justify-between gap-6 border-b border-[var(--slate-800)] px-6 py-6 md:px-10 md:py-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold-dim)]">90-day growth plan</p>
            <h2 id="growth-plan-title" className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] leading-tight text-[var(--warm-white)]">
              Tell us where you are today.
            </h2>
            <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-[var(--slate-400)]">
              Audit, roadmap, and first sprint — scoped to your business. Reply within one business day.
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
          {status === 'success' ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--gold)] text-[var(--gold)]">
                ✓
              </div>
              <h3 className="font-display text-3xl italic text-[var(--warm-white)]">Message received.</h3>
              <p className="mt-4 max-w-sm font-body text-[15px] text-[var(--slate-400)]">
                We&apos;ll be in touch within one business day to discuss your 90-day plan.
              </p>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="portal-website">Website</label>
                <input type="text" id="portal-website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Name</span>
                <input type="text" name="name" required autoComplete="name" className={inputClass} />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Email</span>
                <input type="email" name="email" required autoComplete="email" className={inputClass} />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">How can we help?</span>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="Tell us about your project goals and current challenges."
                  className={`${inputClass} resize-none`}
                />
              </label>

              <details className="border border-[var(--slate-800)] bg-[var(--slate-900)]/40">
                <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[var(--slate-300)]">
                  Add project details (optional)
                </summary>
                <div className="flex flex-col gap-5 px-4 pb-4 pt-2">
                  <label className="flex flex-col gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Company</span>
                    <input type="text" name="company" autoComplete="organization" className={inputClass} />
                  </label>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Budget</span>
                      <select name="budget" className={inputClass}>
                        <option value="">Select range...</option>
                        <option value="10k-25k">$10k - $25k</option>
                        <option value="25k-50k">$25k - $50k</option>
                        <option value="50k+">$50k+</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Project type</span>
                      <select name="type" className={inputClass}>
                        <option value="">Select type...</option>
                        <option value="web-design">Web Design & Dev</option>
                        <option value="seo">SEO & Growth</option>
                        <option value="full-service">Full-Service</option>
                      </select>
                    </label>
                  </div>
                </div>
              </details>

              {error && <p className="font-mono text-[12px] text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="mt-2 inline-flex h-14 items-center justify-center bg-[var(--gold)] px-8 font-mono text-[12px] uppercase tracking-widest text-[var(--obsidian)] transition-colors hover:bg-[var(--gold-light)] disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending...' : 'Get My 90-Day Plan'}
              </button>

              <p className="text-center font-mono text-[10px] tracking-wide text-[var(--slate-500)]">
                We reply within one business day. No spam, no drip sequences.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
