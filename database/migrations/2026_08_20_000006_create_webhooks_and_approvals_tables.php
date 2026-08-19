<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhooks', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('repository_id')->constrained('git_repositories')->onDelete('cascade');
            $table->text('secret_hash');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('webhook_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webhook_id')->constrained('webhooks')->onDelete('cascade');
            $table->string('provider_event_id', 255)->nullable();
            $table->string('event_type', 50)->default('push');
            $table->json('payload');
            $table->enum('status', ['received', 'processed', 'ignored', 'failed'])->default('received');
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('deployment_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deployment_id')->constrained('deployments')->onDelete('cascade');
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_role_id')->nullable()->constrained('roles')->nullOnDelete();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('decision_notes')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deployment_approvals');
        Schema::dropIfExists('webhook_events');
        Schema::dropIfExists('webhooks');
    }
};
