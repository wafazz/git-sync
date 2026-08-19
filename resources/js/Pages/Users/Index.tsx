import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Lock, 
  Sliders, 
  Check, 
  AlertTriangle,
  UserCheck,
  Shield
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions?: { id: number; name: string; category: string; description: string }[];
}

interface Permission {
  id: number;
  name: string;
  category: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending_activation' | 'deactivated';
  created_at: string;
  roles: Role[];
}

interface Props {
  users: User[];
  roles: Role[];
  permissions: Record<string, Permission[]>;
}

export default function UsersIndex({ users = [], roles = [], permissions = {} }: Props) {
  const [activeTab, setActiveTab] = useState<'users' | 'rbac'>('users');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>(roles[0] || null);

  // Selected permission IDs for the active role
  const [rolePermissions, setRolePermissions] = useState<number[]>(
    roles[0]?.permissions?.map((p) => p.id) || []
  );

  // Register User Form
  const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
    name: '',
    email: '',
    password: '',
    role_ids: [roles[0]?.id || 1],
    status: 'active',
  });

  // Edit User Form
  const editForm = useForm({
    name: '',
    email: '',
    password: '',
    role_ids: [] as number[],
    status: 'active',
  });

  // Role Permissions Form
  const rbacForm = useForm<{ permission_ids: number[] }>({
    permission_ids: [],
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postCreate('/users', {
      onSuccess: () => {
        resetCreate();
        setShowCreateModal(false);
      },
    });
  };

  const handleEditClick = (user: User) => {
    setEditUser(user);
    editForm.setData({
      name: user.name,
      email: user.email,
      password: '',
      role_ids: user.roles.map((r) => r.id),
      status: user.status,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    editForm.put(`/users/${editUser.id}`, {
      onSuccess: () => {
        setEditUser(null);
      },
    });
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user account [${user.name} (${user.email})]?`)) {
      router.delete(`/users/${user.id}`);
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setRolePermissions(role.permissions?.map((p) => p.id) || []);
  };

  const handleTogglePermission = (permId: number) => {
    if (selectedRole?.name === 'super_admin') return; // Super admin has all permissions implicitly

    if (rolePermissions.includes(permId)) {
      setRolePermissions(rolePermissions.filter((id) => id !== permId));
    } else {
      setRolePermissions([...rolePermissions, permId]);
    }
  };

  const handleSaveRolePermissions = () => {
    if (!selectedRole) return;

    router.post(`/roles/${selectedRole.id}/permissions`, {
      permission_ids: rolePermissions,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success-subtle text-success border border-success-subtle">Active</span>;
      case 'suspended':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Suspended</span>;
      case 'pending_activation':
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Pending Activation</span>;
      default:
        return <span className="badge bg-secondary-subtle text-secondary">Deactivated</span>;
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'User Management & RBAC' }]}>
      <Head title="User Management & RBAC - Git Deployment Synchronizer" />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-light">User Management & Access Control</h3>
          <p className="text-secondary mb-0 small">
            Provision user credentials, assign granular roles, and enforce CoreSentinel RBAC permission gates.
          </p>
        </div>
        {activeTab === 'users' && (
          <div>
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setShowCreateModal(true)}>
              <UserPlus size={16} />
              <span>Register New User</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs border-secondary border-opacity-25 mb-4">
        <li className="nav-item">
          <button
            className={`nav-link bg-transparent ${activeTab === 'users' ? 'active text-primary border-bottom border-primary border-2 fw-semibold' : 'text-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} className="me-2 inline" />
            Users & Accounts ({users.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link bg-transparent ${activeTab === 'rbac' ? 'active text-primary border-bottom border-primary border-2 fw-semibold' : 'text-secondary'}`}
            onClick={() => setActiveTab('rbac')}
          >
            <ShieldCheck size={16} className="me-2 inline" />
            RBAC Roles & Permissions Matrix
          </button>
        </li>
      </ul>

      {/* Tab 1: Users & Accounts */}
      {activeTab === 'users' && (
        <div className="card bg-dark border-secondary border-opacity-25 shadow-sm">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-secondary border-secondary border-opacity-25" style={{ fontSize: '0.8rem' }}>
                  <th>USER DETAILS</th>
                  <th>ASSIGNED ROLES</th>
                  <th>STATUS</th>
                  <th>PROVISIONED DATE</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-secondary">
                      <Users size={36} className="mb-2 opacity-50" />
                      <div>No registered users found.</div>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-secondary bg-opacity-25 rounded-circle p-2 text-info">
                            <UserCheck size={16} />
                          </div>
                          <div>
                            <div className="fw-semibold text-light">{u.name}</div>
                            <div className="text-secondary small font-monospace">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <span key={r.id} className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                                {r.display_name}
                              </span>
                            ))
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary small">No Role</span>
                          )}
                        </div>
                      </td>
                      <td>{getStatusBadge(u.status)}</td>
                      <td>
                        <span className="text-secondary small font-monospace">
                          {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            className="btn btn-outline-secondary btn-sm p-1 px-2"
                            title="Edit User"
                            onClick={() => handleEditClick(u)}
                          >
                            <Edit3 size={13} className="text-info" />
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm p-1 px-2"
                            title="Delete User"
                            onClick={() => handleDeleteUser(u)}
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
      )}

      {/* Tab 2: RBAC Roles & Permissions Matrix */}
      {activeTab === 'rbac' && (
        <div className="row g-4">
          {/* Roles Selector */}
          <div className="col-12 col-lg-4">
            <div className="card bg-dark border-secondary border-opacity-25 shadow-sm">
              <div className="card-header">
                <span className="text-light fw-semibold">Security Roles</span>
              </div>
              <div className="list-group list-group-flush bg-transparent">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    className={`list-group-item list-group-item-action bg-transparent border-secondary border-opacity-25 text-start py-3 ${
                      selectedRole?.id === r.id ? 'bg-primary bg-opacity-10 border-start border-primary border-3' : ''
                    }`}
                    onClick={() => handleRoleSelect(r)}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className={selectedRole?.id === r.id ? 'text-primary' : 'text-light'}>{r.display_name}</strong>
                      <span className="badge bg-secondary bg-opacity-25 text-secondary font-monospace" style={{ fontSize: '0.65rem' }}>
                        {r.name}
                      </span>
                    </div>
                    <div className="text-secondary small">{r.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="col-12 col-lg-8">
            <div className="card bg-dark border-secondary border-opacity-25 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-light fw-semibold">Permissions for: </span>
                  <span className="text-primary fw-bold">{selectedRole?.display_name}</span>
                </div>
                {selectedRole?.name !== 'super_admin' && (
                  <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={handleSaveRolePermissions}>
                    <Check size={14} />
                    <span>Save Role Permissions</span>
                  </button>
                )}
              </div>

              <div className="card-body">
                {selectedRole?.name === 'super_admin' ? (
                  <div className="alert alert-info bg-dark border-info border-opacity-25 text-light small mb-0">
                    <ShieldCheck size={16} className="me-2 text-info" />
                    The <strong>Super Administrator</strong> role possesses full unrestricted access across all permissions and bypasses all gate validations by definition.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {Object.entries(permissions).map(([category, perms]) => (
                      <div key={category}>
                        <h6 className="text-secondary text-uppercase fw-bold small mb-2 border-bottom border-secondary border-opacity-25 pb-1">
                          {category}
                        </h6>
                        <div className="row g-2">
                          {perms.map((perm) => (
                            <div key={perm.id} className="col-12 col-md-6">
                              <div className="form-check p-2 rounded bg-body-tertiary border border-secondary border-opacity-25">
                                <input
                                  type="checkbox"
                                  className="form-check-input ms-1 me-2"
                                  id={`perm_${perm.id}`}
                                  checked={rolePermissions.includes(perm.id)}
                                  onChange={() => handleTogglePermission(perm.id)}
                                />
                                <label className="form-check-label text-light small cursor-pointer" htmlFor={`perm_${perm.id}`}>
                                  <div className="fw-semibold font-monospace" style={{ fontSize: '0.75rem' }}>{perm.name}</div>
                                  <div className="text-secondary" style={{ fontSize: '0.7rem' }}>{perm.description}</div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register User Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow-lg">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <UserPlus size={18} className="text-primary" />
                  <span>Register New User</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Full Name *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      placeholder="e.g. John Doe"
                      value={createData.name}
                      onChange={(e) => setCreateData('name', e.target.value)}
                      required
                    />
                    {createErrors.name && <div className="text-danger small mt-1">{createErrors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Email Address *</label>
                    <input
                      type="email"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      placeholder="e.g. john@company.com"
                      value={createData.email}
                      onChange={(e) => setCreateData('email', e.target.value)}
                      required
                    />
                    {createErrors.email && <div className="text-danger small mt-1">{createErrors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Initial Password * (min 8 characters)</label>
                    <input
                      type="password"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      value={createData.password}
                      onChange={(e) => setCreateData('password', e.target.value)}
                      required
                      minLength={8}
                    />
                    {createErrors.password && <div className="text-danger small mt-1">{createErrors.password}</div>}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Assigned Role *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={createData.role_ids[0]}
                        onChange={(e) => setCreateData('role_ids', [parseInt(e.target.value)])}
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.display_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Account Status *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={createData.status}
                        onChange={(e: any) => setCreateData('status', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="pending_activation">Pending Activation</option>
                        <option value="suspended">Suspended</option>
                        <option value="deactivated">Deactivated</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={createProcessing}>
                    {createProcessing ? 'Registering...' : 'Register User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary border-opacity-50 text-light shadow-lg">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Edit3 size={18} className="text-info" />
                  <span>Edit User: {editUser.name}</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditUser(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Full Name *</label>
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
                    <label className="form-label small text-secondary">Email Address *</label>
                    <input
                      type="email"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      value={editForm.data.email}
                      onChange={(e) => editForm.setData('email', e.target.value)}
                      required
                    />
                    {editForm.errors.email && <div className="text-danger small mt-1">{editForm.errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Reset Password (leave empty to keep current)</label>
                    <input
                      type="password"
                      className="form-control bg-dark text-light border-secondary border-opacity-50"
                      placeholder="Enter new password if changing..."
                      value={editForm.data.password}
                      onChange={(e) => editForm.setData('password', e.target.value)}
                    />
                    {editForm.errors.password && <div className="text-danger small mt-1">{editForm.errors.password}</div>}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Assigned Role *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.role_ids[0] || ''}
                        onChange={(e) => editForm.setData('role_ids', [parseInt(e.target.value)])}
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.display_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Account Status *</label>
                      <select
                        className="form-select bg-dark text-light border-secondary border-opacity-50"
                        value={editForm.data.status}
                        onChange={(e: any) => editForm.setData('status', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="pending_activation">Pending Activation</option>
                        <option value="suspended">Suspended</option>
                        <option value="deactivated">Deactivated</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditUser(null)}>
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
    </AppLayout>
  );
}
