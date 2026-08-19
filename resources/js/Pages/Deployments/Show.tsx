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
  RefreshCw
} from 'lucide-react';

interface Props {
  deployment: Deployment;
}

export default function DeploymentShow({ deployment }: Props) {
  const [logs, setLogs] = useState<DeploymentLog[]>(deployment.logs || []);
  const [steps, setSteps] = useState<DeploymentStep[]>(deployment.steps || []);
  const [status, setStatus] = useState(deployment.status);
  const [duration, setDuration] = useState<number | null>(deployment.duration_seconds || null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Fast Real-Time Polling for live logs & step state progression
  useEffect(() => {
    const isLive = ['running', 'validating', 'queued', 'health_check', 'pending'].includes(status);
    if (!isLive) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/deployments/${deployment.id}/stream`, {
          headers: { 'Accept': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.logs) setLogs(data.logs);
          if (data.steps) setSteps(data.steps);
          if (data.status) setStatus(data.status);
          if (data.duration_seconds !== undefined) setDuration(data.duration_seconds);
        }
      } catch (err) {
        console.error('Failed to stream deployment updates', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [status, deployment.id]);

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
        return <CheckCircle2 size={18} className="text-success flex-shrink-0" />;
      case 'running':
        return <span className="spinner-border spinner-border-sm text-info flex-shrink-0" style={{ width: '16px', height: '16px' }}></span>;
      case 'failed':
        return <XCircle size={18} className="text-danger flex-shrink-0" />;
      default:
        return <Clock size={18} className="text-secondary flex-shrink-0 opacity-50" />;
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
              {status === 'running' && <span className="spinner-grow spinner-grow-sm me-1" style={{ width: '8px', height: '8px' }}></span>}
              {status.toUpperCase()}
            </span>
          </div>
          <p className="text-secondary mb-0 small">
            {deployment.project?.name} • Target Server: <strong className="text-light">{deployment.server?.name}</strong> • Branch: <code className="text-info">{deployment.branch}</code>
          </p>
        </div>

        {/* Action Controls */}
        <div className="d-flex align-items-center gap-2">
          {status === 'running' && (
            <div className="text-info small d-flex align-items-center gap-1 me-2 font-monospace">
              <RefreshCw size={14} className="spin" /> Live Streaming
            </div>
          )}
          {status === 'failed' && (
            <button className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1" onClick={handleRetry}>
              <PlayCircle size={15} />
              <span>Retry Deployment</span>
            </button>
          )}
          {['success', 'failed'].includes(status) && (
            <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={handleRollback}>
              <RotateCcw size={15} />
              <span>Rollback Release</span>
            </button>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Stepper & Metadata */}
        <div className="col-12 col-lg-4">
          {/* Stepper Card */}
          <div className="card bg-dark border-secondary border-opacity-25 shadow-sm mb-4">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Activity size={18} className="text-primary" />
                <span className="text-light fw-semibold">Execution Pipeline Steps</span>
              </div>
              <span className="badge bg-secondary bg-opacity-25 text-secondary small">
                {steps.filter(s => s.status === 'success').length}/{steps.length}
              </span>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush bg-transparent">
                {steps.length > 0 ? (
                  steps.map((step, idx) => (
                    <li 
                      key={step.id} 
                      className={`list-group-item bg-transparent border-secondary border-opacity-25 py-3 d-flex align-items-center justify-content-between ${
                        step.status === 'running' ? 'bg-info bg-opacity-10' : ''
                      }`}
                    >
                      <div className="d-flex align-items-center gap-3">
                        {getStepIcon(step.status)}
                        <div>
                          <div className={`fw-semibold font-monospace small ${
                            step.status === 'running' ? 'text-info fw-bold' :
                            step.status === 'success' ? 'text-light' :
                            step.status === 'failed' ? 'text-danger' : 'text-secondary'
                          }`}>
                            {idx + 1}. {step.action_verb}
                          </div>
                          <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                            {step.status === 'running' ? 'Executing on target server...' :
                             step.status === 'success' ? 'Step completed successfully' :
                             step.status === 'failed' ? 'Step failed with error' : 'Waiting in queue'}
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
              <div className="mb-2"><strong>Commit SHA:</strong> <code className="text-info">{deployment.commit_sha || 'HEAD'}</code></div>
              <div className="mb-2"><strong>Trigger Source:</strong> <span className="text-light text-capitalize">{deployment.trigger_source}</span></div>
              <div className="mb-2"><strong>Initiated By:</strong> <span className="text-light">{deployment.triggered_by?.name || 'Automated Webhook'}</span></div>
              <div className="mb-2"><strong>Duration:</strong> <span className="text-light">{duration ? `${duration} seconds` : 'In progress'}</span></div>
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
              </div>
            </div>
            <div className="terminal-body" style={{ minHeight: '440px', maxHeight: '680px', overflowY: 'auto' }}>
              {logs.length === 0 ? (
                <div className="text-secondary font-monospace small py-4 text-center">
                  Waiting for agent output stream...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div 
                    key={log.id || idx} 
                    className={`terminal-line ${
                      log.stream_type === 'stderr' ? 'text-danger' : 
                      log.stream_type === 'system' ? 'text-primary' : 'text-light'
                    }`}
                  >
                    <span className="text-secondary select-none opacity-50 me-2" style={{ fontSize: '0.75rem' }}>
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
