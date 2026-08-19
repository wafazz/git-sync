<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(): Response
    {
        $auditLogs = AuditLog::with('user')
            ->latest('id')
            ->take(50)
            ->get();

        return Inertia::render('AuditLogs/Index', [
            'audit_logs' => $auditLogs,
        ]);
    }
}
