#!/usr/bin/env python3
"""Normalize blog auto-brief one-line summaries into Korean."""

from __future__ import annotations

import json
import re
from pathlib import Path

from korean_title_utils import has_latin, localize_one_line_summary


ROOT = Path(__file__).resolve().parent.parent
POSTS_PATH = ROOT / "posts.json"


SUMMARY_RE = re.compile(r"(### 한 줄 요약\s*\n)([^\n]+)")
SOURCE_RE = re.compile(r"- 매체:\s*([^\n]+)")


def main() -> int:
    data = json.loads(POSTS_PATH.read_text(encoding="utf-8"))
    posts = data.get("posts", [])
    changed = 0

    for post in posts:
        if post.get("category") == "issue":
            continue
        content = str(post.get("content", ""))
        if "### 한 줄 요약" not in content:
            continue

        match = SUMMARY_RE.search(content)
        if not match:
            continue

        old_line = match.group(2).strip()
        title_text = str(post.get("title", "")).strip()
        is_auto_brief = title_text.startswith("[자동브리핑]")
        if not is_auto_brief and not has_latin(old_line):
            continue

        source_match = SOURCE_RE.search(content)
        source = source_match.group(1).strip() if source_match else ""
        title = title_text.replace("[자동브리핑]", "").strip()
        new_line = localize_one_line_summary(
            old_line,
            title=title,
            source=source,
            force_rewrite=is_auto_brief,
        )
        if not new_line:
            continue

        content = SUMMARY_RE.sub(r"\1" + new_line, content, count=1)
        post["content"] = content
        changed += 1

    POSTS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[ok] localized one-line summaries: {changed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
