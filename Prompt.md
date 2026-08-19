CoreSentinel Task: Git Deployment Synchronizer

GOVERNANCE — MANDATORY

You are operating under the CoreSentinel Protocol.

This task is PLANNING ONLY.

Absolute rules

1. DO NOT execute implementation.
2. DO NOT create application source code.
3. DO NOT modify existing application files.
4. DO NOT run migrations.
5. DO NOT create or modify databases.
6. DO NOT install packages or dependencies.
7. DO NOT run deployment commands.
8. DO NOT create GitHub webhooks yet.
9. DO NOT create server agents yet.
10. DO NOT connect to production/testing servers yet.
11. DO NOT execute shell commands that change system state.
12. DO NOT assume missing requirements.
13. DO NOT hallucinate infrastructure, credentials, repositories, domains, servers, APIs, or configuration.
14. If information is unknown, explicitly mark it as UNKNOWN, TBD, or REQUIRES USER INPUT.
15. Do not silently make architectural decisions that materially affect security, deployment, data integrity, or infrastructure.
16. Do not interpret this request as approval to build the system.

Your first and only deliverable at this stage is:

Planning.md

The plan must be traceable, reviewable, auditable, and implementation-ready, but it must NOT implement anything.

⸻

1. SYSTEM OBJECTIVE

Design a web application that acts as a centralized Git Deployment / Synchronization Manager.

The purpose is to allow authorized users to synchronize/deploy projects from Git repositories to registered testing/staging/production servers without manually SSH-ing into each server and running git pull.

The system should eventually support:

* Multiple Git repositories
* Multiple branches
* Multiple servers
* Multiple projects
* Private GitHub repositories
* Testing/staging/production environments
* Server agents
* Git synchronization
* Deployment execution
* Deployment history
* Deployment logs
* Deployment status
* Health checks
* Deployment approvals
* Role-based access
* Audit trail
* Failure handling
* Rollback planning
* CoreSentinel governance

The system must be designed with a security-first and traceability-first architecture.

⸻

2. IMPORTANT ARCHITECTURAL DIRECTION

Do NOT design the system around the central web application directly SSH-ing into every server unless there is a documented reason and explicit approval.

The preferred architecture is:

                    Git Provider
                        │
                        │ Webhook / API
                        ▼
              ┌─────────────────────┐
              │ Deployment Manager  │
              │ Laravel Application │
              └──────────┬──────────┘
                         │
                  Authenticated API
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    Server Agent     Server Agent    Server Agent
       VPS 1           VPS 2        Windows/WSL
          │              │              │
          ▼              ▼              ▼
      Projects        Projects        Projects

The server agent should be considered a lightweight component responsible for executing approved deployment actions locally on the target server.

The central application should orchestrate and govern deployments rather than blindly executing arbitrary commands against remote machines.

⸻

3. TECH STACK

The entire central application must use:

* Laravel 12
* PHP version compatible with Laravel 12
* TypeScript
* React
* Inertia.js
* Redis
* Bootstrap
* Responsive Admin Template
* MySQL

Do not introduce another frontend framework unless explicitly approved.

Do not introduce Vue.js.

Do not introduce Next.js.

Do not introduce unnecessary microservices.

The system should initially remain a single Laravel application.

Redis should be considered for:

* queues
* deployment jobs
* caching
* temporary state
* job status
* real-time deployment events where appropriate
* rate limiting where appropriate

⸻

4. PLANNING.md REQUIREMENTS

Create ONLY:

Planning.md

The document must contain sufficient detail for another developer or AI agent to understand exactly what is intended without guessing.

The document must include:

4.1 Document metadata

Include:

* Project name
* Purpose
* Document version
* Date
* Status
* Author
* Governance status
* Approval authority
* Change history

Use:

STATUS: PLANNING ONLY — NOT APPROVED FOR EXECUTION

⸻

5. TRACEABILITY MODEL

Every major requirement must have a unique identifier.

Use IDs such as:

REQ-001
REQ-002
REQ-003

Architecture decisions:

ADR-001
ADR-002
ADR-003

Security requirements:

SEC-001
SEC-002
SEC-003

Deployment requirements:

DEP-001
DEP-002
DEP-003

Database requirements:

DB-001
DB-002
DB-003

UI requirements:

UI-001
UI-002
UI-003

Agent requirements:

AGENT-001
AGENT-002
AGENT-003

Testing requirements:

TEST-001
TEST-002
TEST-003

Operational requirements:

OPS-001
OPS-002
OPS-003

Every important feature should be traceable to one or more requirement IDs.

⸻

6. FUNCTIONAL REQUIREMENTS

Plan the following capabilities.

6.1 Authentication

Plan:

* User authentication
* Session management
* Password security
* Logout
* Optional 2FA
* Login attempt protection
* Account status

Do not assume the authentication package or implementation unless documented.

⸻

7. ROLE-BASED ACCESS CONTROL

Plan roles such as:

Super Admin
Admin
Developer
Deployment Operator
Viewer
Auditor

Permissions should be granular.

Examples:

server.view
server.create
server.update
server.delete
project.view
project.create
project.update
project.delete
deployment.view
deployment.create
deployment.cancel
deployment.retry
deployment.production
deployment.rollback
approval.view
approval.approve
approval.reject
audit.view

Do not allow users to automatically receive unrestricted deployment privileges.

⸻

8. SERVER MANAGEMENT

Plan a Server Management module.

Each registered server may contain:

* Server name
* Environment
* OS
* Host information
* Agent ID
* Agent status
* Last heartbeat
* Version
* Connection status
* Registered projects
* Deployment status

Environments:

development
testing
staging
production

Do not assume server IP addresses, domains, credentials, or operating systems.

Mark these as configurable.

⸻

9. SERVER AGENT

Plan a lightweight deployment agent.

The agent should:

* Register with central application
* Receive authenticated deployment jobs
* Validate job authenticity
* Execute only approved operations
* Report progress
* Report logs
* Report success/failure
* Send heartbeat
* Report agent version
* Reject unauthorized requests

The agent must NOT accept arbitrary shell commands from ordinary users.

Plan a controlled command/action model.

Example:

git_fetch
git_checkout
git_reset
composer_install
npm_install
npm_build
artisan_migrate
artisan_optimize
queue_restart
health_check

Each action should have explicit authorization and validation.

⸻

10. GIT REPOSITORY MANAGEMENT

Plan repository registration.

Fields/concepts may include:

* Repository name
* Provider
* Repository URL
* Owner/organization
* Repository identifier
* Default branch
* Authentication method
* Credential reference
* Webhook configuration
* Active/inactive status

Support private repositories.

Do NOT store plaintext GitHub tokens/passwords.

Plan secure credential handling.

Unknown provider credentials must be marked:

REQUIRES USER INPUT

⸻

11. PROJECT MANAGEMENT

A project should map:

Git Repository
        +
Branch
        +
Environment
        +
Target Server
        +
Deployment Profile

Example:

Multi-Kiosk
Repository: UNKNOWN
Branch: main
Environment: testing
Server: Windows Testing Server
Deployment Profile: Laravel Testing

Do not invent actual repository URLs.

⸻

12. DEPLOYMENT PROFILES

Plan configurable deployment profiles.

Example:

Laravel Testing

git fetch
git checkout
git reset
composer install
npm install
npm run build
php artisan migrate
php artisan optimize
health check

Laravel Production

Potentially:

git fetch
git checkout
composer install --no-dev
npm build
approval checkpoint
migration
cache optimization
queue restart
health check

These are examples only.

Do not execute them.

Do not assume that every project needs every step.

Deployment profiles must be configurable and permission-controlled.

⸻

13. DEPLOYMENT WORKFLOW

Design an explicit lifecycle.

Example:

REQUESTED
   ↓
VALIDATING
   ↓
PENDING_APPROVAL
   ↓
APPROVED
   ↓
QUEUED
   ↓
RUNNING
   ↓
HEALTH_CHECK
   ↓
SUCCESS

Failure path:

RUNNING
   ↓
FAILED
   ↓
RETRY / ROLLBACK / ABORT

Production deployment should support an approval checkpoint.

Do not assume production deployments are automatically approved.

⸻

14. GITHUB WEBHOOK

Plan Git provider webhook integration.

Example:

Developer
   ↓
git push
   ↓
GitHub
   ↓
Webhook
   ↓
Deployment Manager
   ↓
Validate repository
   ↓
Validate branch
   ↓
Validate environment
   ↓
Create deployment request

Webhook security must include:

* Signature verification
* Replay protection
* Idempotency
* Repository validation
* Branch validation
* Event validation
* Audit logging

Do not create the webhook during planning.

⸻

15. DEPLOYMENT LOGS

Every deployment must be traceable.

Plan to record:

* Deployment ID
* Project
* Repository
* Commit
* Branch
* Target server
* Environment
* Initiated by
* Approval by
* Start time
* End time
* Duration
* Status
* Actions executed
* Action result
* Error information
* Agent version

Logs must not expose:

* passwords
* access tokens
* private keys
* secrets
* database credentials

⸻

16. AUDIT TRAIL

Every sensitive operation should be auditable.

Examples:

User created server
User registered repository
User changed deployment profile
User requested deployment
User approved production deployment
Agent executed deployment
Deployment failed
User retried deployment
User initiated rollback

Audit records should be immutable from normal application users.

⸻

17. ROLLBACK

Plan rollback capability.

Possible strategies:

* Git commit rollback
* Release directory strategy
* Previous successful deployment
* Artifact-based rollback

Do not choose a final rollback implementation without evaluating:

* Laravel migrations
* uploaded files
* database changes
* queues
* caches
* frontend assets
* environment configuration

Clearly document the risks.

⸻

18. DATABASE PLANNING

Design the database schema conceptually.

Potential entities:

users
roles
permissions
servers
server_agents
server_heartbeats
git_providers
git_repositories
git_credentials
projects
project_environments
deployment_profiles
deployments
deployment_steps
deployment_logs
deployment_approvals
deployment_artifacts
webhooks
webhook_events
health_checks
audit_logs

Do not create migrations yet.

Do not modify a database yet.

Explain relationships and ownership.

⸻

19. REDIS / QUEUE ARCHITECTURE

Plan Redis queues.

Potential queues:

deployments
deployment-high
deployment-low
health-checks
webhooks
notifications

Consider:

* retries
* timeout
* backoff
* failed jobs
* concurrency
* duplicate deployment prevention
* deployment locking

A project/environment should not accidentally have two conflicting deployments running simultaneously.

⸻

20. SECURITY REQUIREMENTS

The system must follow security-first principles.

Plan:

* HTTPS
* API authentication
* Agent authentication
* Token rotation
* Token revocation
* Least privilege
* RBAC
* CSRF protection
* Rate limiting
* Input validation
* Output escaping
* Secret protection
* Webhook signature verification
* Replay protection
* Audit logging
* Deployment authorization
* Command allowlisting
* Server isolation
* Environment isolation

Never allow a normal user to submit:

rm -rf /

or equivalent arbitrary shell commands through the deployment interface.

Deployment actions must be allowlisted.

⸻

21. CORE SENTINEL GOVERNANCE

The system must be compatible with CoreSentinel governance.

CoreSentinel should be considered the governance/control layer for high-risk operations.

Examples:

LOW RISK
View logs
View deployment
View server status
        ↓
May execute automatically
MEDIUM RISK
Testing deployment
Dependency installation
Database migration on testing
        ↓
Policy dependent
HIGH RISK
Production deployment
Production migration
Rollback
Destructive operation
        ↓
Human approval / CoreSentinel policy

Do not claim CoreSentinel capabilities that have not been verified.

Where integration details are unknown, write:

REQUIRES CORE SENTINEL INTERFACE SPECIFICATION

⸻

22. UI / UX

Use:

React
TypeScript
Inertia.js
Bootstrap
Responsive Admin Template

Plan responsive pages for:

* Dashboard
* Servers
* Server details
* Agents
* Repositories
* Projects
* Deployment profiles
* Deployments
* Deployment details
* Live logs
* Approvals
* Audit logs
* Users
* Roles/permissions
* Settings

Dashboard should provide:

Servers online
Servers offline
Projects
Running deployments
Successful deployments
Failed deployments
Pending approvals
Recent activity

The UI must work on:

* desktop
* tablet
* mobile

⸻

23. API DESIGN

Plan APIs/endpoints for:

* Agent registration
* Agent heartbeat
* Agent authentication
* Deployment polling/receiving
* Deployment acknowledgement
* Deployment progress
* Deployment completion
* Health check reporting
* Webhooks
* Internal application operations

Do not implement APIs yet.

Document authentication and authorization expectations.

⸻

24. FAILURE HANDLING

Plan for:

* Git failure
* Authentication failure
* Repository unavailable
* Network failure
* Agent offline
* Composer failure
* NPM failure
* Migration failure
* Health check failure
* Timeout
* Duplicate deployment
* Server unavailable
* Partial deployment

Every failure should produce a traceable deployment state.

⸻

25. IDEMPOTENCY

Deployment requests must be idempotent where possible.

Example:

If GitHub sends the same webhook twice:

Webhook A
Webhook A duplicate

The system must not unintentionally trigger two deployments.

Plan:

* webhook event IDs
* deployment request IDs
* commit SHA
* project/environment locks
* unique constraints

⸻

26. OBSERVABILITY

Plan:

* deployment logs
* agent heartbeat
* application logs
* queue status
* failed jobs
* deployment duration
* deployment success rate
* health checks
* audit events

Potential future metrics:

Deployment success rate
Average deployment duration
Failure rate
Agent availability
Projects deployed

⸻

27. BACKUP AND RECOVERY

Plan backup requirements for:

* application database
* deployment configuration
* encrypted credentials
* audit logs
* deployment metadata

Do not assume backup provider or storage location.

Mark unknown infrastructure as:

TBD

⸻

28. ENVIRONMENT VARIABLES / SECRETS

Do not hardcode:

* GitHub tokens
* SSH keys
* API tokens
* agent secrets
* database passwords
* Cloudflare tokens
* encryption keys

Plan secret references and secure storage.

Never place secrets inside:

* Git repository
* Planning.md
* source code
* deployment logs
* browser local storage unless explicitly justified

⸻

29. TESTING STRATEGY

Plan:

Unit tests

* authorization
* deployment state transitions
* webhook validation
* idempotency
* repository validation
* deployment policy

Feature tests

* create server
* register repository
* create project
* request deployment
* approve deployment
* reject deployment
* deployment failure
* deployment retry

Agent tests

* registration
* authentication
* heartbeat
* job execution
* unauthorized job rejection
* invalid action rejection

Security tests

* RBAC bypass
* webhook forgery
* replay attack
* token leakage
* arbitrary command injection
* unauthorized production deployment

⸻

30. IMPLEMENTATION PHASES

Create a phased roadmap.

Example:

Phase 0

Planning and approval

Phase 1

Core application foundation

Phase 2

Authentication/RBAC

Phase 3

Server/agent registration

Phase 4

Repository/project management

Phase 5

Deployment engine

Phase 6

GitHub webhook integration

Phase 7

Deployment logs/audit

Phase 8

Approval/governance

Phase 9

Rollback/health checks

Phase 10

Production hardening

Each phase must contain:

* objective
* requirements
* dependencies
* risks
* expected outputs
* acceptance criteria

⸻

31. RISK REGISTER

Create a risk table.

At minimum consider:

Risk	Severity	Probability	Mitigation
Unauthorized deployment	Critical	TBD	RBAC + approval
Arbitrary command execution	Critical	TBD	Allowlisted actions
Token leakage	Critical	TBD	Secret management
Duplicate webhook	High	TBD	Idempotency
Failed migration	Critical	TBD	Backup + approval
Agent compromise	Critical	TBD	Authentication + rotation
Partial deployment	High	TBD	Deployment state + rollback
Production outage	Critical	TBD	Health checks
Database inconsistency	Critical	TBD	Migration strategy

Do not invent probability values if insufficient information exists.

Use TBD.

⸻

32. DECISION REGISTER

Document decisions that still require approval.

Examples:

DEC-001
Agent communication model
DEC-002
GitHub authentication mechanism
DEC-003
Credential storage strategy
DEC-004
Production approval workflow
DEC-005
Rollback strategy
DEC-006
CoreSentinel integration mechanism
DEC-007
Deployment artifact strategy

Do not silently resolve these decisions.

⸻

33. ACCEPTANCE CRITERIA

Define measurable acceptance criteria.

Examples:

* A registered server can authenticate its agent.
* An agent can report heartbeat.
* A repository can be registered without exposing credentials.
* A deployment can be requested.
* A deployment can require approval.
* A deployment produces traceable logs.
* Duplicate webhook events do not create duplicate deployments.
* Unauthorized users cannot deploy to production.
* Arbitrary shell commands cannot be submitted through the UI.
* Every deployment can be traced to user, repository, commit, environment, server, and result.
* Failed deployments have a deterministic failure state.

⸻

34. UNKNOWN INFORMATION

Create a dedicated section:

REQUIRES USER INPUT

List information that must not be guessed.

Examples:

GitHub organization/account
GitHub repositories
Testing server hostname
Production server hostname
Windows server architecture
Domain names
Cloudflare account
Authentication provider
CoreSentinel integration API
Credential storage solution
Deployment agent technology
Production deployment policy
Rollback requirements

⸻

35. EXECUTION GATE

At the end of Planning.md, include:

## EXECUTION GATE
STATUS: BLOCKED
This project is currently PLANNING ONLY.
No implementation, installation, configuration, migration,
deployment, webhook creation, server registration, package
installation, or source-code modification is authorized.
Execution may begin ONLY after explicit approval from the authorized user.
Required approval phrase:
"APPROVED — EXECUTE"
Until that exact approval is provided, remain in planning/review mode.

⸻

36. CORE SENTINEL ANTI-HALLUCINATION RULE

If information is unavailable:

DO NOT GUESS.

Use:

UNKNOWN
TBD
REQUIRES USER INPUT
REQUIRES VERIFICATION

Every assumption must be explicitly labelled.

Never claim that a server, repository, credential, API, domain, package, or external service exists unless verified.

Never fabricate test results.

Never claim an implementation has been completed during the planning phase.

⸻

37. FINAL OUTPUT

For this request, produce ONLY:

Planning.md

Do not execute the plan.

Do not install anything.

Do not modify the project.

Do not create migrations.

Do not create agents.

Do not configure GitHub.

Do not connect to servers.

Do not deploy anything.

After creating Planning.md, stop and wait for explicit approval.