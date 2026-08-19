import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DeploymentProfile } from '@/types';
import { 
  Sliders, 
  Plus, 
  CheckCircle, 
  Code, 
  ShieldCheck, 
  Layers, 
  Trash2, 
  ArrowRight,
  Filter,
  Search,
  Zap,
  Clock
} from 'lucide-react';

interface Props {
  profiles: (DeploymentProfile & { projects_count?: number })[];
}

const AVAILABLE_VERBS = [
  { verb: 'git_fetch', label: 'git_fetch (Fetch latest commits & prune)' },
  { verb: 'git_checkout', label: 'git_checkout (Switch to target branch & pull)' },
  { verb: 'git_reset', label: 'git_reset (Hard reset to commit SHA / origin)' },
  { verb: 'composer_update', label: 'composer_update (Update & optimize autoloader)' },
  { verb: 'composer_install', label: 'composer_install (Install lockfile dependencies)' },
  { verb: 'npm_install', label: 'npm_install (Install Node packages safely)' },
  { verb: 'npm_build', label: 'npm_build (Compile Vite/Webpack production bundle)' },
  { verb: 'artisan_migrate', label: 'artisan_migrate (Run database migrations)' },
  { verb: 'artisan_optimize', label: 'artisan_optimize (Cache routes, config & views)' },
  { verb: 'artisan_cache_clear', label: 'artisan_cache_clear (Clear application caches)' },
  { verb: 'queue_restart', label: 'queue_restart (Restart queue workers & PM2)' },
  { verb: 'docker_compose_up', label: 'docker_compose_up (Build & run docker compose)' },
  { verb: 'pip_install', label: 'pip_install (Install Python requirements.txt)' },
  { verb: 'health_check', label: 'health_check (Verify application health check endpoint)' },
];

export default function ProfilesIndex({ profiles = [] }: Props) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    framework: 'laravel12',
    description: '',
    steps: [
      { action_verb: 'git_fetch', timeout_seconds: 120 },
      { action_verb: 'git_checkout', timeout_seconds: 60 },
      { action_verb: 'git_reset', timeout_seconds: 60 },
      { action_verb: 'health_check', timeout_seconds: 30 },
    ],
  });

  const handleAddStep = () => {
    setData('steps', [
      ...data.steps,
      { action_verb: 'health_check', timeout_seconds: 60 },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (data.steps.length <= 1) return;
    const newSteps = data.steps.filter((_, idx) => idx !== index);
    setData('steps', newSteps);
  };

  const handleStepChange = (index: number, field: string, value: any) => {
    const updated = [...data.steps];
    updated[index] = { ...updated[index], [field]: value };
    setData('steps', updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/profiles', {
      onSuccess: () => {
        reset();
        setShowCreateModal(false);
      },
    });
  };

  const handleDeleteProfile = (p: DeploymentProfile) => {
    if (confirm(`Are you sure you want to delete profile [${p.name}]?`)) {
      router.delete(`/profiles/${p.id}`);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const fw = (p.framework || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q || name.includes(q) || fw.includes(q) || desc.includes(q);
    if (!matchesSearch) return false;

    if (filterCategory === 'all') return true;
    if (filterCategory === 'laravel') {
      return fw.includes('laravel') || fw.includes('php') || name.includes('laravel') || name.includes('php');
    }
    if (filterCategory === 'node') {
      return fw.includes('node') || fw.includes('react') || fw.includes('vue') || fw.includes('spa') || name.includes('react') || name.includes('node') || name.includes('next') || name.includes('vite');
    }
    if (filterCategory === 'docker') {
      return fw.includes('docker') || name.includes('docker');
    }
    if (filterCategory === 'python') {
      return fw.includes('python') || fw.includes('django') || fw.includes('fastapi') || name.includes('python');
    }
    if (filterCategory === 'static') {
      return fw.includes('static') || name.includes('static') || name.includes('html') || name.includes('astro') || name.includes('hugo');
    }
    return false;
  });

  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Deployment Profiles' }]}>
      <Head title="Deployment Profiles - Git Deployment Synchronizer" />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">Deployment Recipes & Profiles</h3>
          <p className="text-secondary mb-0 small">
            Extensive library of allowlisted execution pipelines for Laravel, Node/SPA, Python, Docker, and Custom stacks.
          </p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>Create Custom Profile</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="row g-2 mb-4">
        <div className="col-12 col-md-5">
          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
              <Search size={14} />
            </span>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary border-opacity-50 small"
              placeholder="Search profiles by name, stack, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="col-12 col-md-7 d-flex flex-wrap gap-1 align-items-center justify-content-md-end">
          <button 
            className={`btn btn-sm ${filterCategory === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterCategory('all')}
          >
            All Profiles ({profiles.length})
          </button>
          <button 
            className={`btn btn-sm ${filterCategory === 'laravel' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterCategory('laravel')}
          >
            Laravel & PHP
          </button>
          <button 
            className={`btn btn-sm ${filterCategory === 'node' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterCategory('node')}
          >
            React / Node / SPA
          </button>
          <button 
            className={`btn btn-sm ${filterCategory === 'docker' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterCategory('docker')}
          >
            Docker
          </button>
          <button 
            className={`btn btn-sm ${filterCategory === 'python' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterCategory('python')}
          >
            Python
          </button>
          <button 
            className={`btn btn-sm ${filterCategory === 'static' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterCategory('static')}
          >
            Static Web
          </button>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="row g-4">
        {filteredProfiles.length === 0 ? (
          <div className="col-12">
            <div className="card bg-dark border-secondary border-opacity-25 text-center py-5">
              <div className="card-body">
                <Sliders size={48} className="text-secondary mb-3 opacity-50" />
                <h5 className="text-light fw-bold">No Profiles Matched</h5>
                <p className="text-secondary small mb-0">Try changing your search query or filter selection.</p>
              </div>
            </div>
          </div>
        ) : (
          filteredProfiles.map((p) => (
            <div key={p.id} className="col-12 col-lg-6">
              <div className="card bg-dark border-secondary border-opacity-25 h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <Zap size={16} className="text-info" />
                    <span className="fw-bold text-light">{p.name}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {p.framework}
                    </span>
                    {p.id > 10 && (
                      <button 
                        className="btn btn-outline-danger btn-sm p-0 px-1 border-0" 
                        title="Delete Profile"
                        onClick={() => handleDeleteProfile(p)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-secondary small mb-3">{p.description || 'Configured deployment execution pipeline.'}</p>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary small fw-semibold">Step Execution Pipeline ({p.steps?.length || 0} Steps):</span>
                    {p.projects_count !== undefined && (
                      <span className="badge bg-secondary bg-opacity-25 text-secondary small">
                        {p.projects_count} Bound Projects
                      </span>
                    )}
                  </div>

                  <ol className="list-group list-group-numbered bg-transparent mb-0">
                    {(p.steps && p.steps.length > 0) ? (
                      p.steps.map((s, idx) => (
                        <li key={idx} className="list-group-item bg-transparent text-light border-secondary border-opacity-25 py-2 font-monospace small d-flex justify-content-between align-items-center">
                          <span>
                            <strong className="text-info">{s.action_verb}</strong>
                          </span>
                          {s.timeout_seconds && (
                            <span className="text-secondary font-monospace" style={{ fontSize: '0.7rem' }}>
                              <Clock size={11} className="me-1 inline" />{s.timeout_seconds}s
                            </span>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item bg-transparent text-secondary py-2 small">Default sequential steps</li>
                    )}
                  </ol>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Custom Profile Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow-lg">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Plus size={18} className="text-info" />
                  <span>Create Custom Deployment Profile</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-7">
                      <label className="form-label small text-secondary">Profile Name *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="e.g. Custom Microservice Staging"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                      />
                      {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small text-secondary">Framework / Stack Identifier *</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary border-opacity-50 font-monospace small"
                        placeholder="e.g. laravel, node_ssr, docker"
                        value={data.framework}
                        onChange={(e) => setData('framework', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Description</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      placeholder="e.g. Custom pipeline with migrations and background queue worker refresh"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small text-secondary fw-bold mb-0">Pipeline Steps (Sequential Order):</label>
                      <button type="button" className="btn btn-outline-info btn-sm py-0 px-2" onClick={handleAddStep}>
                        + Add Step
                      </button>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {data.steps.map((step, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2 bg-body-tertiary p-2 rounded border border-secondary border-opacity-25">
                          <span className="badge bg-secondary text-dark">{idx + 1}</span>
                          <select
                            className="form-select form-select-sm bg-dark text-light border-secondary border-opacity-50 font-monospace"
                            value={step.action_verb}
                            onChange={(e) => handleStepChange(idx, 'action_verb', e.target.value)}
                          >
                            {AVAILABLE_VERBS.map((v) => (
                              <option key={v.verb} value={v.verb}>{v.label}</option>
                            ))}
                          </select>
                          <div className="input-group input-group-sm" style={{ width: '130px' }}>
                            <input
                              type="number"
                              className="form-control bg-dark text-light border-secondary border-opacity-50 font-monospace"
                              value={step.timeout_seconds}
                              onChange={(e) => handleStepChange(idx, 'timeout_seconds', parseInt(e.target.value) || 60)}
                              placeholder="Timeout"
                              min={5}
                              max={1800}
                            />
                            <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">s</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm p-1 px-2"
                            onClick={() => handleRemoveStep(idx)}
                            disabled={data.steps.length <= 1}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                    {processing ? 'Saving...' : 'Create Profile'}
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
