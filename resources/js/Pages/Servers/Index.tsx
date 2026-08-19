import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Server as ServerType } from '@/types';
import { 
  Server, 
  Plus, 
  Key, 
  ShieldCheck, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  RefreshCw,
  Sliders,
  Globe
} from 'lucide-react';

interface Props {
  servers: ServerType[];
  flash?: {
    agent_credentials?: {
      name: string;
      token: string;
      agent_id: string;
    };
  };
}

export default function ServersIndex({ servers = [], flash }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editServer, setEditServer] = useState<ServerType | null>(null);
  const [copied, setCopied] = useState(false);

  // Register Form
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    environment: 'testing',
    os_type: 'linux_ubuntu',
    hostname: '',
    ip_address: '',
  });

  // Edit Form
  const editForm = useForm({
    name: '',
    environment: 'testing',
    os_type: 'linux_ubuntu',
    hostname: '',
    ip_address: '',
    status: 'online',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/servers', {
      onSuccess: () => {
        reset();
        setShowModal(false);
      },
    });
  };

  const handleEditClick = (srv: ServerType) => {
    setEditServer(srv);
    editForm.setData({
      name: srv.name,
      environment: srv.environment,
      os_type: srv.os_type,
      hostname: srv.hostname || '',
      ip_address: srv.ip_address || '',
      status: srv.status,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editServer) return;

    editForm.put(`/servers/${editServer.id}`, {
      onSuccess: () => {
        setEditServer(null);
      },
    });
  };

  const handleRegenerateToken = (srv: ServerType) => {
    if (confirm(`Regenerate agent enrollment token for [${srv.name}]? Any previously configured agent daemon will need to re-register.`)) {
      router.post(`/servers/${srv.id}/regenerate-token`);
    }
  };

  const handleDelete = (srv: ServerType) => {
    if (confirm(`Are you sure you want to delete server [${srv.name}]?`)) {
      router.delete(`/servers/${srv.id}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const registeredAgent = flash?.agent_credentials;

  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Servers' }]}>
      <Head title="Target Servers - Git Deployment Synchronizer" />

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">Target Servers</h3>
          <p className="text-secondary mb-0 small">
            Manage distributed deployment target nodes running the CoreSentinel Server Agent Daemon.
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
              <Key size={18} /> Enrollment Token Generated for [{registeredAgent.name}]
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
              <strong>Quick Install Command (run on target VPS):</strong>
              <div className="bg-dark p-2 rounded mt-1 font-monospace text-info small text-break">
                curl -sSL https://raw.githubusercontent.com/wafazz/git-sync/main/agent/install.sh | bash -s -- --url={typeof window !== 'undefined' ? window.location.origin : ''} --token={registeredAgent.token}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Server Grid */}
      <div className="row g-3">
        {servers.length === 0 ? (
          <div className="col-12">
            <div className="card bg-dark border-secondary border-opacity-25 text-center py-5">
              <div className="card-body">
                <Server size={48} className="text-secondary opacity-50 mb-3" />
                <h5 className="text-light fw-bold">No Target Servers Registered</h5>
                <p className="text-secondary small mb-3">
                  Register your first target server instance (Linux VPS, Ubuntu, Debian, Windows WSL).
                </p>
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
                  <div className="text-secondary small mb-2 text-truncate">
                    <strong>Agent UUID:</strong> <code className="text-info">{srv.agent?.agent_uuid || 'Pending Registration'}</code>
                  </div>
                  <div className="text-secondary small mb-3">
                    <strong>Last Heartbeat:</strong> {srv.last_heartbeat_at || 'Never'}
                  </div>

                  <div className="border-top border-secondary border-opacity-25 pt-3 d-flex justify-content-between align-items-center">
                    <span className="text-secondary small">{srv.projects_count || 0} Project(s) Assigned</span>
                    
                    <div className="d-flex align-items-center gap-1">
                      <button 
                        className="btn btn-outline-secondary btn-sm p-1 px-2" 
                        title="Edit Server"
                        onClick={() => handleEditClick(srv)}
                      >
                        <Edit3 size={14} className="text-info" />
                      </button>
                      <button 
                        className="btn btn-outline-secondary btn-sm p-1 px-2" 
                        title="Regenerate Agent Token"
                        onClick={() => handleRegenerateToken(srv)}
                      >
                        <RefreshCw size={14} className="text-warning" />
                      </button>
                      <button 
                        className="btn btn-outline-secondary btn-sm p-1 px-2" 
                        title="Delete Server"
                        onClick={() => handleDelete(srv)}
                      >
                        <Trash2 size={14} className="text-danger" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Server Modal */}
      {editServer && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow-lg">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Edit3 size={18} className="text-info" />
                  <span>Edit Server: {editServer.name}</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditServer(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Server Display Name *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      value={editForm.data.name}
                      onChange={(e) => editForm.setData('name', e.target.value)}
                      required
                    />
                    {editForm.errors.name && <div className="text-danger small mt-1">{editForm.errors.name}</div>}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Environment Tier *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.environment}
                        onChange={(e: any) => editForm.setData('environment', e.target.value)}
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
                        value={editForm.data.os_type}
                        onChange={(e: any) => editForm.setData('os_type', e.target.value)}
                      >
                        <option value="linux_ubuntu">Linux (Ubuntu 22/24)</option>
                        <option value="linux_debian">Linux (Debian)</option>
                        <option value="linux_rhel">Linux (RHEL / CentOS)</option>
                        <option value="windows_wsl">Windows (WSL2)</option>
                        <option value="windows_native">Windows Native</option>
                        <option value="other">Other / Cloud Instance</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">IP Address</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="e.g. 192.168.1.100"
                        value={editForm.data.ip_address}
                        onChange={(e) => editForm.setData('ip_address', e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Hostname / Domain</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="e.g. vps1.domain.com"
                        value={editForm.data.hostname}
                        onChange={(e) => editForm.setData('hostname', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Status</label>
                    <select
                      className="form-select bg-dark text-light border-secondary border-opacity-50"
                      value={editForm.data.status}
                      onChange={(e: any) => editForm.setData('status', e.target.value)}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="busy">Busy</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditServer(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={editForm.processing}>
                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                    <label className="form-label small text-secondary">Server Display Name *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      placeholder="e.g. Production Node 1"
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
                        <option value="linux_ubuntu">Linux (Ubuntu 22/24)</option>
                        <option value="linux_debian">Linux (Debian)</option>
                        <option value="linux_rhel">Linux (RHEL / CentOS)</option>
                        <option value="windows_wsl">Windows (WSL2)</option>
                        <option value="windows_native">Windows Native</option>
                        <option value="other">Other / Cloud Instance</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">IP Address (Optional)</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="e.g. 192.168.1.100"
                        value={data.ip_address}
                        onChange={(e) => setData('ip_address', e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Hostname / Domain</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="e.g. node1.cluster.local"
                        value={data.hostname}
                        onChange={(e) => setData('hostname', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="alert alert-info bg-dark border-info border-opacity-25 text-light small mb-0">
                    <ShieldCheck size={16} className="me-2 text-info" />
                    A unique <strong>Agent Enrollment Token</strong> will be generated upon saving for registering the target server daemon.
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                    {processing ? 'Registering...' : 'Register Server'}
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
