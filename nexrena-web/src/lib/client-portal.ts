import { GROWTH_PORTAL_EVENT } from '@/data/cta';
import { CLIENT_PORTAL_EVENT, clientPortalHref, type PortalTab } from '@/data/portal';

export type PortalOpenDetail = { source?: string; tab?: PortalTab };

export function openClientPortal(source = 'unknown', tab: PortalTab = 'intake') {
  if (tab === 'sign-in' || tab === 'sign-up') {
    window.location.href = clientPortalHref(tab);
    return;
  }

  window.dispatchEvent(
    new CustomEvent<PortalOpenDetail>(CLIENT_PORTAL_EVENT, {
      detail: { source, tab: 'intake' },
    }),
  );
}

/** @deprecated Use openClientPortal */
export function openGrowthPlanPortal(source = 'unknown', tab: PortalTab = 'intake') {
  openClientPortal(source, tab);
}

export function bindClientPortalTriggers() {
  if ((window as Window & { __nexrenaClientPortalBound?: boolean }).__nexrenaClientPortalBound) {
    return;
  }
  (window as Window & { __nexrenaClientPortalBound?: boolean }).__nexrenaClientPortalBound = true;

  document.addEventListener(
    'click',
    (event) => {
      const portalTrigger = (event.target as HTMLElement | null)?.closest('[data-client-portal]');
      const intakeTrigger = (event.target as HTMLElement | null)?.closest('[data-growth-plan-portal]');
      const trigger = portalTrigger || intakeTrigger;
      if (!trigger) return;

      event.preventDefault();
      event.stopPropagation();

      const el = trigger as HTMLElement;
      const source = el.dataset.ctaZone || el.dataset.ctaRole || 'unknown';
      const tab = (el.dataset.portalTab as PortalTab | undefined) ?? (portalTrigger ? 'sign-in' : 'intake');
      openClientPortal(source, tab);
    },
    true,
  );
}

export const bindGrowthPlanPortalTriggers = bindClientPortalTriggers;

export { GROWTH_PORTAL_EVENT };
