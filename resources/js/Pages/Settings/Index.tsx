import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Sliders, ShieldCheck, Database, Key, Activity, Lock } from 'lucide-react';

export default function SettingsIndex() {
  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Settings' }]}>
      <Head title="System Settings - Git Deployment Synchronizer" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">System Settings & Governance</h3>
          <p className="text-secondary mb-0 small">
            Configure global security thresholds, Redis queue connections, and CoreSentinel governance policies.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* CoreSentinel Governance Card */}
        <div className="col-12 col-lg-6">
          <div className="card bg-dark border-secondary border-opacity-25 h-100 shadow-sm">
            <div className="card-header d-flex align-items-center gap-2">
              <ShieldCheck size={18} className="text-success" />
              <span className="text-light fw-semibold">CoreSentinel Governance Engine</span>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-light small fw-semibold">Mandatory Production Approval Gates</span>
                  <span className="badge bg-success-subtle text-success">ENFORCED</span>
                </div>
                <p className="text-secondary small mb-0">All deployments to production require explicit human authorization.</p>
              </div>

              <div className="mb-3 border-top border-secondary border-opacity-25 pt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-light small fw-semibold">Strict Parameterized Action Allowlist</span>
                  <span className="badge bg-success-subtle text-success">ACTIVE</span>
                </div>
                <p className="text-secondary small mb-0">Agents reject arbitrary bash / raw shell strings over the wire.</p>
              </div>

              <div className="border-top border-secondary border-opacity-25 pt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-light small fw-semibold">Secret Masking & Sanitization</span>
                  <span className="badge bg-success-subtle text-success">ACTIVE</span>
                </div>
                <p className="text-secondary small mb-0">Passwords, PAT tokens, and private keys masked in real-time logs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Redis & Infrastructure Status */}
        <div className="col-12 col-lg-6">
          <div className="card bg-dark border-secondary border-opacity-25 h-100 shadow-sm">
            <div className="card-header d-flex align-items-center gap-2">
              <Activity size={18} className="text-info" />
              <span className="text-light fw-semibold">Redis & Queue Concurrency</span>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-light small fw-semibold">Distributed Deployment Mutex Locks</span>
                  <span className="badge bg-info-subtle text-info">REDIS 7</span>
                </div>
                <p className="text-secondary small mb-0">Prevents concurrent conflicting deployments to the same target server.</p>
              </div>

              <div className="mb-3 border-top border-secondary border-opacity-25 pt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-light small fw-semibold">Webhook Idempotency Protection</span>
                  <span className="badge bg-info-subtle text-info">24h TTL</span>
                </div>
                <p className="text-secondary small mb-0">Deduplicates GitHub webhook replay events automatically.</p>
              </div>

              <div className="border-top border-secondary border-opacity-25 pt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-light small fw-semibold">Log Telemetry Retention</span>
                  <span className="badge bg-secondary-subtle text-secondary">30 Days</span>
                </div>
                <p className="text-secondary small mb-0">Real-time log chunks archived with append-only integrity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
