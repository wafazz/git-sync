<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServerHeartbeat extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'server_id',
        'cpu_usage',
        'memory_usage',
        'disk_usage',
        'reported_version',
        'recorded_at',
    ];

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }
}
