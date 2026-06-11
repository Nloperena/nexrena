import type { ReactNode } from 'react';
import { buildCalendlyUrl, isCalendlyEnabled, mailtoFallback } from '@/lib/calendly';
import { loadCalendlyAssets } from '@/lib/calendly-widget';

type Props = {
  children: ReactNode;
  className?: string;
  prefill?: { name?: string; email?: string };
};

export function CalendlyBookButton({ children, className, prefill }: Props) {
  const url = buildCalendlyUrl(prefill);

  if (!isCalendlyEnabled()) {
    return (
      <a href={mailtoFallback()} className={className}>
        {children}
      </a>
    );
  }

  const openPopup = async () => {
    try {
      await loadCalendlyAssets();
      if (window.Calendly && url) {
        window.Calendly.initPopupWidget({ url, prefill });
      }
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button type="button" onClick={openPopup} className={className}>
      {children}
    </button>
  );
}
