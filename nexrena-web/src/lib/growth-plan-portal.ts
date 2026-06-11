import { GROWTH_PORTAL_EVENT } from '@/data/cta';

export type GrowthPortalDetail = { source?: string };

export function openGrowthPlanPortal(source = 'unknown') {
  window.dispatchEvent(
    new CustomEvent<GrowthPortalDetail>(GROWTH_PORTAL_EVENT, {
      detail: { source },
    }),
  );
}

export function bindGrowthPlanPortalTriggers() {
  if ((window as Window & { __nexrenaGrowthPortalBound?: boolean }).__nexrenaGrowthPortalBound) {
    return;
  }
  (window as Window & { __nexrenaGrowthPortalBound?: boolean }).__nexrenaGrowthPortalBound = true;

  document.addEventListener(
    'click',
    (event) => {
      const trigger = (event.target as HTMLElement | null)?.closest('[data-growth-plan-portal]');
      if (!trigger) return;

      event.preventDefault();
      event.stopPropagation();

      const el = trigger as HTMLElement;
      const source = el.dataset.ctaZone || el.dataset.ctaRole || 'unknown';
      openGrowthPlanPortal(source);
    },
    true,
  );
}
