# TaskApp

A full-stack task manager with cookie-based authentication. Users sign up, log in, and manage their own tasks: create, edit, mark complete, and delete. The API validates every request with shared zod schemas, and the React client consumes the same types.

## Features

- Signup and login with argon2-hashed passwords
- Server-side sessions in httpOnly cookies, stored as SHA-256 hashes
- Per-user task isolation: every task query is scoped to the authenticated user
- Create, edit (partial updates), complete/uncomplete, and delete tasks
- Edit form sends only the fields that changed; no request is made if nothing changed
- Session restore on page load, so a refresh keeps you logged in
- Inline loading, error, and empty states

## Tech stack

| Layer      | Technology                                                            |
| ---------- | --------------------------------------------------------------------- |
| Client     | React 19, TypeScript, Vite, react-router, Tailwind CSS v4, Heroicons  |
| Server     | Node.js, Express 5, TypeScript                                        |
| Database   | PostgreSQL 17, Drizzle ORM, drizzle-kit migrations                    |
| Validation | zod 4, shared between client and server                               |
| Auth       | argon2, cookie-parser, session table                                  |
| Tooling    | npm workspaces (`client`, `server`, `shared`), Vitest, Docker Compose |

## Architecture

```
client/  React SPA (Vite dev server on :5173, proxies /api to the server)
   |
   |  HTTP JSON, session cookie (credentials: "include")
   v
server/  Express API on :3000
   |  requireAuth middleware resolves the session cookie to req.user
   |  routes validate input with shared zod schemas
   v
PostgreSQL  users, sessions, tasks

shared/  zod schemas and inferred TypeScript types, imported by client and server
```

The `shared` package is the single source of truth for request validation and response types. Changing a schema there updates both sides after the package is rebuilt.

## Authentication design

- **Passwords** are hashed with argon2. Login runs a verification against a dummy hash when the email does not exist, so response timing does not reveal which emails are registered.
- **Sessions** are random 32-byte tokens. The raw token is sent to the browser as an httpOnly, SameSite=Lax cookie. The database stores only its SHA-256 hash, so a leaked `sessions` table cannot be replayed.
- **Expiry** is 24 hours, enforced in the `requireAuth` query and by the cookie's `maxAge`. Expired sessions are deleted when they are encountered.
- **Authorization** is derived from the session, never from request bodies. Task routes filter by `req.user.id`, so a user cannot read or modify another user's tasks by guessing IDs.

## API

All task routes require a valid session cookie and return `401` without one.

| Method   | Path                | Body                                                          | Success                        |
| -------- | ------------------- | ------------------------------------------------------------- | ------------------------------ |
| `POST`   | `/api/auth/signup`  | `{ name, email, password }`                                   | `201 { user }`                 |
| `POST`   | `/api/auth/login`   | `{ email, password }`                                         | `200 { user }`, sets cookie    |
| `POST`   | `/api/auth/logout`  | none                                                          | `200`, clears cookie           |
| `GET`    | `/api/auth/me`      | none                                                          | `200 { user }`                 |
| `GET`    | `/api/tasks`        | none                                                          | `200 { tasks }` (empty list OK) |
| `GET`    | `/api/tasks/:id`    | none                                                          | `200 { task }`                 |
| `POST`   | `/api/tasks`        | `{ title, description, dueDate? }`                            | `201 { task }`                 |
| `PATCH`  | `/api/tasks/:id`    | any of `{ title, description, completed, dueDate }`, at least one | `200 { task }`             |
| `DELETE` | `/api/tasks/:id`    | none                                                          | `204`                          |

Errors use a consistent shape: `{ error: string }`, with status `400` for validation, `401` for auth, `404` for missing resources, and `409` for duplicate emails. Validation errors are formatted by `z.prettifyError`, so the client always receives a displayable string.

`dueDate` defaults to seven days from creation when omitted.

## Getting started

### Prerequisites

- Node.js 20.19+ or 22.12+ (the minimum Vite 8 requires)
- Docker (for PostgreSQL), or a PostgreSQL 17 instance you already run

### 1. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL 17 on `localhost:5432` with user, password, and database all set to `taskapp`.

### 2. Configure the server

Copy the committed template and adjust it if your setup differs:

```bash
cp server/.env.example server/.env
```

`server/.env` is git-ignored, so local values never reach the repository. The template documents the variables the server reads:

Variables:

| Variable           | Default                  | Purpose                                              |
| ------------------ | ------------------------ | ---------------------------------------------------- |
| `FRONTEND_ADDRESS` | `http://localhost:5173`  | Allowed CORS origin                                  |
| `BACKEND_ADDRESS`  | `http://localhost:3000`  | Target of the Vite dev proxy (read by `client/vite.config.ts`) |
| `NODE_ENV`         | unset                    | Set to `production` to mark session cookies `Secure` |

### 3. Install and migrate

```bash
npm install
npm run db -- migrate
```

### 4. Run

```bash
npm run dev
```

This builds `shared`, then starts the API on port 3000 and the Vite client on port 5173. Open http://localhost:5173.

## Scripts

| Command                    | What it does                                              |
| -------------------------- | --------------------------------------------------------- |
| `npm run dev`              | Build `shared`, then run server and client with hot reload |
| `npm run build`            | Build `shared`, the server, and the client                |
| `npm run db -- migrate`    | Apply Drizzle migrations                                  |
| `npm run db -- generate`   | Generate a migration after changing `server/src/db/schema.ts` |
| `npm run db -- studio`     | Open Drizzle Studio                                       |
| `npm test`                 | Run the Vitest suite                                      |
| `npm run typecheck:tests`  | Typecheck the test project                                |

## Testing

```bash
npm test
```

Current status: 44 tests pass. They cover the auth zod schemas (`test/shared/auth.test.ts`): signup and login validation, and the password rules. They run without a database.

Not yet implemented:

- Task schema tests (`test/shared/tasks.test.ts`) are placeholders.
- Task route tests (`test/server/tasks.test.ts`) are scaffolded against a mocked database and currently placeholders.
- API integration tests (`test/server/tasks.integration.test.ts`) run only when `TEST_DATABASE_URL` is set, and are currently placeholders.

Filling these in is the next testing milestone. The route and integration tests are where the per-user isolation and 401 behavior should be verified.

## Project structure

```
client/
  src/
    auth/            AuthContext: session restore, user state, useAuth()
    components/
      auth/          login/signup form, page, and button chooser
      tasks/         TaskCard and TaskForm (create and edit modes)
    App.tsx          task list, create/edit modal, task handlers
    main.tsx         router and provider setup
server/
  src/
    routes/          auth.ts, tasks.ts
    middleware/      requireAuth.ts
    db/              Drizzle schema, relations, connection
  drizzle/           generated SQL migrations
shared/
  src/               zod schemas and inferred types
test/                Vitest suites
```

## Design decisions

- **Server is the source of truth for task state.** A toggle or edit does not update local state optimistically. The client replaces a task only with the object the server returns, so a dropped request cannot leave the UI showing data the database never stored.
- **Edit diffs before sending.** The edit form compares fields to the original task and sends only what changed, and skips the request when nothing changed.
- **Dates cross the wire as ISO strings.** The server converts them to `Date` for storage. The client converts between ISO and the `datetime-local` input format only at the form boundary.
- **One error contract for every endpoint.** Earlier versions mixed zod's tree-shaped error objects with strings, which crashed the client when an object reached a text render. All endpoints now return strings.

## Known limitations

- No deployment configuration yet. The app runs locally only.
- Task list has no pagination, filtering, or sorting.
- No rate limiting on login or signup.
- No CSRF token. The session cookie uses SameSite=Lax, which blocks cross-site POSTs in modern browsers, but a token would be stronger defense in depth.
- Logging out does not clear the cached task list until the next login reloads it.
- Task schema, task route, and task API integration tests are placeholders. Only auth schema tests run.

## What I would add next

- Fill in the task API integration tests against a dedicated test database
- Rate limiting on auth routes
- Deployment: API and database on a managed host, client as a static build
- Per-field validation errors, using a structured error response for form highlighting
