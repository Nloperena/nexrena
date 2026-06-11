import { useMemo, useState, type FormEvent } from 'react';
import { track } from '@vercel/analytics';
import { projectIntakeCta } from '@/data/cta';
import {
  engagementModels,
  projectBudgetOptions,
  projectTypeOptions,
  waasTiers,
  type EngagementModel,
} from '@/data/pricing';
import { submitLead } from '@/lib/contact-api';

const inputClass =
  'w-full bg-[var(--slate-800)] border border-[var(--slate-700)] text-[var(--warm-white)] font-body px-4 py-3 outline-none focus:border-[var(--gold)] transition-colors';

function safeTrack(eventName: string, data: Record<string, unknown> = {}) {
  try {
    track(eventName, data);
  } catch {
    // Ignore analytics failures.
  }
}

type Props = {
  source?: string;
  onSuccess?: () => void;
  onCreateAccount?: () => void;
  className?: string;
};

export function ProjectIntakeForm({ source = 'contact-page', onSuccess, onCreateAccount, className = '' }: Props) {
  const [engagement, setEngagement] = useState<EngagementModel>('project');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const waasOptions = useMemo(
    () => waasTiers.map((tier) => ({ value: tier.id, label: `${tier.name} — ${tier.priceLabel}${tier.priceSuffix}` })),
    [],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus('sending');

    const form = event.currentTarget;
    const fd = new FormData(form);
    if (fd.get('website')) return;

    const name = String(fd.get('name') ?? '').trim();
    const email = String(fd.get('email') ?? '').trim();
    const message = String(fd.get('message') ?? '').trim();
    const company = String(fd.get('company') ?? '').trim() || undefined;

    let projectType: string | undefined;
    let budget: string | undefined;

    if (engagement === 'waas') {
      const waasTier = String(fd.get('waasTier') ?? '').trim();
      const tier = waasTiers.find((t) => t.id === waasTier);
      projectType = tier?.id;
      budget = tier?.budgetValue;
    } else {
      projectType = String(fd.get('type') ?? '').trim() || undefined;
      budget = String(fd.get('budget') ?? '').trim() || undefined;
    }

    safeTrack('contact_form_submit_attempt', {
      source,
      engagement,
      projectType: projectType ?? 'unspecified',
      budget: budget ?? 'unspecified',
    });

    try {
      await submitLead({ name, email, message, company, budget, projectType, source });
      setStatus('success');
      form.reset();
      setEngagement('project');
      safeTrack('contact_form_submit_success', { source, engagement, projectType, budget });
      onSuccess?.();
    } catch {
      setStatus('error');
      setError('Something went wrong. Please email NicholasL@Nexrena.com directly.');
      safeTrack('contact_form_submit_error', { source, engagement });
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex flex-col items-center justify-center text-center py-12 ${className}`}>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--gold)] text-[var(--gold)]">
          ✓
        </div>
        <h3 className="font-display text-3xl italic text-[var(--warm-white)]">{projectIntakeCta.successTitle}</h3>
        <p className="mt-4 max-w-sm font-body text-[15px] text-[var(--slate-400)]">{projectIntakeCta.successBody}</p>
        {onCreateAccount && (
          <button
            type="button"
            onClick={onCreateAccount}
            className="mt-8 inline-flex h-12 items-center justify-center border border-[var(--gold)] px-6 font-mono text-[11px] uppercase tracking-widest text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--obsidian)]"
          >
            Create portal account
          </button>
        )}
      </div>
    );
  }

  return (
    <form className={`flex flex-col gap-6 ${className}`} onSubmit={onSubmit}>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="intake-website">Website</label>
        <input type="text" id="intake-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="flex flex-col gap-3 border-0 p-0">
        <legend className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)] mb-1">
          How do you want to work together?
        </legend>
        <div className="grid grid-cols-1 gap-3">
          {engagementModels.map((model) => (
            <label
              key={model.id}
              className={`cursor-pointer border px-4 py-3 transition-colors ${
                engagement === model.id
                  ? 'border-[var(--gold)] bg-[var(--slate-800)]'
                  : 'border-[var(--slate-700)] hover:border-[var(--slate-600)]'
              }`}
            >
              <input
                type="radio"
                name="engagement"
                value={model.id}
                checked={engagement === model.id}
                onChange={() => setEngagement(model.id)}
                className="sr-only"
              />
              <span className="block font-mono text-[11px] uppercase tracking-widest text-[var(--gold)]">
                {model.label}
              </span>
              <span className="mt-1 block font-body text-sm text-[var(--slate-400)]">{model.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Name</span>
        <input type="text" name="name" required autoComplete="name" className={inputClass} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Email</span>
        <input type="email" name="email" required autoComplete="email" className={inputClass} />
      </label>

      {engagement === 'waas' ? (
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">WaaS plan</span>
          <select name="waasTier" required className={inputClass}>
            <option value="">Select a monthly plan...</option>
            {waasOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="font-body text-xs text-[var(--slate-500)]">All WaaS plans require a 3-month minimum commitment.</p>
        </label>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Project type</span>
            <select name="type" className={inputClass}>
              <option value="">Select type...</option>
              {projectTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Budget range</span>
            <select name="budget" className={inputClass}>
              <option value="">Select range...</option>
              {projectBudgetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <label className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">How can we help?</span>
        <textarea
          name="message"
          rows={4}
          required
          placeholder="Tell us about your goals, timeline, and current setup."
          className={`${inputClass} resize-none`}
        />
      </label>

      <details className="border border-[var(--slate-800)] bg-[var(--obsidian)]/40">
        <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[var(--slate-300)]">
          Add company (optional)
        </summary>
        <div className="px-4 pb-4 pt-2">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Company</span>
            <input type="text" name="company" autoComplete="organization" className={inputClass} />
          </label>
        </div>
      </details>

      {error && <p className="font-mono text-[12px] text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex h-14 items-center justify-center bg-[var(--gold)] px-8 font-mono text-[12px] uppercase tracking-widest text-[var(--obsidian)] transition-colors hover:bg-[var(--gold-light)] disabled:opacity-60"
      >
        {status === 'sending' ? projectIntakeCta.submitSending : projectIntakeCta.submit}
      </button>

      <p className="text-center font-mono text-[10px] tracking-wide text-[var(--slate-500)]">
        We reply within one business day. No spam, no drip sequences.
      </p>
    </form>
  );
}
