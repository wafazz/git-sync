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
            ['name' => 'view_dashboard', 'category' => 'dashboard', 'description' => 'View system metrics and pipeline status'],
            ['name' => 'manage_servers', 'category' => 'infrastructure', 'description' => 'Register, edit and decommission target servers'],
            ['name' => 'view_servers', 'category' => 'infrastructure', 'description' => 'View connected server nodes and heartbeats'],
            ['name' => 'manage_repositories', 'category' => 'repositories', 'description' => 'Register and configure Git repositories and credentials'],
            ['name' => 'view_repositories', 'category' => 'repositories', 'description' => 'View connected Git repositories'],
            ['name' => 'manage_projects', 'category' => 'projects', 'description' => 'Configure environment project bindings and rules'],
            ['name' => 'view_projects', 'category' => 'projects', 'description' => 'View project mappings and deployment paths'],
            ['name' => 'trigger_deploy_development', 'category' => 'deployments', 'description' => 'Trigger deployments targeting development nodes'],
            ['name' => 'trigger_deploy_testing', 'category' => 'deployments', 'description' => 'Trigger deployments targeting testing/qa nodes'],
            ['name' => 'trigger_deploy_staging', 'category' => 'deployments', 'description' => 'Trigger deployments targeting staging nodes'],
            ['name' => 'trigger_deploy_production', 'category' => 'deployments', 'description' => 'Trigger deployments targeting production nodes'],
            ['name' => 'approve_production_deploy', 'category' => 'approvals', 'description' => 'Approve or reject production deployment gates'],
            ['name' => 'cancel_deployment', 'category' => 'deployments', 'description' => 'Abort in-flight deployment pipelines'],
            ['name' => 'trigger_rollback', 'category' => 'deployments', 'description' => 'Execute release rollbacks to stable commit checkpoints'],
            ['name' => 'view_deployment_logs', 'category' => 'deployments', 'description' => 'View streaming and historical deployment logs'],
            ['name' => 'view_audit_logs', 'category' => 'governance', 'description' => 'View tamper-evident audit logs and security events'],
            ['name' => 'manage_users', 'category' => 'users', 'description' => 'Manage system users and access roles'],
            ['name' => 'manage_system_settings', 'category' => 'system', 'description' => 'Configure CoreSentinel engine settings and keys'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p['name']], $p);
        }

        // 2. Seed RBAC Roles
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'super_admin'],
            ['display_name' => 'Super Administrator', 'description' => 'Full administrative control over all system nodes and operations']
        );
        $superAdminRole->permissions()->sync(Permission::all());

        $roles = [
            ['name' => 'admin', 'display_name' => 'Administrator', 'description' => 'Manage infrastructure, repositories and users'],
            ['name' => 'developer', 'display_name' => 'Developer', 'description' => 'Trigger non-production deployments and view logs'],
            ['name' => 'deployment_operator', 'display_name' => 'Deployment Operator', 'description' => 'Execute deployments across environments and trigger rollbacks'],
            ['name' => 'viewer', 'display_name' => 'Viewer', 'description' => 'Read-only access to dashboards and status metrics'],
            ['name' => 'auditor', 'display_name' => 'Auditor', 'description' => 'Inspect compliance trails and security audit logs'],
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

        // 5. Seed Comprehensive Deployment Profiles Library
        $profilesData = [
            [
                'name' => 'Laravel Universal (v11 / v12 / v13+ Testing)',
                'framework' => 'laravel',
                'description' => 'Full automated test pipeline with composer update, npm build, migrations, and health check for Laravel 11, 12, 13+',
                'steps' => [
                    ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
                    ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
                    ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
                    ['step_order' => 4, 'action_verb' => 'composer_update', 'timeout_seconds' => 300],
                    ['step_order' => 5, 'action_verb' => 'npm_install', 'timeout_seconds' => 300],
                    ['step_order' => 6, 'action_verb' => 'npm_build', 'timeout_seconds' => 300],
                    ['step_order' => 7, 'action_verb' => 'artisan_migrate', 'timeout_seconds' => 180],
                    ['step_order' => 8, 'action_verb' => 'artisan_optimize', 'timeout_seconds' => 60],
                    ['step_order' => 9, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
                ],
            ],
            [
                'name' => 'Laravel Production Zero-Downtime (v11 / v12 / v13+)',
                'framework' => 'laravel',
                'description' => 'Production hardened pipeline with queue worker reboot, forced migrations, and health verification for Laravel 11, 12, 13+',
                'steps' => [
                    ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
                    ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
                    ['step_order' => 3, 'action_verb' => 'composer_update', 'timeout_seconds' => 300],
                    ['step_order' => 4, 'action_verb' => 'npm_build', 'timeout_seconds' => 300],
                    ['step_order' => 5, 'action_verb' => 'artisan_migrate', 'timeout_seconds' => 300],
                    ['step_order' => 6, 'action_verb' => 'artisan_optimize', 'timeout_seconds' => 60],
                    ['step_order' => 7, 'action_verb' => 'queue_restart', 'timeout_seconds' => 60],
                    ['step_order' => 8, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
                ],
            ],
            [
                'name' => 'Laravel Blade & Backend (No NPM/Node)',
                'framework' => 'laravel_blade',
                'description' => 'Lightweight PHP & Blade pipeline without Node.js or NPM build dependencies',
                'steps' => [
                    ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
                    ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
                    ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
                    ['step_order' => 4, 'action_verb' => 'composer_update', 'timeout_seconds' => 300],
                    ['step_order' => 5, 'action_verb' => 'artisan_migrate', 'timeout_seconds' => 180],
                    ['step_order' => 6, 'action_verb' => 'artisan_optimize', 'timeout_seconds' => 60],
                    ['step_order' => 7, 'action_verb' => 'queue_restart', 'timeout_seconds' => 60],
                    ['step_order' => 8, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
                ],
            ],
            [
                'name' => 'Laravel Headless API & Microservices',
                'framework' => 'laravel_api',
                'description' => 'Backend API service with fast caching, queue reboot, and health verification',
                'steps' => [
                    ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
                    ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
                    ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
                    ['step_order' => 4, 'action_verb' => 'composer_update', 'timeout_seconds' => 300],
                    ['step_order' => 5, 'action_verb' => 'artisan_migrate', 'timeout_seconds' => 180],
                    ['step_order' => 6, 'action_verb' => 'artisan_optimize', 'timeout_seconds' => 60],
                    ['step_order' => 7, 'action_verb' => 'queue_restart', 'timeout_seconds' => 60],
                    ['step_order' => 8, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
                ],
            ],
            [
                'name' => 'React / Vue / Vite Frontend SPA',
                'framework' => 'frontend_spa',
                'description' => 'Node/NPM compilation and static asset distribution for Vite, React, and Vue applications',
                'steps' => [
                    ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
                    ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
                    ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
                    ['step_order' => 4, 'action_verb' => 'npm_install', 'timeout_seconds' => 300],
                    ['step_order' => 5, 'action_verb' => 'npm_build', 'timeout_seconds' => 300],
                    ['step_order' => 6, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
                ],
            ],
            [
                'name' => 'Next.js / Nuxt Full-Stack SSR',
                'framework' => 'node_ssr',
                'description' => 'Server-rendered React/Vue with build step and PM2 process reload',
                'steps' => [
                    ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
                    ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
                    ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
                    ['step_order' => 4, 'action_verb' => 'npm_install', 'timeout_seconds' => 300],
                    ['step_order' => 5, 'action_verb' => 'npm_build', 'timeout_seconds' => 300],
                    ['step_order' => 6, 'action_verb' => 'queue_restart', 'timeout_seconds' => 60],
                    ['step_order' => 7, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
                ],
            ],
            [
                'name' => 'Static HTML / Hugo / Astro / Docs Site',
                'framework' => 'static_web',
                'description' => 'Zero-dependency instant git sync for static HTML, Astro, Hugo, or landing pages',
                'steps' => [
                    ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
                    ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
                    ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
                    ['step_order' => 4, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
                ],
            ],
            [
                'name' => 'PHP Generic / WordPress / Symfony App',
                'framework' => 'php_generic',
                'description' => 'Generic PHP application synchronization with composer autoload optimization',
                'steps' => [
                    ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
                    ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
                    ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
                    ['step_order' => 4, 'action_verb' => 'composer_update', 'timeout_seconds' => 300],
                    ['step_order' => 5, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
                ],
            ],
            [
                'name' => 'Docker Compose Automated Service',
                'framework' => 'docker',
                'description' => 'Containerized microservice synchronization with automated compose rebuild',
                'steps' => [
                    ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
                    ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
                    ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
                    ['step_order' => 4, 'action_verb' => 'docker_compose_up', 'timeout_seconds' => 300],
                    ['step_order' => 5, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
                ],
            ],
            [
                'name' => 'Python FastAPI / Django / Flask Backend',
                'framework' => 'python',
                'description' => 'Python backend synchronization with requirements install and service restart',
                'steps' => [
                    ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
                    ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
                    ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
                    ['step_order' => 4, 'action_verb' => 'pip_install', 'timeout_seconds' => 300],
                    ['step_order' => 5, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
                ],
            ],
        ];

        foreach ($profilesData as $pData) {
            $profile = DeploymentProfile::firstOrCreate(
                ['name' => $pData['name']],
                [
                    'framework' => $pData['framework'],
                    'description' => $pData['description'],
                ]
            );

            foreach ($pData['steps'] as $st) {
                DeploymentProfileStep::firstOrCreate(
                    [
                        'profile_id' => $profile->id,
                        'step_order' => $st['step_order'],
                    ],
                    $st
                );
            }
        }
    }
}
