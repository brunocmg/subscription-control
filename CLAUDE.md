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

- `npm run dev`: API with `tsx watch` (needs `--conditions=development`, already in the script)
- `npm run build` then `npm start`: compile to `dist/` and run it
- `npm run typecheck`, `npm run lint` (check only), `npm run lint:fix`, `npm run format`
- `npm test`: Vitest, tests live next to the code as `*.test.ts`
- `npx prisma generate`: required after every install; the client is generated into `src/generated/prisma` (gitignored)
- `docker compose up -d --build`: API + Postgres. If the app fails with `tsx: not found`, add `-V` to renew the anonymous node_modules volume

## Pitfalls

- A fresh worktree needs `.env`, `npm install` and `npx prisma generate`.
- Import alias is `#app/*` (package.json `imports`: `src` with the `development` condition, `dist` otherwise). `#/*` is invalid in Node. Use `.js` extensions in relative imports.
- Windows: if `npm test` fails with `Cannot read properties of undefined (reading 'config')`, the terminal cwd has a lowercase drive letter (`c:\`). Open it as `C:\...`.
- Billing dates: month-end (Jan 31 + 1 month, Feb 29) must be tested, never use a plain `setMonth(+1)`.
- Add here anything the AI got wrong twice.
