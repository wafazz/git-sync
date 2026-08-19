<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Deployment extends Model
{
    protected $fillable = [
        'uuid',
        'project_id',
        'server_id',
        'triggered_by_user_id',
        'trigger_source',
        'commit_sha',
        'commit_message',
        'commit_author',
        'branch',
        'status',
        'started_at',
        'completed_at',
        'duration_seconds',
        'error_summary',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class, 'server_id');
    }

    public function triggeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by_user_id');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(DeploymentStep::class, 'deployment_id')->orderBy('step_order');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(DeploymentLog::class, 'deployment_id')->orderBy('sequence_number');
    }

    public function approval(): HasOne
    {
        return $this->hasOne(DeploymentApproval::class, 'deployment_id');
    }

    public function healthCheck(): HasOne
    {
        return $this->hasOne(HealthCheck::class, 'deployment_id');
    }
}
