#!/usr/bin/env python3
"""Generate one hourly trend post from RSS feeds and update posts.json/updates.json.

If no unseen feed item exists, exits without modifying files.
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import List
from urllib.request import urlopen, Request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
POSTS_PATH = ROOT / "posts.json"
UPDATES_PATH = ROOT / "updates.json"
STATE_PATH = ROOT / ".auto_hourly_state.json"

FEEDS = [
    "https://news.google.com/rss/search?q=AI+regulation+OR+semiconductor+OR+cybersecurity+OR+platform+policy&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=OpenAI+OR+NVIDIA+OR+TSMC+OR+Apple+OR+Google+AI&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=technology+trend+today+startup+funding+policy&hl=en-US&gl=US&ceid=US:en",
]


@dataclass
class FeedItem:
    title: str
    link: str
    source: str
    published: datetime
    summary: str


def clean_text(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_feed(url: str) -> List[FeedItem]:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (catcatbuilder bot)"})
    with urlopen(req, timeout=20) as resp:
        data = resp.read()

    root = ET.fromstring(data)
    items: List[FeedItem] = []

    for item in root.findall("./channel/item"):
        title = clean_text(item.findtext("title", default=""))
        link = clean_text(item.findtext("link", default=""))
        pub_raw = item.findtext("pubDate", default="")
        desc = clean_text(item.findtext("description", default=""))

        source_el = item.find("source")
        source = clean_text(source_el.text if source_el is not None else "")
        if not source:
            source = "Google News"

        if not title or not link:
            continue

        try:
            published = parsedate_to_datetime(pub_raw).astimezone(timezone.utc)
        except Exception:
            published = datetime.now(timezone.utc)

        items.append(
            FeedItem(
                title=title,
                link=link,
                source=source,
                published=published,
                summary=desc,
            )
        )

    return items


def choose_category(title: str, summary: str) -> str:
    text = (title + " " + summary).lower()
    if any(k in text for k in ["security", "breach", "hack", "malware", "vulnerability"]):
        return "dev"
    if any(k in text for k in ["ai", "semiconductor", "chip", "startup", "policy", "platform", "cloud", "nvidia", "openai"]):
        return "tech"
    return "life"


def build_tags(title: str, summary: str, source: str) -> List[str]:
    text = (title + " " + summary).lower()
    tags = ["자동브리핑", "시간당이슈"]
    mapping = [
        ("AI", ["ai", "artificial intelligence", "openai", "llm"]),
        ("반도체", ["chip", "semiconductor", "tsmc", "nvidia"]),
        ("플랫폼", ["platform", "tiktok", "meta", "x " , "youtube"]),
        ("규제", ["policy", "regulation", "law", "eu", "commission", "congress"]),
        ("보안", ["security", "breach", "hack", "malware", "vulnerability"]),
        ("스타트업", ["startup", "funding", "venture", "series "]),
    ]
    for label, keys in mapping:
        if any(k in text for k in keys):
            tags.append(label)

    src = source.replace("News", "").strip()
    if src:
        tags.append(src[:24])

    uniq = []
    for t in tags:
        if t not in uniq:
            uniq.append(t)
    return uniq[:6]


def build_excerpt(item: FeedItem) -> str:
    base = item.summary or item.title
    base = clean_text(base)
    if len(base) > 140:
        base = base[:137] + "..."
    return f"[{item.source}] {base}"


def build_content(item: FeedItem) -> str:
    date_kr = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    summary = item.summary or "핵심 내용은 원문 링크에서 확인 가능합니다."

    return f"""## 오늘의 핵심 이슈: {item.title}

매시간 이슈 브리핑 업데이트입니다. 이 글은 {date_kr} 기준으로 최신 기술/산업 뉴스를 빠르게 파악할 수 있도록 정리한 콘텐츠입니다.

### 한 줄 요약
{summary}

### 왜 이 이슈가 중요한가
지금 시장은 단순한 제품 경쟁을 넘어 **정책, 인프라, 운영 안정성**이 함께 맞물리는 구간에 들어왔습니다. 이 뉴스가 중요한 이유는 단기 헤드라인보다 중장기 의사결정에 영향을 주기 때문입니다.

1. 기업 관점: 투자 우선순위와 로드맵이 달라집니다.
2. 개발팀 관점: 어떤 기술 스택에 시간을 써야 할지 기준이 바뀝니다.
3. 사용자 관점: 서비스 품질, 가격, 정책 경험에 직접 영향을 줍니다.

### 실무 관점 체크포인트
아래 항목을 기준으로 뉴스를 보면 정보가 바로 실행 계획으로 연결됩니다.

- 이 변화가 **비용 구조**를 바꾸는가?
- 이 변화가 **규제/정책 리스크**를 늘리거나 줄이는가?
- 이 변화가 **공급망/인프라 가용성**에 영향을 주는가?
- 우리 서비스에서 1~3개월 내 반영해야 할 항목은 무엇인가?

### 바로 적용 가능한 액션 3가지
1. 내부 노션/위키에 이슈 로그를 추가해 관련 팀이 같은 문맥을 공유합니다.
2. 현재 운영 중인 기능 중 영향받을 수 있는 항목(비용, 정책, 성능)을 체크합니다.
3. 대체 시나리오(모델/벤더/운영 정책)를 최소 1개 이상 준비합니다.

### 에디터 메모
이 페이지는 트래픽용 자극 제목보다 **실행 가능한 정보 밀도**를 우선합니다. 그래서 원문 출처를 명시하고, 팀/개인에게 바로 쓸 수 있는 체크리스트 형태로 정리합니다.

### 원문 출처
- 매체: {item.source}
- 기사 제목: {item.title}
- 링크: {item.link}

### 참고
- 본 글은 시점형 브리핑이며, 후속 보도가 나오면 해석이 달라질 수 있습니다.
- 최신 맥락은 원문 기사와 후속 업데이트를 함께 확인하는 것을 권장합니다.
""".strip()


def load_json(path: Path, default):
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, obj) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main() -> int:
    posts_obj = load_json(POSTS_PATH, {"posts": []})
    updates_obj = load_json(UPDATES_PATH, [])
    state = load_json(STATE_PATH, {"seen_links": []})

    seen = set(state.get("seen_links", []))

    candidates: List[FeedItem] = []
    for url in FEEDS:
        try:
            candidates.extend(parse_feed(url))
        except Exception as exc:
            print(f"[warn] failed feed: {url} ({exc})")

    if not candidates:
        print("[info] no feed data")
        return 0

    # Newest first
    candidates.sort(key=lambda x: x.published, reverse=True)

    chosen = None
    for item in candidates:
        if item.link not in seen:
            chosen = item
            break

    if chosen is None:
        print("[info] no unseen item")
        return 0

    posts = posts_obj.get("posts", [])
    next_id = (max((p.get("id", 0) for p in posts), default=0) + 1)

    category = choose_category(chosen.title, chosen.summary)
    new_post = {
        "id": next_id,
        "title": f"[자동브리핑] {chosen.title}",
        "category": category,
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "image": "",
        "excerpt": build_excerpt(chosen),
        "content": build_content(chosen),
        "tags": build_tags(chosen.title, chosen.summary, chosen.source),
    }

    posts.append(new_post)
    posts.sort(key=lambda x: x.get("id", 0))
    posts_obj["posts"] = posts

    updates_obj.append(
        {
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "title": f"자동 이슈 브리핑 게시: {chosen.title[:48]}",
            "url": f"blog.html#post-{next_id}",
            "category": "자동발행",
        }
    )

    # Keep update log manageable
    if len(updates_obj) > 120:
        updates_obj = updates_obj[-120:]

    seen.add(chosen.link)
    state["seen_links"] = list(seen)[-600:]

    save_json(POSTS_PATH, posts_obj)
    save_json(UPDATES_PATH, updates_obj)
    save_json(STATE_PATH, state)

    print(f"[ok] added post id={next_id} title={chosen.title}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
