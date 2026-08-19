<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeploymentLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'deployment_id',
        'deployment_step_id',
        'stream_type',
        'sequence_number',
        'log_content',
        'created_at',
    ];

    public function deployment(): BelongsTo
    {
        return $this->belongsTo(Deployment::class);
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(DeploymentStep::class, 'deployment_step_id');
    }
}
