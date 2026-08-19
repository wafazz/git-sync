# System Documentation: CoreSentinel Git Deployment Synchronizer (CS-GDS)

> **Status**: Active | **Last Updated**: 2026-08-20 | **Maintainer**: Iris / Fakrul

---

## 1. Overview & Purpose
The **Git Deployment Synchronizer (CS-GDS)** is a centralized orchestration and governance platform designed to synchronize and deploy source code from Git repositories to distributed remote servers without requiring direct, unmonitored SSH access.

It connects to lightweight local agents on target servers (Linux, Windows/WSL) via an authenticated outbound polling/streaming REST protocol and dispatches allowlisted parameterized actions (`git_checkout`, `composer_install`, `npm_build`, `artisan_migrate`, `health_check`).

---

## 2. Architecture & Directory Structure
| Directory / File | Type | Purpose & Responsibility |
|---|---|---|
| `app/Models/` | Models | Eloquent entities: Server, Agent, GitRepo, Project, Deployment, AuditLog |
| `app/Http/Controllers/` | Controllers | Inertia Web UI and REST API controllers |
| `app/Services/` | Services | Core business engines: DeploymentEngine, WebhookHandler, LogSanitizer |
| `app/Jobs/` | Queue Jobs | Redis async workers: ProcessDeploymentJob, WebhookEventJob, HealthCheckJob |
| `resources/js/` | Frontend | React + TypeScript Inertia components, views & layout |
| `routes/` | Routes | `web.php` (Inertia routes) and `api.php` (Agent & Webhook routes) |
| `docs/` | Documentation | Master architecture and module references |
| `Planning.md` | Governance | Approved system specifications and traceability matrix |
| `session-memory.md` | CoreSentinel | Active memory and task status |

---

## 3. Interfaces & API Contracts

### Agent REST API (`/api/v1/agent/*`)
- `POST /api/v1/agent/register`: One-time token handshake.
- `POST /api/v1/agent/heartbeat`: Telemetry ping (CPU, RAM, Disk, Status).
- `GET /api/v1/agent/jobs/poll`: Pull assigned deployment jobs.
- `POST /api/v1/agent/deployments/{id}/ack`: Acknowledge job start.
- `POST /api/v1/agent/deployments/{id}/logs`: Stream stdout/stderr chunks.
- `POST /api/v1/agent/deployments/{id}/complete`: Finalize deployment status.

### Webhook API (`/api/v1/webhooks/*`)
- `POST /api/v1/webhooks/github`: HMAC-SHA256 verified GitHub push/release events.

---

## 4. Configuration & Dependencies
- **Runtime:** PHP 8.2+ / 8.4+, Node.js 20+
- **Framework:** Laravel 12.x, Inertia.js React, TypeScript, Bootstrap 5.3
- **Storage & Caching:** MySQL 8.0+, Redis 7.x

---

## 5. Change History & Log
| Date | Change Summary | Impacted Files | Author / Ref |
|---|---|---|---|
| 2026-08-20 | Project initialized & Planning.md approved | `Planning.md`, `session-memory.md`, `docs/documentation.md` | Iris (`[REQ-001 - REQ-014]`) |
