import subprocess
import time
import random
import csv
from pathlib import Path
from datetime import datetime

RETRY_FILE = "retry_queue.txt"
LOG_FILE = "download_log.txt"
CSV_FILE = "subs_log.csv"
LANG = "ru"

def write_log(message):
    with open(LOG_FILE, "a", encoding="utf-8") as log:
        log.write(f"{message}\n")

def write_csv_row(video_id, channel, status):
    with open(CSV_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([video_id, channel, status, datetime.now().isoformat()])

def main():
    if not Path(RETRY_FILE).exists():
        print("❌ retry_queue.txt не найден.")
        return

    with open(RETRY_FILE, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    retry_pairs = [line.split(",") for line in lines]

    # Очистим retry_queue.txt, чтобы не пытаться повторно
    Path(RETRY_FILE).write_text("", encoding="utf-8")

    for i, (channel, video_id) in enumerate(retry_pairs):
        out_dir = Path("subs") / channel
        out_file = out_dir / f"{video_id}.{LANG}.txt"

        if out_file.exists():
            print(f"⏩ Уже скачано: {channel}/{video_id}")
            continue

        print(f"🔁 Повтор: {channel}/{video_id}")
        result = subprocess.run([
            "python", "fetch_subs.py", video_id, LANG, str(out_dir)
        ])

        if result.returncode == 0:
            write_log(f"✅ Повтор успех: {channel}/{video_id}")
            write_csv_row(video_id, channel, "retry_success")
        elif result.returncode == 100:
            write_log(f"⚠️ Повтор — нет субтитров: {channel}/{video_id}")
            write_csv_row(video_id, channel, "retry_no_subs")
        else:
            write_log(f"❌ Повтор неудача: {channel}/{video_id}")
            write_csv_row(video_id, channel, "retry_fail")
            with open(RETRY_FILE, "a", encoding="utf-8") as f:
                f.write(f"{channel},{video_id}\n")

        delay = random.uniform(4.0, 8.0)
        print(f"⏱ Пауза: {delay:.2f} сек")
        time.sleep(delay)

if __name__ == "__main__":
    main()
