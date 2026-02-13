#!/usr/bin/env python3
"""Generate one scheduled post and update posts.json/updates.json.

Priority:
1) unseen feed issue
2) fallback problem-solving topic (always publish)
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import List, Dict, Any
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

FALLBACK_TOPICS: List[Dict[str, Any]] = [
    {
        "title": "갑자기 색인이 줄어들 때 30분 안에 점검하는 체크리스트",
        "category": "dev",
        "tags": ["SEO", "색인문제", "검색유입", "문제해결", "운영팁", "자동브리핑"],
        "problem": "Search Console에서 갑자기 '발견됨-현재 색인되지 않음'이 늘어나는 상황",
        "steps": [
            "robots/meta robots/noindex 여부를 먼저 확인합니다.",
            "sitemap에 불필요한 리디렉션 URL이나 해시 URL(#section)이 섞였는지 제거합니다.",
            "핵심 페이지 10~15개를 URL 검사로 수동 요청하고 3~7일 추이를 봅니다.",
            "내부 링크를 홈/허브에서 최소 1회 이상 연결해 크롤링 우선순위를 올립니다.",
        ],
    },
    {
        "title": "블로그 조회수는 있는데 체류시간이 짧을 때 바로 고치는 방법",
        "category": "tech",
        "tags": ["블로그운영", "체류시간", "콘텐츠전략", "문제해결", "유입개선", "자동브리핑"],
        "problem": "유입은 늘었지만 평균 체류시간이 짧고 이탈이 빠른 상황",
        "steps": [
            "첫 화면 3줄 안에 문제/해결/대상 독자를 명확히 선언합니다.",
            "본문에 체크리스트/표/단계별 실행 순서를 넣어 스캔 가독성을 높입니다.",
            "관련 글 3개를 글 중간과 하단에 명시적으로 연결합니다.",
            "도입부와 결론의 중복 문장을 줄이고 사례 중심 문단을 늘립니다.",
        ],
    },
    {
        "title": "애드센스 승인 전 마지막 1주 체크포인트",
        "category": "tech",
        "tags": ["애드센스", "사이트운영", "정책", "문제해결", "승인준비", "자동브리핑"],
        "problem": "신청은 했는데 승인 지연이 길어지고 무엇을 고칠지 모르는 상황",
        "steps": [
            "정책/문의/소개/편집정책 페이지가 모든 주요 페이지에서 노출되는지 점검합니다.",
            "얇은 콘텐츠 페이지에 이용 가이드와 FAQ를 보강합니다.",
            "광고 위치가 버튼/다운로드 UI와 오해되지 않도록 분리합니다.",
            "최근 수정일과 업데이트 로그로 관리 신뢰 신호를 강화합니다.",
        ],
    },
    {
        "title": "자동발행 콘텐츠 품질이 떨어질 때 개선하는 프롬프트 구조",
        "category": "dev",
        "tags": ["자동발행", "프롬프트", "콘텐츠품질", "문제해결", "워크플로우", "자동브리핑"],
        "problem": "자동 생성 글이 비슷해지고 정보 밀도가 낮아지는 상황",
        "steps": [
            "역할/독자/분량/포함항목/제외항목을 분리한 템플릿을 고정합니다.",
            "항상 '실행 가능한 액션 3개' 섹션을 강제해 실용성을 높입니다.",
            "출처 표기를 의무화하고 확인 시점을 함께 표기합니다.",
            "업데이트 로그에서 반응이 좋은 글 유형을 기준으로 발행 규칙을 주기적으로 조정합니다.",
        ],
    },
    {
        "title": "API 비용이 갑자기 오를 때 서비스를 지키는 운영 전략",
        "category": "dev",
        "tags": ["API비용", "인프라", "운영전략", "문제해결", "SaaS", "자동브리핑"],
        "problem": "모델/API 사용량 증가로 수익 대비 원가가 급격히 악화되는 상황",
        "steps": [
            "기능별 원가를 분리 계산해 고비용 기능부터 최적화 우선순위를 정합니다.",
            "요청 캐싱/배치 처리/길이 제한으로 토큰 사용량을 낮춥니다.",
            "상위 모델과 경량 모델을 혼합하는 계층 전략을 도입합니다.",
            "가격 정책과 무료 제공 한도를 실제 원가 구조에 맞춰 재조정합니다.",
        ],
    },
    {
        "title": "검색 유입이 줄었을 때 콘텐츠를 살리는 내부 링크 재구성법",
        "category": "tech",
        "tags": ["검색유입", "내부링크", "콘텐츠전략", "문제해결", "SEO", "자동브리핑"],
        "problem": "새 글을 올려도 검색 유입이 늘지 않는 정체 구간",
        "steps": [
            "허브 페이지를 기준으로 주제별 클러스터 링크를 재배치합니다.",
            "신규 글을 기존 상위 트래픽 페이지에서 직접 링크합니다.",
            "유사 문서 간 canonical/중복 키워드 충돌을 점검합니다.",
            "우선 색인 URL 목록을 운영해 중요한 페이지부터 검색 신호를 집중합니다.",
        ],
    },
    {
        "title": "도구 페이지는 많은데 전환이 안 될 때 구조 개선 체크리스트",
        "category": "tech",
        "tags": ["도구페이지", "전환율", "UX", "문제해결", "사이트개선", "자동브리핑"],
        "problem": "페이지 방문은 있지만 반복 방문/구독/문의 전환이 낮은 상황",
        "steps": [
            "각 도구에 '누구를 위한 기능인지'를 첫 문장에 명시합니다.",
            "실전 예시 입력값 버튼을 넣어 초기 진입 장벽을 낮춥니다.",
            "결과 영역 아래에 관련 도구/가이드 링크를 연결합니다.",
            "페이지 하단에 업데이트 이력과 정책 링크를 일관되게 배치합니다.",
        ],
    },
    {
        "title": "모바일에서 이탈이 높은 사이트를 빠르게 개선하는 방법",
        "category": "dev",
        "tags": ["모바일최적화", "이탈률", "웹성능", "문제해결", "UX", "자동브리핑"],
        "problem": "데스크톱 대비 모바일 체류시간과 전환률이 낮은 상황",
        "steps": [
            "상단 네비 링크 수를 줄이고 핵심 CTA를 1개로 집중합니다.",
            "첫 뷰포트 내 텍스트 밀도와 버튼 크기를 재조정합니다.",
            "이미지/스크립트 지연 로딩으로 초기 렌더 속도를 개선합니다.",
            "모바일 전용 FAQ/짧은 요약 블록으로 스캔 가독성을 높입니다.",
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


def build_fallback_topic(state: Dict[str, Any]) -> Dict[str, Any]:
    cursor = int(state.get("fallback_cursor", 0))
    topic = FALLBACK_TOPICS[cursor % len(FALLBACK_TOPICS)]
    state["fallback_cursor"] = cursor + 1
    return topic


def build_fallback_excerpt(topic: Dict[str, Any]) -> str:
    return (
        f"[문제해결 가이드] {topic['problem']} 상황에서 바로 적용할 수 있는 "
        "실전 점검 순서를 정리했습니다."
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
            "- [ ] 오늘 바로 점검할 항목 1개 선정",
            "- [ ] 이번 주에 완료할 구조 개선 1개 확정",
            "- [ ] 다음 발행 글에 반영할 실험 포인트 기록",
        ]
    )

    return f"""## {topic['title']}

실시간 대형 뉴스가 없는 시간대에도 검색 유입과 문제 해결 수요는 계속 발생합니다.  
이 글은 **{now}** 기준 자동 발행된 문제해결형 운영 가이드입니다.

### 문제 상황
{topic['problem']}

### 왜 지금 이 주제가 중요한가
많은 사이트가 트래픽 숫자만 보고 운영하다가 실제 사용자 문제를 놓칩니다.  
하지만 검색은 결국 \"당장 해결하고 싶은 문제\"에서 시작됩니다.  
즉, 뉴스가 없을 때도 해결형 콘텐츠를 쌓아두면 장기적으로 유입 안정성이 좋아집니다.

### 바로 적용할 실행 순서
{steps_md}

### 운영팀 관점에서 보는 핵심 포인트
- 단기 트렌드 기사만으로는 축적형 검색 트래픽을 만들기 어렵습니다.
- 해결형 문서는 시간이 지나도 재방문/재검색으로 이어지는 비율이 높습니다.
- 페이지마다 가이드/정책/업데이트 링크를 고정하면 신뢰 신호가 강화됩니다.

### 실수하기 쉬운 부분
1. 기능 소개만 있고 실제 문제 해결 순서가 없는 콘텐츠
2. 사례 없이 추상 조언만 있는 글
3. 관련 페이지 내부 링크가 없어 사용자가 다음 행동을 못 찾는 구조
4. 수정 이력이 없어 정보 신뢰도가 떨어지는 문서

### 오늘의 미니 체크리스트
{checklist}

### 관련 추천 페이지
- 정보 허브: https://lilhwang.com/resource-center.html
- 업데이트 로그: https://lilhwang.com/update-log.html
- 편집정책: https://lilhwang.com/editorial-policy.html

### 메모
이 글은 자동 발행이지만, 실무에서 바로 적용 가능한 문제 해결 순서를 우선하도록 설계되었습니다.  
다음 주기에는 다른 문제 유형으로 이어서 발행됩니다.
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
        # Newest first
        candidates.sort(key=lambda x: x.published, reverse=True)
        for item in candidates:
            if item.link not in seen:
                chosen = item
                break

    if chosen is not None:
        category = choose_category(chosen.title, chosen.summary)
        image_prompts = build_feed_image_prompts(chosen, category)
        new_post = {
            "id": next_id,
            "title": f"[자동브리핑] {chosen.title}",
            "category": category,
            "date": now_date,
            "image": "",
            "excerpt": build_excerpt(chosen),
            "content": build_content(chosen),
            "tags": build_tags(chosen.title, chosen.summary, chosen.source),
            "image_prompts": image_prompts[:3],
        }
        updates_title = f"자동 이슈 브리핑 게시: {chosen.title[:48]}"
        print(f"[ok] feed post id={next_id} title={chosen.title}")
        seen.add(chosen.link)
        state["seen_links"] = list(seen)[-600:]
    else:
        topic = build_fallback_topic(state)
        image_prompts = build_fallback_image_prompts(topic)
        new_post = {
            "id": next_id,
            "title": f"[자동문제해결] {topic['title']}",
            "category": topic["category"],
            "date": now_date,
            "image": "",
            "excerpt": build_fallback_excerpt(topic),
            "content": build_fallback_content(topic),
            "tags": topic["tags"],
            "image_prompts": image_prompts[:3],
        }
        updates_title = f"자동 문제해결 가이드 게시: {topic['title'][:40]}"
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
