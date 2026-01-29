# TRANSCRIPT_TOOL

Single-source context for the YouTube Transcript Tool: stack, commands, config, data locations, completed work, and open tasks.

## Stack & Commands
- TypeScript (NodeNext ESM) with `tsx`; lint via `npm run lint` (tsc --noEmit); tests via `npm test` (unit + CLI + e2e).
- CLIs:
  - `npm run fetch -- <VIDEO_ID> [lang] [channel]` (exit 100 on no_subs; `--help` for usage).
  - `npm run batch` (reads `video_db.json`, retries with delays/cooldowns, updates statuses; `--help` for usage).
  - `npm run export [channels...]` (combines `video_data/<channel>/*.json` into `<channel>.json`; defaults to DevOops_conf/HighLoadChannel when no args).

## Config (.env)
- `API_KEYS` (comma), `USER_AGENTS` (comma), `LANG` (default ru), `MIN_DELAY`, `MAX_DELAY`, `LOG_LEVEL` (debug/info/warn/error). System `LANG` can override; pass `lang` to CLIs to control explicitly.
- Config mirrors Python defaults and includes client version/UA rotation, backoff and cooldown settings, and a guard against missing API keys.
- Logger (`src/logger.ts`) emits timestamped logs honoring `LOG_LEVEL`.

## Data & Outputs
- Runtime outputs live in `video_data/` (per-video JSON) and per-channel exports (`<channel>.json`). These are gitignored; keep only test fixtures under `tests/fixtures/`.
- Baseline fixtures from the Python flow: `tests/fixtures/python_baseline/` (used by e2e tests).
- If you create ad-hoc inputs (e.g., `<channel>.txt` lists) or exports, keep them out of git or park them under `archive/` for reference.

## Behavior & Features (TS flow)
- YouTube client hits `youtubei/v1/player` with API key/UA rotation, retries/backoff, structured logs.
- Captions: picks ASR track for requested `lang`, downloads srv3, converts to plain text.
- Batch: mirrors Python status/delay/cooldown logic; writes back to `video_db.json`.
- Export: combines per-video JSONs into a channel JSON array.
- Outputs use schema `{video_id, channel, title, views:int, duration:int, published, text}`; exit codes: 0 success, 100 no subtitles, 1 error.

## Testing & Baselines
- Unit: captions parsing, YouTube client (mocked fetch), CLI arg parsing.
- E2E regression: compares TS output to Python baseline fixture `tests/fixtures/python_baseline/video_data/DevOops_conf/-kq832Othh4.json` with stubbed network.
- Commands: `npm run lint`, `npm test`.

## Completed Work
- JS Port (all done): scaffolding, shared config/logging, youtubei client, single fetch, batch runner, export pipeline, CLI parity, e2e regression, docs/cleanup.
- Cleanup (all done): legacy Python moved to `legacy/python/` with README; planning files moved into `docs/`; runtime data gitignored; env/docs clarified; archive option for old exports.

## Open TODO
- Channel resolver: channel URL/handle → channel ID + capped video ID list (choose YouTube Data API or youtubei feed/search).
- Fetcher as callable: expose batch/single fetch flows as importable functions (keep CLIs intact).
- Job runner: accept ID list, run fetch with backoff/status, produce export.
- Telegram flow: `/fetch` handler, delivery (zip/size handling), per-user limits; safety/logging caps and minimal metrics.
- Template item placeholder remains unchecked in `docs/todo.md`.

## Legacy Python (reference only)
- Lives in `legacy/python/` (`fetch_subs.py`, `batch_fetch.py`, `export_combined_json.py`, `video_db.py`, `requirements.txt`, `ruff.toml`, README). TS is primary; Python kept for parity/backcompat.

## Quick Run (typical flow)
- Fetch one: `npm run fetch -- VIDEO_ID [lang] [channel]`
- Batch: ensure `video_db.json` populated (e.g., via `legacy/python/video_db.py init <ids.txt> <channel>`), then `npm run batch`
- Export: `npm run export <channel>` to produce `<channel>.json` in repo root
