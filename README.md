# Subscription Control

Event-driven API that manages plans, subscriptions and recurring billing for a fictional SaaS (built from racoelho's Challenge #7). The API never updates billing state directly: a worker does it by consuming events from a queue.

> Status: in development. See [ROADMAP.md](ROADMAP.md) for scope, phases and progress.

## Stack

Node + TypeScript, Fastify, Zod, Prisma, PostgreSQL, RabbitMQ, Vitest, Docker Compose.

The full README (architecture diagram, how to run, design decisions, demo) is planned for Phase 7.
