import { useState, type FormEvent } from 'react';
import { portalCopy } from '@/data/portal';
import { loginPortalAccount, registerPortalAccount } from '@/lib/portal-api';

const inputClass =
  'w-full bg-[var(--slate-800)] border border-[var(--slate-700)] text-[var(--warm-white)] font-body px-4 py-3 outline-none focus:border-[var(--gold)] transition-colors';

type Mode = 'sign-in' | 'sign-up';

type Props = {
  mode: Mode;
  onSuccess: () => void;
  onSwitchMode: (mode: Mode) => void;
};

export function PortalAuthForm({ mode, onSuccess, onSwitchMode }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus('loading');

    const fd = new FormData(event.currentTarget);
    const email = String(fd.get('email') ?? '').trim();
    const password = String(fd.get('password') ?? '').trim();

    try {
      if (mode === 'sign-up') {
        const name = String(fd.get('name') ?? '').trim();
        const company = String(fd.get('company') ?? '').trim() || undefined;
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }
        await registerPortalAccount({ name, email, password, company });
      } else {
        await loginPortalAccount(email, password);
      }
      setStatus('idle');
      onSuccess();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const isSignUp = mode === 'sign-up';

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      {isSignUp && (
        <>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Full name</span>
            <input type="text" name="name" required autoComplete="name" className={inputClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Company (optional)</span>
            <input type="text" name="company" autoComplete="organization" className={inputClass} />
          </label>
        </>
      )}

      <label className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Email</span>
        <input type="email" name="email" required autoComplete="email" className={inputClass} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)]">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={isSignUp ? 8 : undefined}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          className={inputClass}
        />
        {isSignUp && (
          <p className="font-body text-xs text-[var(--slate-500)]">At least 8 characters.</p>
        )}
      </label>

      {error && <p className="font-mono text-[12px] text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex h-14 items-center justify-center bg-[var(--gold)] px-8 font-mono text-[12px] uppercase tracking-widest text-[var(--obsidian)] transition-colors hover:bg-[var(--gold-light)] disabled:opacity-60"
      >
        {status === 'loading' ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
      </button>

      <p className="text-center font-body text-sm text-[var(--slate-400)]">
        {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
        <button
          type="button"
          onClick={() => onSwitchMode(isSignUp ? 'sign-in' : 'sign-up')}
          className="font-mono text-[11px] uppercase tracking-wider text-[var(--gold)] hover:underline"
        >
          {isSignUp ? portalCopy.tabSignIn : portalCopy.tabSignUp}
        </button>
      </p>
    </form>
  );
}
