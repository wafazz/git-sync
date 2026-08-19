<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeploymentProfile extends Model
{
    protected $fillable = [
        'name',
        'framework',
        'description',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(DeploymentProfileStep::class, 'profile_id')->orderBy('step_order');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'deployment_profile_id');
    }
}
