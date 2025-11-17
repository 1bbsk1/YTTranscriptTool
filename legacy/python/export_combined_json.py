import json
from pathlib import Path

# Каналы для экспорта
CHANNELS = ["DevOops_conf", "HighLoadChannel"]
OUTPUT_DIR = Path(".")  # корневая папка
INPUT_ROOT = Path("video_data")

def collect_channel_data(channel):
    channel_path = INPUT_ROOT / channel
    if not channel_path.exists():
        print(f"❌ Папка не найдена: {channel_path}")
        return []

    combined = []
    for file in channel_path.glob("*.json"):
        try:
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
            if all([data.get("title"), data.get("text"), data.get("video_id")]):
                combined.append(data)
            else:
                print(f"⚠️ Пропущен (неполный): {file}")
        except Exception as e:
            print(f"⚠️ Ошибка чтения {file}: {e}")
    return combined

def main():
    for channel in CHANNELS:
        print(f"📦 Объединяю: {channel}")
        data = collect_channel_data(channel)
        out_path = OUTPUT_DIR / f"{channel}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ Сохранено: {out_path} ({len(data)} видео)")

if __name__ == "__main__":
    main()
