<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Deployment;
use App\Services\DeploymentEngine;
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
        // Identify previous successful deployment for this project
        $previous = Deployment::where('project_id', $deployment->project_id)
            ->where('status', 'success')
            ->where('id', '<', $deployment->id)
            ->latest()
            ->first();

        $targetSha = $previous ? $previous->commit_sha : 'HEAD~1';

        $rollbackDeploy = $engine->requestDeployment(
            $deployment->project,
            $targetSha,
            "Rollback to stable release (Ref: #{$deployment->id})",
            $deployment->branch,
            'rollback',
            auth()->user()
        );

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'deployment.rollback_requested',
            'auditable_type' => Deployment::class,
            'auditable_id' => $rollbackDeploy->id,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'new_values' => ['rolled_back_from' => $deployment->id, 'target_commit' => $targetSha],
        ]);

        return redirect()->route('deployments.show', $rollbackDeploy->id)->with('flash', [
            'warning' => "Rollback deployment #{$rollbackDeploy->id} initiated for target commit {$targetSha}.",
        ]);
    }
}
