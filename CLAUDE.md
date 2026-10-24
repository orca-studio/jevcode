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

- `dev` was cut from `upstream/nightly` at `5c435d0d`.
- The machine identity is Jevcode's: app name "Jevcode", app id `ai.orca-studio.jevcode`,
  its own data folder, settings folder and keychain service, ports 4321/5193, and update
  checks and release publishing against `orca-studio/jevcode`. A Jevcode build runs beside
  an installed TasteCode without sharing anything.
- Visible copy still says TasteCode (onboarding, settings, errors, about), and the app
  icon is TasteCode's. Both are the owner's call and have not been changed.
- `rules/*.md` and upstream docs still describe TasteCode's team; `AGENTS.md` overrides them.
- `rules/*.md` and upstream docs still describe TasteCode's team; `AGENTS.md` overrides them.

Recheck live state (`git fetch`, open PRs) before relying on anything in this section.
