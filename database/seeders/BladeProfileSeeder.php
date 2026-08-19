<?php

namespace Database\Seeders;

use App\Models\DeploymentProfile;
use App\Models\DeploymentProfileStep;
use Illuminate\Database\Seeder;

class BladeProfileSeeder extends Seeder
{
    /**
     * Seed only the Laravel Blade & Backend (No NPM/Node) deployment profile.
     */
    public function run(): void
    {
        $profile = DeploymentProfile::firstOrCreate(
            ['name' => 'Laravel Blade & Backend (No NPM/Node)'],
            [
                'framework' => 'laravel_blade',
                'description' => 'Lightweight PHP & Blade pipeline without Node.js or NPM build steps',
            ]
        );

        $steps = [
            ['step_order' => 1, 'action_verb' => 'git_fetch', 'timeout_seconds' => 120],
            ['step_order' => 2, 'action_verb' => 'git_checkout', 'timeout_seconds' => 60],
            ['step_order' => 3, 'action_verb' => 'git_reset', 'timeout_seconds' => 60],
            ['step_order' => 4, 'action_verb' => 'composer_update', 'timeout_seconds' => 300],
            ['step_order' => 5, 'action_verb' => 'artisan_migrate', 'timeout_seconds' => 180],
            ['step_order' => 6, 'action_verb' => 'artisan_optimize', 'timeout_seconds' => 60],
            ['step_order' => 7, 'action_verb' => 'queue_restart', 'timeout_seconds' => 60],
            ['step_order' => 8, 'action_verb' => 'health_check', 'timeout_seconds' => 30],
        ];

        foreach ($steps as $st) {
            DeploymentProfileStep::firstOrCreate(
                ['profile_id' => $profile->id, 'step_order' => $st['step_order']],
                $st
            );
        }

        $this->command->info("Blade profile seeded successfully (ID: {$profile->id}).");
    }
}
