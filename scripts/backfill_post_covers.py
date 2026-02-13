#!/usr/bin/env python3
"""Backfill self-hosted keyword covers for existing posts.json."""

from __future__ import annotations

import json
from pathlib import Path

from cover_generator import generate_covers_for_post


ROOT = Path(__file__).resolve().parent.parent
POSTS_PATH = ROOT / "posts.json"


def main() -> int:
    if not POSTS_PATH.exists():
        print("[error] posts.json not found")
        return 1

    data = json.loads(POSTS_PATH.read_text(encoding="utf-8"))
    posts = data.get("posts", [])
    updated = 0

    for post in posts:
        pid = int(post.get("id", 0))
        if not pid:
            continue

        title = str(post.get("title") or "Untitled")
        excerpt = str(post.get("excerpt") or post.get("content") or "")[:180]
        tags = post.get("tags") or []
        category = str(post.get("category") or "tech")

        cover_image, image_variants = generate_covers_for_post(
            ROOT,
            pid,
            title,
            excerpt,
            tags,
            category,
            variants=3,
        )

        if post.get("image") != cover_image or post.get("image_variants") != image_variants:
            post["image"] = cover_image
            post["image_variants"] = image_variants
            updated += 1

    data["posts"] = posts
    POSTS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[ok] updated {updated} posts with local covers")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
