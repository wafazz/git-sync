import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { GitRepository, GitProvider } from '@/types';
import { FolderGit2, Plus, GitBranch, Key, ShieldCheck, Lock, CheckCircle2, ExternalLink } from 'lucide-react';

interface Props {
  repositories: GitRepository[];
  providers: GitProvider[];
}

export default function RepositoriesIndex({ repositories = [], providers = [] }: Props) {
  const [showModal, setShowModal] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    provider_id: providers[0]?.id || 1,
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
                <th>AUTH METHOD</th>
                <th>WEBHOOK STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {repositories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-secondary">
                    <FolderGit2 size={40} className="mb-2 opacity-50" />
                    <div className="fw-semibold">No repositories registered</div>
                    <div className="small">Add a GitHub or GitLab repository to configure deployment pipelines.</div>
                  </td>
                </tr>
              ) : (
                repositories.map((repo) => (
                  <tr key={repo.id} className="border-secondary border-opacity-25">
                    <td>
                      <div className="fw-bold text-light">{repo.name}</div>
                      <div className="text-secondary small">{repo.owner_org}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-info small">
                        <span>{repo.repo_url}</span>
                      </div>
                      <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.65rem' }}>
                        {repo.provider?.name || 'GitHub'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-info d-inline-flex align-items-center gap-1">
                        <GitBranch size={12} />
                        {repo.default_branch}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info text-uppercase" style={{ fontSize: '0.7rem' }}>
                        {repo.auth_type} (Encrypted)
                      </span>
                    </td>
                    <td>
                      <span className="badge-status status-online small">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-outline-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                        Configure Webhook
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                    <label className="form-label small text-secondary">
                      Access Token / Secret Key (Stored Encrypted with AES-256-GCM)
                    </label>
                    <input
                      type="password"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={data.credential_token}
                      onChange={(e) => setData('credential_token', e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                    {processing ? 'Saving...' : 'Save & Encrypt Repository'}
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
