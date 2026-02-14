#!/usr/bin/env python3
"""Clean blog titles/labels:
1) remove [자동브리핑] prefix from blog titles
2) normalize awkward transliterated source labels
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict


ROOT = Path(__file__).resolve().parent.parent
POSTS_PATH = ROOT / "posts.json"
UPDATES_PATH = ROOT / "updates.json"


SOURCE_MAP: Dict[str, str] = {
    "와이에이에이치오오": "Yahoo",
    "와이에이에이치오오 에프아이엔에이엔씨이": "Yahoo Finance",
    "씨엔비씨": "CNBC",
    "피알 엔이더블유에스더블유아이알이": "PR Newswire",
    "에스티알이이티아이엔에스아이디이알": "StreetInsider",
    "포커스와이어": "PhocusWire",
    "더블유더블유더블유더블유에이치에이티제이오비에스씨오엠": "whatjobs.com",
    "티아이엠이에스 오에프 아이엔디아이에이": "Times of India",
}


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, obj) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize_sources(text: str) -> str:
    out = str(text or "")
    for old, new in SOURCE_MAP.items():
        out = out.replace(f"[{old}]", f"[{new}]")
        out = out.replace(f"- 매체: {old}", f"- 매체: {new}")
    return out


def main() -> int:
    posts_obj = load_json(POSTS_PATH, {"posts": []})
    updates_obj = load_json(UPDATES_PATH, [])
    posts = posts_obj.get("posts", [])

    changed_posts = 0
    changed_updates = 0

    for post in posts:
        if post.get("category") == "issue":
            # issue titles keep current curation style
            for key in ("excerpt", "content"):
                if isinstance(post.get(key), str):
                    post[key] = normalize_sources(post[key])
            continue

        title = str(post.get("title", ""))
        new_title = re.sub(r"^\[자동브리핑\]\s*", "", title).strip()
        if new_title != title:
            post["title"] = new_title
            changed_posts += 1

        # remove the visible "자동브리핑" tag from blog cards
        if isinstance(post.get("tags"), list):
            tags = [str(t) for t in post["tags"] if str(t).strip() and str(t) != "자동브리핑"]
            if tags != post["tags"]:
                post["tags"] = tags
                changed_posts += 1

        for key in ("excerpt", "content"):
            if isinstance(post.get(key), str):
                replaced = normalize_sources(post[key])
                if replaced != post[key]:
                    post[key] = replaced
                    changed_posts += 1

    for row in updates_obj:
        if not isinstance(row, dict):
            continue
        title = str(row.get("title", ""))
        new_title = re.sub(r"\[자동브리핑\]\s*", "", title).strip()
        new_title = normalize_sources(new_title)
        if new_title != title:
            row["title"] = new_title
            changed_updates += 1

    posts_obj["posts"] = posts
    save_json(POSTS_PATH, posts_obj)
    save_json(UPDATES_PATH, updates_obj)

    print(f"[ok] cleanup done: posts={changed_posts}, updates={changed_updates}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

