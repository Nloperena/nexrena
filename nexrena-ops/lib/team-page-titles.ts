type PageContext = { title: string; subtitle?: string }

const ROUTES: Record<string, PageContext> = {
  '/': { title: 'Main Menu', subtitle: 'Select a destination' },
  '/invoices': { title: 'Invoices', subtitle: 'Billing, payments, and invoice history' },
  '/subscriptions': { title: 'Subscriptions', subtitle: 'Recurring client plans' },
  '/proposals': { title: 'Proposals', subtitle: 'Quotes and project scopes' },
  '/leads': { title: 'Leads', subtitle: 'Pipeline and new opportunities' },
  '/form-submissions': { title: 'Form leads', subtitle: 'Website contact and intake forms' },
  '/ai-chats': { title: 'Site messages', subtitle: 'AI chats, client forms, and portfolio leads' },
  '/messages': { title: 'Messages', subtitle: 'Client conversations' },
  '/client-files': { title: 'Business assets', subtitle: 'Shared files and deliverables' },
  '/client-resources': { title: 'Client websites', subtitle: 'Hosted sites and resources' },
  '/service-requests': { title: 'Service requests', subtitle: 'Client change and support tickets' },
  '/safety-warnings': { title: 'Safety notices', subtitle: 'On-site hazard warnings for clients' },
  '/portal-accounts': { title: 'Portal accounts', subtitle: 'Client login access' },
  '/projects': { title: 'Projects', subtitle: 'Active work and delivery status' },
  '/crm': { title: 'CRM', subtitle: 'Contacts and relationships' },
  '/expenses': { title: 'Expenses', subtitle: 'Business costs and receipts' },
  '/reports': { title: 'Reports', subtitle: 'Revenue, pipeline, and profitability' },
}

export function getTeamPageContext(pathname: string): PageContext {
  if (ROUTES[pathname]) return ROUTES[pathname]

  const match = Object.keys(ROUTES)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname.startsWith(route))

  return match ? ROUTES[match] : { title: 'Team dashboard', subtitle: 'Nexrena operations' }
}
