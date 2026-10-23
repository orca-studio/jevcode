# Agent instructions

For any coding agent working in this repo — Claude Code, Codex, Cursor, an ACP agent.

`pnpm dev` starts the server, renderer and desktop shell together.

## What jevcode is

jevcode is a fork of [TasteCode](https://github.com/Leonxlnx/tastecode) (Apache-2.0) maintained
by orca-studio. It keeps TasteCode's shape — a local server that owns all state and
orchestration, thin Electron and web clients over a typed WebSocket protocol — and its coding
and design agents. On top of that it adds what TasteCode does not do: **driving other
applications through MCP connectors**, so one agent window can operate the user's apps.

The first connector is [Orca PPT](https://github.com/orca-studio/orca-ppt), orca-studio's own
presentation app. It serves MCP at `http://127.0.0.1:6722/mcp` while the app is open; its tool
contract is in `orca-ppt/docs/MCP.md`.

### Providers

jevcode ships four engines:

| Engine           | Integration                                                           | Status      |
| ---------------- | --------------------------------------------------------------------- | ----------- |
| Claude Code      | `packages/adapter-claude-code` (official Agent SDK), from upstream    | shipped     |
| Codex            | `packages/adapter-codex` (official App Server), from upstream         | shipped     |
| Grok             | `packages/adapter-grok`, from upstream                                | shipped     |
| DeepSeek Harness | `packages/adapter-dsh` (official Host Remote API), ported from jevbot | not started |

The other adapters inherited from upstream `nightly` (Cursor, OpenCode, Antigravity, Pi, the
ACP agent library) stay in the tree so upstream merges stay clean, but they are not part of
the jevcode product: do not build features for them or fix them unless asked. Hiding or
removing them is a separate, explicit decision. `packages/adapter-acp` is not optional either
way: Grok's MCP mode uses its protocol client.

**DeepSeek Harness (DSH).** Source: <https://github.com/deepseek-ai/deepseek-harness>. It is
a developer preview with breaking changes between releases. jevcode follows the integration
jevbot already shipped and verified (`jevbot-dev/jevbot-mac`, MIT, same owner):
`docs/runtime-integration.md` for the reasoning and acceptance list, `Runtime/dsh-host/` for
the code. Port it into `packages/adapter-dsh` as TypeScript; record the decision in
`docs/ARCHITECTURE.md`.

- **Official Host Remote API only, not ACP.** It is how DSH's own desktop app connects:
  `apps/desktop-host` in the DSH repo runs a Host with its web server, and `apps/desktop`
  talks to it through the client connection and API gateway packages. ACP appears only in
  the CLI (`dsh-acp-app`), for programmatic automation. jevbot started on ACP and removed
  it: ACP could not carry cancellation and DSH's native interactions without loss. Do not
  route DSH through `adapter-acp` or its agent library.
- **The Host runs as a child process of the server**, started with the server's own Node,
  a fresh `DSH_HOME` per run, telemetry disabled and a minimal inherited environment
  (`host-process.mjs`).
- **The profile is composed explicitly** (`profile.patch.yml`, `bootstrap.mjs`): it registers
  the jevcode MCP endpoint and DSH's timed `ask_user_question`, nothing else by default.
  Connector tools reach DSH through that endpoint and go through jevcode's approvals.
- **Use the official client**, loaded from the published `/client` bundles
  (`client-bundles.mjs`). RPC, auth, sequence checks and reconnect stay DSH's code; do not
  reimplement the wire protocol.
- **Native interactions** (`interactions.mjs`): approvals and user questions through DSH's
  official request waterfall, scoped to the session. Timeouts and disconnects never count
  as approval. Late answers to timed questions are submitted through the official answer
  method and rejected by the Host if stale.
- **The DeepSeek API key never touches disk.** It is read from the OS credential store and
  handed to the Host through an in-memory `CredentialProvider` (`credentials.mjs`).
- **Pin exact versions.** jevbot pinned the `@deepseek-ai/dsh*` packages at `0.2.0-rc.2`;
  npm has moved on (2026-10-23: `latest` is `0.2.1-rc.2`, `next` is `0.2.1-rc.3`). Start
  from a current release rather than jevbot's pin, and treat any version change as a
  migration: rerun the bridge tests and a real handshake, because the client bundle's
  loading boundary can change with it.
- **Tests come along.** jevbot's integration tests run a real Host and client against
  Messages SSE fixtures: full tool call, cancel then continue, disconnect mid-stream,
  restart and resume, missing session, bad auth, key not on disk, approvals and questions.
  Fixtures do not replace one run against the real model.

## Upstream and branches

| Remote     | Repository                               | Use                  |
| ---------- | ---------------------------------------- | -------------------- |
| `origin`   | `orca-studio/jevcode`                    | all jevcode work     |
| `upstream` | `Leonxlnx/tastecode` (push URL disabled) | fetch and merge only |

- **`dev` is the default and integration branch.** Feature branches start from `dev` and
  come back by PR into `dev`.
- **Sync upstream by merge, never rebase.** On a dedicated branch:
  `git fetch upstream && git merge upstream/nightly`, resolve every conflict explicitly,
  run the four gates, open a PR into `dev`. Sync little and often; a stale fork is where
  conflicts come from.
- **Never push to `upstream`** and never open PRs, issues or comments on `Leonxlnx/tastecode`
  without the owner asking. If a jevcode fix belongs upstream, say so and let the owner
  decide.
- **Never rebase or force-push a shared branch.** The local git config may default
  `git pull` to rebase; use `git fetch` + `git merge` instead.

### Keep the fork mergeable

Every line changed in an upstream file is a future merge conflict.

- Put jevcode code in new places: new packages (`packages/connectors`,
  `packages/adapter-dsh`), new UI folders (`apps/web/src/connectors/`), new server modules.
- When an upstream file must change, keep the edit small and hook-shaped (register, import,
  one branch), not a rewrite.
- jevcode's own docs live in `docs/jevcode/`. Leave upstream's docs (`docs/dashboard.html`,
  `docs/feature-inventory.html`, `docs/ROADMAP.md`, `docs/handoff/`, `docs/VISION.md`) as
  upstream wrote them; they describe TasteCode, not jevcode.
- Decisions that change upstream's architecture are still recorded in `docs/ARCHITECTURE.md`,
  in a section marked jevcode, with a change-log row.

## Read first

1. This file. Where it differs from anything under `rules/`, this file wins: those rules were
   written for TasteCode's two-person team and still name its people and its `main`/`nightly`
   model.
2. [rules/code.md](./rules/code.md) — cross-platform, style, decisions
3. [rules/security.md](./rules/security.md) — credentials
4. [rules/git.md](./rules/git.md) — commit and PR conventions (branch names in it mean `dev` here)
5. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — check whether a decision already exists
   before making a new one

## Hard rules

- **Everything in the repo is English** — code, comments, commit messages, PR text, issues.
  It keeps upstream merges readable. Chat with the owner can be in Chinese; none of it
  reaches the repo.
- **Never commit a secret**, including in fixtures and examples. Connector OAuth tokens and
  API keys go to the OS credential store and are referenced, never written to config or logs.
- **Agents do not commit, push or merge unless the owner asks** for that specific work.
  Draft PRs are fine once work is pushed by request.
- **Never write a `.sh` script.** Node/TypeScript only — jevcode ships on macOS and Windows.
- **Never assume POSIX paths.** Use `node:path`.
- **Never mix a refactor with a behavior change** in one commit, and never mix an upstream
  sync with jevcode changes in one PR.
- **Connectors are provider-agnostic.** A connector is configured once by the user and the
  server projects it into whichever engine runs the chat. It must work on every shipped
  engine, or the UI says honestly which engine cannot use it.
- **No application-specific code in shared code.** Shared code reads a connector's catalog
  entry (endpoint, transport, auth, tool risk tiers, launch identity) and the app's own MCP.
  An app's name appearing in the server, orchestrator or shared UI is a bug: put it in the
  catalog data instead.
- **The app owns its state; jevcode never works around its MCP.** No reading an app's files
  or database behind its back, no simulated input where the app offers a tool. If the tool
  is missing, the fix belongs in the app.
- **Approvals are jevcode's job.** Apps like Orca PPT deliberately leave authorization to the
  host. Tool risk tiers (`read` / `edit` / `confirm`) come from the catalog; an unknown tool
  is not auto-allowed.
- **Keep provider behavior checks inside adapters.** Shared code reads declared capabilities
  and degrades honestly when an engine lacks one; it never branches on a provider name.

## How to work

- **Check live state before starting.** Fetch, compare with `dev` and `upstream/nightly`,
  look at open PRs and worktrees. Never modify a worktree, branch or process you did not
  create.
- **Small commits, one logical change each.** Conventional Commits; the body says _why_.
- **One PR does one thing.** Never fold a design change into a PR about logic.
- **Taste calls belong to the owner.** Visual design, layout, copy, user-visible naming:
  find the options, show them, let the owner choose.
- **Report exactly.** Do not call something tested, signed, released or fixed unless it was.
  Say what was not verified.

## Before you mark a PR ready

- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` all clean locally
- Exercise the affected flow with `pnpm dev` for UI or server changes; for a connector,
  against the real app with at least one shipped engine
- Anything visual has a screenshot in the PR body
- Record the local commands and results in the PR body

## Running locally

- Keep local binds on `127.0.0.1`.
- `pnpm dev` refuses to start while another process holds port 4311 or 5183. An installed
  TasteCode or jevcode build holds 4311 and shares the same data folder; quit it first and
  never kill it for the user.
- If the agent shell exports `ELECTRON_RUN_AS_NODE`, unset it for `pnpm dev`; otherwise
  Electron starts as Node and cannot import `BrowserWindow`. On macOS, reference-library
  tests need `TMPDIR` set to its canonical `/private/var/...` path rather than `/var/...`.
- GitHub Actions stay manual-only. Platform-specific changes need a local run on the
  affected OS.

## Traps inherited from upstream

Each of these cost someone hours. They are not preferences.

- **TypeScript is pinned to 5.9.3.** 7.x cannot resolve `@types/node` under pnpm. Do not
  "upgrade" it.
- **`tsc -b` in a `packages/*` adapter restarts the running dev server.** The server
  imports adapters from their `dist/`, and `tsx watch` restarts on any change there — which
  kills every live provider session. While `pnpm dev` is up, typecheck adapters with
  `tsc --noEmit -p packages/<name>` and leave `pnpm typecheck`/`pnpm build` for when no turn
  is running.
- **Use `127.0.0.1`, never `localhost`.** On Windows `localhost` resolves to IPv6 first and
  Electron gets a blank window.
- **Shiki runs the JavaScript regex engine, not WASM**, because the CSP blocks
  `wasm-unsafe-eval`. Do not weaken the CSP to fix a highlighting problem.
- **`packages/contracts` is shared by every client.** A change there ships as its own PR
  before anything builds against it, and is the most likely upstream conflict: prefer
  adding new methods over changing existing ones.
- **Windows CLI shims are `.cmd` files.** `spawn('claude')` fails with EINVAL; use
  `spawnCli` from `@harness/proc`. Never hand-build a `cmd.exe /c` line. Multiline text goes
  through stdin.
- **Adapters are written against captured output**, not against published schemas. When a
  protocol and its documentation disagree, the wire wins. This matters double for DSH.
- **Anything on the per-delta path is on the critical path.** A streamed answer produces
  hundreds of `item.delta` events a second; every one runs the store reduce and re-renders
  its subscribers. Ask what new work there costs times the length of the session.
- **Never put an unstable callback identity in an effect dependency list when the effect's
  trigger condition persists across renders.** It becomes an invisible infinite loop. Latch
  one-shot notifications with a ref; give callbacks in dependency lists a stable identity.

## When unsure

Ambiguity that changes the shape of the work → ask. Ambiguity that does not → decide,
proceed, state the assumption in the PR. Don't stall with nothing delivered.
