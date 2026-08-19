import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Deployment } from '@/types';
import { PlayCircle, GitBranch, Server, Clock, ArrowRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  deployments: Deployment[];
}

export default function DeploymentsIndex({ deployments = [] }: Props) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="badge-status status-online">Success</span>;
      case 'running':
        return <span className="badge-status status-running"><span className="spinner-border spinner-border-sm me-1" style={{ width: '10px', height: '10px' }}></span>Running</span>;
      case 'pending_approval':
        return <span className="badge-status status-pending">Pending Approval</span>;
      case 'failed':
        return <span className="badge-status status-offline">Failed</span>;
      default:
        return <span className="badge bg-secondary-subtle text-secondary">{status}</span>;
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Deployments' }]}>
      <Head title="Deployments & Pipelines - Git Deployment Synchronizer" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">Deployment History & Synchronization Jobs</h3>
          <p className="text-secondary mb-0 small">
            Traceable execution logs and status records for all server deployment pipelines.
          </p>
        </div>
      </div>

      <div className="card bg-dark border-secondary border-opacity-25 shadow-sm">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr className="text-secondary border-secondary border-opacity-25" style={{ fontSize: '0.8rem' }}>
                <th>JOB ID</th>
                <th>PROJECT & REPO</th>
                <th>SERVER & ENV</th>
                <th>REF / COMMIT</th>
                <th>STATUS</th>
                <th>TRIGGERED BY</th>
                <th>TIME & DURATION</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {deployments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-secondary">
                    <PlayCircle size={40} className="mb-2 opacity-50" />
                    <div className="fw-semibold">No deployments recorded</div>
                    <div className="small">Trigger a deployment from the Projects page or push to a webhook-enabled branch.</div>
                  </td>
                </tr>
              ) : (
                deployments.map((d) => (
                  <tr key={d.id} className="border-secondary border-opacity-25">
                    <td>
                      <code className="text-info fw-bold">#{d.id}</code>
                    </td>
                    <td>
                      <div className="fw-bold text-light">{d.project?.name || 'Project'}</div>
                      <div className="text-secondary small">{d.project?.repository?.name || 'Repository'}</div>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-light border border-secondary border-opacity-25 me-1">
                        {d.server?.name || 'Server'}
                      </span>
                      <span className="badge bg-dark border border-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {d.project?.environment || 'test'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-info small">
                        <GitBranch size={12} />
                        <span>{d.branch}</span>
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        <code>{d.commit_sha ? d.commit_sha.substring(0, 7) : 'HEAD'}</code>
                      </div>
                    </td>
                    <td>{getStatusBadge(d.status)}</td>
                    <td className="text-secondary small">
                      {d.triggered_by?.name || d.trigger_source}
                    </td>
                    <td className="text-secondary small">
                      <div>{d.created_at}</div>
                      {d.duration_seconds && <div className="text-secondary opacity-75">{d.duration_seconds}s duration</div>}
                    </td>
                    <td className="text-end">
                      <Link href={`/deployments/${d.id}`} className="btn btn-outline-primary btn-sm" style={{ fontSize: '0.75rem' }}>
                        View Terminal
                      </Link>
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
