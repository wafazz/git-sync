<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deployment_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('framework', 50)->default('laravel12');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('deployment_profile_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('deployment_profiles')->onDelete('cascade');
            $table->integer('step_order');
            $table->string('action_verb', 50);
            $table->json('parameters')->nullable();
            $table->integer('timeout_seconds')->default(300);
            $table->boolean('allow_failure')->default(false);
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 100);
            $table->foreignId('repository_id')->constrained('git_repositories')->onDelete('cascade');
            $table->foreignId('server_id')->constrained('servers')->onDelete('cascade');
            $table->foreignId('deployment_profile_id')->constrained('deployment_profiles')->onDelete('cascade');
            $table->string('target_branch', 100)->default('main');
            $table->enum('environment', ['development', 'testing', 'staging', 'production'])->default('testing');
            $table->string('deploy_path', 500);
            $table->string('health_check_url', 500)->nullable();
            $table->boolean('auto_deploy_on_push')->default(false);
            $table->boolean('requires_approval')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
        Schema::dropIfExists('deployment_profile_steps');
        Schema::dropIfExists('deployment_profiles');
    }
};
