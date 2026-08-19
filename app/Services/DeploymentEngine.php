<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Deployment;
use App\Models\DeploymentApproval;
use App\Models\DeploymentLog;
use App\Models\DeploymentStep;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DeploymentEngine
{
    /**
     * Request a new deployment for a project.
     */
    public function requestDeployment(
        Project $project,
        string $commitSha = 'HEAD',
        string $commitMessage = 'Manual Deployment Trigger',
        string $branch = '',
        string $triggerSource = 'manual',
        ?User $user = null
    ): Deployment {
        $targetBranch = $branch ?: $project->target_branch;

        return DB::transaction(function () use ($project, $commitSha, $commitMessage, $targetBranch, $triggerSource, $user) {
            $deployment = Deployment::create([
                'uuid' => (string) Str::uuid(),
                'project_id' => $project->id,
                'server_id' => $project->server_id,
                'triggered_by_user_id' => $user?->id,
                'trigger_source' => $triggerSource,
                'commit_sha' => $commitSha,
                'commit_message' => $commitMessage,
                'branch' => $targetBranch,
                'status' => 'requested',
            ]);

            // Populate steps from profile
            $profile = $project->profile;
            if ($profile) {
                foreach ($profile->steps as $step) {
                    DeploymentStep::create([
                        'deployment_id' => $deployment->id,
                        'step_order' => $step->step_order,
                        'action_verb' => $step->action_verb,
                        'status' => 'pending',
                    ]);
                }
            }

            // Initial System Log
            $this->appendLog($deployment, 'system', "Deployment #{$deployment->id} requested for project [{$project->name}] ({$project->environment}). Target commit: {$commitSha}");

            // Production & Approval Gating Check
            if ($project->environment === 'production' || $project->requires_approval) {
                $deployment->update(['status' => 'pending_approval']);
                DeploymentApproval::create([
                    'deployment_id' => $deployment->id,
                    'requested_by_user_id' => $user?->id,
                    'status' => 'pending',
                ]);
                $this->appendLog($deployment, 'system', 'Deployment placed in [PENDING_APPROVAL] gate. Awaiting CoreSentinel sign-off.');
            } else {
                $this->enqueueDeployment($deployment);
            }

            // Audit Log
            AuditLog::create([
                'user_id' => $user?->id,
                'action' => 'deployment.requested',
                'auditable_type' => Deployment::class,
                'auditable_id' => $deployment->id,
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'user_agent' => request()->userAgent(),
                'new_values' => ['status' => $deployment->status, 'branch' => $targetBranch, 'commit' => $commitSha],
            ]);

            return $deployment;
        });
    }

    /**
     * Enqueue an approved/unrestricted deployment into the execution queue.
     */
    public function enqueueDeployment(Deployment $deployment): bool
    {
        $lockKey = "lock:deploy:project:{$deployment->project_id}:env:{$deployment->project->environment}";

        // Acquire 15-minute lock
        $lock = Cache::lock($lockKey, 900);

        if (! $lock->get()) {
            $deployment->update([
                'status' => 'failed',
                'error_summary' => 'Another deployment is currently running on this project environment.',
            ]);
            $this->appendLog($deployment, 'stderr', 'COLLISION: Target environment currently locked by active deployment.');

            return false;
        }

        $deployment->update(['status' => 'queued']);
        $this->appendLog($deployment, 'system', 'Deployment successfully enqueued for agent pickup.');

        return true;
    }

    /**
     * Approve a pending deployment gate.
     */
    public function approveDeployment(DeploymentApproval $approval, User $approver, ?string $notes = null): bool
    {
        return DB::transaction(function () use ($approval, $approver, $notes) {
            $approval->update([
                'approved_by_user_id' => $approver->id,
                'status' => 'approved',
                'decision_notes' => $notes,
                'decided_at' => now(),
            ]);

            $deployment = $approval->deployment;
            $this->appendLog($deployment, 'system', "Deployment APPROVED by [{$approver->name}]. Notes: ".($notes ?: 'None'));
            $this->enqueueDeployment($deployment);

            AuditLog::create([
                'user_id' => $approver->id,
                'action' => 'approval.approved',
                'auditable_type' => Deployment::class,
                'auditable_id' => $deployment->id,
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'new_values' => ['decision' => 'approved', 'notes' => $notes],
            ]);

            return true;
        });
    }

    /**
     * Reject a pending deployment gate.
     */
    public function rejectDeployment(DeploymentApproval $approval, User $rejector, ?string $notes = null): bool
    {
        return DB::transaction(function () use ($approval, $rejector, $notes) {
            $approval->update([
                'approved_by_user_id' => $rejector->id,
                'status' => 'rejected',
                'decision_notes' => $notes,
                'decided_at' => now(),
            ]);

            $deployment = $approval->deployment;
            $deployment->update(['status' => 'cancelled', 'error_summary' => 'Rejected by approver']);
            $this->appendLog($deployment, 'system', "Deployment REJECTED by [{$rejector->name}]. Notes: ".($notes ?: 'None'));

            AuditLog::create([
                'user_id' => $rejector->id,
                'action' => 'approval.rejected',
                'auditable_type' => Deployment::class,
                'auditable_id' => $deployment->id,
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'new_values' => ['decision' => 'rejected', 'notes' => $notes],
            ]);

            return true;
        });
    }

    /**
     * Append a sanitized log entry to a deployment.
     */
    public function appendLog(Deployment $deployment, string $streamType, string $content, ?int $stepId = null): DeploymentLog
    {
        $sanitized = LogSanitizer::sanitize($content);
        $nextSeq = ($deployment->logs()->max('sequence_number') ?? 0) + 1;

        return DeploymentLog::create([
            'deployment_id' => $deployment->id,
            'deployment_step_id' => $stepId,
            'stream_type' => in_array($streamType, ['stdout', 'stderr', 'system']) ? $streamType : 'stdout',
            'sequence_number' => $nextSeq,
            'log_content' => $sanitized,
        ]);
    }
}
