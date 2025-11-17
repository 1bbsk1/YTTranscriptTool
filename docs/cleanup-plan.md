# Repository Cleanup Plan (keep 5–15 items; one line per task)
0. [x] Template (type: template) — copy this format: goal/acceptance criteria; tests: npm run lint && npm test; notes: adjust as needed.
1. [x] Move Python legacy to `legacy/python/` (type: chore) — relocate `fetch_subs.py`, `batch_fetch.py`, `export_combined_json.py`, `video_db.py`, `requirements.txt`, `ruff.toml`; add `legacy/python/README.md` with usage; tests: npm run lint.
2. [x] Root cleanup (type: chore) — keep TS artifacts at root; move planning files (`todo.md`, `tasks.json`, `js_port_plan.md`) into `docs/`; tests: npm run lint; notes: update README links.
3. [x] Runtime data hygiene (type: chore) — ensure `video_data/`, `video_db.json`, exports (`*.json`, `video_data.zip`) are gitignored or moved under `data/` with `data/README.md`; keep only test fixtures under `tests/fixtures/`; tests: npm run lint.
4. [x] Env clarity (type: docs) — document LANG/LOG_LEVEL behavior and optional `TRANSCRIPT_LANG` suggestion in README + `.env.example`; tests: npm run lint.
5. [x] Legacy references (type: docs) — add a short section in README pointing to `legacy/python/` and clarifying TS is primary; tests: npm run lint.
6. [x] Optional data archive (type: chore) — move `video_data.zip` and old exports to `archive/` or `data/` with a note; tests: npm run lint.
