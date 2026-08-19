<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class GitCredential extends Model
{
    protected $fillable = [
        'name',
        'auth_type',
        'encrypted_payload',
        'fingerprint',
        'expires_at',
        'created_by',
    ];

    protected $hidden = [
        'encrypted_payload',
    ];

    public function setEncryptedPayloadAttribute($value)
    {
        $this->attributes['encrypted_payload'] = Crypt::encryptString($value);
    }

    public function getDecryptedPayloadAttribute(): ?string
    {
        if (empty($this->attributes['encrypted_payload'])) {
            return null;
        }
        try {
            return Crypt::decryptString($this->attributes['encrypted_payload']);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function repositories(): HasMany
    {
        return $this->hasMany(GitRepository::class, 'credential_id');
    }
}
