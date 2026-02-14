#!/usr/bin/env python3
"""Generate one scheduled post and update posts.json/updates.json.

Priority:
1) unseen feed issue
2) fallback problem-solving topic (always publish)
"""

from __future__ import annotations

import json
import html
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import List, Dict, Any
from urllib.request import urlopen, Request
import xml.etree.ElementTree as ET

from cover_generator import generate_covers_for_post
from korean_title_utils import has_latin, localize_one_line_summary, summarize_auto_brief_title

ROOT = Path(__file__).resolve().parent.parent
POSTS_PATH = ROOT / "posts.json"
UPDATES_PATH = ROOT / "updates.json"
STATE_PATH = ROOT / ".auto_hourly_state.json"

FEEDS = [
    "https://news.google.com/rss/search?q=consumer+tech+tips+OR+smartphone+feature+OR+app+update&hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=daily+life+trend+OR+wellness+habit+OR+sleep+routine+OR+walking&hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=travel+weekend+OR+food+guide+OR+local+festival&hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=personal+finance+budget+saving+tips+OR+subscription+management&hl=ko&gl=KR&ceid=KR:ko",
    "https://news.google.com/rss/search?q=AI+OR+semiconductor+OR+platform+policy&hl=en-US&gl=US&ceid=US:en",
]

FALLBACK_TOPICS: List[Dict[str, Any]] = [
    {
        "title": "퇴근 후 20분으로 머리 식히는 저녁 루틴",
        "category": "life",
        "tags": ["일상", "저녁루틴", "회복", "스트레스관리", "가벼운팁"],
        "problem": "퇴근 후 폰만 보다가 쉬지도 못한 채 하루가 끝나는 상황",
        "steps": [
            "귀가 직후 5분은 화면을 끄고 물 한 잔 마시며 호흡을 정리합니다.",
            "10분은 샤워나 가벼운 스트레칭으로 몸 긴장을 먼저 풉니다.",
            "남은 5분은 내일 할 일 3개만 적고 잠깐 산책하거나 창문을 엽니다.",
            "침대에서는 영상 대신 오디오/짧은 독서로 마무리합니다.",
        ],
    },
    {
        "title": "월말마다 돈이 부족할 때 고정비 줄이는 순서",
        "category": "life",
        "tags": ["생활비", "절약", "고정비", "가계관리", "실전팁"],
        "problem": "수입은 비슷한데 월말마다 생활비가 빠듯해지는 상황",
        "steps": [
            "통신비·구독·보험처럼 매달 자동 결제되는 항목을 먼저 한 번에 모읍니다.",
            "최근 3개월 사용량이 낮은 항목부터 해지 또는 하위 요금제로 변경합니다.",
            "카드 혜택과 실제 사용 패턴이 맞지 않으면 주카드 1장만 남겨 단순화합니다.",
            "남은 예산은 식비·교통비처럼 변동 지출 상한을 정해 관리합니다.",
        ],
    },
    {
        "title": "주말 외출 전에 실패 줄이는 10분 준비 체크",
        "category": "life",
        "tags": ["주말", "나들이", "체크리스트", "일상", "준비팁"],
        "problem": "주말 외출에서 동선이 꼬이거나 대기 시간이 길어지는 상황",
        "steps": [
            "출발 전 날씨·혼잡도·영업시간 3가지만 먼저 확인합니다.",
            "이동 시간 기준으로 1순위 장소와 대체 장소를 각각 1개씩 정합니다.",
            "현장 결제 여부와 주차 정보를 미리 체크해 현장 변수를 줄입니다.",
            "동행 인원별 필수 준비물(보조배터리/우산/물)을 메시지로 공유합니다.",
        ],
    },
    {
        "title": "잠이 뒤죽박죽일 때 수면 리듬 다시 맞추는 방법",
        "category": "life",
        "tags": ["수면", "건강", "루틴", "회복", "생활습관"],
        "problem": "평일과 주말 수면 시간이 크게 달라 피로가 누적되는 상황",
        "steps": [
            "기상 시간을 먼저 고정하고, 취침 시간은 15분씩 천천히 당깁니다.",
            "오후 카페인과 늦은 낮잠을 줄여 밤 수면 압력을 회복합니다.",
            "잠들기 1시간 전에는 밝은 화면 대신 조도를 낮춘 환경으로 전환합니다.",
            "침대는 수면 전용으로 유지해 뇌가 잠자리 신호를 인식하게 만듭니다.",
        ],
    },
    {
        "title": "사진과 파일이 쌓일 때 폰 저장공간 정리 루틴",
        "category": "life",
        "tags": ["스마트폰", "파일정리", "사진정리", "디지털정리", "일상팁"],
        "problem": "저장공간 부족 알림이 자주 떠서 앱 업데이트나 촬영이 막히는 상황",
        "steps": [
            "최근 30일 미만 사진은 남기고, 유사 연속 사진은 대표 컷만 남깁니다.",
            "메신저 다운로드 폴더와 중복 동영상부터 우선 삭제합니다.",
            "클라우드 백업 후 로컬 원본을 정리해 즉시 공간을 확보합니다.",
            "월 1회 자동 정리일을 정해 쌓이기 전에 관리합니다.",
        ],
    },
    {
        "title": "구독 서비스 정리로 새는 돈 막는 체크리스트",
        "category": "life",
        "tags": ["구독관리", "절약", "가계관리", "지출점검", "생활팁"],
        "problem": "잘 쓰지 않는 구독이 누적되어 매달 지출이 커지는 상황",
        "steps": [
            "카드 명세서에서 정기결제 항목만 별도로 분리해 목록화합니다.",
            "최근 2주 사용 빈도가 낮은 구독부터 해지 후보로 지정합니다.",
            "연간 결제 전환 혜택이 있는 항목은 실제 사용량을 본 뒤 결정합니다.",
            "필수 3개만 남기고 나머지는 재구독 기준을 메모해 둡니다.",
        ],
    },
    {
        "title": "식비가 빠르게 늘 때 일주일 장보기 루틴",
        "category": "life",
        "tags": ["식비", "장보기", "생활비", "가정관리", "루틴"],
        "problem": "배달과 즉흥 구매가 반복되며 식비가 예상보다 커지는 상황",
        "steps": [
            "일주일 식단을 거창하게 짜기보다 4끼 핵심 메뉴만 먼저 정합니다.",
            "냉장고 재고를 먼저 확인해 중복 구매를 줄입니다.",
            "충동 구매가 잦은 통로는 마지막에 지나가도록 동선을 바꿉니다.",
            "구매 후 영수증을 찍어 다음 주 장보기 기준으로 남깁니다.",
        ],
    },
    {
        "title": "알림 때문에 집중이 끊길 때 디지털 미니멀 세팅",
        "category": "life",
        "tags": ["집중력", "알림관리", "스마트폰", "업무효율", "일상"],
        "problem": "메신저/앱 알림으로 작업 흐름이 자주 끊기는 상황",
        "steps": [
            "긴급 연락 앱만 예외로 두고 나머지 푸시 알림은 기본 차단합니다.",
            "집중 시간대에는 앱 첫 화면을 단순한 도구 위주로 재배치합니다.",
            "SNS 확인 시간을 하루 2~3회로 묶어 확인 습관을 줄입니다.",
            "업무 종료 후에는 알림 요약만 확인하고 즉시 대응은 최소화합니다.",
        ],
    },
    {
        "title": "글감이 없을 때 15분 안에 주제 찾는 메모법",
        "category": "life",
        "tags": ["글쓰기", "아이디어", "콘텐츠", "메모습관", "가벼운팁"],
        "problem": "무엇을 써야 할지 막막해서 발행 주기가 끊기는 상황",
        "steps": [
            "오늘 자주 들은 질문 3개를 먼저 적어 독자 관점으로 시작합니다.",
            "각 질문에 '내가 겪은 작은 사례'를 한 줄씩 붙입니다.",
            "검색어 한 세트를 뽑아 제목 후보를 3개 만듭니다.",
            "완벽하게 쓰기보다 400~600자 초안을 먼저 공개합니다.",
        ],
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
    text = html.unescape(text or "").replace("\xa0", " ")
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def strip_title_source(title: str, source: str) -> str:
    text = clean_text(title)
    if " - " in text:
        parts = [p.strip() for p in text.split(" - ") if p.strip()]
        if len(parts) >= 2 and len(parts[-1]) <= 40:
            text = " - ".join(parts[:-1]).strip()

    if source:
        src = re.escape(clean_text(source))
        text = re.sub(rf"\s*(?:-|\|)\s*{src}\s*$", "", text, flags=re.IGNORECASE).strip()

    return text.strip(" -|") or clean_text(title)


def is_noisy_summary(summary: str) -> bool:
    lower = summary.lower()
    if not summary:
        return True
    if len(summary) > 220:
        return True
    if summary.count(" - ") >= 2:
        return True
    markers = re.findall(
        r"(뉴스|일보|신문|브리핑|news|times|bloomberg|reuters|herald|post|press)",
        lower,
    )
    return len(markers) >= 2


def normalize_summary(summary: str, title: str, source: str) -> str:
    text = clean_text(summary)
    text = re.sub(r"\[[^\]]+\]", "", text).strip()
    if source:
        src = re.escape(clean_text(source))
        text = re.sub(rf"\s*(?:-|\|)\s*{src}\s*$", "", text, flags=re.IGNORECASE).strip()
        text = re.sub(rf"\s+{src}\s*$", "", text, flags=re.IGNORECASE).strip()

    if is_noisy_summary(text):
        text = strip_title_source(title, source)

    return text


def parse_feed(url: str) -> List[FeedItem]:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (catcatbuilder bot)"})
    with urlopen(req, timeout=20) as resp:
        data = resp.read()

    root = ET.fromstring(data)
    items: List[FeedItem] = []

    for item in root.findall("./channel/item"):
        raw_title = item.findtext("title", default="")
        link = clean_text(item.findtext("link", default=""))
        pub_raw = item.findtext("pubDate", default="")

        source_el = item.find("source")
        source = clean_text(source_el.text if source_el is not None else "")
        if not source:
            source = "Google News"

        title = strip_title_source(raw_title, source)
        desc = normalize_summary(item.findtext("description", default=""), title, source)

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
    if any(
        k in text
        for k in [
            "security", "breach", "hack", "malware", "vulnerability",
            "devops", "incident", "취약점", "해킹", "보안",
        ]
    ):
        return "dev"
    if any(
        k in text
        for k in [
            "ai", "semiconductor", "chip", "startup", "policy", "platform",
            "cloud", "nvidia", "openai", "llm", "모델", "반도체",
        ]
    ):
        return "tech"
    return "life"


def is_lightweight_topic(title: str, summary: str) -> bool:
    text = (title + " " + summary).lower()
    return any(
        k in text
        for k in [
            "daily", "life", "wellness", "sleep", "walking", "travel", "weekend",
            "food", "cafe", "budget", "saving", "subscription", "smartphone",
            "app", "lifestyle", "fitness", "habit", "routine",
            "생활", "건강", "수면", "여행", "식비", "절약", "가계", "루틴", "주말",
        ]
    )


def build_tags(title: str, summary: str, source: str) -> List[str]:
    text = (title + " " + summary).lower()
    tags = ["가벼운브리핑", "30분업데이트"]
    mapping = [
        ("AI", ["ai", "artificial intelligence", "openai", "llm"]),
        ("반도체", ["chip", "semiconductor", "tsmc", "nvidia"]),
        ("플랫폼", ["platform", "tiktok", "meta", "x ", "youtube"]),
        ("규제", ["policy", "regulation", "law", "eu", "commission", "congress"]),
        ("보안", ["security", "breach", "hack", "malware", "vulnerability"]),
        ("스타트업", ["startup", "funding", "venture", "series "]),
        ("생활", ["daily", "lifestyle", "habit", "routine", "생활"]),
        ("건강", ["wellness", "health", "sleep", "fitness", "수면", "건강"]),
        ("여행", ["travel", "weekend", "festival", "trip", "여행"]),
        ("절약", ["budget", "saving", "finance", "subscription", "절약", "식비"]),
        ("모바일", ["smartphone", "app", "ios", "android", "폰", "앱"]),
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


def build_feed_image_prompts(item: FeedItem, category: str) -> List[str]:
    title = clean_text(item.title)
    summary = clean_text(item.summary)
    short_summary = summary[:140] if summary else title[:140]

    category_hint = {
        "tech": "technology industry trend",
        "dev": "software engineering operations",
        "life": "daily life impact story",
    }.get(category, "news analysis")

    return [
        (
            f"editorial news photo, {category_hint}, {title}, {short_summary}, "
            "documentary style, realistic lighting, no logo, no watermark, no visible text"
        ),
        (
            f"conceptual illustration for news analysis, key topic: {title}, "
            f"supporting context: {short_summary}, clean composition, modern style, no text"
        ),
        (
            f"magazine cover style visual, {category_hint}, {title}, "
            "high contrast, cinematic framing, no brand mark, no letters"
        ),
    ]


def build_content(item: FeedItem, display_title: str, category: str) -> str:
    date_kr = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    summary = localize_one_line_summary(
        item.summary or "",
        title=display_title or item.title,
        source=item.source,
    )
    if not summary:
        summary = "핵심 내용은 원문 링크에서 확인 가능합니다."

    if category == "life":
        perspective = (
            "요즘 반응이 큰 주제는 거대한 담론보다 '내 하루에 바로 적용되는가'에서 갈립니다. "
            "작게라도 오늘 적용해보면 체감이 빨리 옵니다."
        )
        actions = [
            "오늘 일정에 바로 넣을 수 있는 작은 실행 1개만 고릅니다.",
            "실행 전/후 변화를 메모해 내 루틴에 맞는지 확인합니다.",
            "과한 목표보다 3일 연속 유지 가능한 강도로 시작합니다.",
        ]
    elif category == "tech":
        perspective = (
            "기술 이슈도 결국 사용 경험과 비용, 시간에 닿을 때 의미가 커집니다. "
            "어려운 용어보다 '지금 내 선택이 바뀌는지'만 먼저 보면 충분합니다."
        )
        actions = [
            "내가 쓰는 서비스/기기에서 관련 설정이나 업데이트를 확인합니다.",
            "새 기능을 바로 전환하기보다 체험 범위를 작게 정해 테스트합니다.",
            "변화가 크면 다음 주까지 지켜보고 최종 판단합니다.",
        ]
    else:
        perspective = (
            "개발/보안 이슈는 큰 사고보다 작은 습관에서 갈리는 경우가 많습니다. "
            "복잡한 개선보다 기본 점검 1개를 꾸준히 지키는 게 효과적입니다."
        )
        actions = [
            "사용 중인 계정/서비스의 기본 보안 설정을 1개 점검합니다.",
            "불필요한 권한이나 오래된 접근 키를 정리합니다.",
            "팀이 있다면 점검 결과를 짧게 공유해 같은 실수를 줄입니다.",
        ]

    actions_md = "\n".join(
        f"{idx}. {step}" for idx, step in enumerate(actions, start=1)
    )

    return f"""## 오늘 가볍게 보는 이슈: {display_title}

30분 자동 업데이트입니다. 이 글은 {date_kr} 기준으로 바쁜 날에도 2~3분 안에 읽히도록 핵심만 정리한 브리핑입니다.

### 한 줄 요약
{summary}

### 세줄요약
1. 지금 화제가 된 핵심은 **{display_title}** 입니다.
2. 이 주제는 일상/업무 선택에 바로 영향을 줄 수 있어 빠르게 체크할 가치가 있습니다.
3. 성급한 결론보다 공식 발표와 후속 보도를 함께 보는 것이 안전합니다.

### 릴황생각
{perspective}

### 오늘 바로 해볼 것
{actions_md}

### 원문 체크
- 매체: {item.source}
- 링크: {item.link}

### 메모
- 이 글은 빠른 브리핑용 요약입니다.
- 세부 맥락은 원문과 후속 기사로 업데이트해 확인하세요.
""".strip()


def build_fallback_topic(state: Dict[str, Any]) -> Dict[str, Any]:
    cursor = int(state.get("fallback_cursor", 0))
    topic = FALLBACK_TOPICS[cursor % len(FALLBACK_TOPICS)]
    state["fallback_cursor"] = cursor + 1
    return topic


def build_fallback_excerpt(topic: Dict[str, Any]) -> str:
    return (
        f"{topic['problem']} 상황에서 오늘 바로 따라할 수 있는 "
        "가벼운 실전 팁을 정리했습니다."
    )


def build_fallback_image_prompts(topic: Dict[str, Any]) -> List[str]:
    title = clean_text(topic["title"])
    problem = clean_text(topic["problem"])
    category = clean_text(topic["category"])
    tags = ", ".join(topic.get("tags", [])[:4])

    return [
        (
            f"editorial problem-solving image, {category}, {title}, {problem}, "
            f"keywords: {tags}, realistic style, no logo, no text"
        ),
        (
            f"workflow checklist concept visual, {title}, {problem}, "
            "clean desk, notebook, dashboard mood, documentary photo style, no text"
        ),
        (
            f"strategy meeting concept, {category} operations planning, {title}, "
            "minimal modern composition, realistic lighting, no letters"
        ),
    ]


def build_fallback_content(topic: Dict[str, Any]) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    steps_md = "\n".join(
        f"{idx}. {step}" for idx, step in enumerate(topic["steps"], start=1)
    )
    checklist = "\n".join(
        [
            "- [ ] 오늘 바로 적용할 항목 1개 선택",
            "- [ ] 이번 주에 유지할 습관 1개 확정",
            "- [ ] 효과 확인을 위한 메모 1줄 남기기",
        ]
    )

    return f"""## {topic['title']}

실시간 큰 이슈가 잠잠한 시간대에도, 사람들이 실제로 자주 겪는 생활 문제는 계속 생깁니다.  
이 글은 **{now}** 기준 자동 발행된 가벼운 실전 가이드입니다.

### 문제 상황
{topic['problem']}

### 세줄요약
1. 지금 문제는 누구나 반복적으로 겪는 일상형 이슈입니다.
2. 복잡한 이론보다 바로 실행할 수 있는 순서가 효과를 만듭니다.
3. 작은 변화 1개라도 꾸준히 유지하면 체감이 확실히 좋아집니다.

### 바로 해보기
{steps_md}

### 5분 체크리스트
{checklist}

### 릴황생각
하루를 바꾸는 건 거창한 계획보다 작은 실행입니다. 오늘 한 번 해보고, 맞으면 내 루틴으로 고정하면 됩니다.
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
    state = load_json(STATE_PATH, {"seen_links": [], "fallback_cursor": 0})

    seen = set(state.get("seen_links", []))

    candidates: List[FeedItem] = []
    for url in FEEDS:
        try:
            candidates.extend(parse_feed(url))
        except Exception as exc:
            print(f"[warn] failed feed: {url} ({exc})")

    posts = posts_obj.get("posts", [])
    next_id = (max((p.get("id", 0) for p in posts), default=0) + 1)
    now_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    chosen = None
    if candidates:
        candidates.sort(key=lambda x: x.published, reverse=True)
        unseen = [item for item in candidates if item.link not in seen]
        if unseen:
            light_unseen = [
                item for item in unseen if is_lightweight_topic(item.title, item.summary)
            ]
            chosen = light_unseen[0] if light_unseen else unseen[0]

    if chosen is not None:
        category = choose_category(chosen.title, chosen.summary)
        localized_headline = (
            summarize_auto_brief_title(chosen.title)
            if has_latin(chosen.title)
            else clean_text(chosen.title)
        )
        post_title = localized_headline
        image_prompts = build_feed_image_prompts(chosen, category)
        cover_image, image_variants = generate_covers_for_post(
            ROOT,
            next_id,
            post_title,
            build_excerpt(chosen),
            build_tags(chosen.title, chosen.summary, chosen.source),
            category,
            variants=3,
        )
        new_post = {
            "id": next_id,
            "title": post_title,
            "category": category,
            "date": now_date,
            "image": cover_image,
            "excerpt": build_excerpt(chosen),
            "content": build_content(chosen, localized_headline, category),
            "tags": build_tags(chosen.title, chosen.summary, chosen.source),
            "image_prompts": image_prompts[:3],
            "image_variants": image_variants[:3],
        }
        updates_title = f"자동 블로그 게시: {localized_headline[:48]}"
        print(f"[ok] feed post id={next_id} title={chosen.title}")
        seen.add(chosen.link)
        state["seen_links"] = list(seen)[-600:]
    else:
        topic = build_fallback_topic(state)
        image_prompts = build_fallback_image_prompts(topic)
        cover_image, image_variants = generate_covers_for_post(
            ROOT,
            next_id,
            topic["title"],
            build_fallback_excerpt(topic),
            topic["tags"],
            topic["category"],
            variants=3,
        )
        new_post = {
            "id": next_id,
            "title": topic["title"],
            "category": topic["category"],
            "date": now_date,
            "image": cover_image,
            "excerpt": build_fallback_excerpt(topic),
            "content": build_fallback_content(topic),
            "tags": topic["tags"],
            "image_prompts": image_prompts[:3],
            "image_variants": image_variants[:3],
        }
        updates_title = f"자동 블로그 게시: {topic['title'][:40]}"
        print(f"[ok] fallback post id={next_id} title={topic['title']}")

    posts.append(new_post)
    posts.sort(key=lambda x: x.get("id", 0))
    posts_obj["posts"] = posts

    updates_obj.append(
        {
            "date": now_date,
            "title": updates_title,
            "url": f"blog.html#post-{next_id}",
            "category": "자동발행",
        }
    )

    # Keep update log manageable
    if len(updates_obj) > 120:
        updates_obj = updates_obj[-120:]

    save_json(POSTS_PATH, posts_obj)
    save_json(UPDATES_PATH, updates_obj)
    save_json(STATE_PATH, state)

    print(f"[ok] added post id={next_id}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
