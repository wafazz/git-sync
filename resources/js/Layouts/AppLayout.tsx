import React, { PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { 
  Server, 
  GitBranch, 
  FolderGit2, 
  PlayCircle, 
  CheckSquare, 
  ShieldCheck, 
  Sliders, 
  Activity, 
  Terminal, 
  FileText, 
  Bell, 
  User as UserIcon,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface AppLayoutProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AppLayout({ title, breadcrumbs, children }: PropsWithChildren<AppLayoutProps>) {
  const { auth, flash, url } = usePage<PageProps & { url: string }>().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    return url === path || url.startsWith(`${path}/`);
  };

  return (
    <div className="app-wrapper">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 z-3 d-lg-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? 'd-flex position-fixed h-100' : 'd-none d-lg-flex'}`}>
        <div className="sidebar-brand">
          <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded p-1" style={{ width: '32px', height: '32px' }}>
            <GitBranch size={20} />
          </div>
          <div>
            <span className="fw-bold">CoreSentinel</span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle ms-2" style={{ fontSize: '0.65rem' }}>GDS</span>
          </div>
          <button className="btn btn-sm btn-link text-secondary ms-auto d-lg-none" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-nav overflow-y-auto">
          <div className="sidebar-section-header">Core Overview</div>
          <Link href="/dashboard" className={`nav-link nav-link-dashboard ${isActive('/dashboard') ? 'active' : ''}`}>
            <Activity size={18} />
            <span>Dashboard</span>
          </Link>

          <div className="sidebar-section-header">Infrastructure</div>
          <Link href="/servers" className={`nav-link ${isActive('/servers') ? 'active' : ''}`}>
            <Server size={18} />
            <span>Target Servers</span>
          </Link>
          <Link href="/repositories" className={`nav-link ${isActive('/repositories') ? 'active' : ''}`}>
            <FolderGit2 size={18} />
            <span>Git Repositories</span>
          </Link>
          <Link href="/projects" className={`nav-link ${isActive('/projects') ? 'active' : ''}`}>
            <GitBranch size={18} />
            <span>Projects & Envs</span>
          </Link>

          <div className="sidebar-section-header">Deployments & Gates</div>
          <Link href="/profiles" className={`nav-link ${isActive('/profiles') ? 'active' : ''}`}>
            <Sliders size={18} />
            <span>Deployment Profiles</span>
          </Link>
          <Link href="/deployments" className={`nav-link ${isActive('/deployments') ? 'active' : ''}`}>
            <PlayCircle size={18} />
            <span>Deployments</span>
          </Link>
          <Link href="/approvals" className={`nav-link ${isActive('/approvals') ? 'active' : ''}`}>
            <CheckSquare size={18} />
            <span>Approval Gates</span>
          </Link>

          <div className="sidebar-section-header">Governance & Audit</div>
          <Link href="/audit-logs" className={`nav-link ${isActive('/audit-logs') ? 'active' : ''}`}>
            <ShieldCheck size={18} />
            <span>Audit Trail</span>
          </Link>
          <Link href="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
            <Sliders size={18} />
            <span>System Settings</span>
          </Link>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-secondary bg-opacity-25 rounded-circle p-2 text-info">
              <UserIcon size={18} />
            </div>
            <div className="min-w-0 flex-grow-1">
              <div className="text-truncate fw-semibold small text-light">{auth?.user?.name || 'Administrator'}</div>
              <div className="text-truncate text-secondary" style={{ fontSize: '0.75rem' }}>{auth?.user?.email || 'admin@coresentinel.local'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        {/* Sticky Header */}
        <header className="app-header d-flex align-items-center justify-content-between px-3 px-lg-4">
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary d-lg-none" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>

            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav aria-label="breadcrumb" className="d-none d-sm-block">
                <ol className="breadcrumb mb-0 small">
                  {breadcrumbs.map((crumb, idx) => (
                    <li key={idx} className={`breadcrumb-item ${idx === breadcrumbs.length - 1 ? 'active text-light' : ''}`}>
                      {crumb.href ? (
                        <Link href={crumb.href} className="text-secondary text-decoration-none hover-text-light">{crumb.label}</Link>
                      ) : (
                        <span>{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="badge-status status-online small">
                <span className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></span>
                CoreSentinel Active
              </span>
            </div>

            <div className="vr bg-secondary opacity-25 my-2"></div>

            <div className="dropdown">
              <button className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                <UserIcon size={16} />
                <span className="d-none d-md-inline small">{auth?.user?.name || 'Fakrul (Admin)'}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                <li><h6 className="dropdown-header">Authenticated User</h6></li>
                <li><span className="dropdown-item-text small text-secondary">{auth?.user?.email || 'fakrul@wafazz.com'}</span></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link href="/logout" method="post" as="button" className="dropdown-item text-danger d-flex align-items-center gap-2">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Flash Notifications */}
        <div className="container-fluid px-3 px-lg-4 pt-3">
          {flash?.success && (
            <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
              <ShieldCheck size={18} />
              <div>{flash.success}</div>
              <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
            </div>
          )}
          {flash?.error && (
            <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
              <ShieldCheck size={18} />
              <div>{flash.error}</div>
              <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
            </div>
          )}
        </div>

        {/* Page Content Body */}
        <main className="app-content">
          <div className="container-fluid">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
