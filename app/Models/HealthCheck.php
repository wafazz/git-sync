<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthCheck extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'deployment_id',
        'target_url',
        'http_status',
        'response_time_ms',
        'status',
        'response_body_snippet',
        'checked_at',
    ];

    public function deployment(): BelongsTo
    {
        return $this->belongsTo(Deployment::class);
    }
}
