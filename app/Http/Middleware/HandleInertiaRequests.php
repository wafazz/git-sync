<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                ] : null,
                'permissions' => $user ? $user->roles->flatMap->permissions->pluck('name')->unique()->values()->all() : [],
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('flash.success') ?? $request->session()->get('success'),
                'error' => fn () => $request->session()->get('flash.error') ?? $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('flash.warning') ?? $request->session()->get('warning'),
                'agent_credentials' => fn () => $request->session()->get('flash.agent_credentials'),
            ],
            'url' => $request->getRequestUri(),
        ];
    }
}
