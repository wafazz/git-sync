import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DeploymentProfile } from '@/types';
import { Sliders, Plus, CheckCircle, Code, ShieldCheck } from 'lucide-react';

interface Props {
  profiles: DeploymentProfile[];
}

export default function ProfilesIndex({ profiles = [] }: Props) {
  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Deployment Profiles' }]}>
      <Head title="Deployment Profiles - Git Deployment Synchronizer" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">Deployment Recipes & Profiles</h3>
          <p className="text-secondary mb-0 small">
            Allowlisted parameterized step execution workflows dispatched to target server agents.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {profiles.length === 0 ? (
          <div className="col-12">
            <div className="card bg-dark border-secondary border-opacity-25 text-center py-5">
              <div className="card-body">
                <Sliders size={48} className="text-secondary mb-3 opacity-50" />
                <h5 className="text-light fw-bold">Standard Profiles Loaded</h5>
                <p className="text-secondary small mb-0">System default profiles: Laravel 12 Standard, Laravel Production, Node/React SPA.</p>
              </div>
            </div>
          </div>
        ) : (
          profiles.map((p) => (
            <div key={p.id} className="col-12 col-lg-6">
              <div className="card bg-dark border-secondary border-opacity-25 h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-light">{p.name}</span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace text-uppercase" style={{ fontSize: '0.65rem' }}>
                    {p.framework}
                  </span>
                </div>
                <div className="card-body">
                  <p className="text-secondary small mb-3">{p.description || 'Configured deployment execution pipeline.'}</p>
                  <div className="text-secondary small fw-semibold mb-2">Step Execution Pipeline:</div>
                  <ol className="list-group list-group-numbered bg-transparent mb-0">
                    {(p.steps && p.steps.length > 0) ? (
                      p.steps.map((s, idx) => (
                        <li key={idx} className="list-group-item bg-transparent text-light border-secondary border-opacity-25 py-2 font-monospace small">
                          <strong className="text-info">{s.action_verb}</strong>
                          {s.timeout_seconds && <span className="text-secondary ms-2 opacity-75">({s.timeout_seconds}s timeout)</span>}
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
    </AppLayout>
  );
}
