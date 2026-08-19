<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeploymentProfileStep extends Model
{
    protected $fillable = [
        'profile_id',
        'step_order',
        'action_verb',
        'parameters',
        'timeout_seconds',
        'allow_failure',
    ];

    protected function casts(): array
    {
        return [
            'parameters' => 'array',
            'allow_failure' => 'boolean',
        ];
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(DeploymentProfile::class, 'profile_id');
    }
}
