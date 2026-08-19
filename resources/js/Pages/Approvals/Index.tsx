import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DeploymentApproval } from '@/types';
import { CheckSquare, ShieldCheck, Check, X, AlertTriangle, GitBranch, Server, Clock, User } from 'lucide-react';

interface Props {
  approvals: DeploymentApproval[];
}

export default function ApprovalsIndex({ approvals = [] }: Props) {
  const [decisionNotes, setDecisionNotes] = useState<Record<number, string>>({});

  const handleDecision = (approvalId: number, decision: 'approve' | 'reject') => {
    const notes = decisionNotes[approvalId] || '';
    if (confirm(`Are you sure you want to ${decision.toUpperCase()} this production deployment?`)) {
      router.post(`/approvals/${approvalId}/${decision}`, {
        decision_notes: notes,
      });
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Approvals' }]}>
      <Head title="Production Approval Gates - Git Deployment Synchronizer" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">CoreSentinel Production Approval Gates</h3>
          <p className="text-secondary mb-0 small">
            High-risk production deployment requests requiring explicit authorized human sign-off.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {approvals.length === 0 ? (
          <div className="col-12">
            <div className="card bg-dark border-secondary border-opacity-25 text-center py-5">
              <div className="card-body">
                <CheckSquare size={48} className="text-success mb-3 opacity-50" />
                <h5 className="text-light fw-bold">No Pending Approvals</h5>
                <p className="text-secondary small mb-0">All deployment pipelines are either auto-approved or already decided.</p>
              </div>
            </div>
          </div>
        ) : (
          approvals.map((approval) => (
            <div key={approval.id} className="col-12 col-lg-6">
              <div className="card bg-dark border-warning border-opacity-50 h-100 shadow-sm">
                <div className="card-header bg-warning bg-opacity-10 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <AlertTriangle size={18} className="text-warning" />
                    <span className="fw-bold text-warning">Production Gate Request #{approval.id}</span>
                  </div>
                  <span className="badge bg-warning text-dark text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>
                    Awaiting Decision
                  </span>
                </div>
                <div className="card-body">
                  <h5 className="fw-bold text-light mb-1">{approval.deployment?.project?.name}</h5>
                  <p className="text-secondary small mb-3">
                    Target Server: <strong className="text-light">{approval.deployment?.server?.name}</strong> • Commit: <code>{approval.deployment?.commit_sha?.substring(0, 7) || 'HEAD'}</code>
                  </p>

                  <div className="bg-body-tertiary p-3 rounded mb-3 text-secondary small">
                    <div className="mb-1"><strong>Branch:</strong> <code className="text-info">{approval.deployment?.branch}</code></div>
                    <div className="mb-1"><strong>Requested By:</strong> {approval.requested_by?.name || 'Developer'} ({approval.requested_by?.email})</div>
                    <div><strong>Requested At:</strong> {approval.created_at}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Decision Notes / Audit Reason (Optional):</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-light border-secondary border-opacity-50"
                      placeholder="e.g. Verified database backup and changelog"
                      value={decisionNotes[approval.id] || ''}
                      onChange={(e) => setDecisionNotes({ ...decisionNotes, [approval.id]: e.target.value })}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                      onClick={() => handleDecision(approval.id, 'approve')}
                    >
                      <Check size={16} />
                      <span>Approve & Dispatch</span>
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                      onClick={() => handleDecision(approval.id, 'reject')}
                    >
                      <X size={16} />
                      <span>Reject Request</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
