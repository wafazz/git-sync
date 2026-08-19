<?php

namespace App\Http\Controllers;

use App\Models\Deployment;
use App\Models\DeploymentApproval;
use App\Models\Project;
use App\Models\Server;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $serversTotal = Server::count();
        $serversOnline = Server::where('status', 'online')->count();
        $projectsCount = Project::count();
        $runningDeployments = Deployment::whereIn('status', ['running', 'queued', 'health_check'])->count();
        $pendingApprovalsCount = DeploymentApproval::where('status', 'pending')->count();

        $recentDeployments = Deployment::with(['project.repository', 'server', 'triggeredBy'])
            ->latest()
            ->take(10)
            ->get();

        $pendingApprovals = DeploymentApproval::with(['deployment.project', 'deployment.server', 'requestedBy'])
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get();

        $servers = Server::with(['agent'])
            ->withCount('projects')
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'servers_online' => $serversOnline,
                'servers_total' => $serversTotal,
                'projects_count' => $projectsCount,
                'running_deployments' => $runningDeployments,
                'pending_approvals' => $pendingApprovalsCount,
            ],
            'recent_deployments' => $recentDeployments,
            'pending_approvals' => $pendingApprovals,
            'servers' => $servers,
        ]);
    }
}
