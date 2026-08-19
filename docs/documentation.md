# System Documentation: CoreSentinel Git Deployment Synchronizer (CS-GDS)

> **Status**: Active | **Last Updated**: 2026-08-20 | **Maintainer**: Iris / Fakrul

---

## 1. Overview & Purpose
The **Git Deployment Synchronizer (CS-GDS)** is a centralized orchestration and governance platform designed to synchronize and deploy source code from Git repositories (GitHub, GitLab, Gitea, Custom Git) to distributed remote servers without requiring direct, unmonitored SSH access.

It connects to lightweight local agents on target servers (Linux, Windows/WSL) via an authenticated outbound polling/streaming REST protocol and dispatches allowlisted parameterized actions (`git_checkout`, `composer_install`, `npm_build`, `artisan_migrate`, `health_check`).

---

## 2. Architecture & Directory Structure
| Directory / File | Type | Purpose & Responsibility |
|---|---|---|
| `app/Models/` | Models | Eloquent entities: Server, Agent, GitRepo, Project, Deployment, AuditLog, Approval |
| `app/Http/Controllers/` | Controllers | Inertia Web UI and REST API controllers |
| `app/Services/DeploymentEngine.php` | Service | Core lifecycle, Redis locking, approval gating, step execution |
| `app/Services/LogSanitizer.php` | Service | Multi-pass regex masking of tokens, passwords, and private keys |
| `app/Http/Controllers/Api/AgentApiController.php` | API Controller | Server Agent REST API (Handshake, Heartbeat, Poll, Complete) |
| `app/Http/Controllers/Api/WebhookApiController.php` | API Controller | Inbound Webhook deduplication & auto-deploy triggers |
| `agent/agent.php` | Daemon Script | Standalone lightweight agent daemon for target servers |
| `resources/js/` | Frontend | React + TypeScript + Bootstrap Inertia SPA layout & interactive views |
| `routes/` | Routes | `web.php` (Inertia UI routes) and `api.php` (Agent & Webhook routes) |
| `docs/` | Documentation | Master architecture and module references |
| `Planning.md` | Governance | Approved system specifications and traceability matrix |
| `session-memory.md` | CoreSentinel | Active memory and task status |

---

## 3. Interfaces & API Contracts

### Agent REST API (`/api/v1/agent/*`)
- `POST /api/v1/agent/register`: One-time enrollment token handshake -> returns `agent_uuid` and shared secret.
- `POST /api/v1/agent/heartbeat`: Telemetry ping (CPU, RAM, Disk, Status).
- `GET /api/v1/agent/jobs/poll`: Pull assigned deployment jobs with allowlisted parameters.
- `POST /api/v1/agent/deployments/{id}/ack`: Acknowledge job start (`status: running`).
- `POST /api/v1/agent/deployments/{id}/logs`: Stream real-time stdout/stderr chunks.
- `POST /api/v1/agent/deployments/{id}/complete`: Finalize deployment status (`success` or `failed`).

### Webhook API (`/api/v1/webhooks/*`)
- `POST /api/v1/webhooks/github`: HMAC-SHA256 verified GitHub push events with 24-hour deduplication.

---

## 4. Configuration & Dependencies
- **Runtime:** PHP 8.4+, Node.js 20+
- **Framework:** Laravel 12.x, Inertia.js v2, React 18, TypeScript 5, Bootstrap 5.3
- **Storage & Caching:** MySQL / SQLite, Redis 7.x
- **Seeded Admin Account:** `admin@coresentinel.local` / `password`

---

## 5. Change History & Log
| Date | Change Summary | Impacted Files | Author / Ref |
|---|---|---|---|
| 2026-08-20 | Project initialized & Planning.md approved | `Planning.md`, `session-memory.md` | Iris (`[Phase 0]`) |
| 2026-08-20 | Full Laravel 12 + Inertia React Stack built | `app/*`, `resources/*`, `routes/*` | Iris (`[Phase 1-6]`) |
| 2026-08-20 | CoreSentinel 6-point verification verified (100/100) | `tests/*`, `agent/agent.php` | Iris (`[VERIFIED]`) |
