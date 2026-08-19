<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'repository_id',
        'server_id',
        'deployment_profile_id',
        'target_branch',
        'environment',
        'deploy_path',
        'health_check_url',
        'auto_deploy_on_push',
        'requires_approval',
        'is_locked',
    ];

    protected function casts(): array
    {
        return [
            'auto_deploy_on_push' => 'boolean',
            'requires_approval' => 'boolean',
            'is_locked' => 'boolean',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function repository(): BelongsTo
    {
        return $this->belongsTo(GitRepository::class, 'repository_id');
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class, 'server_id');
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(DeploymentProfile::class, 'deployment_profile_id');
    }

    public function deployments(): HasMany
    {
        return $this->hasMany(Deployment::class, 'project_id');
    }

    public function latestDeployment(): HasOne
    {
        return $this->hasOne(Deployment::class, 'project_id')->latestOfMany();
    }
}
