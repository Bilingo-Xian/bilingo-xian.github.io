#!/usr/bin/env python3
"""
Rebuilds the site's data files:

  src/data/curriculum.json  - per lesson: class title, tiered (A/B/C) vocabulary,
                              structures, grammar, extra activities
                              parsed from the GE Master File (GE3 sheet)
  src/data/content.json     - activity files per lesson, scanned from public/content/
                              images referenced by a lesson's HTML files are tagged
                              role="asset" (hidden from teachers); the rest role="set"

Run from the project root:  python3 scripts/build-data.py

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

SHEET_LEVELS = ["GE3"]  # extend later: "GE4", ...

# Excel fill colors per tier (verified in the master file)
TIER_COLORS = {"A": "#00B050", "B": "#FFC000", "C": "#FF767A"}

NA = {"N/A", "NA", ""}


def clean(value):
    """Normalize a cell: flatten newlines into separate items, strip 'N/A'."""
    if value is None:
        return []
    text = str(value).replace("\r", "\n")
    items = []
    for line in text.split("\n"):
        line = line.strip()
        if not line or line.upper() in NA:
            continue
        # strip leading enumeration like "1. " or "2) "
        line = re.sub(r"^\d+[.)]\s*", "", line)
        items.append(line)
    return items


# ---------------------------------------------------------------------------
# 1. curriculum data from the master file
# ---------------------------------------------------------------------------
def parse_curriculum():
    import openpyxl

    wb = openpyxl.load_workbook(MASTER_FILE, read_only=True, data_only=True)
    lessons = []

    for sheet_name in SHEET_LEVELS:
        ws = wb[sheet_name]
        rows = list(ws.iter_rows(values_only=True))
        current = None
        last_unit_title = ""

        # column indices (0-based): H,I,J vocab A/B/C | K,L,M structures | N,O,P grammar | T activities
        VOCAB = [(7, "A"), (8, "B"), (9, "C")]
        STRUCT = [(10, "A"), (11, "B"), (12, "C")]
        GRAMMAR = [(13, "A"), (14, "B"), (15, "C")]
        ACTIVITIES = 19

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
                    "vocabulary": {"A": [], "B": [], "C": []},
                    "structures": {"A": [], "B": [], "C": []},
                    "grammar": {"A": [], "B": [], "C": []},
                    "activities": [],
                }
                lessons.append(current)

            if current is None:
                continue

            unit_title = (str(row[1]).strip() if row[1] else "")
            if unit_title:
                last_unit_title = unit_title
                current["unitTitle"] = unit_title
            elif not current["unitTitle"]:
                current["unitTitle"] = last_unit_title

            for idx, tier in VOCAB + STRUCT + GRAMMAR:
                if idx < len(row):
                    key = "vocabulary" if idx < 10 else "structures" if idx < 13 else "grammar"
                    for item in clean(row[idx]):
                        if key == "grammar":
                            # light summarizing: drop trailing support-level qualifiers
                            # (the tier letter already encodes the level)
                            item = re.sub(r"[,.]?\s*with (planned|minimal|some|decreasing) support[^.]*\.*$", "", item).strip()
                        if item and item not in current[key][tier]:
                            current[key][tier].append(item)

            if ACTIVITIES < len(row):
                for item in clean(row[ACTIVITIES]):
                    if item not in current["activities"]:
                        current["activities"].append(item)

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


def referenced_images(folder: Path) -> set:
    """Basenames of images referenced by any HTML file in the folder."""
    refs = set()
    for html in folder.glob("*.htm*"):
        try:
            text = html.read_text(encoding="utf-8", errors="ignore").lower()
        except Exception:
            continue
        refs.update(re.findall(r"[a-z0-9_ \-]+\.(?:png|jpe?g|gif|webp|svg)", text))
    return refs


def scan_content():
    content = {}
    if not CONTENT_DIR.exists():
        return content

    for level_dir in sorted(CONTENT_DIR.iterdir()):
        if not level_dir.is_dir():
            continue
        level = level_dir.name  # e.g. "GE3"
        lessons = {}

        for lesson_dir in sorted(level_dir.iterdir()):
            if not lesson_dir.is_dir():
                continue
            m = re.match(rf"^{level}\s*U(\d+)C(\d+)", lesson_dir.name)
            if not m:
                continue
            code = f"{level} U{m.group(1)}C{m.group(2)}"
            refs = referenced_images(lesson_dir)
            files = []
            for f in sorted(lesson_dir.iterdir()):
                if not f.is_file() or f.name.startswith(".") or f.name == "Icon\r":
                    continue
                entry = {
                    "name": f.name,
                    "type": classify(f.name),
                    "path": f"content/{level_dir.name}/{lesson_dir.name}/{f.name}",
                }
                if entry["type"] == "image":
                    entry["role"] = "asset" if f.name.lower() in refs else "set"
                files.append(entry)
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

        content[level] = {"lessons": lessons, "extras": extras}

    return content


def main():
    lessons = parse_curriculum()
    content = scan_content()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "curriculum.json").write_text(
        json.dumps({"lessons": lessons, "tierColors": TIER_COLORS}, ensure_ascii=False, indent=2))
    (OUT_DIR / "content.json").write_text(
        json.dumps(content, ensure_ascii=False, indent=2))

    n_files = sum(len(v) for lvl in content.values() for v in lvl["lessons"].values())
    print(f"OK: {len(lessons)} lessons, {n_files} files mapped.")

    # quick sanity: activity count per level (games + videos + picture sets)
    for lvl_name, lvl in content.items():
        games = vids = sets = 0
        for files in lvl["lessons"].values():
            games += sum(1 for f in files if f["type"] == "game")
            vids += sum(1 for f in files if f["type"] == "video")
            sets += 1 if any(f.get("role") == "set" for f in files) else 0
        print(f"   {lvl_name}: {games} games + {vids} videos + {sets} picture sets = {games+vids+sets} activities")


if __name__ == "__main__":
    sys.exit(main())
