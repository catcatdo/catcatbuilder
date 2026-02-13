#!/usr/bin/env python3
"""Generate RSS feeds from posts.json.

Outputs:
- rss.xml (blog feed)
- issues-rss.xml (issue feed)
"""

from __future__ import annotations

import json
import html
import mimetypes
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parent.parent
POSTS_PATH = ROOT / "posts.json"
BLOG_FEED_PATH = ROOT / "rss.xml"
ISSUE_FEED_PATH = ROOT / "issues-rss.xml"
BASE_URL = "https://lilhwang.com"


def parse_date(value: str) -> datetime:
    text = str(value or "").strip()
    if not text:
        return datetime.now(timezone.utc)
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).astimezone(timezone.utc)
    except Exception:
        pass
    try:
        return datetime.strptime(text, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


def to_rfc2822(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")


def absolute_url(value: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        return BASE_URL
    if raw.startswith("http://") or raw.startswith("https://"):
        return raw
    return f"{BASE_URL}/{raw.lstrip('/')}"


def normalize_text(value: Any, max_len: int = 220) -> str:
    text = html.unescape(str(value or "")).replace("\xa0", " ")
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > max_len:
        return text[: max_len - 1] + "…"
    return text


def get_image_mime_type(image_url: str) -> str:
    guessed, _ = mimetypes.guess_type(str(image_url or ""))
    if guessed and guessed.startswith("image/"):
        return guessed
    return "image/jpeg"


def build_item_xml(
    title: str,
    link: str,
    guid: str,
    description: str,
    pub_date: datetime,
    image_url: str,
) -> str:
    item = [
        "<item>",
        f"<title>{escape(title)}</title>",
        f"<link>{escape(link)}</link>",
        f"<guid isPermaLink=\"false\">{escape(guid)}</guid>",
        f"<description>{escape(description)}</description>",
        f"<pubDate>{to_rfc2822(pub_date)}</pubDate>",
    ]
    if image_url:
        image_type = get_image_mime_type(image_url)
        item.append(
            f"<enclosure url=\"{escape(image_url)}\" type=\"{escape(image_type)}\" length=\"0\" />"
        )
    item.append("</item>")
    return "".join(item)


def build_feed_xml(
    title: str,
    description: str,
    site_link: str,
    feed_link: str,
    items_xml: List[str],
) -> str:
    now = to_rfc2822(datetime.now(timezone.utc))
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n"
        "<channel>\n"
        f"<title>{escape(title)}</title>\n"
        f"<link>{escape(site_link)}</link>\n"
        f"<description>{escape(description)}</description>\n"
        f"<atom:link href=\"{escape(feed_link)}\" rel=\"self\" type=\"application/rss+xml\" />\n"
        "<language>ko-KR</language>\n"
        f"<lastBuildDate>{now}</lastBuildDate>\n"
        + "\n".join(items_xml)
        + "\n</channel>\n</rss>\n"
    )


def sort_posts(posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return sorted(
        posts,
        key=lambda p: (parse_date(p.get("date", "")).timestamp(), int(p.get("id", 0))),
        reverse=True,
    )


def make_blog_items(posts: List[Dict[str, Any]]) -> List[str]:
    items: List[str] = []
    for post in sort_posts(posts)[:50]:
        post_id = int(post.get("id", 0))
        if not post_id:
            continue
        title = normalize_text(post.get("title") or "제목 없음", 140)
        description = normalize_text(post.get("excerpt") or title, 220)
        link = f"{BASE_URL}/blog.html#post-{post_id}"
        guid = f"blog-{post_id}"
        image = absolute_url(post.get("image", ""))
        items.append(build_item_xml(title, link, guid, description, parse_date(post.get("date", "")), image))
    return items


def make_issue_items(posts: List[Dict[str, Any]]) -> List[str]:
    items: List[str] = []
    for post in sort_posts(posts)[:50]:
        post_id = int(post.get("id", 0))
        if not post_id:
            continue
        title = normalize_text(post.get("catchy_title") or post.get("title") or "제목 없음", 140)
        description = normalize_text(post.get("excerpt") or post.get("content") or title, 220)
        link = f"{BASE_URL}/issues.html#issue-post-{post_id}"
        guid = f"issue-{post_id}"
        image = absolute_url(post.get("image", ""))
        items.append(build_item_xml(title, link, guid, description, parse_date(post.get("date", "")), image))
    return items


def main() -> int:
    if not POSTS_PATH.exists():
        print("[error] posts.json not found")
        return 1

    data = json.loads(POSTS_PATH.read_text(encoding="utf-8"))
    posts = data.get("posts", [])
    if not isinstance(posts, list):
        posts = []

    blog_posts = [
        p for p in posts if str(p.get("category", "")).strip() not in {"issue", "template", "diary"}
    ]
    issue_posts = [p for p in posts if str(p.get("category", "")).strip() == "issue"]

    blog_xml = build_feed_xml(
        title="릴황 블로그 RSS",
        description="릴황 블로그 최신 글 피드",
        site_link=f"{BASE_URL}/blog.html",
        feed_link=f"{BASE_URL}/rss.xml",
        items_xml=make_blog_items(blog_posts),
    )
    BLOG_FEED_PATH.write_text(blog_xml, encoding="utf-8")

    issue_xml = build_feed_xml(
        title="릴황 이슈 허브 RSS",
        description="릴황 이슈 허브 최신 글 피드",
        site_link=f"{BASE_URL}/issues.html",
        feed_link=f"{BASE_URL}/issues-rss.xml",
        items_xml=make_issue_items(issue_posts),
    )
    ISSUE_FEED_PATH.write_text(issue_xml, encoding="utf-8")

    print(
        f"[ok] feeds generated: blog={len(blog_posts)} posts, issues={len(issue_posts)} posts"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
