import { useCallback, useEffect, useState } from 'react';
import type { PortalAccount, PortalInvoice, PortalProject, PortalProposal } from '@/data/portal';
import {
  fetchPortalInvoices,
  fetchPortalMe,
  fetchPortalProjects,
  fetchPortalProposals,
  logoutPortal,
  updatePortalProfile,
} from '@/lib/portal-api';

const cardClass =
  'border border-[var(--slate-800)] bg-[var(--slate-900)]/40 px-4 py-4';

type Props = {
  onSignOut: () => void;
  embedded?: boolean;
};

export function PortalDashboard({ onSignOut, embedded = false }: Props) {
  const [account, setAccount] = useState<PortalAccount | null>(null);
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [proposals, setProposals] = useState<PortalProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [me, projectRows, invoiceRows, proposalRows] = await Promise.all([
        fetchPortalMe(),
        fetchPortalProjects(),
        fetchPortalInvoices(),
        fetchPortalProposals(),
      ]);
      setAccount(me);
      setName(me.name);
      setCompany(me.company ?? '');
      setProjects(projectRows);
      setInvoices(invoiceRows);
      setProposals(proposalRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your portal.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSignOut = () => {
    logoutPortal();
    onSignOut();
  };

  const saveProfile = async () => {
    try {
      const updated = await updatePortalProfile({ name, company });
      setAccount(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update profile.');
    }
  };

  if (loading) {
    return <p className="font-mono text-sm text-[var(--slate-400)]">Loading your workspace…</p>;
  }

  if (error && !account) {
    return (
      <div className="space-y-4">
        <p className="font-mono text-sm text-red-400">{error}</p>
        <button type="button" onClick={handleSignOut} className="font-mono text-[11px] uppercase tracking-widest text-[var(--gold)]">
          Sign in again
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-8 ${embedded ? '' : 'max-w-3xl'}`}>
      <div className={`${cardClass} flex flex-wrap items-start justify-between gap-4`}>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--gold-dim)]">Signed in as</p>
          {editing ? (
            <div className="mt-3 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--slate-800)] border border-[var(--slate-700)] px-3 py-2 text-[var(--warm-white)]"
              />
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
                className="w-full bg-[var(--slate-800)] border border-[var(--slate-700)] px-3 py-2 text-[var(--warm-white)]"
              />
              <div className="flex gap-3">
                <button type="button" onClick={saveProfile} className="font-mono text-[11px] uppercase tracking-widest text-[var(--gold)]">
                  Save
                </button>
                <button type="button" onClick={() => setEditing(false)} className="font-mono text-[11px] uppercase tracking-widest text-[var(--slate-400)]">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="mt-2 font-display text-2xl text-[var(--warm-white)]">{account?.name}</h3>
              <p className="font-body text-sm text-[var(--slate-400)]">{account?.email}</p>
              {account?.company && <p className="font-body text-sm text-[var(--slate-500)]">{account.company}</p>}
            </>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {!editing && (
            <button type="button" onClick={() => setEditing(true)} className="font-mono text-[11px] uppercase tracking-widest text-[var(--slate-300)] hover:text-[var(--gold)]">
              Edit profile
            </button>
          )}
          <button type="button" onClick={handleSignOut} className="font-mono text-[11px] uppercase tracking-widest text-[var(--slate-400)] hover:text-[var(--gold)]">
            Sign out
          </button>
        </div>
      </div>

      <section>
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)] mb-3">Projects</h4>
        {projects.length === 0 ? (
          <p className={`${cardClass} font-body text-sm text-[var(--slate-500)]`}>
            No active projects yet. Submit a request and we will scope your first sprint.
          </p>
        ) : (
          <ul className="space-y-3">
            {projects.map((project) => (
              <li key={project.id} className={cardClass}>
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-display text-lg text-[var(--warm-white)]">{project.name}</p>
                    <p className="font-body text-sm text-[var(--slate-400)]">{project.type} · {project.status}</p>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-wider text-[var(--gold)]">{project.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)] mb-3">Proposals</h4>
        {proposals.length === 0 ? (
          <p className={`${cardClass} font-body text-sm text-[var(--slate-500)]`}>No proposals yet.</p>
        ) : (
          <ul className="space-y-3">
            {proposals.map((proposal) => (
              <li key={proposal.id} className={cardClass}>
                <p className="font-display text-lg text-[var(--warm-white)]">{proposal.title}</p>
                <p className="mt-1 font-body text-sm text-[var(--slate-400)]">{proposal.status} · valid until {proposal.validUntil}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--slate-400)] mb-3">Invoices</h4>
        {invoices.length === 0 ? (
          <p className={`${cardClass} font-body text-sm text-[var(--slate-500)]`}>No invoices yet.</p>
        ) : (
          <ul className="space-y-3">
            {invoices.map((invoice) => (
              <li key={invoice.id} className={cardClass}>
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-display text-lg text-[var(--warm-white)]">{invoice.number}</p>
                    <p className="font-body text-sm text-[var(--slate-400)]">Due {invoice.dueDate}</p>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-wider text-[var(--gold)]">{invoice.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
