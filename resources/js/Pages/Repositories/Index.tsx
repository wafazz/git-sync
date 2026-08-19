import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GitRepository, GitProvider } from '@/types';
import { 
  FolderGit2, 
  Plus, 
  GitBranch, 
  Key, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ExternalLink, 
  Webhook as WebhookIcon, 
  Copy, 
  Check, 
  Info,
  Edit3,
  Trash2
} from 'lucide-react';

interface Props {
  repositories: GitRepository[];
  providers: GitProvider[];
}

export default function RepositoriesIndex({ repositories = [], providers = [] }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editRepo, setEditRepo] = useState<GitRepository | null>(null);
  const [webhookModalRepo, setWebhookModalRepo] = useState<GitRepository | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Connect Form
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    provider_id: providers[0]?.id || 1,
    repo_url: '',
    owner_org: '',
    default_branch: 'main',
    auth_type: 'pat',
    credential_token: '',
  });

  // Edit Form
  const editForm = useForm({
    name: '',
    provider_id: 1,
    repo_url: '',
    owner_org: '',
    default_branch: 'main',
    auth_type: 'pat',
    credential_token: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/repositories', {
      onSuccess: () => {
        reset();
        setShowModal(false);
      },
    });
  };

  const handleEditClick = (repo: GitRepository) => {
    setEditRepo(repo);
    editForm.setData({
      name: repo.name,
      provider_id: repo.provider_id,
      repo_url: repo.repo_url,
      owner_org: repo.owner_org || '',
      default_branch: repo.default_branch,
      auth_type: repo.auth_type,
      credential_token: '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRepo) return;

    editForm.put(`/repositories/${editRepo.id}`, {
      onSuccess: () => {
        setEditRepo(null);
      },
    });
  };

  const handleDelete = (repo: GitRepository) => {
    if (confirm(`Are you sure you want to remove repository [${repo.name}]?`)) {
      router.delete(`/repositories/${repo.id}`);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getWebhookUrl = (repo: GitRepository) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
    const provider = repo.provider?.provider_type || 'github';
    return `${origin}/api/v1/webhooks/${provider}`;
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Repositories' }]}>
      <Head title="Git Repositories - Git Deployment Synchronizer" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">Connected Git Repositories</h3>
          <p className="text-secondary mb-0 small">
            Securely register private and public Git repositories with encrypted credentials (PAT / SSH).
          </p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Connect Repository</span>
          </button>
        </div>
      </div>

      <div className="card bg-dark border-secondary border-opacity-25 shadow-sm">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr className="text-secondary border-secondary border-opacity-25" style={{ fontSize: '0.8rem' }}>
                <th>REPOSITORY NAME</th>
                <th>PROVIDER & URL</th>
                <th>DEFAULT BRANCH</th>
                <th>AUTH ENCRYPTION</th>
                <th>STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {repositories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-secondary">
                    <FolderGit2 size={36} className="mb-2 opacity-50" />
                    <div>No Git repositories connected yet.</div>
                    <button className="btn btn-outline-primary btn-sm mt-3" onClick={() => setShowModal(true)}>
                      Connect First Repository
                    </button>
                  </td>
                </tr>
              ) : (
                repositories.map((repo) => (
                  <tr key={repo.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FolderGit2 size={18} className="text-primary" />
                        <div>
                          <div className="fw-semibold text-light">{repo.name}</div>
                          {repo.owner_org && <span className="badge bg-secondary text-dark small">{repo.owner_org}</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-light small">{repo.provider?.name || 'Git'}</div>
                      <a
                        href={repo.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-secondary small text-decoration-none font-monospace text-truncate d-inline-block"
                        style={{ maxWidth: '280px' }}
                      >
                        {repo.repo_url} <ExternalLink size={12} className="ms-1" />
                      </a>
                    </td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-info font-monospace">
                        <GitBranch size={12} className="me-1" /> {repo.default_branch}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25">
                        <ShieldCheck size={12} className="me-1" /> AES-256 Encrypted
                      </span>
                    </td>
                    <td>
                      <span className="badge-status status-online small">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center gap-1">
                        <button
                          className="btn btn-outline-info btn-sm d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '0.75rem' }}
                          title="Configure Webhook"
                          onClick={() => setWebhookModalRepo(repo)}
                        >
                          <WebhookIcon size={13} />
                          <span>Webhook</span>
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm p-1 px-2"
                          title="Edit Repository & Credentials"
                          onClick={() => handleEditClick(repo)}
                        >
                          <Edit3 size={13} className="text-info" />
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm p-1 px-2"
                          title="Delete Repository"
                          onClick={() => handleDelete(repo)}
                        >
                          <Trash2 size={13} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Configuration Modal */}
      {webhookModalRepo && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow-lg">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <WebhookIcon size={20} className="text-info" />
                  <span>Webhook Setup: {webhookModalRepo.name}</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setWebhookModalRepo(null)}></button>
              </div>
              <div className="modal-body">
                <p className="text-secondary small mb-4">
                  Add this webhook to your Git provider (<span className="text-light">{webhookModalRepo.provider?.name || 'GitHub'}</span>) to automatically trigger deployments whenever new commits are pushed to bound branches.
                </p>

                {/* Payload URL */}
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold">1. PAYLOAD URL</label>
                  <div className="input-group">
                    <input
                      type="text"
                      readOnly
                      className="form-control bg-body-tertiary text-info font-monospace border-secondary border-opacity-50 small"
                      value={getWebhookUrl(webhookModalRepo)}
                    />
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center gap-1"
                      onClick={() => copyToClipboard(getWebhookUrl(webhookModalRepo), 'url')}
                    >
                      {copiedField === 'url' ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                      <span>{copiedField === 'url' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Content Type */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small text-secondary fw-semibold">2. CONTENT TYPE</label>
                    <div className="input-group">
                      <input
                        type="text"
                        readOnly
                        className="form-control bg-body-tertiary text-light font-monospace border-secondary border-opacity-50 small"
                        value="application/json"
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => copyToClipboard('application/json', 'content_type')}
                      >
                        {copiedField === 'content_type' ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary fw-semibold">3. TRIGGER EVENTS</label>
                    <input
                      type="text"
                      readOnly
                      className="form-control bg-body-tertiary text-light border-secondary border-opacity-50 small"
                      value="Just the 'push' event"
                    />
                  </div>
                </div>

                {/* Webhook Secret */}
                <div className="mb-4">
                  <label className="form-label small text-secondary fw-semibold">4. SECRET TOKEN (HMAC-SHA256)</label>
                  <div className="input-group">
                    <input
                      type="text"
                      readOnly
                      className="form-control bg-body-tertiary text-warning font-monospace border-secondary border-opacity-50 small"
                      value={webhookModalRepo.webhook?.uuid || 'cs_webhook_secret_key'}
                    />
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center gap-1"
                      onClick={() => copyToClipboard(webhookModalRepo.webhook?.uuid || 'cs_webhook_secret_key', 'secret')}
                    >
                      {copiedField === 'secret' ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                      <span>{copiedField === 'secret' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-secondary small mt-1">Used to verify payload authenticity using HMAC-SHA256 signatures.</div>
                </div>

                {/* Instructions Box */}
                <div className="bg-body-tertiary p-3 rounded border border-secondary border-opacity-25">
                  <h6 className="text-light fw-bold small d-flex align-items-center gap-2 mb-2">
                    <Info size={16} className="text-primary" /> Setup Instructions for GitHub / GitLab
                  </h6>
                  <ol className="text-secondary small mb-0 ps-3">
                    <li className="mb-1">Go to your repository on <strong>GitHub / GitLab</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Webhooks</strong>.</li>
                    <li className="mb-1">Click <strong>Add webhook</strong>.</li>
                    <li className="mb-1">Paste the <strong>Payload URL</strong> and <strong>Secret Token</strong> above.</li>
                    <li className="mb-1">Set <strong>Content type</strong> to <code>application/json</code>.</li>
                    <li>Click <strong>Add webhook</strong> to activate auto-deploy on push!</li>
                  </ol>
                </div>
              </div>
              <div className="modal-footer border-secondary border-opacity-25">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWebhookModalRepo(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Repository Modal */}
      {editRepo && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow-lg">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Edit3 size={18} className="text-info" />
                  <span>Edit Repository: {editRepo.name}</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditRepo(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Repository Display Name *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      value={editForm.data.name}
                      onChange={(e) => editForm.setData('name', e.target.value)}
                      required
                    />
                    {editForm.errors.name && <div className="text-danger small mt-1">{editForm.errors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Repository Clone URL (HTTPS / SSH) *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      value={editForm.data.repo_url}
                      onChange={(e) => editForm.setData('repo_url', e.target.value)}
                      required
                    />
                    {editForm.errors.repo_url && <div className="text-danger small mt-1">{editForm.errors.repo_url}</div>}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Default Branch *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.default_branch}
                        onChange={(e) => editForm.setData('default_branch', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Auth Method *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.auth_type}
                        onChange={(e: any) => editForm.setData('auth_type', e.target.value)}
                      >
                        <option value="pat">Personal Access Token</option>
                        <option value="ssh_key">SSH Deploy Key</option>
                        <option value="github_app">GitHub App Integration</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Update Personal Access Token / Deploy Key</label>
                    <textarea
                      className="form-control bg-dark text-light border-secondary border-opacity-50 font-monospace small"
                      rows={3}
                      placeholder="Leave blank to keep existing encrypted token, or paste new ghp_..."
                      value={editForm.data.credential_token}
                      onChange={(e) => editForm.setData('credential_token', e.target.value)}
                    ></textarea>
                    <div className="text-secondary small mt-1">
                      <Lock size={12} className="me-1" /> Re-encrypted with AES-256-GCM before saving.
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditRepo(null)}>
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

      {/* Connect Repository Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold">Connect Git Repository</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Repository Display Name *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      placeholder="e.g. Core Multi-Kiosk App"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      required
                    />
                    {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Repository Clone URL (HTTPS / SSH) *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      placeholder="https://github.com/organization/repo.git"
                      value={data.repo_url}
                      onChange={(e) => setData('repo_url', e.target.value)}
                      required
                    />
                    {errors.repo_url && <div className="text-danger small mt-1">{errors.repo_url}</div>}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Default Branch *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        value={data.default_branch}
                        onChange={(e) => setData('default_branch', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Auth Method *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={data.auth_type}
                        onChange={(e: any) => setData('auth_type', e.target.value)}
                      >
                        <option value="pat">Personal Access Token</option>
                        <option value="ssh_key">SSH Deploy Key</option>
                        <option value="github_app">GitHub App Integration</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Personal Access Token / Private Key</label>
                    <textarea
                      className="form-control bg-dark text-light border-secondary border-opacity-50 font-monospace small"
                      rows={3}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or -----BEGIN OPENSSH PRIVATE KEY-----"
                      value={data.credential_token}
                      onChange={(e) => setData('credential_token', e.target.value)}
                    ></textarea>
                    <div className="text-secondary small mt-1">
                      <Lock size={12} className="me-1" /> Encrypted with AES-256-GCM before storage.
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                    {processing ? 'Encrypting & Saving...' : 'Save Repository'}
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
