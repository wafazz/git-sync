<?php

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeploymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RepositoryController;
use App\Http\Controllers\ServerController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

// Authentication Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Protected Routes
Route::middleware('auth')->group(function () {
    Route::get('/', function () {
        return redirect()->route('dashboard');
    });

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Servers Management
    Route::get('/servers', [ServerController::class, 'index'])->name('servers.index');
    Route::post('/servers', [ServerController::class, 'store'])->name('servers.store');
    Route::put('/servers/{server}', [ServerController::class, 'update'])->name('servers.update');
    Route::post('/servers/{server}/regenerate-token', [ServerController::class, 'regenerateToken'])->name('servers.regenerate_token');
    Route::delete('/servers/{server}', [ServerController::class, 'destroy'])->name('servers.destroy');

    // Repositories Management
    Route::get('/repositories', [RepositoryController::class, 'index'])->name('repositories.index');
    Route::post('/repositories', [RepositoryController::class, 'store'])->name('repositories.store');
    Route::put('/repositories/{repository}', [RepositoryController::class, 'update'])->name('repositories.update');
    Route::delete('/repositories/{repository}', [RepositoryController::class, 'destroy'])->name('repositories.destroy');

    // Projects Management
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::post('/projects/{project}/deploy', [ProjectController::class, 'triggerDeploy'])->name('projects.deploy');

    // Deployment Profiles
    Route::get('/profiles', [ProfileController::class, 'index'])->name('profiles.index');
    Route::post('/profiles', [ProfileController::class, 'store'])->name('profiles.store');
    Route::delete('/profiles/{profile}', [ProfileController::class, 'destroy'])->name('profiles.destroy');

    // Deployments History & Live Console
    Route::get('/deployments', [DeploymentController::class, 'index'])->name('deployments.index');
    Route::get('/deployments/{deployment}', [DeploymentController::class, 'show'])->name('deployments.show');
    Route::get('/deployments/{deployment}/stream', [DeploymentController::class, 'stream'])->name('deployments.stream');
    Route::post('/deployments/{deployment}/retry', [DeploymentController::class, 'retry'])->name('deployments.retry');
    Route::post('/deployments/{deployment}/rollback', [DeploymentController::class, 'rollback'])->name('deployments.rollback');

    // CoreSentinel Approval Gates
    Route::get('/approvals', [ApprovalController::class, 'index'])->name('approvals.index');
    Route::post('/approvals/{approval}/approve', [ApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('/approvals/{approval}/reject', [ApprovalController::class, 'reject'])->name('approvals.reject');

    // Immutable Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit_logs.index');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
});
