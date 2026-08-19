<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Server extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'environment',
        'os_type',
        'hostname',
        'ip_address',
        'status',
        'last_heartbeat_at',
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

    public function agent(): HasOne
    {
        return $this->hasOne(ServerAgent::class);
    }

    public function heartbeats(): HasMany
    {
        return $this->hasMany(ServerHeartbeat::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function deployments(): HasMany
    {
        return $this->hasMany(Deployment::class);
    }
}
