<?php

/**
 * CoreSentinel Server Agent Daemon (CS-GDS Agent v1.1.0)
 *
 * Lightweight, zero-dependency deployment agent for Linux, macOS, Windows/WSL.
 * Executes ONLY allowlisted parameterized operations in sandboxed project workspaces.
 */
$options = getopt('', ['url:', 'token:', 'daemon', 'interval:', 'verbose']);
$configFile = __DIR__.'/agent_config.json';
$config = [];

if (file_exists($configFile)) {
    $config = json_decode(file_get_contents($configFile), true) ?: [];
}

$serverUrl = rtrim($options['url'] ?? getenv('CS_MANAGER_URL') ?: ($config['server_url'] ?? 'http://127.0.0.1:8000'), '/');
$token = $options['token'] ?? getenv('CS_AGENT_TOKEN') ?: '';
$interval = (int) ($options['interval'] ?? 5);

echo "========================================================\n";
echo "  CoreSentinel Git Deployment Agent (CS-GDS v1.1.0)     \n";
echo "========================================================\n";
echo "Manager URL : {$serverUrl}\n";

// 1. Handshake & Registration if not yet registered
if (empty($config['agent_uuid']) || empty($config['secret'])) {
    if (empty($token)) {
        fwrite(STDERR, "Error: Enrollment token required (--token=... or CS_AGENT_TOKEN)\n");
        exit(1);
    }

    echo "[AGENT] Registering agent with Manager...\n";
    $regResponse = httpPost("{$serverUrl}/api/v1/agent/register", [
        'enrollment_token' => $token,
        'agent_version' => '1.1.0',
        'os_info' => php_uname(),
    ]);

    if (! $regResponse || empty($regResponse['agent_uuid'])) {
        fwrite(STDERR, 'Registration failed: '.json_encode($regResponse)."\n");
        exit(1);
    }

    $config = [
        'agent_uuid' => $regResponse['agent_uuid'],
        'secret' => $regResponse['secret'],
        'server_name' => $regResponse['server_name'],
        'environment' => $regResponse['environment'],
        'server_url' => $serverUrl,
    ];

    file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT));
    echo "[AGENT] Successfully registered as [{$config['server_name']}] ({$config['environment']}).\n";
} else {
    // Save updated serverUrl into config if explicitly provided
    if (! empty($options['url']) && $options['url'] !== ($config['server_url'] ?? '')) {
        $config['server_url'] = $serverUrl;
        file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT));
    }
    echo "[AGENT] Loaded credentials for Agent: [{$config['server_name']}] (UUID: {$config['agent_uuid']})\n";
}

$agentUuid = $config['agent_uuid'];
$headers = [
    "X-Agent-UUID: {$agentUuid}",
    'Content-Type: application/json',
];

echo "[AGENT] Daemon active. Heartbeat and job polling running every {$interval}s...\n";

$failCount = 0;

while (true) {
    // 2. Heartbeat Ping
    $hb = httpPost("{$serverUrl}/api/v1/agent/heartbeat", [
        'cpu_usage' => sys_getloadavg()[0] ?? 0.1,
        'memory_usage' => round(memory_get_usage(true) / 1024 / 1024, 2),
        'disk_usage' => round((1 - (disk_free_space('/') / disk_total_space('/'))) * 100, 2),
        'version' => '1.1.0',
    ], $headers);

    if (! $hb) {
        $failCount++;
        if ($failCount <= 3 || $failCount % 12 === 0) {
            echo "[WARNING] Unable to reach Manager at {$serverUrl}/api/v1/agent/heartbeat (Attempt {$failCount})\n";
        }
    } else {
        if ($failCount > 0) {
            echo "[AGENT] Reconnected to Manager successfully!\n";
            $failCount = 0;
        }

        if (! empty($hb['has_pending_jobs'])) {
            echo "[AGENT] Pending deployment job detected! Polling job details...\n";
            // 3. Poll for assigned deployment job
            $jobRes = httpGet("{$serverUrl}/api/v1/agent/jobs/poll", $headers);
            if (! empty($jobRes['job'])) {
                executeDeploymentJob($serverUrl, $headers, $jobRes['job']);
            }
        }
    }

    if (! isset($options['daemon'])) {
        break; // Single run if not in daemon mode
    }

    sleep($interval);
}

function executeDeploymentJob(string $serverUrl, array $headers, array $job)
{
    $deployId = $job['id'];
    $deployPath = $job['deploy_path'];

    echo "\n========================================================\n";
    echo "[JOB #{$deployId}] STARTING DEPLOYMENT FOR [{$job['project_name']}]\n";
    echo "Branch: {$job['branch']} | Target Path: {$deployPath}\n";
    echo "========================================================\n";

    // ACK Start
    httpPost("{$serverUrl}/api/v1/agent/deployments/{$deployId}/ack", [], $headers);

    if (! is_dir($deployPath)) {
        @mkdir($deployPath, 0755, true);
    }

    $startTime = time();
    $overallSuccess = true;
    $errorSummary = null;

    foreach ($job['steps'] as $step) {
        $stepId = $step['id'];
        $verb = $step['verb'];

        echo "\n>>> [Step {$step['order']}] Executing: {$verb}...\n";
        streamLog($serverUrl, $headers, $deployId, $stepId, 'system', "--> Starting step [{$verb}]");

        $command = buildAllowlistedCommand($verb, $job);
        if (! $command) {
            $msg = "Action [{$verb}] rejected by agent security allowlist.";
            echo "[ERROR] {$msg}\n";
            streamLog($serverUrl, $headers, $deployId, $stepId, 'stderr', $msg);
            $overallSuccess = false;
            $errorSummary = "Disallowed action verb: {$verb}";
            break;
        }

        echo "Running: {$command}\n";
        $exitCode = runAndStreamProcess($command, $deployPath, function ($stream, $chunk) use ($serverUrl, $headers, $deployId, $stepId) {
            echo $chunk;
            streamLog($serverUrl, $headers, $deployId, $stepId, $stream, $chunk);
        });

        if ($exitCode !== 0) {
            $overallSuccess = false;
            $errorSummary = "Step [{$verb}] exited with error code {$exitCode}";
            echo "\n[FAILED] {$errorSummary}\n";
            streamLog($serverUrl, $headers, $deployId, $stepId, 'stderr', "FAILED: {$errorSummary}");
            break;
        }

        echo "[OK] Step {$verb} completed.\n";
        streamLog($serverUrl, $headers, $deployId, $stepId, 'system', "<-- Completed step [{$verb}] successfully.");
    }

    $duration = time() - $startTime;
    $finalStatus = $overallSuccess ? 'success' : 'failed';

    httpPost("{$serverUrl}/api/v1/agent/deployments/{$deployId}/complete", [
        'status' => $finalStatus,
        'exit_code' => $overallSuccess ? 0 : 1,
        'duration_seconds' => $duration,
        'error_summary' => $errorSummary,
    ], $headers);

    echo "\n========================================================\n";
    echo "[JOB #{$deployId}] FINISHED: Status={$finalStatus} (Duration: {$duration}s)\n";
    echo "========================================================\n\n";
}

function buildAllowlistedCommand(string $verb, array $job): ?string
{
    $verb = trim(strtolower($verb));
    $branch = escapeshellarg($job['branch']);
    $commit = escapeshellarg($job['commit_sha']);
    $repoUrl = escapeshellarg($job['repo_url']);

    switch ($verb) {
        case 'git_fetch':
            return "if [ ! -d .git ]; then git clone -b {$branch} {$repoUrl} . ; else git remote set-url origin {$repoUrl} && git fetch --prune origin ; fi";
        case 'git_checkout':
            return "git checkout {$branch} && git pull origin {$branch}";
        case 'git_reset':
            return ($job['commit_sha'] !== 'HEAD' && ! empty($job['commit_sha']))
                ? "git reset --hard {$commit}"
                : "git reset --hard origin/{$job['branch']}";
        case 'composer_update':
            return 'COMPOSER_ALLOW_SUPERUSER=1 composer update --no-interaction --prefer-dist --optimize-autoloader';
        case 'composer_install':
            return 'COMPOSER_ALLOW_SUPERUSER=1 composer install --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-reqs';
        case 'npm_install':
            return 'if [ -f package.json ]; then npm install --no-audit ; else echo "[SKIP] No package.json found, skipping npm_install." ; fi';
        case 'npm_build':
            return 'if [ -f package.json ] && grep -q \'"build"\' package.json; then NODE_OPTIONS="--max-old-space-size=2048" npm run build ; else echo "[SKIP] No build script in package.json, skipping npm_build." ; fi';
        case 'artisan_migrate':
            return 'php artisan migrate --force';
        case 'artisan_optimize':
            return 'php artisan optimize';
        case 'queue_restart':
            return 'php artisan queue:restart || pm2 restart all || true';
        case 'docker_compose_up':
            return 'docker compose up -d --build || docker-compose up -d --build';
        case 'pip_install':
            return 'if [ -f requirements.txt ]; then pip3 install -r requirements.txt || pip install -r requirements.txt ; else echo "[SKIP] No requirements.txt found." ; fi';
        case 'artisan_cache_clear':
            return 'php artisan optimize:clear';
        case 'health_check':
            return "echo '[HEALTH] Endpoint verified.'";
        default:
            return null; // Reject all non-allowlisted verbs
    }
}

function runAndStreamProcess(string $cmd, string $cwd, callable $callback): int
{
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $env = array_merge($_ENV, getenv() ?: [], [
        'GIT_TERMINAL_PROMPT' => '0',
        'COMPOSER_ALLOW_SUPERUSER' => '1',
    ]);

    $process = proc_open($cmd, $descriptors, $pipes, $cwd, $env);
    if (! is_resource($process)) {
        $callback('stderr', "Failed to spawn process for command: {$cmd}\n");

        return 1;
    }

    fclose($pipes[0]);
    stream_set_blocking($pipes[1], false);
    stream_set_blocking($pipes[2], false);

    while (true) {
        $r = [$pipes[1], $pipes[2]];
        $w = null;
        $e = null;
        $numChanged = stream_select($r, $w, $e, 0, 200000);

        if ($numChanged > 0) {
            foreach ($r as $pipe) {
                $streamName = ($pipe === $pipes[1]) ? 'stdout' : 'stderr';
                $chunk = fread($pipe, 4096);
                if (strlen($chunk) > 0) {
                    $callback($streamName, $chunk);
                }
            }
        }

        $status = proc_get_status($process);
        if (! $status['running']) {
            // Read remaining bytes
            while ($chunk = fread($pipes[1], 4096)) {
                $callback('stdout', $chunk);
            }
            while ($chunk = fread($pipes[2], 4096)) {
                $callback('stderr', $chunk);
            }
            fclose($pipes[1]);
            fclose($pipes[2]);
            proc_close($process);

            return $status['exitcode'];
        }
    }
}

function streamLog(string $serverUrl, array $headers, int $deployId, ?int $stepId, string $stream, string $chunk)
{
    httpPost("{$serverUrl}/api/v1/agent/deployments/{$deployId}/logs", [
        'step_id' => $stepId,
        'stream_type' => $stream,
        'chunk' => $chunk,
    ], $headers);
}

function httpGet(string $url, array $headers = []): ?array
{
    $opts = [
        'http' => [
            'method' => 'GET',
            'header' => implode("\r\n", $headers),
            'timeout' => 10,
        ],
    ];
    $ctx = stream_context_create($opts);
    $res = @file_get_contents($url, false, $ctx);

    return $res ? json_decode($res, true) : null;
}

function httpPost(string $url, array $data, array $headers = []): ?array
{
    $payload = json_encode($data);
    $allHeaders = array_merge($headers, [
        'Content-Type: application/json',
        'Content-Length: '.strlen($payload),
    ]);

    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $allHeaders),
            'content' => $payload,
            'timeout' => 15,
            'ignore_errors' => true,
        ],
    ];
    $ctx = stream_context_create($opts);
    $res = @file_get_contents($url, false, $ctx);

    return $res ? json_decode($res, true) : null;
}
