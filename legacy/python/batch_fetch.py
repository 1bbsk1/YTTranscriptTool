# batch_fetch.py

import json
import os
import random
import subprocess
import time
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

# === Загрузка .env ===
load_dotenv()

# === Константы ===
DB_PATH = Path("video_db.json")
MIN_DELAY = float(os.getenv("MIN_DELAY", 1.5))
MAX_DELAY = float(os.getenv("MAX_DELAY", 3.5))
SHORT_COOLDOWN = (60, 90)
LONG_COOLDOWN = (300, 420)
SOFT_ERROR_LIMIT = 2
HARD_ERROR_LIMIT = 3

# === Функции работы с базой ===
def load_db():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(data):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def is_valid(entry):
    path = Path("video_data") / entry["channel"] / f"{entry['video_id']}.json"
    if not path.exists():
        return False
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return all([
            data.get("title"),
            data.get("text"),
            isinstance(data.get("views"), int) and data["views"] > 0
        ])
    except Exception:
        return False

# === Основной цикл ===
def main():
    db = load_db()
    error_streak = 0

    for entry in db:
        status = entry["status"]
        if status == "success" and is_valid(entry):
            print(f"⏩ Уже есть: {entry['channel']}/{entry['video_id']}")
            continue

        video_id = entry["video_id"]
        lang = "ru"
        channel = entry.get("channel") or "UnknownChannel"

        print(f"\n⬇️ {channel}: {video_id}")
        print(f"📞 Вызов: fetch_subs.py {video_id} {lang} {channel}")

        entry["tries"] += 1
        entry["last_attempt"] = datetime.now().isoformat()

        result = subprocess.run([
            "python", "fetch_subs.py", video_id, lang, channel
        ])

        # Новая логика — главное, чтобы файл валиден
        if is_valid(entry):
            print(f"✅ Успех: {channel}/{video_id}")
            entry["status"] = "success"
            entry["error"] = None
            error_streak = 0
        elif result.returncode == 100:
            print(f"⚠️ Нет субтитров: {channel}/{video_id}")
            entry["status"] = "no_subs"
            entry["error"] = "NO_SUBTITLES"
            error_streak = 0
        else:
            print(f"❌ Ошибка: {channel}/{video_id}")
            entry["status"] = "error"
            entry["error"] = f"Return code: {result.returncode}"
            error_streak += 1

        save_db(db)

        # Anti-throttling логика
        if error_streak == SOFT_ERROR_LIMIT:
            cooldown = random.uniform(*SHORT_COOLDOWN)
            print(f"⏸️ {error_streak} ошибки подряд — короткая пауза {cooldown:.1f} сек")
            time.sleep(cooldown)
        elif error_streak >= HARD_ERROR_LIMIT:
            cooldown = random.uniform(*LONG_COOLDOWN)
            print(f"🧊 {error_streak} ошибок подряд — длинная пауза {cooldown:.1f} сек")
            time.sleep(cooldown)
            error_streak = 0

        delay = random.uniform(MIN_DELAY, MAX_DELAY)
        print(f"⏱ Пауза: {delay:.2f} сек")
        time.sleep(delay)

if __name__ == "__main__":
    main()
