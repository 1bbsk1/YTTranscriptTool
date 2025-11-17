# TODO (keep 5–15 items; one line per task)
- [ ] Template (type: template) — copy this format: goal/acceptance criteria; tests: make lint && make test && make typecheck; notes: add details as needed.
- [ ] Bot dependencies and config (type: feat) — pick Telegram framework, pin dependency, document TELEGRAM_BOT_TOKEN in README/.env.example; tests: make lint; notes: prefer aiogram or grammy wrapper.
- [ ] Channel resolver (type: feat) — resolve channel URL/handle to channel ID and list video IDs with caps; tests: make lint; notes: choose YT Data API or youtubei feed/search.
- [ ] Fetcher as callable (type: refactor) — expose batch_fetch/fetch_subs as importable functions for programmatic use; tests: make lint && make typecheck; notes: keep CLI entrypoints intact.
- [ ] Job runner (type: feat) — accept video ID list, run fetcher with backoff, track per-video status, produce export; tests: make lint && make test; notes: reuse export_combined_json or shared function.
- [ ] Telegram /fetch handler (type: feat) — validate URL, resolve IDs, enqueue job, send progress/final file or friendly error; tests: make lint && make test; notes: include per-user limits.
- [ ] Delivery and size handling (type: feat) — package JSON (zip if needed), handle “no subtitles” cases, respect Telegram size limits; tests: make lint && make test; notes: stream/log failures.
- [ ] Safety and logging (type: refactor) — add caps, rate limits, and minimal structured logs; tests: make lint && make test; notes: centralize limits in config.

Self-review checklist: tests run? names clear? dead code/logs removed? errors handled? docs/notes updated?
