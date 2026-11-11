# Together

Real-time video conferencing built on WebRTC.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the plan of action and progress.

## Layout

| Path | What it is |
|---|---|
| `apps/signaling` | Node + Socket.IO signaling server |
| `apps/web` | Next.js client, exported as static HTML to `apps/web/out` |
| `packages/shared` | TypeScript types shared by client and server, e.g. the Socket.IO event contract |

## Setup

Requires Node 20+. From the repo root:

```sh
npm install              # installs every workspace
npm run dev:signaling    # signaling server on :5000, reloads on change
npm run dev:web          # web app on http://localhost:3000
npm run build            # compiles all workspaces
npm run typecheck        # type-checks all TypeScript workspaces
npm run lint             # ESLint over the whole repo
npm run format           # Prettier; format:check only reports
```

CI (`.github/workflows/ci.yml`) runs typecheck, lint, format check and build on every push to `master` and
`production-new`, and on pull requests.

The signaling server reads `PORT` and `CORS_ORIGIN` from the environment; see `apps/signaling/.env.example`.
The web app connects to `NEXT_PUBLIC_SIGNALING_URL` (default `http://localhost:5000`); see `apps/web/.env.example`.

## Backing services

PostgreSQL, Redis and a TURN server (coturn) run in Docker for local development. Nothing uses them yet; later
roadmap steps connect them.

```sh
npm run services:up      # start all three and wait until healthy
npm run services:down    # stop them (data is kept in Docker volumes)
```

| Service | Address | Notes |
|---|---|---|
| PostgreSQL 17 | `localhost:5433` | user `together`, password `together-dev`, database `together`. Port 5433 avoids a local install on 5432. |
| Redis 8 | `localhost:6379` | |
| coturn (TURN) | `turn:localhost:3478` | Time-limited credentials derived from `TURN_SECRET`. Relay ports 49160–49200/udp. |

The defaults are for local development only; override them in a root `.env` (see `.env.example`).
To test calls from a phone on the same Wi-Fi, set `TURN_EXTERNAL_IP` to this machine's LAN address.

To try a call, run both servers and open the app in two browser windows: copy the code from one into the other and press Call.
