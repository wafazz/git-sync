import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Deployment, DeploymentStep, DeploymentLog } from '@/types';
import { 
  Terminal, 
  PlayCircle, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  GitBranch, 
  Server, 
  ShieldCheck, 
  Activity, 
  Download, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface Props {
  deployment: Deployment;
}

export default function DeploymentShow({ deployment }: Props) {
  const [logs, setLogs] = useState<DeploymentLog[]>(deployment.logs || []);
  const [status, setStatus] = useState(deployment.status);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Polling / SSE fallback for live log streaming
  useEffect(() => {
    if (status === 'running' || status === 'validating' || status === 'queued' || status === 'health_check') {
      const interval = setInterval(() => {
        router.reload({
          only: ['deployment'],
          onSuccess: (page: any) => {
            if (page.props.deployment) {
              setLogs(page.props.deployment.logs || []);
              setStatus(page.props.deployment.status);
            }
          },
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleRollback = () => {
    if (confirm('Are you sure you want to trigger a rollback to the previous stable release?')) {
      router.post(`/deployments/${deployment.id}/rollback`);
    }
  };

  const handleRetry = () => {
    if (confirm('Retry this deployment execution?')) {
      router.post(`/deployments/${deployment.id}/retry`);
    }
  };

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'success':
        return <CheckCircle2 size={16} className="text-success" />;
      case 'running':
        return <span className="spinner-border spinner-border-sm text-info" style={{ width: '14px', height: '14px' }}></span>;
      case 'failed':
        return <XCircle size={16} className="text-danger" />;
      default:
        return <Clock size={16} className="text-secondary" />;
    }
  };

  return (
    <AppLayout breadcrumbs={[
      { label: 'Home', href: '/dashboard' },
      { label: 'Deployments', href: '/deployments' },
      { label: `#${deployment.id} (${deployment.project?.name || 'Deployment'})` }
    ]}>
      <Head title={`Deployment #${deployment.id} - ${deployment.project?.name}`} />

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bold mb-0 text-light">Deployment #{deployment.id}</h3>
            <span className={`badge-status ${
              status === 'success' ? 'status-online' :
              status === 'failed' ? 'status-offline' :
              status === 'running' ? 'status-running' : 'status-pending'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
          <p className="text-secondary mb-0 small">
            {deployment.project?.name} • Target Server: <strong className="text-light">{deployment.server?.name}</strong> • Branch: <code>{deployment.branch}</code>
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="d-flex gap-2">
          {status === 'failed' && (
            <>
              <button className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1" onClick={handleRollback}>
                <RotateCcw size={16} />
                <span>Initiate Rollback</span>
              </button>
              <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={handleRetry}>
                <PlayCircle size={16} />
                <span>Retry Deployment</span>
              </button>
            </>
          )}
          {status === 'success' && (
            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={handleRollback}>
              <RotateCcw size={16} />
              <span>Rollback to Previous</span>
            </button>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Pipeline Execution Stepper */}
        <div className="col-12 col-lg-4">
          <div className="card bg-dark border-secondary border-opacity-25 shadow-sm mb-4">
            <div className="card-header d-flex align-items-center gap-2">
              <Activity size={18} className="text-primary" />
              <span className="text-light fw-semibold">Execution Pipeline Steps</span>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush bg-transparent">
                {(deployment.steps && deployment.steps.length > 0) ? (
                  deployment.steps.map((step, idx) => (
                    <li key={step.id} className="list-group-item bg-transparent border-secondary border-opacity-25 py-3 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        {getStepIcon(step.status)}
                        <div>
                          <div className="fw-semibold text-light font-monospace small">
                            {idx + 1}. {step.action_verb}
                          </div>
                          <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                            {step.started_at ? `Started ${step.started_at}` : 'Waiting in queue'}
                          </div>
                        </div>
                      </div>
                      <div>
                        {step.exit_code !== undefined && step.exit_code !== null && (
                          <span className={`badge ${step.exit_code === 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`} style={{ fontSize: '0.65rem' }}>
                            exit {step.exit_code}
                          </span>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item bg-transparent text-secondary py-3 text-center small">
                    Pipeline steps initializing...
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Deployment Metadata Card */}
          <div className="card bg-dark border-secondary border-opacity-25 shadow-sm">
            <div className="card-header">
              <span className="text-light fw-semibold">Audit & Governance Details</span>
            </div>
            <div className="card-body text-secondary small">
              <div className="mb-2"><strong>Commit SHA:</strong> <code>{deployment.commit_sha || 'HEAD'}</code></div>
              <div className="mb-2"><strong>Trigger Source:</strong> <span className="text-info text-capitalize">{deployment.trigger_source}</span></div>
              <div className="mb-2"><strong>Initiated By:</strong> {deployment.triggered_by?.name || 'Automated Webhook'}</div>
              <div className="mb-2"><strong>Duration:</strong> {deployment.duration_seconds ? `${deployment.duration_seconds} seconds` : 'In progress'}</div>
              <div><strong>CoreSentinel Gate:</strong> <span className="text-success">Verified Allowlisted Action</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Terminal Output */}
        <div className="col-12 col-lg-8">
          <div className="terminal-window shadow">
            <div className="terminal-header">
              <div className="d-flex align-items-center gap-3">
                <div className="terminal-dots">
                  <span className="terminal-dot bg-danger"></span>
                  <span className="terminal-dot bg-warning"></span>
                  <span className="terminal-dot bg-success"></span>
                </div>
                <span className="fw-semibold font-monospace">agent@target-server: live-execution-stream</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small d-none d-sm-inline">Sanitized ANSI Stream</span>
                <button className="btn btn-sm btn-link text-secondary p-0" title="Download Raw Logs">
                  <Download size={14} />
                </button>
              </div>
            </div>
            <div className="terminal-body">
              <div className="log-system mb-2">
                [SYSTEM] Connected to CoreSentinel Server Agent Daemon (Protocol v1.1.0)
              </div>
              <div className="log-system mb-3">
                [SYSTEM] Workspace: {deployment.project?.deploy_path || '/var/www'} | Lock acquired: OK
              </div>

              {logs.length === 0 ? (
                <div className="text-secondary italic">Waiting for agent to stream execution output...</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className={`log-${log.stream_type} font-monospace mb-1`}>
                    <span className="text-secondary opacity-50 me-2" style={{ fontSize: '0.75rem' }}>
                      [{log.stream_type.toUpperCase()}]
                    </span>
                    <span>{log.log_content}</span>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
