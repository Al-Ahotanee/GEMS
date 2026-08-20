# GSEM

GSEM is a single-service election monitoring platform with a React/Vite frontend, an Express API, PostgreSQL persistence, Socket.IO updates, and optional email, SMS, and web-push notification channels.

## Production layout

The repository intentionally uses a minimal monorepo structure. Render builds the frontend into `frontend/dist`, then the Express service serves that build and the API from the same web service.

| Path | Purpose |
| --- | --- |
| `backend/src` | Express API, controllers, migrations, services, and websocket handlers |
| `frontend/src` | React application |
| `render.yaml` | Render Blueprint for one free Node web service |
| `.env.example` | Local environment template with no credentials |
| `package-lock.json` | Reproducible workspace dependency lockfile |

## Requirements

Use Node.js 20 for deployment and local parity. Create a Neon PostgreSQL database and obtain its pooled or direct `DATABASE_URL` with SSL enabled. The application uses PostgreSQL-native migrations and does not require a Render-managed database.

## Local setup

Copy `.env.example` to `.env` and replace every placeholder secret. Install and validate the workspace with:

```bash
npm ci
npm run migrate
npm run seed
npm run dev
```

The production-equivalent commands are:

```bash
npm ci
npm run build
npm start
```

The API health endpoint is `GET /health`. It returns `200` only when the application can reach PostgreSQL; an unavailable database returns `503`, allowing Render to remove an unhealthy instance from service rather than routing traffic to a broken process.

## Render Blueprint deployment

1. Push this repository to a Git provider.
2. Create a Render Blueprint from the repository. Render reads `render.yaml` and creates the `gsem` web service.
3. In the service environment, set `DATABASE_URL` to the Neon connection string and `FRONTEND_URL` to the public Render URL, for example `https://gsem.onrender.com`.
4. Keep the generated `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `HMAC_SECRET` values private. Do not commit `.env` files or credentials.
5. Run the schema bootstrap once after the first deployment with `npm run migrate`; run `npm run seed` only when the initial reference data is required.

The Blueprint uses `npm ci && npm run build` as its build command, `npm start` as its start command, and `/health` as its health check. Render supplies the runtime `PORT`; the server listens on `0.0.0.0` by default.

## Optional integrations

SMTP, Africa’s Talking SMS, and Web Push are disabled unless their corresponding environment variables are supplied. SMS uses the provider’s HTTPS API directly, avoiding an unnecessary SDK dependency. Local uploads are supported for development; production deployments should use an external object-storage strategy if uploaded files must survive instance replacement.

## Validation

The release has been validated with backend syntax checks, a TypeScript/Vite production build, SQL-adapter smoke tests, Blueprint checks, XLSX generation smoke tests, an isolated runtime probe, and a production dependency audit. The final production audit reports zero known vulnerabilities for the locked dependency tree.
