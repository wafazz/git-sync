<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class GitRepository extends Model
{
    protected $fillable = [
        'provider_id',
        'name',
        'repo_url',
        'owner_org',
        'default_branch',
        'auth_type',
        'credential_id',
        'is_active',
    ];

    public function provider(): BelongsTo
    {
        return $this->belongsTo(GitProvider::class, 'provider_id');
    }

    public function credential(): BelongsTo
    {
        return $this->belongsTo(GitCredential::class, 'credential_id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'repository_id');
    }

    public function webhook(): HasOne
    {
        return $this->hasOne(Webhook::class, 'repository_id');
    }
}
