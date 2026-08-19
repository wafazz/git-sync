export interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending_activation' | 'deactivated';
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  category: string;
  description?: string;
}

export interface Server {
  id: number;
  uuid: string;
  name: string;
  environment: 'development' | 'testing' | 'staging' | 'production';
  os_type: 'linux_ubuntu' | 'linux_debian' | 'linux_rhel' | 'windows_wsl' | 'windows_native' | 'other';
  hostname?: string;
  ip_address?: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  last_heartbeat_at?: string;
  agent?: ServerAgent;
  projects_count?: number;
  created_at: string;
}

export interface ServerAgent {
  id: number;
  server_id: number;
  agent_uuid: string;
  agent_version: string;
  is_active: boolean;
  last_ip?: string;
  created_at: string;
}

export interface GitProvider {
  id: number;
  name: string;
  provider_type: 'github' | 'gitlab' | 'gitea' | 'custom_git';
  base_url: string;
}

export interface GitRepository {
  id: number;
  provider_id: number;
  name: string;
  repo_url: string;
  owner_org: string;
  default_branch: string;
  auth_type: 'pat' | 'ssh_key' | 'github_app';
  is_active: boolean;
  provider?: GitProvider;
  created_at: string;
}

export interface Project {
  id: number;
  uuid: string;
  name: string;
  repository_id: number;
  server_id: number;
  deployment_profile_id: number;
  target_branch: string;
  environment: 'development' | 'testing' | 'staging' | 'production';
  deploy_path: string;
  health_check_url?: string;
  auto_deploy_on_push: boolean;
  requires_approval: boolean;
  is_locked: boolean;
  repository?: GitRepository;
  server?: Server;
  profile?: DeploymentProfile;
  latest_deployment?: Deployment;
  created_at: string;
}

export interface DeploymentProfile {
  id: number;
  name: string;
  framework: string;
  description?: string;
  steps?: DeploymentProfileStep[];
}

export interface DeploymentProfileStep {
  id: number;
  profile_id: number;
  step_order: number;
  action_verb: string;
  parameters: Record<string, any>;
  timeout_seconds: number;
  allow_failure: boolean;
}

export type DeploymentStatus =
  | 'requested'
  | 'validating'
  | 'pending_approval'
  | 'approved'
  | 'queued'
  | 'running'
  | 'health_check'
  | 'success'
  | 'failed'
  | 'rolling_back'
  | 'rolled_back'
  | 'cancelled';

export interface Deployment {
  id: number;
  uuid: string;
  project_id: number;
  server_id: number;
  triggered_by_user_id?: number;
  trigger_source: 'manual' | 'webhook' | 'rollback' | 'api';
  commit_sha: string;
  commit_message?: string;
  commit_author?: string;
  branch: string;
  status: DeploymentStatus;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  error_summary?: string;
  project?: Project;
  server?: Server;
  triggered_by?: User;
  steps?: DeploymentStep[];
  logs?: DeploymentLog[];
  created_at: string;
}

export interface DeploymentStep {
  id: number;
  deployment_id: number;
  step_order: number;
  action_verb: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  exit_code?: number;
  started_at?: string;
  completed_at?: string;
}

export interface DeploymentLog {
  id: number;
  deployment_id: number;
  deployment_step_id?: number;
  stream_type: 'stdout' | 'stderr' | 'system';
  sequence_number: number;
  log_content: string;
  created_at: string;
}

export interface DeploymentApproval {
  id: number;
  deployment_id: number;
  requested_by_user_id: number;
  assigned_role_id: number;
  approved_by_user_id?: number;
  status: 'pending' | 'approved' | 'rejected';
  decision_notes?: string;
  decided_at?: string;
  deployment?: Deployment;
  requested_by?: User;
  approved_by?: User;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  auditable_type: string;
  auditable_id?: number;
  ip_address: string;
  user_agent?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user?: User;
  created_at: string;
}

export interface PageProps<T = Record<string, unknown>> {
  auth: {
    user: User;
    permissions: string[];
  };
  flash?: {
    success?: string;
    error?: string;
    warning?: string;
  };
  [key: string]: unknown;
}
