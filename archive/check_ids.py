import json
from pathlib import Path

# Путь к базе
db_path = Path("video_db.json")

# Все .txt-файлы с ID
txt_files = list(Path(".").glob("*.txt"))

# Подсчёт ID в txt
txt_ids = set()
for f in txt_files:
    with open(f, "r") as file:
        for line in file:
            id = line.strip()
            if id:
                txt_ids.add(id)

# Подсчёт ID в базе
with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)
db_ids = {entry["video_id"] for entry in db}

print(f"ID в .txt: {len(txt_ids)}")
print(f"ID в базе: {len(db_ids)}")

if txt_ids == db_ids:
    print("✅ Совпадают")
else:
    print("⚠️ Разные. Разница:")
    print("В txt, но не в базе:", txt_ids - db_ids)
    print("В базе, но не в txt:", db_ids - txt_ids)
