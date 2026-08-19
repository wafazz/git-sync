<?php

namespace App\Services;

class LogSanitizer
{
    protected static array $patterns = [
        '/(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]+)/i' => '[REDACTED_GITHUB_TOKEN]',
        '/((?:api|access|auth)[_-]key\s*[:=]\s*)[\'"][^\'"]+[\'"]/i' => '$1[REDACTED_API_KEY]',
        '/(-----BEGIN [A-Z ]+ PRIVATE KEY-----[^-]+-----END [A-Z ]+ PRIVATE KEY-----)/s' => '[REDACTED_PRIVATE_KEY]',
        '/(DB_PASSWORD\s*=\s*)([^\r\n]+)/i' => '$1[REDACTED_DB_PASSWORD]',
        '/(https?:\/\/)([^:]+):([^@]+)@/i' => '$1$2:[REDACTED_AUTH]@',
    ];

    public static function sanitize(string $log): string
    {
        foreach (self::$patterns as $pattern => $replacement) {
            $log = preg_replace($pattern, $replacement, $log) ?? $log;
        }

        return $log;
    }
}
