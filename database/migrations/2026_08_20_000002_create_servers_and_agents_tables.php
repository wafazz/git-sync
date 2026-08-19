<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 100);
            $table->enum('environment', ['development', 'testing', 'staging', 'production'])->default('testing');
            $table->enum('os_type', ['linux_ubuntu', 'linux_debian', 'linux_rhel', 'windows_wsl', 'windows_native', 'other'])->default('linux_ubuntu');
            $table->string('hostname', 255)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->enum('status', ['online', 'offline', 'degraded', 'maintenance'])->default('offline');
            $table->timestamp('last_heartbeat_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('server_agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->unique()->constrained('servers')->onDelete('cascade');
            $table->uuid('agent_uuid')->unique();
            $table->string('agent_version', 30)->default('1.0.0');
            $table->string('api_key_hash', 255);
            $table->text('secret_hash');
            $table->text('public_key')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('last_ip', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('server_heartbeats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->constrained('servers')->onDelete('cascade');
            $table->decimal('cpu_usage', 5, 2)->nullable();
            $table->decimal('memory_usage', 5, 2)->nullable();
            $table->decimal('disk_usage', 5, 2)->nullable();
            $table->string('reported_version', 30)->nullable();
            $table->timestamp('recorded_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('server_heartbeats');
        Schema::dropIfExists('server_agents');
        Schema::dropIfExists('servers');
    }
};
