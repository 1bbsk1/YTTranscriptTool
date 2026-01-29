# AI Context Brief (yt-intel)

## Stack & commands
- TypeScript (NodeNext ESM) with tsx; lint via `npm run lint` (tsc --noEmit); tests via `npm test` (unit + CLI + e2e).
- CLIs:
  - `npm run fetch -- <VIDEO_ID> [lang] [channel]` (exit 100 on no_subs; help: `--help`).
  - `npm run batch` (reads `video_db.json`, delays/backoff, updates statuses; help: `--help`).
  - `npm run export [channels...]` (combines `video_data/<channel>/*.json` into `<channel>.json`; help: `--help`).

## Config
- `.env` keys: `API_KEYS` (comma), `USER_AGENTS` (comma), `LANG` (default ru), `MIN_DELAY`, `MAX_DELAY`, `LOG_LEVEL` (debug/info/warn/error). Defaults mirror Python. System `LANG` can override if set; pass lang arg to fetch/batch or set LANG env to control.

## Features/Parity
- YouTube client hits `youtubei/v1/player` with API key/UA rotation, retries/backoff, structured logs.
- Caption parser selects ASR track for requested lang, downloads srv3, converts to text.
- Batch runner mirrors Python status/delay/cooldown logic; export mirrors Python combined outputs.
- Exit codes: 0 success, 100 no subtitles, 1 error.

## Testing/Baseline
- Unit tests: captions parsing, YouTube client (mocked fetch), CLI parsing.
- E2E regression: uses Python baseline fixture `tests/fixtures/python_baseline/video_data/DevOops_conf/-kq832Othh4.json` (stubbed network) to assert TS output matches baseline.
- Baselines stored under `tests/fixtures/python_baseline/` (sample per-video + combined exports).

## Docs/Status
- Migration notes and plan: `docs/js-port.md`, `docs/js_port_plan.md` (all tasks marked complete).
- README updated for TS usage; Makefile notes Python path is legacy. Python scripts kept in `legacy/python/` but not primary.
