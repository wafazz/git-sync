import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Project, GitRepository, Server as ServerType, DeploymentProfile } from '@/types';
import { 
  GitBranch, 
  Plus, 
  Server, 
  Play, 
  FolderGit2, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Edit3,
  Trash2
} from 'lucide-react';

interface Props {
  projects: Project[];
  repositories: GitRepository[];
  servers: ServerType[];
  profiles: DeploymentProfile[];
}

export default function ProjectsIndex({ projects = [], repositories = [], servers = [], profiles = [] }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Create Form
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

  // Edit Form
  const editForm = useForm({
    name: '',
    repository_id: '',
    server_id: '',
    deployment_profile_id: '',
    target_branch: 'main',
    environment: 'testing',
    deploy_path: '',
    health_check_url: '',
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

  const handleEditClick = (project: Project) => {
    setEditProject(project);
    editForm.setData({
      name: project.name,
      repository_id: project.repository_id,
      server_id: project.server_id,
      deployment_profile_id: project.deployment_profile_id,
      target_branch: project.target_branch,
      environment: project.environment,
      deploy_path: project.deploy_path,
      health_check_url: project.health_check_url || '',
      auto_deploy_on_push: project.auto_deploy_on_push,
      requires_approval: project.requires_approval,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;

    editForm.put(`/projects/${editProject.id}`, {
      onSuccess: () => {
        setEditProject(null);
      },
    });
  };

  const handleDelete = (project: Project) => {
    if (confirm(`Are you sure you want to remove project binding [${project.name}]?`)) {
      router.delete(`/projects/${project.id}`);
    }
  };

  const handleDeploy = (projectId: number) => {
    if (confirm('Trigger deployment for this project now?')) {
      router.post(`/projects/${projectId}/deploy`);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Projects' }]}>
      <Head title="Projects & Environments - Git Deployment Synchronizer" />

      {/* Page Header */}
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
                    <span>Server: <strong className="text-light">{project.server?.name || 'Unassigned'}</strong></span>
                  </div>
                  <div className="mb-3 text-secondary small d-flex align-items-center gap-2">
                    <Sliders size={14} className="text-info" />
                    <span className="text-truncate">Profile: <strong className="text-light">{project.profile?.name || 'Standard'}</strong></span>
                  </div>

                  <div className="p-2 bg-body-tertiary rounded border border-secondary border-opacity-25 mb-3 font-monospace small text-secondary text-truncate">
                    Path: {project.deploy_path}
                  </div>

                  {project.latest_deployment && (
                    <div className="mb-3 p-2 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-25 small">
                      <div className="text-secondary d-flex justify-content-between">
                        <span>Last Deploy #{project.latest_deployment.id}:</span>
                        <span className={`fw-bold ${
                          project.latest_deployment.status === 'success' ? 'text-success' :
                          project.latest_deployment.status === 'failed' ? 'text-danger' : 'text-info'
                        }`}>
                          {project.latest_deployment.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-25">
                    <button 
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                      onClick={() => handleDeploy(project.id)}
                    >
                      <Play size={14} />
                      <span>Deploy Now</span>
                    </button>

                    <div className="d-flex align-items-center gap-1">
                      <button
                        className="btn btn-outline-secondary btn-sm p-1 px-2"
                        title="Edit Project Binding"
                        onClick={() => handleEditClick(project)}
                      >
                        <Edit3 size={14} className="text-info" />
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm p-1 px-2"
                        title="Delete Project"
                        onClick={() => handleDelete(project)}
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

      {/* Edit Project Modal */}
      {editProject && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow-lg">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Edit3 size={18} className="text-info" />
                  <span>Edit Project: {editProject.name}</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditProject(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Project Name *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.name}
                        onChange={(e) => editForm.setData('name', e.target.value)}
                        required
                      />
                      {editForm.errors.name && <div className="text-danger small mt-1">{editForm.errors.name}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Target Server *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.server_id}
                        onChange={(e) => editForm.setData('server_id', e.target.value)}
                        required
                      >
                        {servers.map((srv) => (
                          <option key={srv.id} value={srv.id}>{srv.name} ({srv.environment})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Git Repository *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.repository_id}
                        onChange={(e) => editForm.setData('repository_id', e.target.value)}
                        required
                      >
                        {repositories.map((repo) => (
                          <option key={repo.id} value={repo.id}>{repo.name} ({repo.default_branch})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Deployment Profile (Recipe) *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.deployment_profile_id}
                        onChange={(e) => editForm.setData('deployment_profile_id', e.target.value)}
                        required
                      >
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Target Git Branch *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.target_branch}
                        onChange={(e) => editForm.setData('target_branch', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Environment Tier *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.environment}
                        onChange={(e: any) => editForm.setData('environment', e.target.value)}
                      >
                        <option value="development">Development</option>
                        <option value="testing">Testing</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production (Approval Gated)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Server Absolute Deploy Path *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50 font-monospace small"
                      value={editForm.data.deploy_path}
                      onChange={(e) => editForm.setData('deploy_path', e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="edit_auto_deploy"
                          checked={editForm.data.auto_deploy_on_push}
                          onChange={(e) => editForm.setData('auto_deploy_on_push', e.target.checked)}
                        />
                        <label className="form-check-label text-secondary small" htmlFor="edit_auto_deploy">
                          Auto-deploy upon GitHub webhook push
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="edit_requires_approval"
                          checked={editForm.data.requires_approval}
                          onChange={(e) => editForm.setData('requires_approval', e.target.checked)}
                        />
                        <label className="form-check-label text-secondary small" htmlFor="edit_requires_approval">
                          Require CoreSentinel approval gate before execution
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditProject(null)}>
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

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold">Create Project Binding</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Project Name *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="e.g. Kiosk Frontend Staging"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                      />
                      {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Target Server *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={data.server_id}
                        onChange={(e) => setData('server_id', e.target.value)}
                        required
                      >
                        {servers.map((srv) => (
                          <option key={srv.id} value={srv.id}>{srv.name} ({srv.environment})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Git Repository *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={data.repository_id}
                        onChange={(e) => setData('repository_id', e.target.value)}
                        required
                      >
                        {repositories.map((repo) => (
                          <option key={repo.id} value={repo.id}>{repo.name} ({repo.default_branch})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Deployment Profile (Recipe) *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={data.deployment_profile_id}
                        onChange={(e) => setData('deployment_profile_id', e.target.value)}
                        required
                      >
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Target Git Branch *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="main"
                        value={data.target_branch}
                        onChange={(e) => setData('target_branch', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Environment Tier *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={data.environment}
                        onChange={(e: any) => setData('environment', e.target.value)}
                      >
                        <option value="development">Development</option>
                        <option value="testing">Testing</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production (Approval Gated)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Server Absolute Deploy Path *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50 font-monospace small"
                      placeholder="/var/www/my-app"
                      value={data.deploy_path}
                      onChange={(e) => setData('deploy_path', e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="auto_deploy"
                          checked={data.auto_deploy_on_push}
                          onChange={(e) => setData('auto_deploy_on_push', e.target.checked)}
                        />
                        <label className="form-check-label text-secondary small" htmlFor="auto_deploy">
                          Auto-deploy upon GitHub webhook push
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="requires_approval"
                          checked={data.requires_approval}
                          onChange={(e) => setData('requires_approval', e.target.checked)}
                        />
                        <label className="form-check-label text-secondary small" htmlFor="requires_approval">
                          Require CoreSentinel approval gate before execution
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                    {processing ? 'Creating...' : 'Create Binding'}
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
