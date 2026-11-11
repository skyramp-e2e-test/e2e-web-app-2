# e2e-web-app

A small Node.js (Express) + PostgreSQL web app used as a target for end-to-end testing.

### Editor check for UC-09.8

## What's inside

| Path | Description |
| --- | --- |
| `GET /` | Home page |
| `GET /login` | Login page (form posts to `POST /login`) |
| `GET /items` | Items page: lists items and lets you add new ones |
| `GET /api/items` | JSON list of items |
| `POST /api/items` | Create an item. Body: `{"name": "..."}`. Returns `201` with the created item; returns `400` if `name` is missing |
| `GET /health`, `GET /healthz` | Health checks. Both return `200` |

`docker-compose.yml` defines two services:

- `db`: PostgreSQL 16
- `app`: this Express server. It waits for `db` to be healthy before starting.

On startup the app creates its tables and seeds a test user.

## Required configuration

The app **refuses to start** unless `APP_SIGNING_SECRET` is set to a valid value. It signs the session cookie with this value. The app never prints or logs the value.

`APP_SIGNING_SECRET` is **provided by the customer**. Do not generate your own value; use the secret the customer gives you.

The value must be **exactly 40 characters**, using only letters and digits (`A-Z`, `a-z`, `0-9`). No spaces, symbols, or other characters.

If the variable is missing:

- `docker compose up` stops with `APP_SIGNING_SECRET must be set`.
- The app exits with code 1 and prints `Startup error: Missing required environment variable APP_SIGNING_SECRET`.

If the variable is set but is not exactly 40 letters/digits, the app exits with code 1 and prints `Startup error: APP_SIGNING_SECRET is invalid`.

## Start the app

Requires Docker with Compose v2.

```bash
export APP_SIGNING_SECRET="<40-character secret provided by the customer>"
docker compose up --build
```

Or put the secret in a `.env` file next to `docker-compose.yml` (see `.env.example`; `.env` is gitignored):

```bash
echo "APP_SIGNING_SECRET=<40-character secret provided by the customer>" > .env
docker compose up --build
```

Then open http://localhost:3000.

To stop the app and delete the database volume:

```bash
docker compose down -v
```

### Run without Docker (optional)

With a PostgreSQL instance reachable at `DATABASE_URL`:

```bash
npm install
APP_SIGNING_SECRET="<40-character secret provided by the customer>" \
DATABASE_URL=postgres://app:app@localhost:5432/app \
npm start
```

## Sign in with the test user

The app seeds this user every time it starts:

- **Email:** `test@example.com`
- **Password:** `password123`

1. Go to http://localhost:3000/login.
2. Enter the email and password above and click **Sign in**.
3. You are redirected to `/items`, which shows "Signed in as test@example.com".

If you enter wrong credentials, the login page shows "Invalid email or password."

## Quick API check

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/healthz
curl -s -X POST http://localhost:3000/api/items \
  -H 'Content-Type: application/json' -d '{"name":"First item"}'
curl -s http://localhost:3000/api/items
```
