<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Server;
use App\Models\ServerAgent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServerController extends Controller
{
    public function index(): Response
    {
        $servers = Server::with(['agent'])
            ->withCount('projects')
            ->latest()
            ->get();

        return Inertia::render('Servers/Index', [
            'servers' => $servers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'environment' => 'required|in:development,testing,staging,production',
            'os_type' => 'required|in:linux_ubuntu,linux_debian,linux_rhel,windows_wsl,windows_native,other',
            'hostname' => 'nullable|string|max:255',
            'ip_address' => 'nullable|string|max:45',
        ]);

        $server = Server::create($validated);

        // Generate enrollment token for the agent
        $rawToken = 'cs_agent_'.Str::random(40);
        $agentUuid = (string) Str::uuid();

        ServerAgent::create([
            'server_id' => $server->id,
            'agent_uuid' => $agentUuid,
            'api_key_hash' => Hash::make($rawToken),
            'secret_hash' => Hash::make(Str::random(32)),
            'is_active' => true,
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'server.registered',
            'auditable_type' => Server::class,
            'auditable_id' => $server->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'new_values' => ['name' => $server->name, 'environment' => $server->environment],
        ]);

        return redirect()->back()->with('flash', [
            'success' => "Server [{$server->name}] registered successfully.",
            'agent_credentials' => [
                'name' => $server->name,
                'token' => $rawToken,
                'agent_id' => $agentUuid,
            ],
        ]);
    }
}
