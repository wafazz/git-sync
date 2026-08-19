<?php

namespace App\Http\Controllers;

use App\Models\DeploymentApproval;
use App\Services\DeploymentEngine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    public function index(): Response
    {
        $approvals = DeploymentApproval::with([
            'deployment.project.repository',
            'deployment.server',
            'requestedBy',
            'approvedBy',
        ])
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('Approvals/Index', [
            'approvals' => $approvals,
        ]);
    }

    public function approve(Request $request, DeploymentApproval $approval, DeploymentEngine $engine): RedirectResponse
    {
        $notes = $request->input('decision_notes');
        $engine->approveDeployment($approval, auth()->user(), $notes);

        return redirect()->back()->with('flash', [
            'success' => "Deployment #{$approval->deployment_id} approved and dispatched to execution queue.",
        ]);
    }

    public function reject(Request $request, DeploymentApproval $approval, DeploymentEngine $engine): RedirectResponse
    {
        $notes = $request->input('decision_notes');
        $engine->rejectDeployment($approval, auth()->user(), $notes);

        return redirect()->back()->with('flash', [
            'warning' => "Deployment #{$approval->deployment_id} rejected.",
        ]);
    }
}
