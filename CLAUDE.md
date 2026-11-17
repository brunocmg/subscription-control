# CLAUDE.md

Event-driven subscription API (Fastify + TypeScript + Prisma + RabbitMQ). Source of truth for scope and order: [ROADMAP.md](ROADMAP.md).

## Workflow

- One roadmap item at a time. Pause after each mini task and wait for review.
- Never push to `main`. Branch from `main` as `<type>/<slug>`, Conventional Commits, PR per item.
- Risk levels: green (docs, tests), yellow (feature), red (money, webhooks, migrations). Red items get a written plan before code; write tests first for business rules.
- Stay in scope. Out-of-scope findings go to ROADMAP.md as new items, not into the current diff.
- Repo, commits, PRs and docs in English.

## Architecture rules

- Only the worker changes a subscription's status. The API and webhook write a row plus an outbox event and return.
- Money is integer cents. Webhooks must verify the HMAC signature and be idempotent via unique `external_id`.
- Zod schemas are shared between HTTP bodies and message contracts.

## Commands

Filled in as the Fastify migration lands (`dev`, `build`, `lint`, `typecheck`, `test`, `db:migrate`, `db:seed`).

## Pitfalls

- A fresh worktree needs `.env`, `npm install` and `npx prisma generate`.
- Billing dates: month-end (Jan 31 + 1 month, Feb 29) must be tested, never use a plain `setMonth(+1)`.
- Add here anything the AI got wrong twice.
