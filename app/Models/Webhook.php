<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Webhook extends Model
{
    protected $fillable = [
        'uuid',
        'repository_id',
        'secret_hash',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
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

    public function repository(): BelongsTo
    {
        return $this->belongsTo(GitRepository::class, 'repository_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(WebhookEvent::class);
    }
}
