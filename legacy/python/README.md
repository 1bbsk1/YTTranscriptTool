# Legacy Python Scripts

These are the original Python entrypoints preserved for reference. The TypeScript version is the primary path.

## Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## Usage
- Single video: `python fetch_subs.py VIDEO_ID [lang] [channel]`
- Batch: `python batch_fetch.py` (uses `video_db.json`)
- Export combined JSON: `python export_combined_json.py`
- Video DB helper: `python video_db.py` (init/stats)

Notes:
- Reads `.env` for API_KEYS/USER_AGENTS/etc.
- Exit code 100 indicates no subtitles.
- Output schema matches the TS version (`video_data/<channel>/<id>.json`).
