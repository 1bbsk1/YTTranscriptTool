# fetch_subs.py

import requests
import xml.etree.ElementTree as ET
import sys
import random
import time
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime

# Загрузка ключей и параметров
load_dotenv()
API_KEYS = os.getenv("API_KEYS", "").split(",")

CLIENT_VERSIONS = [
    "2.20210721.00.00",
    "2.20210812.07.00",
    "2.20210909.07.00",
    "2.20211012.00.00"
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "Mozilla/5.0 (X11; Linux x86_64)"
]

# Аргументы: video_id lang channel
video_id = sys.argv[1]
lang = sys.argv[2] if len(sys.argv) > 2 else "ru"
channel = sys.argv[3] if len(sys.argv) > 3 else "UnknownChannel"
out_path = Path("video_data") / channel / f"{video_id}.json"
out_path.parent.mkdir(parents=True, exist_ok=True)

def get_video_data(video_id, lang="ru"):
    for attempt in range(5):
        key = random.choice(API_KEYS)
        version = random.choice(CLIENT_VERSIONS)
        user_agent = random.choice(USER_AGENTS)

        endpoint = "https://www.youtube.com/youtubei/v1/player"
        params = {"key": key}
        headers = {
            "User-Agent": user_agent,
            "Content-Type": "application/json"
        }
        body = {
            "videoId": video_id,
            "context": {
                "client": {
                    "hl": lang,
                    "clientName": "WEB",
                    "clientVersion": version
                }
            }
        }

        try:
            r = requests.post(endpoint, params=params, headers=headers, json=body)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"⏳ Попытка {attempt + 1}/5 не удалась: {e}")
            time.sleep(3 + random.random() * 3)

    raise Exception("❌ Не удалось получить данные о видео после 5 попыток")

def extract_caption_url(data, lang="ru"):
    try:
        caption_tracks = data["captions"]["playerCaptionsTracklistRenderer"]["captionTracks"]
        for track in caption_tracks:
            if track.get("languageCode") == lang and "asr" in track.get("kind", ""):
                return track["baseUrl"]
        raise ValueError("NO_SUBTITLES")
    except KeyError:
        raise ValueError("NO_SUBTITLES")

def download_subs_text(url):
    url += "&fmt=srv3"
    r = requests.get(url)
    r.raise_for_status()
    root = ET.fromstring(r.text)
    lines = []
    for p in root.findall(".//p"):
        words = [s.text.strip() for s in p.findall("s") if s.text]
        if words:
            lines.append(" ".join(words))
    return " ".join(lines)

def build_result(data, text):
    return {
        "video_id": video_id,
        "channel": channel,
        "title": data.get("videoDetails", {}).get("title", ""),
        "views": int(data.get("videoDetails", {}).get("viewCount", 0)),
        "duration": int(data.get("videoDetails", {}).get("lengthSeconds", 0)),
        "published": extract_published_date(data),
        "text": text
    }

def extract_published_date(data):
    try:
        micro = data["microformat"]["playerMicroformatRenderer"]
        return micro.get("publishDate", "")
    except KeyError:
        return ""

def main():
    delay = random.uniform(1.5, 3.5)
    print(f"⏱ Задержка перед запросом: {delay:.2f} сек")
    time.sleep(delay)

    try:
        print("📡 Запрашиваю данные о видео...")
        data = get_video_data(video_id, lang)
        url = extract_caption_url(data, lang)
    except ValueError as ve:
        if str(ve) == "NO_SUBTITLES":
            print("⚠️ Автосубтитры отсутствуют")
            sys.exit(100)
        else:
            print(f"❌ Ошибка: {ve}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Ошибка запроса: {e}")
        sys.exit(1)

    try:
        print("📥 Скачиваю субтитры...")
        text = download_subs_text(url)
        result = build_result(data, text)

        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"✅ Сохранено: {out_path}")
    except Exception as e:
        print(f"❌ Ошибка при обработке: {e}")
        sys.exit(2)

if __name__ == "__main__":
    main()
