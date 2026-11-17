# Roadmap

Subscription Control is an event-driven API that manages plans, subscriptions and recurring billing for a fictional SaaS (from racoelho's Challenge #7). The core lesson is messaging: the API never updates billing state directly. A worker does, by consuming events from a queue.

## Goals

- API for plans and subscriptions: create, read, upgrade/downgrade, cancel
- Asynchronous processing through a broker, with a worker that owns status changes
- Status updates driven by payment events: webhook, queue, worker, database
- Basic reports: active and canceled subscriptions, active per plan

## Constraints

- 100% free to build and host
- Portfolio-grade: tests, CI, docs and a live demo
- Repo, issues and roadmap in English
- Out of scope: real payment provider (simulated via webhook), frontend, multi-tenancy, real email

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node + TypeScript |
| HTTP | Fastify |
| Validation | Zod (HTTP bodies and messages) |
| ORM | Prisma |
| Database | PostgreSQL (Docker locally, Neon in prod) |
| Broker | RabbitMQ (Docker locally, CloudAMQP in prod) |
| Tests | Vitest + Testcontainers |
| Docs | OpenAPI (Swagger UI) |
| CI / hosting | GitHub Actions, Render free |

The API only writes a row plus an outbox event, then returns. The worker consumes from RabbitMQ and is the only code that changes a subscription's status.

## Data model

Statuses: `pending`, `active`, `suspended`, `canceled`.
Event types: `subscription_created`, `payment_success`, `payment_failed`; Phase 5 adds `plan_changed` and `subscription_canceled`.

| Entity | Fields |
|---|---|
| Plan | id, name, price_cents, billing_cycle (monthly, yearly), active, created_at |
| Subscription | id, plan_id, customer_email, status, next_billing_date, failed_attempts, canceled_at, created_at, updated_at |
| Event | id, type, data (JSON), processed, subscription_id, external_id (unique), attempts, processed_at, created_at |

Lifecycle: `pending` -> `active` on first `payment_success`; `payment_failed` suspends; a later success restores; exhausted retries or a cancel request end it as `canceled`.

## Endpoints

| Method | Path | Phase |
|---|---|---|
| GET | /health | 0 |
| POST, GET | /api/plans, /api/plans/:id | 1 |
| POST | /api/subscriptions | 2 |
| GET | /api/subscriptions, /api/subscriptions/:id | 2 |
| POST | /api/webhooks/payment | 4 |
| POST | /api/subscriptions/:id/change-plan | 5 |
| POST | /api/subscriptions/:id/cancel | 5 |
| GET | /api/reports/subscriptions | 6 |

## Workflow

One item in progress at a time. Branch from `main` as `<type>/<slug>`, Conventional Commits, one PR per item, squash merge with CI green. Risk levels follow the solo flow: green (docs, tests), yellow (regular feature), red (money, webhooks, migrations).

Definition of done for every item: CI green, tests for new logic, README or OpenAPI updated when behavior changes, diff re-read cold before merge.

Risk tag in brackets: [G] green, [Y] yellow, [R] red.

## Current state

The repo started on NestJS with one working endpoint (`POST /api/subscriptions`), a Prisma schema and a Compose file with Postgres. Phase 0 begins with migrating to Fastify; the reusable parts are the Prisma schema (to be adjusted), the Compose db service and the subscription + outbox transaction.

## Phase 0: Foundation

Done when `docker compose up` runs the API, Postgres and RabbitMQ, and CI is green.

- [ ] [G] Add ROADMAP.md and CLAUDE.md
- [ ] [Y] Migrate from NestJS to Fastify + Zod + Vitest, path aliases, `.env.example`
- [ ] [G] `/health` and structured logging (pino)
- [ ] [G] Env validation with Zod (fail fast on missing variables)
- [ ] [G] Docker Compose with Postgres and RabbitMQ (management UI enabled)
- [ ] [G] Prisma setup: connection, `db:migrate` and `db:seed` scripts
- [ ] [G] GitHub Actions CI: lint, typecheck, test on every PR

## Phase 1: Plans and data model

Done when plans can be created and listed, and all three tables exist.

- [ ] [R] Prisma schema for Plan, Subscription and Event (new columns, enums, migration)
- [ ] [Y] `POST /api/plans` and `GET /api/plans` with Zod validation
- [ ] [Y] `GET /api/plans/:id` with 404 handling
- [ ] [G] Global error handler with a consistent error body
- [ ] [G] Seed: Basic monthly, Pro monthly, Pro yearly

## Phase 2: Subscriptions API (synchronous part)

Done when a subscription can be created as `pending` with a correct `next_billing_date`.

- [ ] [Y] Port `POST /api/subscriptions` (`plan_id`, `customer_email`)
- [ ] [Y] Billing date calculator for monthly and yearly, with unit tests for month-end (Jan 31, Feb 29)
- [ ] [Y] `GET /api/subscriptions/:id` and `GET /api/subscriptions?status=&plan_id=` with pagination
- [ ] [Y] Reject a second non-canceled subscription for the same email and plan

## Phase 3: Messaging infrastructure

Done when creating a subscription produces a `subscription_created` message that a separate worker process consumes.

- [ ] [Y] Broker module: connection, reconnect, graceful shutdown
- [ ] [Y] Topology: one exchange, queues per event family, a dead-letter queue
- [ ] [R] Transactional outbox: Event row saved in the same transaction, a relay publishes unprocessed rows
- [ ] [Y] Worker entrypoint (`src/worker.ts`) as its own process and Compose service
- [ ] [Y] `subscription_created` handler: verify, simulate billing, mark processed
- [ ] [Y] Typed message contracts shared by API and worker

## Phase 4: Payment webhook and worker

Done when a simulated payment changes subscription status through the queue, and a repeated webhook changes nothing.

- [ ] [R] `POST /api/webhooks/payment` (`subscription_id`, `event`, `amount`, `date`): validate, save Event, enqueue, return 202
- [ ] [R] HMAC signature header check (shared secret)
- [ ] [R] Idempotency: unique `external_id`; duplicates return 200 without enqueuing
- [ ] [R] Status transitions in the worker (state machine), invalid ones rejected and logged
- [ ] [Y] Retry with backoff; messages that keep failing go to the dead-letter queue
- [ ] [R] `payment_success` advances `next_billing_date` by one cycle; `amount` checked against plan price
- [ ] [G] Script to fire fake webhooks (`npm run simulate:payment`)

## Phase 5: Lifecycle rules

Done when upgrade, downgrade, cancel and renewal all run through events.

- [ ] [G] Rules doc: upgrades apply now with prorated charge, downgrades at next billing date
- [ ] [R] `POST /api/subscriptions/:id/change-plan` emitting `plan_changed`
- [ ] [R] `POST /api/subscriptions/:id/cancel` with `at_period_end`, emitting `subscription_canceled`
- [ ] [R] Suspension rule: N failed attempts in a row cancel the subscription (N in config)
- [ ] [Y] Renewal scheduler: a daily cron finds subscriptions due today and enqueues billing requests

## Phase 6: Reports

Done when the report endpoint matches the database after a seeded simulation.

- [ ] [Y] `GET /api/reports/subscriptions`: total active, total canceled, active per plan
- [ ] [Y] Single aggregate query (`groupBy`), covered by an integration test
- [ ] [G] Seed script with a realistic mix of subscriptions and payment events

## Phase 7: Quality, docs and deploy

Done when there is a public URL, a README with an architecture diagram, and a Postman collection.

- [ ] [Y] Integration tests with Testcontainers (Postgres + RabbitMQ), including the full webhook-to-status flow
- [ ] [G] OpenAPI docs served at `/docs`
- [ ] [Y] Correlation id from HTTP request to message to worker logs
- [ ] [Y] Deploy API and worker on free hosting (open question below)
- [ ] [G] Postman/Insomnia collection in the repo
- [ ] [G] README: architecture diagram, how to run, design decisions, demo GIF

Open question: Render's free tier runs web services, not background workers. Options: run the worker as a web service with a `/health` route, or host the broker on CloudAMQP free and keep the worker on Render. Decide in this phase.

## Phase 8: Extras (optional, only after Phase 7 ships)

- [ ] MRR and churn rate in the report
- [ ] Notification consumer (fake email on payment failure) to show fan-out
- [ ] Swap RabbitMQ for Redis Streams behind the same broker interface, to compare
