export type PortalAccount = {
  id: string;
  email: string;
  name: string;
  company: string | null;
  contactId: string;
  createdAt?: string;
};

export type PortalProject = {
  id: string;
  name: string;
  clientName: string;
  status: string;
  type: string;
  value: number;
  phases: unknown;
  startDate: string;
  endDate?: string | null;
};

export type PortalInvoice = {
  id: string;
  number: string;
  clientName: string;
  status: string;
  issueDate: string;
  dueDate: string;
  lineItems: unknown;
  projectName?: string | null;
};

export type PortalProposal = {
  id: string;
  title: string;
  status: string;
  validUntil: string;
  clientName: string;
  scopeOfWork: string;
};

export const clientPortalUrl = 'https://nexrena-ops.vercel.app';

export function clientPortalShopUrl(sku?: string, category?: string) {
  const params = new URLSearchParams({ tab: 'sign-in', view: 'shop' })
  if (sku) params.set('sku', sku)
  if (category) params.set('category', category)
  return `${clientPortalUrl}?${params.toString()}`
}

export const portalCopy = {
  navLabel: 'Portal',
  eyebrow: 'Client portal',
  intakeTitle: 'Start a project',
  intakeSubtitle: 'Tell us where you are today. We reply within one business day.',
  signInTitle: 'Welcome back',
  signInSubtitle: 'Sign in to view projects, proposals, and invoices.',
  signUpTitle: 'Create your account',
  signUpSubtitle: 'Track your project, documents, and messages in one place.',
  dashboardTitle: 'Your workspace',
  dashboardSubtitle: 'Projects, proposals, and billing — all in one place.',
  tabIntake: 'New request',
  tabSignIn: 'Sign in',
  tabSignUp: 'Create account',
  tabDashboard: 'Dashboard',
} as const;

export type PortalTab = 'intake' | 'sign-in' | 'sign-up' | 'dashboard';

export function clientPortalHref(tab: Exclude<PortalTab, 'intake' | 'dashboard'> = 'sign-in') {
  if (tab === 'sign-up') return `${clientPortalUrl}?tab=sign-up`;
  return clientPortalUrl;
}

export const CLIENT_PORTAL_EVENT = 'nexrena:open-client-portal';
