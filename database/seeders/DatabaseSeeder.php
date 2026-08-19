<?php

namespace Database\Seeders;

use App\Models\DeploymentProfile;
use App\Models\DeploymentProfileStep;
use App\Models\GitProvider;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with CoreSentinel enterprise configurations.
     */
    public function run(): void
    {
        // 1. Seed RBAC Permissions
        $permissions = [
            ['name' => 'view_dashboard', 'guard_name' => 'web', 'description' => 'View system metrics and pipeline status'],
            ['name' => 'manage_servers', 'guard_name' => 'web', 'description' => 'Register, edit and decommission target servers'],
            ['name' => 'view_servers', 'guard_name' => 'web', 'description' => 'View connected server nodes and heartbeats'],
            ['name' => 'manage_repositories', 'guard_name' => 'web', 'description' => 'Register and configure Git repositories and credentials'],
            ['name' => 'view_repositories', 'guard_name' => 'web', 'description' => 'View connected Git repositories'],
            ['name' => 'manage_projects', 'guard_name' => 'web', 'description' => 'Configure environment project bindings and rules'],
            ['name' => 'view_projects', 'guard_name' => 'web', 'description' => 'View project mappings and deployment paths'],
            ['name' => 'trigger_deploy_development', 'guard_name' => 'web', 'description' => 'Trigger deployments targeting development nodes'],
            ['name' => 'trigger_deploy_testing', 'guard_name' => 'web', 'description' => 'Trigger deployments targeting testing/qa nodes'],
            ['name' => 'trigger_deploy_staging', 'guard_name' => 'web', 'description' => 'Trigger deployments targeting staging nodes'],
            ['name' => 'trigger_deploy_production', 'guard_name' => 'web', 'description' => 'Trigger deployments targeting production nodes'],
            ['name' => 'approve_production_deploy', 'guard_name' => 'web', 'description' => 'Approve or reject production deployment gates'],
            ['name' => 'cancel_deployment', 'guard_name' => 'web', 'description' => 'Abort in-flight deployment pipelines'],
            ['name' => 'trigger_rollback', 'guard_name' => 'web', 'description' => 'Execute release rollbacks to stable commit checkpoints'],
            ['name' => 'view_deployment_logs', 'guard_name' => 'web', 'description' => 'View streaming and historical deployment logs'],
            ['name' => 'view_audit_logs', 'guard_name' => 'web', 'description' => 'View tamper-evident audit logs and security events'],
            ['name' => 'manage_users', 'guard_name' => 'web', 'description' => 'Manage system users and access roles'],
            ['name' => 'manage_system_settings', 'guard_name' => 'web', 'description' => 'Configure CoreSentinel engine settings and keys'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p['name']], $p);
        }

        // 2. Seed RBAC Roles
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'super_admin'],
            ['label' => 'Super Administrator', 'description' => 'Full administrative control over all system nodes and operations']
        );
        $superAdminRole->permissions()->sync(Permission::all());

        $roles = [
            ['name' => 'admin', 'label' => 'Administrator', 'description' => 'Manage infrastructure, repositories and users'],
            ['name' => 'developer', 'label' => 'Developer', 'description' => 'Trigger non-production deployments and view logs'],
            ['name' => 'deployment_operator', 'label' => 'Deployment Operator', 'description' => 'Execute deployments across environments and trigger rollbacks'],
            ['name' => 'viewer', 'label' => 'Viewer', 'description' => 'Read-only access to dashboards and status metrics'],
            ['name' => 'auditor', 'label' => 'Auditor', 'description' => 'Inspect compliance trails and security audit logs'],
        ];

        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r['name']], $r);
        }

        // 3. Seed Default Admin User
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@coresentinel.local'],
            [
                'name' => 'CoreSentinel Admin',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );
        $adminUser->roles()->syncWithoutDetaching([$superAdminRole->id]);

        // 4. Seed Git Providers
        GitProvider::firstOrCreate(['name' => 'GitHub'], ['provider_type' => 'github', 'base_url' => 'https://github.com']);
        GitProvider::firstOrCreate(['name' => 'GitLab'], ['provider_type' => 'gitlab', 'base_url' => 'https://gitlab.com']);
        GitProvider::firstOrCreate(['name' => 'Gitea'], ['provider_type' => 'gitea', 'base_url' => 'https://gitea.io']);
        GitProvider::firstOrCreate(['name' => 'Custom Git Server'], ['provider_type' => 'custom_git', 'base_url' => '']);

        // 5. Seed Deployment Profiles
        $p1 = DeploymentProfile::firstOrCreate(
            ['name' => 'Laravel 12 Standard (Testing)'],
            ['framework' => 'laravel12', 'description' => 'Full automated test deployment pipeline with migrations and asset build']
        );
        $steps1 = [
            ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
            ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
            ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
            ['step_order' => 4, 'action_verb' => 'composer_update', 'timeout_seconds' => 300],
            ['step_order' => 5, 'action_verb' => 'npm_install', 'timeout_seconds' => 300],
            ['step_order' => 6, 'action_verb' => 'npm_build', 'timeout_seconds' => 300],
            ['step_order' => 7, 'action_verb' => 'artisan_migrate', 'timeout_seconds' => 180],
            ['step_order' => 8, 'action_verb' => 'artisan_optimize', 'timeout_seconds' => 60],
            ['step_order' => 9, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
        ];
        foreach ($steps1 as $st) {
            DeploymentProfileStep::firstOrCreate(['profile_id' => $p1->id, 'step_order' => $st['step_order']], $st);
        }

        $p2 = DeploymentProfile::firstOrCreate(
            ['name' => 'Laravel 12 Production Zero-Downtime'],
            ['framework' => 'laravel12', 'description' => 'Production hardened pipeline with queue restart and health verification']
        );
        $steps2 = [
            ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
            ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
            ['step_order' => 3, 'action_verb' => 'composer_update', 'timeout_seconds' => 300, 'parameters' => ['no_dev' => true]],
            ['step_order' => 4, 'action_verb' => 'npm_build', 'timeout_seconds' => 300],
            ['step_order' => 5, 'action_verb' => 'artisan_migrate', 'timeout_seconds' => 300, 'parameters' => ['force' => true]],
            ['step_order' => 6, 'action_verb' => 'artisan_optimize', 'timeout_seconds' => 60],
            ['step_order' => 7, 'action_verb' => 'queue_restart', 'timeout_seconds' => 60],
            ['step_order' => 8, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
        ];
        foreach ($steps2 as $st) {
            DeploymentProfileStep::firstOrCreate(['profile_id' => $p2->id, 'step_order' => $st['step_order']], $st);
        }

        $p3 = DeploymentProfile::firstOrCreate(
            ['name' => 'React / Node.js SPA'],
            ['framework' => 'react_spa', 'description' => 'Frontend bundle build and distribution']
        );
        $steps3 = [
            ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
            ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
            ['step_order' => 3, 'action_verb' => 'npm_install', 'timeout_seconds' => 300],
            ['step_order' => 4, 'action_verb' => 'npm_build', 'timeout_seconds' => 300],
            ['step_order' => 5, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
        ];
        foreach ($steps3 as $st) {
            DeploymentProfileStep::firstOrCreate(['profile_id' => $p3->id, 'step_order' => $st['step_order']], $st);
        }

        $p4 = DeploymentProfile::firstOrCreate(
            ['name' => 'Laravel Blade & Backend (No NPM/Node)'],
            ['framework' => 'laravel_blade', 'description' => 'Lightweight PHP & Blade pipeline without Node.js or NPM build steps']
        );
        $steps4 = [
            ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
            ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
            ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
            ['step_order' => 4, 'action_verb' => 'composer_update', 'timeout_seconds' => 300],
            ['step_order' => 5, 'action_verb' => 'artisan_migrate', 'timeout_seconds' => 180],
            ['step_order' => 6, 'action_verb' => 'artisan_optimize', 'timeout_seconds' => 60],
            ['step_order' => 7, 'action_verb' => 'queue_restart', 'timeout_seconds' => 60],
            ['step_order' => 8, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
        ];
        foreach ($steps4 as $st) {
            DeploymentProfileStep::firstOrCreate(['profile_id' => $p4->id, 'step_order' => $st['step_order']], $st);
        }
    }
}
