# video_db.py

import json
import sys
from pathlib import Path
from datetime import datetime

DB_PATH = Path("video_db.json")

def load_db():
    if not DB_PATH.exists():
        return []
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(data):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def video_key(entry):
    return (entry["channel"], entry["video_id"])

def print_stats(data):
    total = len(data)
    pending = sum(1 for v in data if v["status"] == "pending")
    print(f"Всего видео: {total}")
    print(f"Ожидают обработки: {pending}")

def init_from_file(path, channel):
    ids = [line.strip() for line in open(path, "r") if line.strip()]
    db = load_db()
    existing_keys = {video_key(v) for v in db}

    new_entries = []
    for video_id in ids:
        key = (channel, video_id)
        if key in existing_keys:
            continue
        new_entries.append({
            "channel": channel,
            "video_id": video_id,
            "status": "pending",
            "tries": 0,
            "last_attempt": None,
            "error": None
        })

    db.extend(new_entries)
    save_db(db)
    print(f"Добавлено {len(new_entries)} новых видео в базу.")

def main():
    args = sys.argv[1:]
    if not args:
        print_stats(load_db())
        return

    if args[0] == "init" and len(args) == 3:
        txt_path = Path(args[1])
        channel = args[2]
        if not txt_path.exists():
            print(f"Файл {txt_path} не найден.")
            return
        init_from_file(txt_path, channel)
    else:
        print("Использование:")
        print("  python video_db.py                 — показать статистику")
        print("  python video_db.py init FILE CHANNEL — инициализировать базу из .txt")

if __name__ == "__main__":
    main()
