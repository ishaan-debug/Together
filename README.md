# Together

Real-time video conferencing built on WebRTC.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the plan of action and progress.

## Layout

| Path | What it is |
|---|---|
| `apps/signaling` | Node + Socket.IO signaling server |
| `apps/web` | Next.js client (added in a later step) |
| `packages/shared` | TypeScript types shared by client and server, e.g. the Socket.IO event contract |
| `legacy/client` | Original CRA client, kept as reference until `apps/web` replaces it. It does not build on Node 17+. |

## Setup

Requires Node 20+. From the repo root:

```sh
npm install              # installs every workspace
npm run dev:signaling    # signaling server on :5000, reloads on change
npm run build            # compiles all workspaces
npm run typecheck        # type-checks all TypeScript workspaces
```

The signaling server reads `PORT` and `CORS_ORIGIN` from the environment; see `apps/signaling/.env.example`.
