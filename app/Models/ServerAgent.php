<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServerAgent extends Model
{
    protected $fillable = [
        'server_id',
        'agent_uuid',
        'agent_version',
        'api_key_hash',
        'secret_hash',
        'public_key',
        'is_active',
        'last_ip',
    ];

    protected $hidden = [
        'secret_hash',
        'api_key_hash',
    ];

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }
}
