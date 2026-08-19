<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\DeploymentProfile;
use App\Models\DeploymentProfileStep;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        $profiles = DeploymentProfile::with(['steps' => fn ($q) => $q->orderBy('step_order', 'asc')])
            ->withCount('projects')
            ->get();

        return Inertia::render('Profiles/Index', [
            'profiles' => $profiles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:deployment_profiles,name',
            'framework' => 'required|string|max:50',
            'description' => 'nullable|string|max:500',
            'steps' => 'required|array|min:1',
            'steps.*.action_verb' => 'required|string',
            'steps.*.timeout_seconds' => 'nullable|integer|min:5|max:1800',
        ]);

        $profile = DeploymentProfile::create([
            'name' => $validated['name'],
            'framework' => $validated['framework'],
            'description' => $validated['description'] ?? null,
        ]);

        foreach ($validated['steps'] as $idx => $step) {
            DeploymentProfileStep::create([
                'profile_id' => $profile->id,
                'step_order' => $idx + 1,
                'action_verb' => $step['action_verb'],
                'timeout_seconds' => $step['timeout_seconds'] ?? 120,
            ]);
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'profile.created',
            'auditable_type' => DeploymentProfile::class,
            'auditable_id' => $profile->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'new_values' => ['name' => $profile->name],
        ]);

        return redirect()->back()->with('flash', [
            'success' => "Deployment Profile [{$profile->name}] created successfully.",
        ]);
    }

    public function destroy(DeploymentProfile $profile): RedirectResponse
    {
        if ($profile->projects()->exists()) {
            return redirect()->back()->with('flash', [
                'error' => "Cannot delete profile [{$profile->name}] because it is currently assigned to active projects.",
            ]);
        }

        $name = $profile->name;
        $profile->steps()->delete();
        $profile->delete();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'profile.deleted',
            'auditable_type' => DeploymentProfile::class,
            'auditable_id' => $profile->id,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'old_values' => ['name' => $name],
        ]);

        return redirect()->back()->with('flash', [
            'success' => "Profile [{$name}] removed successfully.",
        ]);
    }
}
