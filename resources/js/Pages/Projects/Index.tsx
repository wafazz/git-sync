import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Project, GitRepository, Server as ServerType, DeploymentProfile } from '@/types';
import { GitBranch, Plus, Server, Play, FolderGit2, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  projects: Project[];
  repositories: GitRepository[];
  servers: ServerType[];
  profiles: DeploymentProfile[];
}

export default function ProjectsIndex({ projects = [], repositories = [], servers = [], profiles = [] }: Props) {
  const [showModal, setShowModal] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    repository_id: repositories[0]?.id || '',
    server_id: servers[0]?.id || '',
    deployment_profile_id: profiles[0]?.id || '',
    target_branch: 'main',
    environment: 'testing',
    deploy_path: '/var/www/my-project',
    health_check_url: 'http://127.0.0.1:8000/up',
    auto_deploy_on_push: true,
    requires_approval: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/projects', {
      onSuccess: () => {
        reset();
        setShowModal(false);
      },
    });
  };

  const handleDeploy = (projectId: number) => {
    if (confirm('Trigger deployment for this project now?')) {
      post(`/projects/${projectId}/deploy`);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Projects' }]}>
      <Head title="Projects & Environments - Git Deployment Synchronizer" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">Projects & Environment Bindings</h3>
          <p className="text-secondary mb-0 small">
            Map Git repositories and branches to target servers, environments, and deployment profiles.
          </p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Create Project Binding</span>
          </button>
        </div>
      </div>

      <div className="row g-4">
        {projects.length === 0 ? (
          <div className="col-12">
            <div className="card bg-dark border-secondary border-opacity-25 text-center py-5">
              <div className="card-body">
                <GitBranch size={48} className="text-secondary mb-3 opacity-50" />
                <h5 className="text-light fw-bold">No Project Bindings Configured</h5>
                <p className="text-secondary small mb-3">Create a project binding to link a repository branch to a server.</p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                  Create Project Binding
                </button>
              </div>
            </div>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="col-12 col-lg-6 col-xl-4">
              <div className="card bg-dark border-secondary border-opacity-25 h-100 shadow-sm">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <span className="fw-bold text-light">{project.name}</span>
                  <span className={`badge ${
                    project.environment === 'production' ? 'bg-danger-subtle text-danger border border-danger-subtle' :
                    project.environment === 'staging' ? 'bg-warning-subtle text-warning border border-warning-subtle' :
                    'bg-info-subtle text-info border border-info-subtle'
                  } text-uppercase`} style={{ fontSize: '0.7rem' }}>
                    {project.environment}
                  </span>
                </div>
                <div className="card-body">
                  <div className="mb-2 text-secondary small d-flex align-items-center gap-2">
                    <FolderGit2 size={14} className="text-info" />
                    <span className="fw-semibold text-light">{project.repository?.name || 'Repository'}</span>
                  </div>
                  <div className="mb-2 text-secondary small d-flex align-items-center gap-2">
                    <GitBranch size={14} className="text-info" />
                    <span>Branch: <code>{project.target_branch}</code></span>
                  </div>
                  <div className="mb-2 text-secondary small d-flex align-items-center gap-2">
                    <Server size={14} className="text-info" />
                    <span>Server: <strong className="text-light">{project.server?.name || 'Server'}</strong></span>
                  </div>
                  <div className="mb-3 text-secondary small d-flex align-items-center gap-2">
                    <Sliders size={14} className="text-info" />
                    <span>Profile: {project.profile?.name || 'Standard Profile'}</span>
                  </div>

                  <div className="bg-body-tertiary p-2 rounded small text-secondary mb-3 font-monospace" style={{ fontSize: '0.75rem' }}>
                    Deploy Path: {project.deploy_path}
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-top border-secondary border-opacity-25 pt-3">
                    <span className="text-secondary small">
                      {project.auto_deploy_on_push ? 'Auto-deploy on Push' : 'Manual Trigger'}
                    </span>
                    <button
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                      onClick={() => handleDeploy(project.id)}
                    >
                      <Play size={14} />
                      <span>Deploy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold">Create Project Environment Binding</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Project Name *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="e.g. Multi-Kiosk Staging"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                      />
                      {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Target Environment *</label>
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
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Source Git Repository *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={data.repository_id}
                        onChange={(e: any) => setData('repository_id', e.target.value)}
                        required
                      >
                        <option value="">Select Repository...</option>
                        {repositories.map((r) => (
                          <option key={r.id} value={r.id}>{r.name} ({r.default_branch})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Target Branch *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        value={data.target_branch}
                        onChange={(e) => setData('target_branch', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Target Server Host *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={data.server_id}
                        onChange={(e: any) => setData('server_id', e.target.value)}
                        required
                      >
                        <option value="">Select Target Server...</option>
                        {servers.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.environment})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Deployment Recipe Profile *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={data.deployment_profile_id}
                        onChange={(e: any) => setData('deployment_profile_id', e.target.value)}
                        required
                      >
                        <option value="">Select Profile Recipe...</option>
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.framework})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Local Server Deploy Path *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="/var/www/my-project or C:\inetpub\wwwroot\app"
                        value={data.deploy_path}
                        onChange={(e) => setData('deploy_path', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Post-Deploy Health Check URL</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="http://127.0.0.1:8000/up"
                        value={data.health_check_url}
                        onChange={(e) => setData('health_check_url', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-check form-switch mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="auto_deploy"
                      checked={data.auto_deploy_on_push}
                      onChange={(e) => setData('auto_deploy_on_push', e.target.checked)}
                    />
                    <label className="form-check-label small text-light" htmlFor="auto_deploy">
                      Automatically deploy when webhook push event matches target branch
                    </label>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="req_approval"
                      checked={data.requires_approval}
                      onChange={(e) => setData('requires_approval', e.target.checked)}
                    />
                    <label className="form-check-label small text-light" htmlFor="req_approval">
                      Require CoreSentinel approval gate sign-off before dispatching to server agent
                    </label>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                    {processing ? 'Saving...' : 'Create Project Binding'}
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
