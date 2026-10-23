# Claude Code instructions

Claude Code loads this file automatically. The repository's agent rules live in
`AGENTS.md` and apply to every agent; they are imported here:

@AGENTS.md

## Owner

`zhenwusw` (orca-studio) owns jevcode: product direction, taste calls, merges and releases.
The owner also maintains [Orca PPT](https://github.com/orca-studio/orca-ppt) and
[jevbot](https://github.com/jevbot-dev), the native macOS/Windows predecessor whose connector
catalog, approval tiers and DSH integration notes are the reference for jevcode's own.

Upstream TasteCode is maintained by Leon (`Leonxlnx`) and his team. They are not jevcode
reviewers; do not contact them or act on their repository unless the owner asks.

## Current state (2026-10-23)

- `dev` was cut from `upstream/nightly` at `5c435d0d` and has no jevcode commits yet beyond
  these instruction files.
- Product identity is still upstream's. Until it changes, a jevcode build is
  indistinguishable from TasteCode on the machine:
  - `apps/desktop/package.json`: `productName` "Taste Code", `appId`
    `dev.tastecode.desktop`, electron-builder `publish` targets `Leonxlnx/tastecode`.
  - The updater reads `Leonxlnx/tastecode` releases (`apps/desktop/src/github-release-provider.ts`,
    `apps/server/src/update-check.ts`). A jevcode build will offer to replace itself with
    the next TasteCode release.
  - Same server port (4311) and data folder as an installed TasteCode.
- Changing that identity (name, app id, data folder, port, update feed) is the first jevcode
  change to plan; the name is the owner's call.
- `rules/*.md` and upstream docs still describe TasteCode's team; `AGENTS.md` overrides them.

Recheck live state (`git fetch`, open PRs) before relying on anything in this section.
