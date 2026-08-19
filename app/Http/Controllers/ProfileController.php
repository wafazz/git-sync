<?php

namespace App\Http\Controllers;

use App\Models\DeploymentProfile;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        $profiles = DeploymentProfile::with('steps')
            ->get();

        return Inertia::render('Profiles/Index', [
            'profiles' => $profiles,
        ]);
    }
}
