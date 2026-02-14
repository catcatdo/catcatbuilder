#!/usr/bin/env python3
"""Utilities to normalize mixed/English headlines into Korean text."""

from __future__ import annotations

import re


ASCII_RE = re.compile(r"[A-Za-z]")
TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z0-9'&.+-]*")

LETTER_KO = {
    "a": "에이",
    "b": "비",
    "c": "씨",
    "d": "디",
    "e": "이",
    "f": "에프",
    "g": "지",
    "h": "에이치",
    "i": "아이",
    "j": "제이",
    "k": "케이",
    "l": "엘",
    "m": "엠",
    "n": "엔",
    "o": "오",
    "p": "피",
    "q": "큐",
    "r": "알",
    "s": "에스",
    "t": "티",
    "u": "유",
    "v": "브이",
    "w": "더블유",
    "x": "엑스",
    "y": "와이",
    "z": "지",
}

# Longest-first replacements are safer for phrase conversions.
PHRASE_REPLACEMENTS = [
    ("Google for Startups Gemini Startup Forum", "구글 스타트업스 제미나이 스타트업 포럼"),
    ("Google Docs", "구글 문서"),
    ("GitHub Pages", "깃허브 페이지스"),
    ("Cloudflare Workers", "클라우드플레어 워커스"),
    ("Open WebUI", "오픈 웹유아이"),
    ("Mac Studio", "맥 스튜디오"),
    ("M4 Max", "엠4 맥스"),
    ("M3 Ultra", "엠3 울트라"),
    ("Open Claw", "오픈클로"),
    ("OpenClaw", "오픈클로"),
    ("OpenAI", "오픈에이아이"),
    ("ChatGPT", "챗지피티"),
    ("DeepSeek", "딥시크"),
    ("Cerebras", "세레브라스"),
    ("Nvidia", "엔비디아"),
    ("Pinterest", "핀터레스트"),
    ("Amazon", "아마존"),
    ("Google", "구글"),
    ("Apple Inc.", "애플"),
    ("Apple", "애플"),
    ("Etsy", "엣시"),
    ("Meta", "메타"),
    ("Reuters", "로이터"),
    ("PhocusWire", "포커스와이어"),
    ("MSN", "엠에스엔"),
    ("Five9", "파이브나인"),
    ("Cybersecurity", "사이버보안"),
    ("ByteString", "바이트스트링"),
    ("UTF-8", "유티에프팔"),
    ("REST API", "레스트 에이피아이"),
    ("FastAPI", "패스트에이피아이"),
    ("Discord", "디스코드"),
    ("Codex", "코덱스"),
    ("AdSense", "애드센스"),
    ("Docker", "도커"),
    ("Python", "파이썬"),
    ("Ubuntu", "우분투"),
    ("Minecraft", "마인크래프트"),
    ("Palworld", "팰월드"),
    ("Synology", "시놀로지"),
    ("Ollama", "올라마"),
    ("TSMC", "티에스엠씨"),
    ("TikTok", "틱톡"),
    ("ESP32", "이에스피삼이"),
    ("IoT", "사물인터넷"),
    ("LLM", "대규모 언어모델"),
    ("NAS", "나스"),
    ("HDD", "하드디스크"),
    ("SEO", "검색최적화"),
    ("MBTI", "엠비티아이"),
    ("API", "에이피아이"),
    ("AI", "인공지능"),
    ("UN", "유엔"),
    ("EU", "유럽연합"),
]

WORD_REPLACEMENTS = {
    "vs": "비교",
    "best": "베스트",
    "top": "톱",
    "infra": "인프라",
    "infrastructure": "인프라",
    "forum": "포럼",
    "startup": "스타트업",
    "founders": "창업자",
    "shopping": "쇼핑",
    "ads": "광고",
    "ad": "광고",
    "upgrade": "업데이트",
    "updates": "업데이트",
    "hardware": "하드웨어",
    "partnership": "파트너십",
    "mode": "모드",
    "audio": "오디오",
    "summary": "요약",
    "summaries": "요약",
    "travel": "여행",
    "hackers": "해커",
    "hacker": "해커",
    "state": "국가",
    "sponsored": "지원",
    "tools": "도구",
    "review": "리뷰",
    "week": "주간",
    "street": "증권가",
    "optimistic": "낙관론",
    "testing": "테스트",
    "rivals": "경쟁사",
    "dominance": "지배력",
    "ultra": "울트라",
    "max": "맥스",
    "nm": "나노미터",
    "gb": "기가바이트",
}

AUTO_ENTITY_MAP = [
    ("openai", "오픈에이아이"),
    ("google", "구글"),
    ("nvidia", "엔비디아"),
    ("amazon", "아마존"),
    ("apple", "애플"),
    ("gemini", "제미나이"),
    ("deepseek", "딥시크"),
    ("cerebras", "세레브라스"),
    ("meta", "메타"),
    ("pinterest", "핀터레스트"),
]

AUTO_TOPIC_RULES = [
    (["hack", "hacker", "security", "distill", "extract", "clone", "breach"], "인공지능 보안 이슈"),
    (["chip", "semiconductor", "cerebras", "nvidia"], "인공지능 반도체 경쟁"),
    (["shopping", "ads", "ad ", "search", "mode", "travel"], "검색·광고 생태계 변화"),
    (["startup", "forum", "founder", "funding"], "스타트업·투자 흐름"),
    (["docs", "audio", "summary", "productivity"], "생산성 기능 업데이트"),
    (["partnership", "tie", "deal"], "기업 제휴·전략 변화"),
]


def has_latin(text: str) -> bool:
    return bool(ASCII_RE.search(str(text or "")))


def _replace_ci(text: str, source: str, target: str) -> str:
    return re.sub(re.escape(source), target, text, flags=re.IGNORECASE)


def _spell_token(token: str) -> str:
    result = []
    for ch in token:
        if ch.isalpha():
            result.append(LETTER_KO.get(ch.lower(), ""))
        elif ch.isdigit():
            result.append(ch)
    return "".join(result)


def localize_mixed_title(title: str) -> str:
    text = str(title or "").strip()
    if not text or not has_latin(text):
        return text

    out = text
    for src, dst in PHRASE_REPLACEMENTS:
        out = _replace_ci(out, src, dst)

    def repl(match: re.Match[str]) -> str:
        token = match.group(0)
        low = token.lower()
        if low in WORD_REPLACEMENTS:
            return WORD_REPLACEMENTS[low]
        if low.endswith("'s") and low[:-2] in WORD_REPLACEMENTS:
            return WORD_REPLACEMENTS[low[:-2]] + "의"
        spelled = _spell_token(token)
        return spelled or token

    out = TOKEN_RE.sub(repl, out)
    out = re.sub(r"\s{2,}", " ", out).strip()
    out = out.replace(" ,", ",").replace(" .", ".")
    return out


def summarize_auto_brief_title(raw_title: str) -> str:
    title = str(raw_title or "").strip()
    low = title.lower()

    entities = []
    for key, label in AUTO_ENTITY_MAP:
        if key in low and label not in entities:
            entities.append(label)

    topic = "글로벌 기술 이슈"
    for keys, label in AUTO_TOPIC_RULES:
        if any(k in low for k in keys):
            topic = label
            break

    if entities:
        return f"{'·'.join(entities[:2])} {topic} 핵심 정리"
    return f"{topic} 핵심 정리"


def localize_post_title(title: str) -> str:
    text = str(title or "").strip()
    if not text:
        return text
    if text.startswith("[자동브리핑]"):
        base = re.sub(r"^\[자동브리핑\]\s*", "", text)
        return summarize_auto_brief_title(base)
    return localize_mixed_title(text)


def localize_one_line_summary(
    summary: str,
    title: str = "",
    source: str = "",
    force_rewrite: bool = False,
) -> str:
    text = str(summary or "").strip()
    if text and not has_latin(text) and not force_rewrite:
        return text

    topic = summarize_auto_brief_title(title or text).replace("핵심 정리", "핵심 흐름")
    src = str(source or "").strip()
    if src and not has_latin(src):
        return f"{topic} 관련 {src} 보도를 중심으로 쟁점이 빠르게 확산되고 있습니다."
    return f"{topic} 관련 주요 매체 보도를 중심으로 쟁점이 빠르게 확산되고 있습니다."
