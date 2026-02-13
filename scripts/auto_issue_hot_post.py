#!/usr/bin/env python3
"""Publish one curated issue post every 3 hours.

Rules implemented:
- Rewrite (no direct copy)
- Catchy title
- Three-line summary
- Curator insight
- Visual suggestion prompt
- Community reactions (7-8, pros/cons mixed)
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

from cover_generator import generate_covers_for_post


ROOT = Path(__file__).resolve().parent.parent
POSTS_PATH = ROOT / "posts.json"
UPDATES_PATH = ROOT / "updates.json"
STATE_PATH = ROOT / ".auto_issue_state.json"

FEEDS = [
    "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=속보+경제+정책+사건+사고&hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=AI+반도체+규제+플랫폼+보안&hl=ko&gl=KR&ceid=KR:ko",
]

FALLBACK_ISSUES = [
    {
        "topic": "검색 색인 지연",
        "title": "색인이 멈출 때 운영자가 제일 먼저 봐야 할 것들",
        "summary": "새 글을 올려도 색인이 느린 구간에서 점검 우선순위를 정리한 해설형 이슈",
        "tags": ["SEO", "색인", "운영", "문제해결", "이슈봇"],
    },
    {
        "topic": "모바일 이탈 증가",
        "title": "모바일 이탈 급증, 콘텐츠 문제가 아니라 구조 문제일 수 있다",
        "summary": "첫 화면 밀도와 내부 링크 구조가 체류시간에 미치는 영향 정리",
        "tags": ["모바일UX", "체류시간", "콘텐츠전략", "운영", "이슈봇"],
    },
    {
        "topic": "API 비용 급등",
        "title": "API 비용이 터질 때: 서비스 살리는 운영 리밸런싱",
        "summary": "요금제/캐시/모델 계층화로 비용을 낮추는 실무 포인트 정리",
        "tags": ["API비용", "인프라", "운영전략", "SaaS", "이슈봇"],
    },
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


def normalize_title_key(title: str) -> str:
    text = clean_text(title).lower()
    text = re.sub(r"\[[^\]]+\]", "", text)
    text = re.sub(r"[^0-9a-z가-힣 ]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    # Keep first 10 tokens to improve grouping.
    return " ".join(text.split(" ")[:10])


def load_json(path: Path, default):
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, obj) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")


def parse_feed(url: str) -> List[FeedItem]:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (catcatbuilder issue bot)"})
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
        source = clean_text(source_el.text if source_el is not None else "") or "Google News"

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


def score_item(item: FeedItem, now_utc: datetime, grouped_count: int) -> float:
    age_h = max(0.0, (now_utc - item.published).total_seconds() / 3600.0)
    recency = max(0.0, 72.0 - age_h)  # 3-day window
    trend_boost = grouped_count * 6.0

    text = f"{item.title} {item.summary}".lower()
    keyword_weights = [
        ("긴급", 6), ("속보", 6), ("사망", 6), ("사고", 5), ("감형", 5),
        ("규제", 4), ("정책", 4), ("금리", 4), ("반도체", 4), ("ai", 4),
        ("보안", 4), ("해킹", 4), ("환율", 3), ("실적", 3), ("올림픽", 3),
    ]
    impact = 0.0
    for k, w in keyword_weights:
        if k in text:
            impact += w

    return recency + trend_boost + impact


def pick_hottest(items: List[FeedItem], seen_links: set[str]) -> Optional[FeedItem]:
    if not items:
        return None

    now_utc = datetime.now(timezone.utc)
    grouped: Dict[str, int] = {}
    for item in items:
        key = normalize_title_key(item.title)
        grouped[key] = grouped.get(key, 0) + 1

    candidates = [item for item in items if item.link not in seen_links]
    if not candidates:
        candidates = items

    scored = []
    for item in candidates:
        key = normalize_title_key(item.title)
        score = score_item(item, now_utc, grouped.get(key, 1))
        scored.append((score, item.published, item))

    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return scored[0][2] if scored else None


def shorten(text: str, n: int) -> str:
    text = clean_text(text)
    if len(text) <= n:
        return text
    return text[: max(0, n - 1)] + "…"


def build_tags(item: FeedItem) -> List[str]:
    text = f"{item.title} {item.summary}".lower()
    tags = ["핫이슈", "자동이슈봇"]
    mapping = [
        ("정책", ["정책", "규제", "법안", "정부"]),
        ("경제", ["경제", "금리", "물가", "환율", "시장"]),
        ("사건사고", ["사고", "사망", "범죄", "재판", "감형"]),
        ("AI", ["ai", "openai", "모델", "llm"]),
        ("반도체", ["반도체", "chip", "nvidia", "tsmc"]),
        ("스포츠", ["올림픽", "리그", "메달", "선수"]),
        ("국제", ["미국", "중국", "eu", "국제"]),
    ]
    for label, keys in mapping:
        if any(k in text for k in keys):
            tags.append(label)

    src = item.source.replace("News", "").strip()
    if src:
        tags.append(src[:20])

    uniq: List[str] = []
    for t in tags:
        if t not in uniq:
            uniq.append(t)
    return uniq[:6]


def build_catchy_title(item: FeedItem) -> str:
    base = shorten(item.title, 52)
    return f"{base}: 지금 논쟁의 핵심만 짚어봤다"


def build_rewritten_body(item: FeedItem) -> str:
    summary = clean_text(item.summary) or clean_text(item.title)
    return (
        f"현재 주목받는 이슈는 '{clean_text(item.title)}'로, 온라인 확산 속도가 빠르게 올라가는 상황입니다. "
        f"핵심은 {shorten(summary, 180)}에 있으며, 단편적 문장보다 사실 관계와 후속 조치의 순서를 함께 보는 해석이 필요합니다. "
        "초기 정보와 후속 발표 사이 간극이 큰 이슈일수록, 확인된 사실과 의견을 분리해 읽는 태도가 중요하다는 점이 다시 강조되고 있습니다."
    )


def build_summary_lines(item: FeedItem) -> List[str]:
    summary = clean_text(item.summary) or clean_text(item.title)
    return [
        f"핫이슈로 떠오른 사안은 '{shorten(item.title, 70)}'이며 확산 속도가 빠르다.",
        f"현재까지 공개된 핵심 맥락은 {shorten(summary, 95)}로 요약된다.",
        "단정적 해석보다 후속 발표·공식 자료·절차 진행 상황을 기준으로 판단해야 한다는 의견이 우세하다.",
    ]


def build_curator_insight(item: FeedItem) -> str:
    return (
        "이번 이슈의 포인트는 사건 자체만이 아니라 정보가 소비되는 방식입니다. "
        "초기 헤드라인의 강도와 실제 확인 정보 사이 간격이 클수록, 미디어 리터러시가 곧 리스크 관리 역량이 됩니다."
    )


def build_visual_suggestion(item: FeedItem, tags: List[str]) -> str:
    topic = shorten(item.title, 60)
    stock_keywords = [
        "breaking news", "editorial analysis", "press microphones", "city night",
    ]
    if "사건사고" in tags:
        stock_keywords = ["courtroom", "traffic lane", "news briefing", "documentary tone"]
    elif "스포츠" in tags:
        stock_keywords = ["stadium", "sports press", "team huddle", "spotlight"]
    elif "경제" in tags:
        stock_keywords = ["financial chart", "trading desk", "market volatility", "news studio"]

    prompt = (
        f"editorial news photo about {topic}, realistic documentary style, "
        "high detail, no logo, no watermark, no visible text, cinematic composition"
    )
    return (
        "무료 스톡 키워드: " + ", ".join(stock_keywords) +
        f'. 생성형 프롬프트: "{prompt}"'
    )


def build_comments(topic_label: str) -> List[Dict[str, str]]:
    return [
        {"side": "left", "author": "공감파", "text": f"{topic_label} 이건 진짜 그냥 넘길 이슈는 아닌 듯", "time": "오전 09:10"},
        {"side": "right", "author": "신중파", "text": "초반 기사만 보고 결론 내리긴 이르다", "time": "오전 09:12"},
        {"side": "left", "author": "강경론", "text": "재발 막으려면 기준 더 세게 가야 함", "time": "오전 09:14"},
        {"side": "right", "author": "절차중시", "text": "공식 발표랑 사실관계부터 보자 ㅇㅇ", "time": "오전 09:16"},
        {"side": "left", "author": "현실파", "text": "초기 제목이 여론 다 끌고 가는 구조가 문제", "time": "오전 09:18"},
        {"side": "right", "author": "중립모드", "text": "찬반보다 근거 품질이 더 중요함", "time": "오전 09:20"},
        {"side": "left", "author": "의문제기", "text": "핵심 쟁점 정리본은 계속 업데이트해줘", "time": "오전 09:22"},
        {"side": "right", "author": "요약좋아", "text": "세줄요약+릴황생각 포맷은 좋네 ㅋㅋ", "time": "오전 09:24"},
    ]


def build_fallback_issue(state: Dict[str, Any]) -> Dict[str, Any]:
    cursor = int(state.get("fallback_cursor", 0))
    topic = FALLBACK_ISSUES[cursor % len(FALLBACK_ISSUES)]
    state["fallback_cursor"] = cursor + 1
    return topic


def compose_issue_post_from_item(next_id: int, now_date: str, item: FeedItem) -> Dict[str, Any]:
    tags = build_tags(item)
    catchy = build_catchy_title(item)
    cover_image, image_variants = generate_covers_for_post(
        ROOT,
        next_id,
        catchy,
        shorten(clean_text(item.summary) or clean_text(item.title), 120),
        tags,
        "issue",
        variants=3,
    )
    return {
        "id": next_id,
        "title": catchy,
        "category": "issue",
        "date": now_date,
        "image": cover_image,
        "excerpt": shorten(clean_text(item.summary) or clean_text(item.title), 160),
        "content": build_rewritten_body(item),
        "tags": tags,
        "image_variants": image_variants[:3],
        "catchy_title": catchy,
        "summary_lines": build_summary_lines(item),
        "curator_insight": build_curator_insight(item),
        "visual_suggestion": build_visual_suggestion(item, tags),
        "comments": build_comments(shorten(item.title, 18)),
    }


def compose_issue_post_fallback(next_id: int, now_date: str, topic: Dict[str, Any]) -> Dict[str, Any]:
    catchy = f"{topic['title']}: 오늘 다시 보는 핵심 포인트"
    summary = clean_text(topic["summary"])
    tags = topic.get("tags", ["자동이슈봇"])
    cover_image, image_variants = generate_covers_for_post(
        ROOT,
        next_id,
        catchy,
        summary,
        tags,
        "issue",
        variants=3,
    )
    return {
        "id": next_id,
        "title": catchy,
        "category": "issue",
        "date": now_date,
        "image": cover_image,
        "excerpt": shorten(summary, 150),
        "content": (
            f"대형 속보 공백 시간대에도 사용자 검색 수요는 계속됩니다. 이번 자동 이슈는 '{topic['topic']}'를 주제로 "
            "실무 관점에서 다시 점검해야 할 포인트를 정리한 브리핑입니다."
        ),
        "tags": tags,
        "image_variants": image_variants[:3],
        "catchy_title": catchy,
        "summary_lines": [
            f"이번 자동 이슈 주제는 '{topic['topic']}'이며 반복적으로 검색되는 문제 영역이다.",
            shorten(summary, 90),
            "단편적 대응보다 기준·절차·업데이트 구조를 함께 설계해야 같은 문제가 반복되지 않는다.",
        ],
        "curator_insight": (
            "속보가 없는 시간대에 쌓이는 해설형 이슈는 검색 지속성과 신뢰도에 크게 기여합니다. "
            "핵심은 '빨리 쓰는 것'보다 '다음 행동이 보이게 쓰는 것'입니다."
        ),
        "visual_suggestion": (
            "무료 스톡 키워드: editorial desk, analysis board, trend monitoring, checklist. "
            '생성형 프롬프트: "editorial analysis workspace for issue tracking, realistic lighting, '
            'documentary photo style, no logo, no visible text"'
        ),
        "comments": build_comments(topic["topic"]),
    }


def main() -> int:
    posts_obj = load_json(POSTS_PATH, {"posts": []})
    updates_obj = load_json(UPDATES_PATH, [])
    state = load_json(STATE_PATH, {"seen_links": [], "fallback_cursor": 0})

    seen = set(state.get("seen_links", []))
    posts = posts_obj.get("posts", [])
    next_id = max((p.get("id", 0) for p in posts), default=0) + 1
    now_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    all_items: List[FeedItem] = []
    for url in FEEDS:
        try:
            all_items.extend(parse_feed(url))
        except Exception as exc:
            print(f"[warn] feed failed: {url} ({exc})")

    hottest = pick_hottest(all_items, seen)
    if hottest is not None:
        new_post = compose_issue_post_from_item(next_id, now_date, hottest)
        updates_title = f"자동 이슈봇 게시: {shorten(hottest.title, 42)}"
        seen.add(hottest.link)
        state["seen_links"] = list(seen)[-900:]
        print(f"[ok] hot issue id={next_id} title={hottest.title}")
    else:
        fb = build_fallback_issue(state)
        new_post = compose_issue_post_fallback(next_id, now_date, fb)
        updates_title = f"자동 이슈봇 게시(해설): {shorten(fb['title'], 40)}"
        print(f"[ok] fallback issue id={next_id} title={fb['title']}")

    posts.append(new_post)
    posts.sort(key=lambda x: x.get("id", 0))
    posts_obj["posts"] = posts

    updates_obj.append(
        {
            "date": now_date,
            "title": updates_title,
            "url": f"issues.html#issue-post-{next_id}",
            "category": "자동이슈봇",
        }
    )

    if len(updates_obj) > 160:
        updates_obj = updates_obj[-160:]

    save_json(POSTS_PATH, posts_obj)
    save_json(UPDATES_PATH, updates_obj)
    save_json(STATE_PATH, state)
    print(f"[ok] added issue post id={next_id}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
