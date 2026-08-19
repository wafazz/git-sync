import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Server, GitBranch, FolderGit2, PlayCircle, CheckSquare, ShieldCheck, ArrowUpRight, Activity, Terminal, Clock, AlertTriangle } from 'lucide-react';
import { Server as ServerType, Deployment, Project, DeploymentApproval } from '@/types';

interface DashboardProps {
  stats: {
    servers_online: number;
    servers_total: number;
    projects_count: number;
    running_deployments: number;
    pending_approvals: number;
  };
  recent_deployments: Deployment[];
  pending_approvals: DeploymentApproval[];
  servers: ServerType[];
}

export default function Dashboard({ stats, recent_deployments = [], pending_approvals = [], servers = [] }: DashboardProps) {
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
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }]}>
      <Head title="System Dashboard - Git Deployment Synchronizer" />

      {/* Page Title Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">Deployment Synchronizer Dashboard</h3>
          <p className="text-secondary mb-0 small">Centralized multi-server Git deployment orchestrator under CoreSentinel governance.</p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/deployments" className="btn btn-primary btn-sm d-flex align-items-center gap-2">
            <PlayCircle size={16} />
            <span>Trigger Deployment</span>
          </Link>
          <Link href="/servers" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
            <Server size={16} />
            <span>Manage Servers</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        {/* Servers Status */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 bg-dark border-secondary border-opacity-25 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-medium">Target Servers</span>
                <div className="bg-primary-subtle text-primary p-2 rounded">
                  <Server size={18} />
                </div>
              </div>
              <h3 className="fw-bold text-light mb-1">
                {stats?.servers_online || 0} <span className="fs-6 text-secondary fw-normal">/ {stats?.servers_total || 0} Online</span>
              </h3>
              <div className="text-success small d-flex align-items-center gap-1">
                <span className="rounded-circle bg-success d-inline-block" style={{ width: '8px', height: '8px' }}></span>
                <span>Agents Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Configured Projects */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 bg-dark border-secondary border-opacity-25 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-medium">Active Projects</span>
                <div className="bg-info-subtle text-info p-2 rounded">
                  <FolderGit2 size={18} />
                </div>
              </div>
              <h3 className="fw-bold text-light mb-1">{stats?.projects_count || 0}</h3>
              <div className="text-secondary small">Mapped to repositories</div>
            </div>
          </div>
        </div>

        {/* Active Deployments */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 bg-dark border-secondary border-opacity-25 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-medium">Active Pipelines</span>
                <div className="bg-success-subtle text-success p-2 rounded">
                  <Activity size={18} />
                </div>
              </div>
              <h3 className="fw-bold text-light mb-1">{stats?.running_deployments || 0}</h3>
              <div className="text-info small">Executing via local agents</div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 bg-dark border-secondary border-opacity-25 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-medium">Production Gates</span>
                <div className="bg-warning-subtle text-warning p-2 rounded">
                  <CheckSquare size={18} />
                </div>
              </div>
              <h3 className="fw-bold text-warning mb-1">{stats?.pending_approvals || 0}</h3>
              <div className="text-secondary small">Awaiting human sign-off</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Deployments & Server Matrix */}
      <div className="row g-4 mb-4">
        {/* Left Column: Recent Deployments */}
        <div className="col-12 col-xl-8">
          <div className="card bg-dark border-secondary border-opacity-25 shadow-sm h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Terminal size={18} className="text-primary" />
                <span className="text-light fw-semibold">Recent Deployments & Synchronization</span>
              </div>
              <Link href="/deployments" className="btn btn-link btn-sm text-secondary p-0 text-decoration-none d-flex align-items-center gap-1">
                <span>View Full History</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 align-middle">
                <thead>
                  <tr className="text-secondary border-secondary border-opacity-25" style={{ fontSize: '0.8rem' }}>
                    <th>PROJECT / REPO</th>
                    <th>TARGET SERVER</th>
                    <th>BRANCH & COMMIT</th>
                    <th>STATUS</th>
                    <th>TIME</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_deployments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-secondary">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                          <PlayCircle size={32} className="mb-2 opacity-50" />
                          <span>No recent deployment jobs recorded.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recent_deployments.map((deploy) => (
                      <tr key={deploy.id} className="border-secondary border-opacity-25">
                        <td>
                          <div className="fw-semibold text-light">{deploy.project?.name || 'Project'}</div>
                          <div className="text-secondary small">{deploy.project?.repository?.name || 'Repository'}</div>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-light border border-secondary border-opacity-25">
                            {deploy.server?.name || 'Target Server'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1 text-info small">
                            <GitBranch size={12} />
                            <span>{deploy.branch}</span>
                          </div>
                          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                            <code>{deploy.commit_sha ? deploy.commit_sha.substring(0, 7) : 'HEAD'}</code>
                          </div>
                        </td>
                        <td>{getStatusBadge(deploy.status)}</td>
                        <td className="text-secondary small">
                          <div className="d-flex align-items-center gap-1">
                            <Clock size={12} />
                            <span>{deploy.created_at}</span>
                          </div>
                        </td>
                        <td className="text-end">
                          <Link href={`/deployments/${deploy.id}`} className="btn btn-outline-info btn-sm py-0 px-2" style={{ fontSize: '0.75rem' }}>
                            Live Console
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Server Health & Quick Actions */}
        <div className="col-12 col-xl-4">
          <div className="card bg-dark border-secondary border-opacity-25 shadow-sm mb-4">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Server size={18} className="text-info" />
                <span className="text-light fw-semibold">Target Server Inventory</span>
              </div>
              <Link href="/servers" className="btn btn-link btn-sm text-secondary p-0 text-decoration-none">Manage</Link>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush bg-transparent">
                {servers.length === 0 ? (
                  <li className="list-group-item bg-transparent text-secondary py-4 text-center">
                    No servers registered yet.
                  </li>
                ) : (
                  servers.map((srv) => (
                    <li key={srv.id} className="list-group-item bg-transparent border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-3">
                      <div>
                        <div className="fw-semibold text-light">{srv.name}</div>
                        <div className="text-secondary small">
                          <span className="text-uppercase">{srv.os_type}</span> • <span className="text-info">{srv.environment}</span>
                        </div>
                      </div>
                      <div>
                        <span className={`badge-status ${srv.status === 'online' ? 'status-online' : 'status-offline'}`}>
                          {srv.status}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Pending Approval Alert Box if any */}
          {pending_approvals.length > 0 && (
            <div className="card bg-warning bg-opacity-10 border-warning border-opacity-50 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-start gap-2">
                  <AlertTriangle className="text-warning flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h6 className="fw-bold text-warning mb-1">Production Approval Required</h6>
                    <p className="text-light small mb-2">
                      There are {pending_approvals.length} high-risk deployment requests waiting for authorization.
                    </p>
                    <Link href="/approvals" className="btn btn-warning btn-sm text-dark fw-semibold">
                      Review Pending Approvals
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
