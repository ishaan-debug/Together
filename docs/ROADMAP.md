# Together — Plan of Action

A lightweight, self-hosted alternative to Google Meet or Zoom, grown out of the original 1:1 WebRTC app.

## How this plan is executed

- Work happens on the `production-new` branch.
- **One task at a time.** Each task is implemented, explained, and verified, then work pauses for approval before the next task.
- Each task is one commit. Tick the box here when it lands.

## Target architecture

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React, TypeScript, Next.js (static export) | Meeting UI; static export keeps the Android/Capacitor route open |
| Signaling | Node.js, Socket.IO, TypeScript | Room events, SDP and ICE exchange |
| Media server | mediasoup | SFU for multi-party video |
| NAT traversal | STUN, coturn | Connectivity across networks |
| Database | PostgreSQL | Users, meetings, permissions |
| Cache / presence | Redis | Room state, presence, cross-instance events |
| Storage | S3-compatible (MinIO locally) | Recordings, attachments |
| Deployment | Docker, GitHub Actions | Reproducible builds and deploys |

### Why an SFU instead of peer-to-peer

- **P2P mesh:** each participant sends their video to every other participant. Upload bandwidth and connection count grow with the square of the room size, which is impractical beyond about 4 people.
- **SFU (Selective Forwarding Unit):** each participant uploads one stream to the server, which forwards it to everyone else. This makes rooms of 5–20 people possible.

Signaling stays separate from media transport so the 1:1 P2P path can be replaced by the SFU without rewriting room logic.

mediasoup must run on a server with a public IP and open UDP ports, so the backend is self-hosted. Hosted signaling (PeerJS, Firebase) and free hosts that sleep when idle are ruled out.

### Changes from the original plan

1. **PostgreSQL moved from Phase 3 to Phase 1.** Authentication needs somewhere to store users.
2. **TURN moved from Phase 2 to Phase 1.** Without it, even 1:1 calls fail across mobile networks and strict NATs.
3. **Phase 0 added.** Repo layout, Docker Compose, and CI are in place before feature work.

## Repository layout

| Path | Contents |
|---|---|
| `apps/signaling` | Signaling server (later also hosts mediasoup) |
| `apps/web` | Next.js client |
| `packages/shared` | Types shared by client and server, starting with the Socket.IO event contract |

---

## Phase 0 — Foundation

- [x] **0.1 Monorepo restructure.** npm workspaces with `apps/signaling`, `packages/shared` and a single lockfile; the old client moves to `legacy/client`. *Why:* one install command, and a typed contract between client and server.
- [x] **0.2 Signaling server in TypeScript.** Typed events from `@together/shared`, environment-based config, health check endpoint. Same behaviour as before. *Why:* a typed base for everything that follows.
- [x] **0.3 Next.js web app.** Scaffold `apps/web` in TypeScript with static export and port the existing pages (home, call); then delete `legacy/client`. *Why:* the old react-scripts 4 client cannot build on Node 17+. Also fixed #7 early, because Next.js's async navigation made that race fail on every call.
- [x] **0.4 Docker Compose for development.** Postgres, Redis and coturn. *Why:* the whole backend runs locally with one command.
- [x] **0.5 Tooling and CI.** ESLint, Prettier, type checking, and a GitHub Actions pipeline. *Why:* every push is checked from the start.

## Phase 1 — Production-quality 1:1 calling

- [x] **1.1 `useLocalMedia` hook.** Request the camera once; handle denied permission and non-HTTPS pages; stop tracks on leave. *Fixes audit #6, #8, #10, #13.*
- [ ] **1.2 Native `RTCPeerConnection` wrapper.** Replaces simple-peer, with proper error handling. *Fixes #9, #14 and drops simple-peer (#7 was fixed in 0.3).*
- [ ] **1.3 Rooms and invite links.** `/room/[id]` instead of socket IDs; join and leave are safe to repeat. *Fixes #16, #18.*
- [ ] **1.4 Call lifecycle events.** Decline, hang-up and "other person left" are sent only to the affected participant. *Fixes #11, #12.*
- [ ] **1.5 STUN/TURN configuration.** ICE servers come from config, with local coturn in development. *Fixes #15.*
- [ ] **1.6 Device controls.** Mute, camera on/off, and choice of camera, microphone and speaker.
- [ ] **1.7 Reconnection.** Rejoin after a socket drop, ICE restart on failure, recovery after a browser refresh.
- [ ] **1.8 PostgreSQL schema and migrations.** Users and meetings.
- [ ] **1.9 Authentication.** Sign-up and login with JWT access tokens and refresh-token rotation.
- [ ] **1.10 Room-scoped join tokens.** Short-lived tokens, checked on every signaling event.

## Phase 2 — Multi-user collaboration

- [ ] **2.1 Server-side room state.** Presence and a participant list.
- [ ] **2.2 mediasoup on the server.** Workers, one router per room, transports.
- [ ] **2.3 mediasoup-client in the browser.** Send and receive through the SFU, replacing the P2P path.
- [ ] **2.4 Video grid.** Layout for any number of participants, with active-speaker highlighting.
- [ ] **2.5 Real-time chat.**
- [ ] **2.6 Reactions and hand raising.**
- [ ] **2.7 Roles.** Host, moderator and participant; mute others, remove participants, lock the meeting.
- [ ] **2.8 Waiting room with host approval.**
- [ ] **2.9 Room lifecycle.** Remove stale participants, shut down empty rooms, enforce room size limits.
- [ ] **2.10 Rate limiting and input validation** on every signaling event.

## Phase 3 — Platform capabilities

- [ ] **3.1 Redis-backed presence** and the Socket.IO Redis adapter, so more than one signaling server can run.
- [ ] **3.2 Screen sharing.**
- [ ] **3.3 Adaptive quality.** Simulcast (several quality layers per video), audio-only fallback, network-quality indicator.
- [ ] **3.4 Background blur.**
- [ ] **3.5 Scheduling, recurring rooms and meeting history.**
- [ ] **3.6 Notifications and calendar integration.** `.ics` export first, then Google Calendar.
- [ ] **3.7 File sharing and meeting notes.** S3-compatible storage with signed URLs.
- [ ] **3.8 Recording.** mediasoup → FFmpeg → S3, with retention rules.
- [ ] **3.9 Transcription.**
- [ ] **3.10 Meeting analytics.**

## Phase 4 — Production engineering

- [ ] **4.1 Structured logging** with request IDs.
- [ ] **4.2 Client WebRTC stats.** Packet loss, jitter, round-trip time and bitrate from `getStats()`.
- [ ] **4.3 Prometheus and Grafana dashboards.**
- [ ] **4.4 Unit tests** for signaling state.
- [ ] **4.5 Integration tests** for the room lifecycle.
- [ ] **4.6 Browser end-to-end tests** with Playwright and fake camera/microphone devices.
- [ ] **4.7 Load tests** with simulated participants; document the bottlenecks found.
- [ ] **4.8 Graceful shutdown** that lets active sessions finish.
- [ ] **4.9 Production deployment.** Docker images, HTTPS and secure WebSockets. The static host must serve Next.js's `.txt` route payloads as text; otherwise every page change is a full reload, which drops the call.
- [ ] **4.10 Documentation.** Architecture decision records, architecture overview, README.

---

## Appendix — Audit issues in the original app

Referenced as *#n* above. Found during the initial review of the `master` branch.

| # | Issue |
|---|---|
| 1 | Backend URL pointed at a Heroku app that no longer exists |
| 2 | Client install failed: `postcss-cli@8` conflicts with `postcss@7` |
| 3 | Lockfile out of date; both `yarn.lock` and `package-lock.json` present |
| 4 | react-scripts 4 fails on Node 17+ (`ERR_OSSL_EVP_UNSUPPORTED`) |
| 5 | Production build failed on an unused import |
| 6 | Camera requested twice; preview and sent stream differ; possible null crash |
| 7 | Remote stream written to a `<video>` that may not be mounted yet |
| 8 | Calling before camera permission resolves gives a one-way call |
| 9 | No peer `error` handler, so errors crash the page |
| 10 | No handling for denied permission or non-HTTPS pages |
| 11 | Hang-up broadcast to every user and ignored by the client |
| 12 | Declining a call never tells the caller |
| 13 | Leaving can crash and never stops camera tracks |
| 14 | `callAccepted` listener added again on every call |
| 15 | No TURN server |
| 16 | Meeting code is the socket ID, which changes on reconnect or refresh |
| 17 | Deep links 404 on static hosts |
| 18 | Calling an invalid code gives no feedback |

Issues 1–5 are resolved by Phase 0 (the new backend, workspaces and the Next.js client). Issue 17 is handled by the room routing in 1.3 and the hosting setup in 4.9.
