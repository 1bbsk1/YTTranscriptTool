# YouTube Transcript Parser

A tool for bulk downloading auto-generated subtitles (ASR) from YouTube — including videos where standard tools like `yt-dlp` or `youtube-transcript-api` fail.

## 🚀 Features

- Bypasses YouTube API limitations using `youtubei/v1/player`
- Supports multiple API keys and randomized user-agents
- Stable `batch_fetch` script with retries, delays, and error handling
- Saves transcript text along with video title, views, duration, and publish date
- Exports clean `.json` data ready for ML / LLM processing

## 📦 Structure

- `fetch_subs.py` — fetches and parses subtitles for a single video
- `batch_fetch.py` — loops through a list of videos in `video_db.json`
- `export_combined_json.py` — combines parsed data into exportable JSON by channel

## 🛠 Requirements

```bash
pip install -r requirements.txt
```

## ⚙️ .env Example

Create a `.env` file in the project root with the following content:

```env
API_KEYS=your_api_key1,your_api_key2
USER_AGENTS=agent1,agent2
LANG=ru
MIN_DELAY=1.5
MAX_DELAY=3.5
```

## ▶️ Usage

Fetch a single video (manually):

```bash
python fetch_subs.py VIDEO_ID ru CHANNEL_NAME
```

Process the full video list from `video_db.json`:

```bash
python batch_fetch.py
```

Export combined JSON files by channel:

```bash
python export_combined_json.py
```

## 📁 Output Format

Each resulting JSON contains:

```json
{
  "video_id": "abc123",
  "channel": "ExampleChannel",
  "title": "Example Video Title",
  "views": 12345,
  "duration": 456,
  "published": "2022-01-01",
  "text": "Full transcript text..."
}
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).