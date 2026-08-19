<?php

namespace Database\Seeders;

use App\Models\DeploymentProfile;
use App\Models\DeploymentProfileStep;
use Illuminate\Database\Seeder;

class NewProfilesSeeder extends Seeder
{
    /**
     * Seed only the newly added development and deployment profiles.
     */
    public function run(): void
    {
        $profiles = [
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

        foreach ($profiles as $pData) {
            $p = DeploymentProfile::firstOrCreate(
                ['name' => $pData['name']],
                [
                    'framework' => $pData['framework'],
                    'description' => $pData['description'],
                ]
            );

            foreach ($pData['steps'] as $st) {
                DeploymentProfileStep::firstOrCreate(
                    [
                        'profile_id' => $p->id,
                        'step_order' => $st['step_order'],
                    ],
                    $st
                );
            }
        }

        $this->command->info('Latest development profiles seeded successfully.');
    }
}
