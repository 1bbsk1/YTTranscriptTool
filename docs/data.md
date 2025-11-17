# Data & Outputs

- Runtime outputs (transcripts, combined exports) live in `video_data/` and per-channel JSON files. These are gitignored; keep only test fixtures under `tests/fixtures/`.
- If you generate new exports (e.g., `DevOops_conf.json`), keep them out of the repo or move them to `archive/` for reference.
- Baseline fixtures from the Python flow are stored in `tests/fixtures/python_baseline/` and used by the e2e tests.
