#!/usr/bin/env python3
"""Convert existing post/update titles with Latin letters into Korean text."""

from __future__ import annotations

import json
from pathlib import Path

from korean_title_utils import has_latin, localize_mixed_title, localize_post_title


ROOT = Path(__file__).resolve().parent.parent
POSTS_PATH = ROOT / "posts.json"
UPDATES_PATH = ROOT / "updates.json"


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, obj) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    posts_obj = load_json(POSTS_PATH, {"posts": []})
    updates_obj = load_json(UPDATES_PATH, [])

    changed_posts = 0
    changed_updates = 0

    for post in posts_obj.get("posts", []):
        old_title = str(post.get("title", ""))
        new_title = localize_post_title(old_title)
        if new_title and new_title != old_title:
            post["title"] = new_title
            changed_posts += 1

        if isinstance(post.get("catchy_title"), str):
            old_catchy = post["catchy_title"]
            new_catchy = localize_mixed_title(old_catchy)
            if new_catchy and new_catchy != old_catchy:
                post["catchy_title"] = new_catchy
                changed_posts += 1

    for row in updates_obj:
        old_title = str(row.get("title", ""))
        if not has_latin(old_title):
            continue
        new_title = localize_mixed_title(old_title)
        if new_title and new_title != old_title:
            row["title"] = new_title
            changed_updates += 1

    save_json(POSTS_PATH, posts_obj)
    save_json(UPDATES_PATH, updates_obj)
    print(f"[ok] localized titles: posts={changed_posts}, updates={changed_updates}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

