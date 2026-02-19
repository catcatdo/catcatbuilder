#!/usr/bin/env python3
"""Generate sitemap.xml from posts.json and static pages.

Outputs:
- sitemap.xml (all URLs with proper lastmod dates)
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List
from xml.dom import minidom

ROOT = Path(__file__).resolve().parent.parent
POSTS_PATH = ROOT / "posts.json"
SITEMAP_PATH = ROOT / "sitemap.xml"
BASE_URL = "https://lilhwang.com"

# Static pages with their priorities and changefreq
STATIC_PAGES = [
    {"loc": "", "priority": "1.0", "changefreq": "weekly"},  # homepage
    {"loc": "blog.html", "priority": "0.9", "changefreq": "daily"},
    {"loc": "issues.html", "priority": "0.9", "changefreq": "daily"},
    {"loc": "about.html", "priority": "0.8", "changefreq": "monthly"},
    {"loc": "resource-center.html", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "update-log.html", "priority": "0.7", "changefreq": "daily"},
    {"loc": "editorial-policy.html", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "privacy.html", "priority": "0.5", "changefreq": "monthly"},
    {"loc": "terms.html", "priority": "0.5", "changefreq": "monthly"},
    {"loc": "contact.html", "priority": "0.5", "changefreq": "monthly"},
    {"loc": "tests.html", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "mbti.html", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "developer-tools.html", "priority": "0.7", "changefreq": "weekly"},
    {"loc": "cheatsheet.html", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "base64.html", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "hash.html", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "image-tool.html", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "json-formatter.html", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "timezone.html", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "writing-helper.html", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "templates.html", "priority": "0.7", "changefreq": "weekly"},
    {"loc": "diary.html", "priority": "0.6", "changefreq": "weekly"},
    {"loc": "poop-dodge.html", "priority": "0.5", "changefreq": "monthly"},
    {"loc": "404.html", "priority": "0.1", "changefreq": "yearly"},
]


def get_lastmod_from_file(filepath: Path) -> str:
    """Get lastmod date from file modification time."""
    try:
        mtime = os.path.getmtime(filepath)
        dt = datetime.fromtimestamp(mtime, tz=timezone.utc)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def build_url_elem(doc, loc: str, lastmod: str, changefreq: str, priority: str) -> Any:
    """Build a URL element for the sitemap."""
    url_elem = doc.createElement("url")
    
    loc_elem = doc.createElement("loc")
    loc_elem.appendChild(doc.createTextNode(loc))
    url_elem.appendChild(loc_elem)
    
    lastmod_elem = doc.createElement("lastmod")
    lastmod_elem.appendChild(doc.createTextNode(lastmod))
    url_elem.appendChild(lastmod_elem)
    
    changefreq_elem = doc.createElement("changefreq")
    changefreq_elem.appendChild(doc.createTextNode(changefreq))
    url_elem.appendChild(changefreq_elem)
    
    priority_elem = doc.createElement("priority")
    priority_elem.appendChild(doc.createTextNode(priority))
    url_elem.appendChild(priority_elem)
    
    return url_elem


def main() -> int:
    if not POSTS_PATH.exists():
        print("[error] posts.json not found")
        return 1

    # Load posts
    data = json.loads(POSTS_PATH.read_text(encoding="utf-8"))
    posts = data.get("posts", [])
    if not isinstance(posts, list):
        posts = []

    # Create XML document
    doc = minidom.Document()
    urlset = doc.createElement("urlset")
    urlset.setAttribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
    doc.appendChild(urlset)
    
    # Add comment for main pages
    urlset.appendChild(doc.createComment(" Main Pages "))
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Add static pages
    for page in STATIC_PAGES:
        loc = f"{BASE_URL}/{page['loc']}" if page['loc'] else BASE_URL
        
        # Get actual file modification date if file exists
        filepath = ROOT / page['loc'] if page['loc'] else ROOT / "index.html"
        if filepath.exists():
            lastmod = get_lastmod_from_file(filepath)
        else:
            lastmod = today
            
        url_elem = build_url_elem(doc, loc, lastmod, page['changefreq'], page['priority'])
        urlset.appendChild(url_elem)
    
    # Add blog posts
    urlset.appendChild(doc.createComment(" Blog Posts "))
    
    for post in posts:
        post_id = post.get("id")
        if not post_id:
            continue
            
        # Use hash-based URL format that blog.js uses
        loc = f"{BASE_URL}/blog.html#post-{post_id}"
        
        # Get date from post or use file modification time
        post_date = post.get("date", "")
        if post_date:
            try:
                # Parse ISO date
                if "T" in post_date:
                    post_date = post_date.split("T")[0]
                lastmod = post_date
            except Exception:
                lastmod = today
        else:
            lastmod = today
        
        url_elem = build_url_elem(doc, loc, lastmod, "weekly", "0.6")
        urlset.appendChild(url_elem)
    
    # Add standalone post pages if they exist
    posts_dir = ROOT / "posts"
    if posts_dir.exists():
        urlset.appendChild(doc.createComment(" Standalone Post Pages "))
        for post_file in sorted(posts_dir.glob("*.html")):
            loc = f"{BASE_URL}/posts/{post_file.name}"
            lastmod = get_lastmod_from_file(post_file)
            url_elem = build_url_elem(doc, loc, lastmod, "weekly", "0.5")
            urlset.appendChild(url_elem)
    
    # Write sitemap with pretty formatting
    xml_str = doc.toprettyxml(indent="    ", encoding="utf-8")
    # Remove extra blank lines
    xml_str = b"\n".join(line for line in xml_str.split(b"\n") if line.strip())
    SITEMAP_PATH.write_bytes(xml_str)
    
    total_urls = len(STATIC_PAGES) + len(posts) + len(list(posts_dir.glob("*.html")) if posts_dir.exists() else [])
    print(f"[ok] sitemap generated: {total_urls} URLs")
    print(f"  - Static pages: {len(STATIC_PAGES)}")
    print(f"  - Blog posts: {len(posts)}")
    if posts_dir.exists():
        print(f"  - Standalone pages: {len(list(posts_dir.glob('*.html')))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
