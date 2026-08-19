<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\GitCredential;
use App\Models\GitProvider;
use App\Models\GitRepository;
use App\Models\Webhook;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RepositoryController extends Controller
{
    public function index(): Response
    {
        $repositories = GitRepository::with(['provider', 'credential', 'webhook'])
            ->latest()
            ->get();

        $providers = GitProvider::all();

        return Inertia::render('Repositories/Index', [
            'repositories' => $repositories,
            'providers' => $providers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'provider_id' => 'required|exists:git_providers,id',
            'repo_url' => 'required|string|max:500',
            'owner_org' => 'nullable|string|max:100',
            'default_branch' => 'required|string|max:100',
            'auth_type' => 'required|in:pat,ssh_key,github_app',
            'credential_token' => 'nullable|string',
        ]);

        $credentialId = null;
        if (! empty($validated['credential_token'])) {
            $credential = GitCredential::create([
                'name' => "{$validated['name']} Credential",
                'auth_type' => $validated['auth_type'],
                'encrypted_payload' => $validated['credential_token'],
                'created_by' => auth()->id(),
            ]);
            $credentialId = $credential->id;
        }

        $repo = GitRepository::create([
            'provider_id' => $validated['provider_id'],
            'name' => $validated['name'],
            'repo_url' => $validated['repo_url'],
            'owner_org' => $validated['owner_org'],
            'default_branch' => $validated['default_branch'],
            'auth_type' => $validated['auth_type'],
            'credential_id' => $credentialId,
            'is_active' => true,
        ]);

        // Auto-generate webhook configuration
        Webhook::create([
            'uuid' => (string) Str::uuid(),
            'repository_id' => $repo->id,
            'secret_hash' => Hash::make(Str::random(32)),
            'is_active' => true,
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'repository.created',
            'auditable_type' => GitRepository::class,
            'auditable_id' => $repo->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'new_values' => ['name' => $repo->name, 'url' => $repo->repo_url],
        ]);

        return redirect()->back()->with('flash', [
            'success' => "Repository [{$repo->name}] connected securely.",
        ]);
    }
}
