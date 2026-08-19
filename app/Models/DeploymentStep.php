<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeploymentStep extends Model
{
    protected $fillable = [
        'deployment_id',
        'step_order',
        'action_verb',
        'status',
        'exit_code',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function deployment(): BelongsTo
    {
        return $this->belongsTo(Deployment::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(DeploymentLog::class, 'deployment_step_id');
    }
}
