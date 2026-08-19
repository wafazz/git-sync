<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deployments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('server_id')->constrained('servers')->onDelete('cascade');
            $table->foreignId('triggered_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('trigger_source', ['manual', 'webhook', 'rollback', 'api'])->default('manual');
            $table->string('commit_sha', 40)->default('HEAD');
            $table->text('commit_message')->nullable();
            $table->string('commit_author', 255)->nullable();
            $table->string('branch', 100);
            $table->enum('status', [
                'requested',
                'validating',
                'pending_approval',
                'approved',
                'queued',
                'running',
                'health_check',
                'success',
                'failed',
                'rolling_back',
                'rolled_back',
                'cancelled',
            ])->default('requested');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->text('error_summary')->nullable();
            $table->timestamps();
        });

        Schema::create('deployment_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deployment_id')->constrained('deployments')->onDelete('cascade');
            $table->integer('step_order');
            $table->string('action_verb', 50);
            $table->enum('status', ['pending', 'running', 'success', 'failed', 'skipped'])->default('pending');
            $table->integer('exit_code')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('deployment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deployment_id')->constrained('deployments')->onDelete('cascade');
            $table->foreignId('deployment_step_id')->nullable()->constrained('deployment_steps')->nullOnDelete();
            $table->enum('stream_type', ['stdout', 'stderr', 'system'])->default('stdout');
            $table->unsignedBigInteger('sequence_number')->default(1);
            $table->mediumText('log_content');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deployment_logs');
        Schema::dropIfExists('deployment_steps');
        Schema::dropIfExists('deployments');
    }
};
