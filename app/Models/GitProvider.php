<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GitProvider extends Model
{
    protected $fillable = [
        'name',
        'provider_type',
        'base_url',
    ];

    public function repositories(): HasMany
    {
        return $this->hasMany(GitRepository::class, 'provider_id');
    }
}
