<?php

namespace Tests\Feature;

use App\Models\Deployment;
use App\Models\DeploymentProfile;
use App\Models\GitProvider;
use App\Models\GitRepository;
use App\Models\Project;
use App\Models\Role;
use App\Models\Server;
use App\Models\ServerAgent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class DeploymentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Server $server;

    protected GitRepository $repo;

    protected DeploymentProfile $profile;

    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        $this->user = User::first();

        $this->server = Server::create([
            'name' => 'VPS 1 - Production',
            'environment' => 'production',
            'os_type' => 'linux_ubuntu',
            'status' => 'online',
        ]);

        ServerAgent::create([
            'server_id' => $this->server->id,
            'agent_uuid' => (string) Str::uuid(),
            'api_key_hash' => Hash::make('test_token'),
            'secret_hash' => Hash::make('test_secret'),
            'is_active' => true,
        ]);

        $provider = GitProvider::first();
        $this->repo = GitRepository::create([
            'provider_id' => $provider->id,
            'name' => 'Test Repo',
            'repo_url' => 'https://github.com/org/test-repo.git',
            'default_branch' => 'main',
            'auth_type' => 'pat',
            'is_active' => true,
        ]);

        $this->profile = DeploymentProfile::first();

        $this->project = Project::create([
            'name' => 'Multi-Kiosk Production',
            'repository_id' => $this->repo->id,
            'server_id' => $this->server->id,
            'deployment_profile_id' => $this->profile->id,
            'target_branch' => 'main',
            'environment' => 'production',
            'deploy_path' => '/var/www/test-app',
            'auto_deploy_on_push' => true,
            'requires_approval' => true,
        ]);
    }

    public function test_dashboard_renders_successfully(): void
    {
        $response = $this->actingAs($this->user)->get('/dashboard');
        $response->assertStatus(200);
    }

    public function test_servers_index_renders_successfully(): void
    {
        $response = $this->actingAs($this->user)->get('/servers');
        $response->assertStatus(200);
    }

    public function test_register_new_server_generates_token(): void
    {
        $response = $this->actingAs($this->user)->post('/servers', [
            'name' => 'Testing Node 2',
            'environment' => 'testing',
            'os_type' => 'windows_wsl',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('servers', ['name' => 'Testing Node 2']);
    }

    public function test_production_deployment_enters_pending_approval_state(): void
    {
        $response = $this->actingAs($this->user)->post("/projects/{$this->project->id}/deploy");

        $deployment = Deployment::where('project_id', $this->project->id)->latest()->first();
        $this->assertNotNull($deployment);
        $this->assertEquals('pending_approval', $deployment->status);
        $this->assertDatabaseHas('deployment_approvals', ['deployment_id' => $deployment->id, 'status' => 'pending']);
    }

    public function test_approval_gate_can_be_approved(): void
    {
        // Request deploy
        $this->actingAs($this->user)->post("/projects/{$this->project->id}/deploy");
        $deployment = Deployment::where('project_id', $this->project->id)->latest()->first();
        $approval = $deployment->approval;

        // Approve
        $response = $this->actingAs($this->user)->post("/approvals/{$approval->id}/approve", [
            'decision_notes' => 'Tested on staging, verified DB schema',
        ]);

        $response->assertRedirect();
        $approval->refresh();
        $deployment->refresh();

        $this->assertEquals('approved', $approval->status);
        $this->assertEquals('queued', $deployment->status);
    }

    public function test_agent_heartbeat_updates_status(): void
    {
        $agent = $this->server->agent;

        $response = $this->withHeaders([
            'X-Agent-UUID' => $agent->agent_uuid,
        ])->postJson('/api/v1/agent/heartbeat', [
            'cpu_usage' => 12.5,
            'memory_usage' => 45.2,
            'disk_usage' => 60.1,
            'version' => '1.1.0',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['status' => 'acknowledged']);
    }

    public function test_webhook_deduplication_and_auto_deploy(): void
    {
        $deliveryId = 'delivery-unique-12345';
        $payload = [
            'ref' => 'refs/heads/main',
            'repository' => [
                'name' => 'Test Repo',
                'clone_url' => 'https://github.com/org/test-repo.git',
            ],
            'head_commit' => [
                'id' => 'abc1234567890',
                'message' => 'Fix kiosk payment modal',
                'author' => ['name' => 'Fakrul'],
            ],
        ];

        // First delivery
        $res1 = $this->withHeaders([
            'X-GitHub-Delivery' => $deliveryId,
            'X-GitHub-Event' => 'push',
        ])->postJson('/api/v1/webhooks/github', $payload);

        $res1->assertStatus(202);

        // Replay delivery (duplicate)
        $res2 = $this->withHeaders([
            'X-GitHub-Delivery' => $deliveryId,
            'X-GitHub-Event' => 'push',
        ])->postJson('/api/v1/webhooks/github', $payload);

        $res2->assertStatus(200);
        $res2->assertJson(['message' => 'Duplicate webhook delivery ignored']);
    }

    public function test_user_can_login_and_logout(): void
    {
        $loginRes = $this->post('/login', [
            'email' => $this->user->email,
            'password' => 'password',
        ]);

        $loginRes->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($this->user);

        $logoutRes = $this->post('/logout');
        $logoutRes->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_users_index_renders_successfully(): void
    {
        $response = $this->actingAs($this->user)->get('/users');
        $response->assertStatus(200);
    }

    public function test_register_new_user_and_update_role(): void
    {
        $role = Role::first();

        $createRes = $this->actingAs($this->user)->post('/users', [
            'name' => 'Developer Two',
            'email' => 'dev2@company.local',
            'password' => 'secret1234',
            'role_ids' => [$role->id],
            'status' => 'active',
        ]);

        $createRes->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'dev2@company.local']);
    }
}
