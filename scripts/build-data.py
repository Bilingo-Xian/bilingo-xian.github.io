#!/usr/bin/env python3
"""
Rebuilds the site's data files:

  src/data/curriculum.json  - lesson metadata (names, target vocab, target structures)
                              parsed from the GE Master File (GE3 sheet)
  src/data/content.json     - activity files per lesson, scanned from public/content/

Run from the project root:  python3 scripts/build-data.py
Or from the workspace:      python3 bilingo-site/scripts/build-data.py

When you later add GE4-GE8 materials, drop folders into public/content/GE<n>/
and rerun this script — the site picks them up automatically.
"""

import json
import re
import sys
from pathlib import Path

# --- locate paths -----------------------------------------------------------
script_dir = Path(__file__).resolve().parent
project_root = script_dir.parent
workspace = project_root.parent

MASTER_FILE = workspace / "GE Master File (latest edit).xlsx"
CONTENT_DIR = project_root / "public" / "content"
OUT_DIR = project_root / "src" / "data"

SHEET_LEVELS = {"GE3": "GE3"}  # extend later: "GE4": "GE4", ...

# ---------------------------------------------------------------------------
# 1. curriculum data from the master file
# ---------------------------------------------------------------------------
def parse_curriculum():
    import openpyxl

    wb = openpyxl.load_workbook(MASTER_FILE, read_only=True, data_only=True)
    lessons = []

    for sheet_name in SHEET_LEVELS.values():
        ws = wb[sheet_name]
        rows = list(ws.iter_rows(values_only=True))
        current = None
        last_unit_title = ""

        for row in rows[2:]:  # skip header rows
            code = (str(row[0]).strip() if row[0] else "")
            m = re.match(r"^(GE\d+)U(\d+)C(\d+)$", code)
            if m:
                current = {
                    "level": m.group(1),
                    "unit": int(m.group(2)),
                    "cycle": int(m.group(3)),
                    "code": f"{m.group(1)} U{m.group(2)}C{m.group(3)}",
                    "unitTitle": "",
                    "classTitle": (str(row[2]).strip() if row[2] else ""),
                    "vocabulary": [],
                    "structures": [],
                }
                lessons.append(current)

            if current is None:
                continue

            # unit title appears on the first row of a lesson, only when the unit changes
            unit_title = (str(row[1]).strip() if row[1] else "")
            if unit_title:
                last_unit_title = unit_title
                current["unitTitle"] = unit_title
            elif not current["unitTitle"]:
                current["unitTitle"] = last_unit_title

            # vocabulary: columns H,I,J (indices 7,8,9); structures: K,L,M (10,11,12)
            for idx, key in ((7, "vocabulary"), (8, "vocabulary"), (9, "vocabulary"),
                             (10, "structures"), (11, "structures"), (12, "structures")):
                if idx >= len(row):
                    continue
                val = row[idx]
                if val is None:
                    continue
                val = re.sub(r"\s*\|\s*", " ", str(val)).strip()
                if not val or val.upper() == "N/A":
                    continue
                if val not in current[key]:
                    current[key].append(val)

    return lessons


# ---------------------------------------------------------------------------
# 2. content manifest from public/content/
# ---------------------------------------------------------------------------
def classify(fname: str) -> str:
    ext = fname.lower().rsplit(".", 1)[-1] if "." in fname else ""
    if ext in ("html", "htm"):
        return "game"
    if ext in ("mp4", "mov", "webm", "m4v"):
        return "video"
    if ext in ("png", "jpg", "jpeg", "gif", "webp", "svg"):
        return "image"
    if ext == "pdf":
        return "pdf"
    if ext in ("doc", "docx"):
        return "doc"
    if ext in ("xls", "xlsx", "xlsm", "csv"):
        return "sheet"
    return "other"


def scan_content():
    content = {}
    if not CONTENT_DIR.exists():
        return content

    for level_dir in sorted(CONTENT_DIR.iterdir()):
        if not level_dir.is_dir():
            continue
        level = level_dir.name  # e.g. "GE3"
        level_key = level.replace(" ", "")
        lessons = {}

        for lesson_dir in sorted(level_dir.iterdir()):
            if not lesson_dir.is_dir():
                continue
            m = re.match(rf"^{level}\s*U(\d+)C(\d+)", lesson_dir.name)
            if not m:
                continue
            code = f"{level} U{m.group(1)}C{m.group(2)}"
            files = []
            for f in sorted(lesson_dir.iterdir()):
                if not f.is_file() or f.name.startswith(".") or f.name == "Icon\r":
                    continue
                files.append({
                    "name": f.name,
                    "type": classify(f.name),
                    "path": f"content/{level_dir.name}/{lesson_dir.name}/{f.name}",
                })
            if files:
                lessons[code] = files

        extras = []
        for f in sorted(level_dir.iterdir()):
            if f.is_file() and not f.name.startswith("."):
                extras.append({
                    "name": f.name,
                    "type": classify(f.name),
                    "path": f"content/{level_dir.name}/{f.name}",
                })

        content[level_key] = {"lessons": lessons, "extras": extras}

    return content


def main():
    lessons = parse_curriculum()
    content = scan_content()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "curriculum.json").write_text(
        json.dumps({"lessons": lessons}, ensure_ascii=False, indent=2))
    (OUT_DIR / "content.json").write_text(
        json.dumps(content, ensure_ascii=False, indent=2))

    n_lessons = len(lessons)
    n_files = sum(len(v["lessons"].get(l["code"], []))
                  for v in content.values() for l in lessons
                  if v.get("lessons"))
    print(f"OK: {n_lessons} lessons, {n_files} activity files mapped.")


if __name__ == "__main__":
    sys.exit(main())
