import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { AuditLog } from '@/types';
import { ShieldCheck, User, Clock, Search } from 'lucide-react';

interface Props {
  audit_logs: AuditLog[];
}

export default function AuditLogsIndex({ audit_logs = [] }: Props) {
  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Audit Trail' }]}>
      <Head title="Immutable Audit Trail - Git Deployment Synchronizer" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">CoreSentinel Immutable Audit Trail</h3>
          <p className="text-secondary mb-0 small">
            Tamper-resistant historical record of all authentication, server mutation, and deployment events.
          </p>
        </div>
      </div>

      <div className="card bg-dark border-secondary border-opacity-25 shadow-sm">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr className="text-secondary border-secondary border-opacity-25" style={{ fontSize: '0.8rem' }}>
                <th>EVENT ID</th>
                <th>ACTION TYPE</th>
                <th>PERFORMED BY</th>
                <th>IP ADDRESS</th>
                <th>ENTITY AFFECTED</th>
                <th>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {audit_logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-secondary">
                    <ShieldCheck size={40} className="mb-2 opacity-50 text-success" />
                    <div className="fw-semibold">No audit records recorded yet</div>
                    <div className="small">System actions and user events will appear here in append-only storage.</div>
                  </td>
                </tr>
              ) : (
                audit_logs.map((log) => (
                  <tr key={log.id} className="border-secondary border-opacity-25">
                    <td>
                      <code className="text-secondary">#{log.id}</code>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-light small">
                        <User size={12} className="text-secondary" />
                        <span>{log.user?.name || 'System Daemon'}</span>
                      </div>
                    </td>
                    <td>
                      <code className="text-secondary small">{log.ip_address}</code>
                    </td>
                    <td>
                      <span className="text-secondary small">
                        {log.auditable_type ? `${log.auditable_type.split('\\').pop()} #${log.auditable_id}` : 'Global Config'}
                      </span>
                    </td>
                    <td className="text-secondary small">
                      <div className="d-flex align-items-center gap-1">
                        <Clock size={12} />
                        <span>{log.created_at}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
