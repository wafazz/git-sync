<?php

namespace App\Http\Controllers;

use App\Models\Deployment;
use App\Services\DeploymentEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DeploymentController extends Controller
{
    public function index(): Response
    {
        $deployments = Deployment::with(['project.repository', 'server', 'triggeredBy'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Deployments/Index', [
            'deployments' => $deployments->items(),
        ]);
    }

    public function show(Deployment $deployment): Response
    {
        $deployment->load([
            'project.repository',
            'server',
            'triggeredBy',
            'steps',
            'logs',
            'approval.requestedBy',
            'approval.approvedBy',
            'healthCheck',
        ]);

        return Inertia::render('Deployments/Show', [
            'deployment' => $deployment,
        ]);
    }

    /**
     * Fast JSON stream endpoint for real-time live console and step state updates.
     */
    public function stream(Deployment $deployment): JsonResponse
    {
        $deployment->load([
            'steps',
            'logs' => fn ($q) => $q->orderBy('sequence_number', 'asc'),
        ]);

        return response()->json([
            'id' => $deployment->id,
            'status' => $deployment->status,
            'duration_seconds' => $deployment->duration_seconds,
            'error_summary' => $deployment->error_summary,
            'steps' => $deployment->steps,
            'logs' => $deployment->logs,
        ]);
    }

    public function retry(Deployment $deployment, DeploymentEngine $engine): RedirectResponse
    {
        $newDeployment = $engine->requestDeployment(
            $deployment->project,
            $deployment->commit_sha,
            "Retry of deployment #{$deployment->id}",
            $deployment->branch,
            'manual',
            auth()->user()
        );

        return redirect()->route('deployments.show', $newDeployment->id)->with('flash', [
            'success' => "Retry deployment #{$newDeployment->id} initiated.",
        ]);
    }

    public function rollback(Deployment $deployment, DeploymentEngine $engine): RedirectResponse
    {
        $project = $deployment->project;
        $lastSuccess = Deployment::where('project_id', $project->id)
            ->where('status', 'success')
            ->where('id', '!=', $deployment->id)
            ->latest()
            ->first();

        if (! $lastSuccess) {
            return redirect()->back()->with('flash', [
                'error' => 'No previous verified successful deployment found to rollback to.',
            ]);
        }

        $rollbackDeployment = $engine->requestDeployment(
            $project,
            $lastSuccess->commit_sha,
            "Rollback to stable deployment #{$lastSuccess->id} (commit {$lastSuccess->commit_sha})",
            $project->target_branch,
            'rollback',
            auth()->user()
        );

        return redirect()->route('deployments.show', $rollbackDeployment->id)->with('flash', [
            'warning' => "Rollback deployment #{$rollbackDeployment->id} initiated.",
        ]);
    }
}
