<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\DeploymentProfile;
use App\Models\GitRepository;
use App\Models\Project;
use App\Models\Server;
use App\Services\DeploymentEngine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        $projects = Project::with(['repository', 'server', 'profile', 'latestDeployment'])
            ->latest()
            ->get();

        $repositories = GitRepository::where('is_active', true)->get();
        $servers = Server::all();
        $profiles = DeploymentProfile::all();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'repositories' => $repositories,
            'servers' => $servers,
            'profiles' => $profiles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'repository_id' => 'required|exists:git_repositories,id',
            'server_id' => 'required|exists:servers,id',
            'deployment_profile_id' => 'required|exists:deployment_profiles,id',
            'target_branch' => 'required|string|max:100',
            'environment' => 'required|in:development,testing,staging,production',
            'deploy_path' => 'required|string|max:500',
            'health_check_url' => 'nullable|string|max:500',
            'auto_deploy_on_push' => 'boolean',
            'requires_approval' => 'boolean',
        ]);

        $project = Project::create($validated);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'project.created',
            'auditable_type' => Project::class,
            'auditable_id' => $project->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'new_values' => $validated,
        ]);

        return redirect()->back()->with('flash', [
            'success' => "Project [{$project->name}] created successfully.",
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'repository_id' => 'required|exists:git_repositories,id',
            'server_id' => 'required|exists:servers,id',
            'deployment_profile_id' => 'required|exists:deployment_profiles,id',
            'target_branch' => 'required|string|max:100',
            'environment' => 'required|in:development,testing,staging,production',
            'deploy_path' => 'required|string|max:500',
            'health_check_url' => 'nullable|string|max:500',
            'auto_deploy_on_push' => 'boolean',
            'requires_approval' => 'boolean',
        ]);

        $oldValues = $project->only(array_keys($validated));
        $project->update($validated);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'project.updated',
            'auditable_type' => Project::class,
            'auditable_id' => $project->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'old_values' => $oldValues,
            'new_values' => $validated,
        ]);

        return redirect()->back()->with('flash', [
            'success' => "Project [{$project->name}] updated successfully.",
        ]);
    }

    public function destroy(Project $project): RedirectResponse
    {
        $name = $project->name;
        $project->delete();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'project.deleted',
            'auditable_type' => Project::class,
            'auditable_id' => $project->id,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'old_values' => ['name' => $name],
        ]);

        return redirect()->back()->with('flash', [
            'success' => "Project [{$name}] removed successfully.",
        ]);
    }

    public function triggerDeploy(Project $project, DeploymentEngine $engine): RedirectResponse
    {
        $deployment = $engine->requestDeployment(
            $project,
            'HEAD',
            'Manual trigger via dashboard UI',
            $project->target_branch,
            'manual',
            auth()->user()
        );

        return redirect()->route('deployments.show', $deployment->id)->with('flash', [
            'success' => "Deployment #{$deployment->id} requested.",
        ]);
    }
}
