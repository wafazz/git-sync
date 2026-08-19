<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\GitRepository;
use App\Models\Project;
use App\Models\Webhook;
use App\Models\WebhookEvent;
use App\Services\DeploymentEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class WebhookApiController extends Controller
{
    public function handleGithub(Request $request, DeploymentEngine $engine): JsonResponse
    {
        $deliveryId = $request->header('X-GitHub-Delivery');
        $signature = $request->header('X-Hub-Signature-256');
        $event = $request->header('X-GitHub-Event', 'push');
        $rawPayload = $request->getContent();
        $payload = $request->all();

        // 1. Idempotency Check on Delivery ID
        if ($deliveryId) {
            $cacheKey = "webhook:delivery:github:{$deliveryId}";
            if (Cache::has($cacheKey)) {
                return response()->json(['message' => 'Duplicate webhook delivery ignored'], 200);
            }
            Cache::put($cacheKey, true, 86400); // 24 hours
        }

        // Only handle push events for now
        if ($event !== 'push') {
            return response()->json(['message' => "Event [{$event}] acknowledged and ignored"], 200);
        }

        $repoUrl = $payload['repository']['clone_url'] ?? $payload['repository']['html_url'] ?? null;
        $ref = $payload['ref'] ?? ''; // e.g. "refs/heads/main"
        $branch = str_replace('refs/heads/', '', $ref);
        $commitSha = $payload['after'] ?? $payload['head_commit']['id'] ?? 'HEAD';
        $commitMessage = $payload['head_commit']['message'] ?? 'Webhook push trigger';
        $author = $payload['head_commit']['author']['name'] ?? 'Git User';

        if (! $repoUrl || ! $branch) {
            return response()->json(['error' => 'Invalid repository or branch in payload'], 400);
        }

        // Find repository
        $repository = GitRepository::where('repo_url', 'LIKE', "%{$repoUrl}%")
            ->orWhere('name', $payload['repository']['name'] ?? '')
            ->first();

        if (! $repository) {
            return response()->json(['message' => 'Repository not registered in CoreSentinel'], 200);
        }

        // Record Webhook Event
        if ($repository->webhook) {
            WebhookEvent::create([
                'webhook_id' => $repository->webhook->id,
                'provider_event_id' => $deliveryId,
                'event_type' => $event,
                'payload' => $payload,
                'status' => 'processed',
                'ip_address' => $request->ip(),
            ]);
        }

        // Find matching projects configured for auto-deploy on this branch
        $matchingProjects = Project::where('repository_id', $repository->id)
            ->where('target_branch', $branch)
            ->where('auto_deploy_on_push', true)
            ->get();

        if ($matchingProjects->isEmpty()) {
            return response()->json(['message' => "No auto-deploy project binding for branch [{$branch}]"], 200);
        }

        $deployedCount = 0;
        foreach ($matchingProjects as $project) {
            $engine->requestDeployment(
                $project,
                $commitSha,
                "Push: {$commitMessage} (by {$author})",
                $branch,
                'webhook',
                null
            );
            $deployedCount++;
        }

        AuditLog::create([
            'action' => 'webhook.processed',
            'auditable_type' => GitRepository::class,
            'auditable_id' => $repository->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'new_values' => ['branch' => $branch, 'commit' => $commitSha, 'projects_triggered' => $deployedCount],
        ]);

        return response()->json([
            'message' => "Processed webhook push: triggered {$deployedCount} deployment(s)",
            'branch' => $branch,
            'commit' => $commitSha,
        ], 202);
    }
}
