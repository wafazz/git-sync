<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deployment;
use App\Models\DeploymentStep;
use App\Models\Server;
use App\Models\ServerAgent;
use App\Models\ServerHeartbeat;
use App\Services\DeploymentEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AgentApiController extends Controller
{
    /**
     * Agent initial registration handshake.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enrollment_token' => 'required|string',
            'agent_version' => 'nullable|string',
            'os_info' => 'nullable|string',
        ]);

        $agents = ServerAgent::where('is_active', true)->get();
        $matchedAgent = null;

        foreach ($agents as $agent) {
            if (Hash::check($validated['enrollment_token'], $agent->api_key_hash)) {
                $matchedAgent = $agent;
                break;
            }
        }

        if (! $matchedAgent) {
            return response()->json(['error' => 'Invalid or expired enrollment token'], 401);
        }

        $secret = Str::random(40);
        $agentUuid = (string) Str::uuid();

        $matchedAgent->update([
            'agent_uuid' => $agentUuid,
            'secret_hash' => Hash::make($secret),
            'agent_version' => $validated['agent_version'] ?? '1.1.0',
            'last_ip' => $request->ip(),
        ]);

        $server = $matchedAgent->server;
        $server->update([
            'status' => 'online',
            'last_heartbeat_at' => now(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'agent_uuid' => $agentUuid,
            'secret' => $secret,
            'server_name' => $server->name,
            'environment' => $server->environment,
        ]);
    }

    /**
     * Agent Heartbeat ping.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        $agentUuid = $request->header('X-Agent-UUID');
        $agent = ServerAgent::where('agent_uuid', $agentUuid)->where('is_active', true)->first();

        if (! $agent) {
            return response()->json(['error' => 'Unauthorized agent'], 401);
        }

        $server = $agent->server;
        $server->update([
            'status' => 'online',
            'last_heartbeat_at' => now(),
            'ip_address' => $request->ip(),
        ]);

        ServerHeartbeat::create([
            'server_id' => $server->id,
            'cpu_usage' => $request->input('cpu_usage'),
            'memory_usage' => $request->input('memory_usage'),
            'disk_usage' => $request->input('disk_usage'),
            'reported_version' => $request->input('version', $agent->agent_version),
        ]);

        // Check if pending jobs exist for this server
        $hasJobs = Deployment::where('server_id', $server->id)
            ->where('status', 'queued')
            ->exists();

        return response()->json([
            'status' => 'acknowledged',
            'server_status' => 'healthy',
            'has_pending_jobs' => $hasJobs,
        ]);
    }

    /**
     * Poll next deployment job for this agent's server.
     */
    public function pollJobs(Request $request): JsonResponse
    {
        $agentUuid = $request->header('X-Agent-UUID');
        $agent = ServerAgent::where('agent_uuid', $agentUuid)->where('is_active', true)->first();

        if (! $agent) {
            return response()->json(['error' => 'Unauthorized agent'], 401);
        }

        $job = Deployment::with(['project.repository.credential', 'project.profile.steps', 'steps'])
            ->where('server_id', $agent->server_id)
            ->where('status', 'queued')
            ->orderBy('id', 'asc')
            ->first();

        if (! $job) {
            return response()->json(['job' => null]);
        }

        $repo = $job->project->repository;
        $repoUrl = $repo->repo_url;

        // If repository has stored PAT credential, inject token for private repo operations
        if ($repo->credential && ! empty($repo->credential->encrypted_payload) && $repo->auth_type === 'pat') {
            $token = $repo->credential->encrypted_payload;
            if (str_starts_with($repoUrl, 'https://') && ! str_contains($repoUrl, '@')) {
                $parsed = parse_url($repoUrl);
                $host = $parsed['host'] ?? 'github.com';
                $path = ltrim($parsed['path'] ?? '', '/');
                if (str_contains($host, 'github.com')) {
                    $repoUrl = "https://x-access-token:{$token}@{$host}/{$path}";
                } elseif (str_contains($host, 'gitlab.com')) {
                    $repoUrl = "https://oauth2:{$token}@{$host}/{$path}";
                } else {
                    $repoUrl = "https://{$token}@{$host}/{$path}";
                }
            }
        }

        return response()->json([
            'job' => [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'project_name' => $job->project->name,
                'repo_url' => $repoUrl,
                'branch' => $job->branch,
                'commit_sha' => $job->commit_sha,
                'deploy_path' => $job->project->deploy_path,
                'health_check_url' => $job->project->health_check_url,
                'steps' => $job->steps->map(fn ($s) => [
                    'id' => $s->id,
                    'order' => $s->step_order,
                    'verb' => $s->action_verb,
                ]),
            ],
        ]);
    }

    /**
     * Acknowledge deployment start.
     */
    public function ackJob(Deployment $deployment, DeploymentEngine $engine): JsonResponse
    {
        $deployment->update([
            'status' => 'running',
            'started_at' => now(),
        ]);

        $engine->appendLog($deployment, 'system', 'Server agent acknowledged and started deployment execution.');

        return response()->json(['status' => 'running']);
    }

    /**
     * Ingest chunked execution logs and update step states.
     */
    public function appendLogs(Request $request, Deployment $deployment, DeploymentEngine $engine): JsonResponse
    {
        $stream = $request->input('stream_type', 'stdout');
        $content = $request->input('chunk', '');
        $stepId = $request->input('step_id');

        if ($stepId) {
            $step = DeploymentStep::where('deployment_id', $deployment->id)->where('id', $stepId)->first();
            if ($step) {
                if ($step->status === 'pending' || $step->status === 'queued') {
                    $step->update([
                        'status' => 'running',
                        'started_at' => $step->started_at ?? now(),
                    ]);
                }

                if (str_contains($content, '<-- Completed step') || str_contains($content, 'successfully')) {
                    $step->update([
                        'status' => 'success',
                        'exit_code' => 0,
                        'completed_at' => now(),
                    ]);
                } elseif (str_contains($content, 'FAILED: Step') || str_contains($content, 'rejected by agent') || str_contains($content, 'exited with error code')) {
                    $step->update([
                        'status' => 'failed',
                        'exit_code' => 1,
                        'completed_at' => now(),
                    ]);
                }
            }
        }

        $engine->appendLog($deployment, $stream, $content, $stepId);

        return response()->json(['status' => 'saved']);
    }

    /**
     * Finalize deployment execution.
     */
    public function completeJob(Request $request, Deployment $deployment, DeploymentEngine $engine): JsonResponse
    {
        $status = $request->input('status') === 'success' ? 'success' : 'failed';
        $exitCode = $request->input('exit_code', 0);
        $duration = $request->input('duration_seconds');
        $errorSummary = $request->input('error_summary');

        $deployment->update([
            'status' => $status,
            'completed_at' => now(),
            'duration_seconds' => $duration,
            'error_summary' => $errorSummary,
        ]);

        // Finalize any running steps
        if ($status === 'success') {
            DeploymentStep::where('deployment_id', $deployment->id)
                ->where('status', 'running')
                ->update([
                    'status' => 'success',
                    'exit_code' => 0,
                    'completed_at' => now(),
                ]);
        } else {
            DeploymentStep::where('deployment_id', $deployment->id)
                ->where('status', 'running')
                ->update([
                    'status' => 'failed',
                    'exit_code' => $exitCode ?: 1,
                    'completed_at' => now(),
                ]);
        }

        $engine->appendLog(
            $deployment,
            $status === 'success' ? 'system' : 'stderr',
            "Deployment completed with status [{$status}]. Exit Code: {$exitCode}."
        );

        // Release Redis lock
        $lockKey = "lock:deploy:project:{$deployment->project_id}:env:{$deployment->project->environment}";
        Cache::lock($lockKey)->forceRelease();

        return response()->json(['status' => 'finalized']);
    }
}
