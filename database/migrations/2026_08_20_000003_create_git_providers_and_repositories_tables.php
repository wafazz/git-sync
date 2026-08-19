<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('git_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->enum('provider_type', ['github', 'gitlab', 'gitea', 'custom_git'])->default('github');
            $table->string('base_url', 255)->default('https://github.com');
            $table->timestamps();
        });

        Schema::create('git_credentials', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->enum('auth_type', ['pat', 'ssh_key', 'token'])->default('pat');
            $table->longText('encrypted_payload'); // AES-256-GCM encrypted
            $table->string('fingerprint', 100)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('git_repositories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('git_providers')->onDelete('cascade');
            $table->string('name', 100);
            $table->string('repo_url', 500);
            $table->string('owner_org', 100)->nullable();
            $table->string('default_branch', 100)->default('main');
            $table->enum('auth_type', ['pat', 'ssh_key', 'github_app'])->default('pat');
            $table->foreignId('credential_id')->nullable()->constrained('git_credentials')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('git_repositories');
        Schema::dropIfExists('git_credentials');
        Schema::dropIfExists('git_providers');
    }
};
