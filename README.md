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
```

The signaling server reads `PORT` and `CORS_ORIGIN` from the environment; see `apps/signaling/.env.example`.
The web app connects to `NEXT_PUBLIC_SIGNALING_URL` (default `http://localhost:5000`); see `apps/web/.env.example`.

To try a call, run both servers and open the app in two browser windows: copy the code from one into the other and press Call.
