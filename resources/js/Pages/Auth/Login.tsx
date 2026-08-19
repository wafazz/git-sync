import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { GitBranch, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: 'admin@coresentinel.local',
    password: 'password',
    remember: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-body-tertiary px-3">
      <Head title="Sign In - CoreSentinel Git Sync" />

      <div className="card bg-dark border-secondary border-opacity-50 shadow-lg p-4" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded p-2 mb-3 shadow" style={{ width: '48px', height: '48px' }}>
            <GitBranch size={28} />
          </div>
          <h4 className="fw-bold text-light mb-1">CoreSentinel Git Sync</h4>
          <p className="text-secondary small mb-0">Centralized Git Deployment & Synchronization Manager</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-secondary">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-body-tertiary border-secondary border-opacity-50 text-secondary">
                <Mail size={16} />
              </span>
              <input
                type="email"
                className="form-control bg-dark text-light border-secondary border-opacity-50"
                placeholder="admin@coresentinel.local"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                required
              />
            </div>
            {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label small text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-body-tertiary border-secondary border-opacity-50 text-secondary">
                <Lock size={16} />
              </span>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary border-opacity-50"
                placeholder="••••••••"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                required
              />
            </div>
            {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
          </div>

          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="remember"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
              />
              <label className="form-check-label text-secondary small" htmlFor="remember">
                Remember session
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2" disabled={processing}>
            <ShieldCheck size={18} />
            <span>{processing ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25 text-secondary small">
          Protected under <strong>CoreSentinel Protocol</strong>
        </div>
      </div>
    </div>
  );
}
