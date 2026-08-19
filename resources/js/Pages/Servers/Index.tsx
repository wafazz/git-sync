import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Server as ServerType } from '@/types';
import { Server, Plus, ShieldCheck, Cpu, HardDrive, Key, RefreshCw, Terminal, Check, Copy } from 'lucide-react';

interface Props {
  servers: ServerType[];
}

export default function ServersIndex({ servers = [] }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [registeredAgent, setRegisteredAgent] = useState<{ name: string; token: string; agent_id: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    environment: 'testing',
    os_type: 'linux_ubuntu',
    hostname: '',
    ip_address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/servers', {
      onSuccess: (page: any) => {
        reset();
        setShowModal(false);
        if (page.props.flash?.agent_credentials) {
          setRegisteredAgent(page.props.flash.agent_credentials);
        }
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Servers' }]}>
      <Head title="Target Servers - Git Deployment Synchronizer" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">Target Servers & Deployment Agents</h3>
          <p className="text-secondary mb-0 small">
            Manage target server infrastructure and monitor authenticated local agent heartbeats.
          </p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Register New Server</span>
          </button>
        </div>
      </div>

      {/* Agent Credentials Notification Box if generated */}
      {registeredAgent && (
        <div className="card bg-success bg-opacity-10 border-success border-opacity-50 mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="text-success fw-bold d-flex align-items-center gap-2 mb-2">
              <Key size={18} /> Server Registered Successfully
            </h5>
            <p className="text-light small mb-3">
              Copy the deployment agent configuration token below. This secret token will not be displayed again.
            </p>
            <div className="bg-dark p-3 rounded border border-secondary border-opacity-25 mb-3">
              <div className="text-secondary small mb-1">AGENT ENROLLMENT TOKEN:</div>
              <div className="d-flex align-items-center justify-content-between">
                <code className="text-info font-monospace text-break">{registeredAgent.token}</code>
                <button className="btn btn-sm btn-outline-secondary ms-2 flex-shrink-0" onClick={() => copyToClipboard(registeredAgent.token)}>
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <div className="text-secondary small">
              <strong>Agent Setup Command:</strong> <code>curl -sSL https://get.coresentinel.local/agent.sh | bash -s -- --token={registeredAgent.token}</code>
            </div>
          </div>
        </div>
      )}

      {/* Server Grid */}
      <div className="row g-4">
        {servers.length === 0 ? (
          <div className="col-12">
            <div className="card bg-dark border-secondary border-opacity-25 text-center py-5">
              <div className="card-body">
                <Server size={48} className="text-secondary mb-3 opacity-50" />
                <h5 className="text-light fw-bold">No Servers Registered</h5>
                <p className="text-secondary small mb-3">Register your first testing, staging, or production server agent.</p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                  Register Server
                </button>
              </div>
            </div>
          </div>
        ) : (
          servers.map((srv) => (
            <div key={srv.id} className="col-12 col-md-6 col-xl-4">
              <div className="card bg-dark border-secondary border-opacity-25 h-100 shadow-sm">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded bg-primary bg-opacity-25 p-1 text-primary">
                      <Server size={16} />
                    </span>
                    <span className="fw-semibold text-light">{srv.name}</span>
                  </div>
                  <span className={`badge-status ${srv.status === 'online' ? 'status-online' : 'status-offline'}`}>
                    {srv.status}
                  </span>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <span className={`badge ${
                      srv.environment === 'production' ? 'bg-danger-subtle text-danger border border-danger-subtle' :
                      srv.environment === 'staging' ? 'bg-warning-subtle text-warning border border-warning-subtle' :
                      'bg-info-subtle text-info border border-info-subtle'
                    } text-uppercase me-2`} style={{ fontSize: '0.7rem' }}>
                      {srv.environment}
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.7rem' }}>
                      {srv.os_type}
                    </span>
                  </div>

                  <div className="text-secondary small mb-2">
                    <strong>Hostname / IP:</strong> {srv.hostname || srv.ip_address || 'Configurable (Agent Driven)'}
                  </div>
                  <div className="text-secondary small mb-2">
                    <strong>Agent ID:</strong> <code>{srv.agent?.agent_uuid || 'Pending Connection'}</code>
                  </div>
                  <div className="text-secondary small mb-3">
                    <strong>Last Heartbeat:</strong> {srv.last_heartbeat_at || 'Never'}
                  </div>

                  <div className="border-top border-secondary border-opacity-25 pt-3 d-flex justify-content-between align-items-center">
                    <span className="text-secondary small">{srv.projects_count || 0} Projects Assigned</span>
                    <button className="btn btn-outline-info btn-sm" style={{ fontSize: '0.75rem' }}>
                      Details & Logs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register Server Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold">Register Target Server</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Server Name *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      placeholder="e.g. VPS 1 - Production or Windows Test Server"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      required
                    />
                    {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Environment Tier *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={data.environment}
                        onChange={(e: any) => setData('environment', e.target.value)}
                      >
                        <option value="development">Development</option>
                        <option value="testing">Testing</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Operating System *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={data.os_type}
                        onChange={(e: any) => setData('os_type', e.target.value)}
                      >
                        <option value="linux_ubuntu">Ubuntu Linux</option>
                        <option value="linux_debian">Debian Linux</option>
                        <option value="linux_rhel">RHEL / CentOS</option>
                        <option value="windows_wsl">Windows / WSL</option>
                        <option value="windows_native">Windows Native</option>
                        <option value="other">Other Unix/Linux</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Hostname / Domain (Optional)</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      placeholder="e.g. prod-app1.internal.net"
                      value={data.hostname}
                      onChange={(e) => setData('hostname', e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                    {processing ? 'Registering...' : 'Generate Agent Token & Register'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
