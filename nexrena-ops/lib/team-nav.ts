export type TeamNavItem = {

  href: string

  label: string

  icon: string

  badge?: 'messages' | 'forms'

}



export const TEAM_DASHBOARD_NAV: TeamNavItem[] = [

  { href: '/', label: 'Dashboard', icon: '⌂' },

]



export const TEAM_WORK_NAV: TeamNavItem[] = [

  { href: '/projects', label: 'Projects', icon: '▦' },

  { href: '/service-requests', label: 'Service requests', icon: '✦' },

  { href: '/safety-warnings', label: 'Safety notices', icon: '⚠' },

  { href: '/proposals', label: 'Proposals', icon: '◇' },

  { href: '/leads', label: 'Leads', icon: '◉' },

  { href: '/form-submissions', label: 'Form leads', icon: '▣', badge: 'forms' },

  { href: '/ai-chats', label: 'AI chats', icon: '◐' },

]



export const TEAM_BILLING_NAV: TeamNavItem[] = [

  { href: '/invoices', label: 'Invoices', icon: '▤' },

  { href: '/subscriptions', label: 'Subscriptions', icon: '↻' },

  { href: '/expenses', label: 'Expenses', icon: '▥' },

]



export const TEAM_CLIENTS_NAV: TeamNavItem[] = [

  { href: '/messages', label: 'Messages', icon: '✉', badge: 'messages' },

  { href: '/client-files', label: 'Business assets', icon: '📁' },

  { href: '/client-resources', label: 'Client websites', icon: '⌘' },

  { href: '/portal-accounts', label: 'Portal accounts', icon: '◈' },

]



export const TEAM_ADMIN_NAV: TeamNavItem[] = [

  { href: '/crm', label: 'CRM', icon: '◎' },

  { href: '/reports', label: 'Reports', icon: '◩' },

]



/** Primary mobile bottom tabs */

export const TEAM_MOBILE_TABS: TeamNavItem[] = [

  { href: '/', label: 'Home', icon: '⌂' },

  { href: '/messages', label: 'Messages', icon: '✉', badge: 'messages' },

  { href: '/copilot', label: 'Copilot', icon: '✦' },

  { href: '/invoices', label: 'Billing', icon: '▤' },

  { href: '/projects', label: 'Work', icon: '▦' },

]



export const TEAM_NAV_SECTIONS = [

  { title: 'Overview', items: TEAM_DASHBOARD_NAV },

  { title: 'Work', items: TEAM_WORK_NAV },

  { title: 'Billing', items: TEAM_BILLING_NAV },

  { title: 'Clients', items: TEAM_CLIENTS_NAV },

  { title: 'Admin', items: TEAM_ADMIN_NAV },

] as const



export function isTeamNavActive(pathname: string, href: string) {

  if (href === '/') return pathname === '/'

  return pathname === href || pathname.startsWith(`${href}/`)

}



export function isTeamMoreRouteActive(pathname: string) {

  if (pathname === '/') return false

  const tabHrefs = TEAM_MOBILE_TABS.map((t) => t.href)

  if (tabHrefs.some((h) => isTeamNavActive(pathname, h))) return false

  const all = TEAM_NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href))

  return all.some((h) => isTeamNavActive(pathname, h))

}

