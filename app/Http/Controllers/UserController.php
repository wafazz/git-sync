<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        // Auto-provision standard roles & permissions if table is empty
        if (Role::count() === 0) {
            (new RolesAndPermissionsSeeder)->run();
        }

        $users = User::with('roles')
            ->latest()
            ->get();

        $roles = Role::with('permissions')->get();
        $permissions = Permission::all()->groupBy('category');

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role_ids' => 'required|array|min:1',
            'role_ids.*' => 'exists:roles,id',
            'status' => 'required|in:active,suspended,pending_activation,deactivated',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'],
        ]);

        $user->roles()->sync($validated['role_ids']);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'user.registered',
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'new_values' => [
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'roles' => $user->roles->pluck('name'),
            ],
        ]);

        return redirect()->back()->with('flash', [
            'success' => "User [{$user->name}] registered successfully.",
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
            'role_ids' => 'required|array|min:1',
            'role_ids.*' => 'exists:roles,id',
            'status' => 'required|in:active,suspended,pending_activation,deactivated',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'status' => $validated['status'],
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);
        $user->roles()->sync($validated['role_ids']);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'user.updated',
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'new_values' => [
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'roles' => $user->roles->pluck('name'),
            ],
        ]);

        return redirect()->back()->with('flash', [
            'success' => "User [{$user->name}] updated successfully.",
        ]);
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('flash', [
                'error' => 'You cannot delete your own active account.',
            ]);
        }

        $name = $user->name;
        $user->roles()->detach();
        $user->delete();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'user.deleted',
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'old_values' => ['name' => $name],
        ]);

        return redirect()->back()->with('flash', [
            'success' => "User [{$name}] removed successfully.",
        ]);
    }

    public function updateRolePermissions(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'permission_ids' => 'array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($validated['permission_ids'] ?? []);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'rbac.permissions_updated',
            'auditable_type' => Role::class,
            'auditable_id' => $role->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'new_values' => [
                'role' => $role->name,
                'permission_count' => count($validated['permission_ids'] ?? []),
            ],
        ]);

        return redirect()->back()->with('flash', [
            'success' => "Permissions for role [{$role->display_name}] updated successfully.",
        ]);
    }
}
