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

    public function update(Request $request, Server $server): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'environment' => 'required|in:development,testing,staging,production',
            'os_type' => 'required|in:linux_ubuntu,linux_debian,linux_rhel,windows_wsl,windows_native,other',
            'hostname' => 'nullable|string|max:255',
            'ip_address' => 'nullable|string|max:45',
            'status' => 'nullable|in:online,offline,busy,error',
        ]);

        $oldValues = $server->only(['name', 'environment', 'os_type', 'hostname', 'ip_address', 'status']);
        $server->update($validated);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'server.updated',
            'auditable_type' => Server::class,
            'auditable_id' => $server->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'old_values' => $oldValues,
            'new_values' => $validated,
        ]);

        return redirect()->back()->with('flash', [
            'success' => "Server [{$server->name}] updated successfully.",
        ]);
    }

    public function regenerateToken(Server $server): RedirectResponse
    {
        $rawToken = 'cs_agent_'.Str::random(40);

        if ($server->agent) {
            $server->agent->update([
                'api_key_hash' => Hash::make($rawToken),
            ]);
        } else {
            $agentUuid = (string) Str::uuid();
            ServerAgent::create([
                'server_id' => $server->id,
                'agent_uuid' => $agentUuid,
                'api_key_hash' => Hash::make($rawToken),
                'secret_hash' => Hash::make(Str::random(32)),
                'is_active' => true,
            ]);
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'server.token_regenerated',
            'auditable_type' => Server::class,
            'auditable_id' => $server->id,
            'ip_address' => request()->ip() ?? '127.0.0.1',
        ]);

        return redirect()->back()->with('flash', [
            'success' => "New enrollment token generated for [{$server->name}].",
            'agent_credentials' => [
                'name' => $server->name,
                'token' => $rawToken,
                'agent_id' => $server->agent ? $server->agent->agent_uuid : '',
            ],
        ]);
    }

    public function destroy(Server $server): RedirectResponse
    {
        if ($server->projects()->exists()) {
            return redirect()->back()->with('flash', [
                'error' => "Cannot delete server [{$server->name}] because it is currently assigned to active projects.",
            ]);
        }

        $serverName = $server->name;
        $server->delete();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'server.deleted',
            'auditable_type' => Server::class,
            'auditable_id' => $server->id,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'old_values' => ['name' => $serverName],
        ]);

        return redirect()->back()->with('flash', [
            'success' => "Server [{$serverName}] removed successfully.",
        ]);
    }
}
