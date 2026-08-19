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
    public function run(): void
    {
        // 1. Seed Roles
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin'], ['display_name' => 'Super Administrator', 'description' => 'Full administrative access and governance control']);
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['display_name' => 'Administrator', 'description' => 'Project, server, and approval management']);
        $devRole = Role::firstOrCreate(['name' => 'developer'], ['display_name' => 'Developer', 'description' => 'Development/Testing deployment triggers']);
        $operatorRole = Role::firstOrCreate(['name' => 'deployment_operator'], ['display_name' => 'Deployment Operator', 'description' => 'Execution and rollback operator']);
        $viewerRole = Role::firstOrCreate(['name' => 'viewer'], ['display_name' => 'Viewer', 'description' => 'Read-only dashboard and logs']);
        $auditorRole = Role::firstOrCreate(['name' => 'auditor'], ['display_name' => 'Auditor', 'description' => 'Audit logs and compliance monitoring']);

        // 2. Seed Permissions
        $permissions = [
            'server.view' => 'View server inventory and health',
            'server.create' => 'Register new servers and agents',
            'server.update' => 'Modify server configurations',
            'server.delete' => 'Remove servers from inventory',
            'project.view' => 'View configured projects',
            'project.create' => 'Create project environment bindings',
            'project.update' => 'Edit project environment bindings',
            'project.delete' => 'Delete project bindings',
            'deployment.view' => 'View deployment pipelines and logs',
            'deployment.create' => 'Trigger development/testing deployments',
            'deployment.production' => 'Trigger production deployments',
            'deployment.cancel' => 'Cancel in-flight deployment jobs',
            'deployment.retry' => 'Retry failed deployments',
            'deployment.rollback' => 'Initiate rollback routines',
            'approval.view' => 'View pending approval gates',
            'approval.approve' => 'Sign-off and authorize production deployments',
            'approval.reject' => 'Reject deployment requests',
            'audit.view' => 'Inspect immutable audit logs',
        ];

        foreach ($permissions as $permName => $desc) {
            $permission = Permission::firstOrCreate(
                ['name' => $permName],
                ['category' => explode('.', $permName)[0], 'description' => $desc]
            );
            $superAdminRole->permissions()->syncWithoutDetaching([$permission->id]);
            $adminRole->permissions()->syncWithoutDetaching([$permission->id]);
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
            ['step_order' => 3, 'action_verb' => 'composer_install', 'timeout_seconds' => 300, 'parameters' => ['no_dev' => true]],
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
    }
}
