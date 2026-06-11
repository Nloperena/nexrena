import { NEXRENA_API_URL } from '@/lib/contact-api';
import type { PortalAccount, PortalInvoice, PortalProject, PortalProposal } from '@/data/portal';

const SESSION_KEY = 'nx-portal-token';

export function getPortalToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setPortalToken(token: string) {
  localStorage.setItem(SESSION_KEY, token);
}

export function clearPortalToken() {
  localStorage.removeItem(SESSION_KEY);
}

async function portalFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getPortalToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${NEXRENA_API_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Request failed');
  }
  return data as T;
}

export async function registerPortalAccount(payload: {
  name: string;
  email: string;
  password: string;
  company?: string;
}) {
  const data = await portalFetch<{ token: string; account: PortalAccount }>('/api/portal/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setPortalToken(data.token);
  return data.account;
}

export async function loginPortalAccount(email: string, password: string) {
  const data = await portalFetch<{ token: string; account: PortalAccount }>('/api/portal/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setPortalToken(data.token);
  return data.account;
}

export async function fetchPortalMe() {
  return portalFetch<PortalAccount>('/api/portal/me');
}

export async function updatePortalProfile(payload: { name?: string; company?: string }) {
  return portalFetch<PortalAccount>('/api/portal/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchPortalProjects() {
  return portalFetch<PortalProject[]>('/api/portal/projects');
}

export async function fetchPortalInvoices() {
  return portalFetch<PortalInvoice[]>('/api/portal/invoices');
}

export async function fetchPortalProposals() {
  return portalFetch<PortalProposal[]>('/api/portal/proposals');
}

export function logoutPortal() {
  clearPortalToken();
}
