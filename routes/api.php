<?php

use App\Http\Controllers\Api\AgentApiController;
use App\Http\Controllers\Api\WebhookApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Target Server Agent Endpoints
    Route::prefix('agent')->group(function () {
        Route::post('/register', [AgentApiController::class, 'register']);
        Route::post('/heartbeat', [AgentApiController::class, 'heartbeat']);
        Route::get('/jobs/poll', [AgentApiController::class, 'pollJobs']);
        Route::post('/deployments/{deployment}/ack', [AgentApiController::class, 'ackJob']);
        Route::post('/deployments/{deployment}/logs', [AgentApiController::class, 'appendLogs']);
        Route::post('/deployments/{deployment}/complete', [AgentApiController::class, 'completeJob']);
    });

    // Git Provider Webhooks
    Route::prefix('webhooks')->group(function () {
        Route::post('/github', [WebhookApiController::class, 'handleGithub']);
    });
});
