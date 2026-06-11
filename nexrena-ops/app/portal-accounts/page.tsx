'use client'
import { usePortalAccounts } from '@/lib/store'
import { formatDate } from '@/lib/store'
import { PageHeader, EmptyState, SectionCard } from '@/components/ui'

export default function PortalAccountsPage() {
  const { accounts } = usePortalAccounts()

  return (
    <div>
      <PageHeader title="Portal Accounts" sub={`${accounts.length} self-service client accounts`} />

      {accounts.length === 0 ? (
        <EmptyState message="No portal accounts yet. Accounts appear when clients sign up on nexrena.com/portal." />
      ) : (
        <SectionCard>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="py-3 pr-4">Client</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Company</th>
                  <th className="py-3 pr-4">CRM ID</th>
                  <th className="py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-slate-800/60 text-slate-300">
                    <td className="py-3 pr-4 font-medium text-white">{account.name}</td>
                    <td className="py-3 pr-4">{account.email}</td>
                    <td className="py-3 pr-4">{account.company || '—'}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">{account.contactId}</td>
                    <td className="py-3 text-slate-400">{formatDate(account.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
