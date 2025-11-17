# JS/TS Port Notes

- Stack: TypeScript (NodeNext ESM), tsx for dev, tsc --noEmit as lint, dotenv + undici for env and HTTP.
- Config: `src/config.ts` loads .env and mirrors Python defaults (LANG ru, delay ranges, client versions, user agents). `requireApiKeys` guards empty API key sets.
- CLI scaffold: `npm run fetch` -> `tsx src/cli/fetchSubs.ts <VIDEO_ID> [lang] [channel]` writes `video_data/<channel>/<id>.json` (Python shape) with .env API keys; shared logic in `src/flows/fetchSingle.ts`.
- Batch: `npm run batch` -> `tsx src/cli/batchFetch.ts` consumes `video_db.json`, retries with delays/cooldowns, updates the DB, and reuses the single-fetch flow.
- Export: `npm run export [channels...]` -> `tsx src/cli/exportCombined.ts` combines `video_data/<channel>/*.json` into `<channel>.json` in repo root (defaults to DevOops_conf/HighLoadChannel).
- CLI parity: help/usage flags on all CLIs; parsers exported and tested so imports don’t auto-run entrypoints; exit codes preserved (100 on no_subs).
## Testing & regression
- Unit: captions parsing, YouTube client (mocked fetch with retries/backoff), CLI arg parsing.
- E2E regression: uses Python baseline fixture `tests/fixtures/python_baseline/video_data/DevOops_conf/-kq832Othh4.json` with stubbed network to ensure TS flow writes identical output (text compared via prefix) to a temp folder.
- Pending modules: YouTube client hitting `youtubei/v1/player` with key/UA rotation + retry/backoff; caption XML parser to plain text; shared video record types.
- Large transcript handling: store transcripts as files/object storage (gzip) instead of DB rows; chunk before summarization; only send summaries to the bot/web UI.
- Next actions: port `fetch_subs` into `src/clients/youtube` + `src/flows/fetchSubs`; define output schema and paths; add fixtures/tests and wire into npm scripts.

## Shared config/logging
- Config reads .env + defaults: `API_KEYS`, `CLIENT_VERSIONS`, `USER_AGENTS`, `LANG`, `MIN_DELAY`, `MAX_DELAY`, cooldowns (short 60–90s, long 300–420s), error limits (2 soft/3 hard), `LOG_LEVEL` (debug/info/warn/error).
- Logger (`src/logger.ts`) emits timestamped, leveled logs honoring `LOG_LEVEL`; all CLIs/flows now use it instead of raw console logs.

## Python inventory (reference for parity)
- Entrypoints: `fetch_subs.py` (single video, writes `video_data/<channel>/<id>.json`, exit 100 on NO_SUBTITLES), `batch_fetch.py` (iterates `video_db.json`, delays/backoffs, updates statuses), `export_combined_json.py` (combines per-channel JSONs), `video_db.py` (init/stats).
- Env/config: `.env` with `API_KEYS` (comma-separated), `USER_AGENTS` (comma-separated), `LANG` default ru, `MIN_DELAY`/`MAX_DELAY` (seconds), optional Telegram token unused by scripts. Hardcoded client versions and UA fallbacks in Python.
- External calls: POST `https://www.youtube.com/youtubei/v1/player?key=<API_KEY>` with randomized `clientVersion`/UA; GET captions `baseUrl&fmt=srv3`; XML parsed to plain text concatenating `<s>` tokens per `<p>`.
- Behavior: random initial delay per call, 5 attempts with 3–6s backoff for player API; caption selection prefers matching `languageCode` with `kind` containing `asr`; statuses in DB: `pending|success|error|no_subs`; error streaks trigger short (60–90s) and long (300–420s) cooldowns; validity check ensures title/text and positive views.
- Outputs: video JSON schema `{video_id, channel, title, views:int, duration:int, published, text}`; combined exports are arrays of these objects per channel.
