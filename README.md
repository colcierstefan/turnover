# Turnover

Mobile-first web app for short-term rental hosts and property managers in Romania. It keeps every appliance per unit, takes issue reports from guests and cleaners, diagnoses them with AI, looks up prices, and drafts a Romanian message to the manager's handyman that opens in WhatsApp.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Prisma 7 with PostgreSQL (Docker locally)
- Auth0 for manager login
- Gemini on Vertex AI through the AI SDK (`ai`, `@ai-sdk/google-vertex`), Zod structured outputs
- Langfuse for tracing (OpenTelemetry)
- Vitest, ESLint, Prettier

## Structure

A pnpm workspace. Every command runs from the repo root.

| Package          | Folder          | Holds                                                                    |
| ---------------- | --------------- | ------------------------------------------------------------------------ |
| `@turnover/web`  | `apps/web`      | Next.js routes, components, hooks, server actions                        |
| `@turnover/core` | `packages/core` | Services, repositories, schemas, model calls, evals, tests, clients, env |
| `@turnover/db`   | `packages/db`   | Prisma schema, migrations and generated client                           |

`web` depends on `core`, `core` depends on `db`; `web` cannot import Prisma. One `.env` at the root serves all three.

## Prerequisites

- Node.js 22 and pnpm 10
- Docker
- gcloud CLI, logged in with Application Default Credentials for the Vertex calls:

```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project <project-id>
```

- An Auth0 Regular Web Application with:
  - Allowed Callback URLs: `http://localhost:3000/auth/callback`
  - Allowed Logout URLs: `http://localhost:3000`
- A Langfuse project (EU region) and its API keys

## Run It

```bash
# 1. Install dependencies (also generates the Prisma client)
pnpm install

# 2. Copy the root env file and fill in the Auth0, Google Cloud and Langfuse values
cp .env.example .env

# 3. Start Postgres
docker compose up -d

# 4. Apply the migrations
pnpm db:migrate

# 5. Start the app on http://localhost:3000
pnpm dev
```

`AUTH0_SECRET` is any random 32-byte value: `openssl rand -hex 32`.

## Available Scripts

| Script                          | What it does                                                          |
| ------------------------------- | --------------------------------------------------------------------- |
| `pnpm dev`                      | Next.js dev server                                                    |
| `pnpm build` / `pnpm start`     | Production build and server                                           |
| `pnpm lint`                     | ESLint                                                                |
| `pnpm type-check`               | TypeScript without emitting                                           |
| `pnpm format` / `format:fix`    | Prettier check / write                                                |
| `pnpm test`                     | Vitest unit tests (never calls a model)                               |
| `pnpm db:migrate:create --name` | Create a migration without applying it                                |
| `pnpm db:migrate`               | Apply migrations                                                      |
| `pnpm check:vertex`             | One plain and one search-grounded Vertex call, traced to Langfuse     |
| `pnpm evals:label-extraction`   | Label extraction evals against Vertex (`--limit N`, `--only id,id`)   |
| `pnpm evals:invoice-extraction` | Invoice extraction evals against Vertex (`--limit N`, `--only id,id`) |
| `pnpm evals:report-triage`      | Report triage evals against Vertex (`--limit N`, `--only id,id`)      |
| `pnpm evals:self-help-tips`     | Self-help tips evals against Vertex (`--limit N`, `--only id,id`)     |
