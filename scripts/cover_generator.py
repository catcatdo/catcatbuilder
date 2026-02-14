#!/usr/bin/env python3
"""Keyword-based local SVG cover generator.

Generates deterministic self-hosted images to avoid CSP/external image issues.
"""

from __future__ import annotations

import hashlib
import re
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

from korean_title_utils import localize_mixed_title


PALETTES = [
    ("#0f172a", "#1e3a8a", "#0b3b6a"),
    ("#111827", "#1d4ed8", "#2563eb"),
    ("#1f2937", "#065f46", "#0f766e"),
    ("#1e1b4b", "#4c1d95", "#6d28d9"),
    ("#1f2937", "#7c2d12", "#b45309"),
]

THEME_PALETTES: Dict[str, Tuple[str, str, str]] = {
    "baseball_lotte": ("#0b1f3b", "#5b1427", "#be123c"),
    "baseball": ("#0f172a", "#1e3a8a", "#dc2626"),
    "finance": ("#0f172a", "#064e3b", "#0f766e"),
    "legal_incident": ("#111827", "#374151", "#7f1d1d"),
    "ai_tech": ("#0b1020", "#1d4ed8", "#2563eb"),
    "sports": ("#111827", "#4c1d95", "#2563eb"),
}

THEME_KEYWORDS = [
    ("baseball_lotte", ["롯데", "자이언츠", "lotte", "giants", "부산", "kbo"]),
    ("baseball", ["야구", "baseball", "mlb", "구단", "캠프", "spring training"]),
    ("finance", ["금융", "대출", "금리", "은행", "부동산", "주택", "finance", "loan", "rate"]),
    ("legal_incident", ["재판", "법원", "판결", "항소", "사고", "음주", "무면허", "court", "appeal"]),
    ("ai_tech", ["ai", "openai", "gemini", "google", "llm", "반도체", "chip", "nvidia"]),
    ("sports", ["올림픽", "스노보드", "축구", "농구", "sports", "athlete"]),
]

THEME_HINT_CHIPS: Dict[str, List[str]] = {
    "baseball_lotte": ["야구", "부산", "유니폼"],
    "baseball": ["야구", "경기장", "선수"],
    "finance": ["금융", "대출", "시장"],
    "legal_incident": ["사건", "판결", "안전"],
    "ai_tech": ["AI", "기술", "칩"],
    "sports": ["스포츠", "기록", "훈련"],
}

STOPWORDS = {
    "the", "and", "for", "with", "from", "into", "this", "that", "are",
    "was", "were", "has", "have", "had", "will", "about", "today", "issue",
    "news", "update", "auto", "post", "blog", "article", "analysis",
    "입니다", "관련", "대한", "그리고", "하는", "에서", "으로", "까지", "통해",
    "대한민국", "정리", "핵심", "이슈", "뉴스", "브리핑", "자동브리핑",
}

LATIN_RE = re.compile(r"[A-Za-z]")
KEEP_TOKEN_RE = re.compile(r"\b(?:M3|M4|M5|S26)\b", flags=re.IGNORECASE)


def _safe_text(text: str, max_len: int) -> str:
    text = re.sub(r"\s+", " ", str(text or "")).strip()
    if len(text) <= max_len:
        return text
    return text[: max(0, max_len - 1)] + "…"


def _latin_ratio(text: str) -> float:
    letters = [c for c in str(text or "") if c.isalpha()]
    if not letters:
        return 0.0
    latin = sum(1 for c in letters if "a" <= c.lower() <= "z")
    return latin / len(letters)


def _koreanize_cover_text(text: str, fallback: str, max_len: int) -> str:
    raw = _safe_text(text, max_len).strip()
    if not raw:
        return fallback

    if not LATIN_RE.search(raw):
        return raw

    keep_map: Dict[str, str] = {}
    keep_idx = 0

    def protect(match: re.Match[str]) -> str:
        nonlocal keep_idx
        token = match.group(0).upper()
        key = f"§{keep_idx}§"
        keep_map[key] = token
        keep_idx += 1
        return key

    protected = KEEP_TOKEN_RE.sub(protect, raw)
    converted = _safe_text(localize_mixed_title(protected), max_len).strip()

    for key, token in keep_map.items():
        converted = converted.replace(key, token)

    if converted and not LATIN_RE.search(converted):
        return converted
    return fallback


def _esc(text: str) -> str:
    return (
        str(text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def _pick_palette(seed: str) -> Tuple[str, str, str]:
    idx = int(hashlib.sha1(seed.encode("utf-8")).hexdigest(), 16) % len(PALETTES)
    return PALETTES[idx]


def _pick_theme_palette(seed: str, theme: str) -> Tuple[str, str, str]:
    if theme in THEME_PALETTES:
        return THEME_PALETTES[theme]
    return _pick_palette(seed)


def _seed_int(seed: str, salt: str, mod: int) -> int:
    return int(hashlib.sha1(f"{seed}|{salt}".encode("utf-8")).hexdigest(), 16) % max(1, mod)


def _normalize_match_text(*parts: str) -> str:
    return " ".join(str(part or "") for part in parts).lower()


def _clean_chip(text: str) -> str:
    value = re.sub(r"[^0-9A-Za-z가-힣]+", "", str(text or ""))
    return value[:12]


def _extract_tokens(text: str) -> List[str]:
    out: List[str] = []
    for raw in re.findall(r"[0-9A-Za-z가-힣]{2,}", str(text or "")):
        low = raw.lower()
        if low in STOPWORDS:
            continue
        out.append(raw)
    return out


def _pick_theme(title: str, subtitle: str, tags: List[str], category: str) -> str:
    text = _normalize_match_text(title, subtitle, " ".join(tags), category)
    for theme, keywords in THEME_KEYWORDS:
        if any(keyword.lower() in text for keyword in keywords):
            return theme
    return "editorial"


def _build_chips(title: str, subtitle: str, tags: List[str], theme: str, category: str) -> List[str]:
    values: List[str] = []

    for tag in tags or []:
        values.append(_clean_chip(tag))

    values.extend(_clean_chip(token) for token in _extract_tokens(title))
    values.extend(_clean_chip(token) for token in _extract_tokens(subtitle))

    for hint in THEME_HINT_CHIPS.get(theme, []):
        values.append(_clean_chip(hint))

    values.append(_clean_chip(category or "BLOG"))

    uniq: List[str] = []
    seen = set()
    for value in values:
        if not value:
            continue
        key = value.lower()
        if key in seen:
            continue
        seen.add(key)
        uniq.append(value)
    return uniq[:6]


def _scene_baseball(seed: str) -> str:
    shift = _seed_int(seed, "baseball_shift", 28) - 14
    return f"""
  <ellipse cx="{968 + shift}" cy="410" rx="250" ry="170" fill="rgba(255,255,255,0.10)"/>
  <path d="M792 520 L968 318 L1144 520 L968 664 Z" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  <circle cx="{1038 + shift}" cy="220" r="82" fill="#ffffff" stroke="rgba(31,41,55,0.22)" stroke-width="2"/>
  <path d="M990 178 Q1042 220 990 262" fill="none" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
  <path d="M1086 178 Q1034 220 1086 262" fill="none" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
"""


def _scene_baseball_lotte(seed: str) -> str:
    shift = _seed_int(seed, "lotte_shift", 22) - 11
    return f"""
  {_scene_baseball(seed)}
  <path d="M840 226 L906 194 L972 226 L956 330 L906 368 L856 330 Z" fill="#0f172a" stroke="rgba(255,255,255,0.36)" stroke-width="2"/>
  <rect x="896" y="238" width="20" height="96" rx="10" fill="#be123c"/>
  <path d="M774 452 Q906 372 1038 452" fill="none" stroke="rgba(255,255,255,0.58)" stroke-width="4"/>
  <path d="M906 406 L968 472 L1030 406" fill="none" stroke="rgba(255,255,255,0.42)" stroke-width="4"/>
"""


def _scene_finance(seed: str) -> str:
    move = _seed_int(seed, "finance_move", 32) - 16
    return f"""
  <rect x="740" y="152" width="470" height="394" rx="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.28)" stroke-width="2"/>
  <path d="M772 498 L840 452 L898 468 L962 408 L1038 430 L1112 340 L1180 302" fill="none" stroke="#22c55e" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="{812 + move}" y="420" width="24" height="78" rx="4" fill="#60a5fa"/>
  <rect x="{862 + move}" y="382" width="24" height="116" rx="4" fill="#60a5fa"/>
  <rect x="{912 + move}" y="358" width="24" height="140" rx="4" fill="#34d399"/>
  <rect x="{962 + move}" y="326" width="24" height="172" rx="4" fill="#34d399"/>
  <rect x="{1012 + move}" y="294" width="24" height="204" rx="4" fill="#22c55e"/>
"""


def _scene_legal_incident(seed: str) -> str:
    tilt = _seed_int(seed, "legal_tilt", 26) - 13
    return f"""
  <path d="M750 560 L940 330 L1130 560 Z" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.24)" stroke-width="2"/>
  <rect x="{894 + tilt}" y="212" width="180" height="28" rx="8" fill="rgba(255,255,255,0.68)"/>
  <rect x="{866 + tilt}" y="246" width="58" height="110" rx="8" fill="rgba(255,255,255,0.62)"/>
  <rect x="{914 + tilt}" y="346" width="128" height="24" rx="8" fill="rgba(255,255,255,0.62)"/>
  <path d="M936 472 L944 472 M964 472 L972 472 M992 472 L1000 472 M1020 472 L1028 472" stroke="#fde68a" stroke-width="5" stroke-linecap="round"/>
  <circle cx="1140" cy="196" r="34" fill="#f97316"/>
  <path d="M1140 178 L1140 206" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
  <circle cx="1140" cy="218" r="4" fill="#fff"/>
"""


def _scene_ai_tech(seed: str) -> str:
    nudge = _seed_int(seed, "tech_nudge", 24) - 12
    return f"""
  <rect x="{776 + nudge}" y="198" width="360" height="320" rx="28" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.30)" stroke-width="2"/>
  <rect x="{866 + nudge}" y="286" width="180" height="144" rx="18" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  <path d="M866 254 L818 254 M866 350 L818 350 M866 446 L818 446 M1046 254 L1098 254 M1046 350 L1098 350 M1046 446 L1098 446" stroke="#93c5fd" stroke-width="5" stroke-linecap="round"/>
  <path d="M908 286 L908 238 M956 286 L956 238 M1004 286 L1004 238 M908 430 L908 478 M956 430 L956 478 M1004 430 L1004 478" stroke="#bfdbfe" stroke-width="5" stroke-linecap="round"/>
"""


def _scene_sports(seed: str) -> str:
    drift = _seed_int(seed, "sports_drift", 30) - 15
    return f"""
  <ellipse cx="{980 + drift}" cy="500" rx="220" ry="88" fill="rgba(255,255,255,0.14)"/>
  <rect x="{856 + drift}" y="374" width="82" height="130" rx="14" fill="rgba(255,255,255,0.26)"/>
  <rect x="{950 + drift}" y="332" width="82" height="172" rx="14" fill="rgba(255,255,255,0.34)"/>
  <rect x="{1044 + drift}" y="390" width="82" height="114" rx="14" fill="rgba(255,255,255,0.22)"/>
  <circle cx="{990 + drift}" cy="284" r="36" fill="#fde68a"/>
"""


def _scene_editorial(seed: str) -> str:
    move = _seed_int(seed, "ed_move", 36) - 18
    return f"""
  <circle cx="{940 + move}" cy="236" r="108" fill="rgba(255,255,255,0.12)"/>
  <circle cx="{1068 + move}" cy="356" r="84" fill="rgba(255,255,255,0.10)"/>
  <rect x="{790 + move}" y="426" width="350" height="132" rx="20" fill="rgba(255,255,255,0.10)"/>
"""


def _render_scene(theme: str, seed: str) -> str:
    if theme == "baseball_lotte":
        return _scene_baseball_lotte(seed)
    if theme == "baseball":
        return _scene_baseball(seed)
    if theme == "finance":
        return _scene_finance(seed)
    if theme == "legal_incident":
        return _scene_legal_incident(seed)
    if theme == "ai_tech":
        return _scene_ai_tech(seed)
    if theme == "sports":
        return _scene_sports(seed)
    return _scene_editorial(seed)


def _svg(
    title: str,
    subtitle: str,
    chips: Iterable[str],
    label: str,
    seed: str,
    theme: str,
) -> str:
    c1, c2, c3 = _pick_theme_palette(seed, theme)
    disp_label = _koreanize_cover_text(label, "대표 이미지", 16)
    disp_title = _koreanize_cover_text(title, "핵심 이슈 브리핑", 48)
    disp_subtitle = _koreanize_cover_text(subtitle, "핵심 포인트를 빠르게 정리한 콘텐츠", 74)

    chip_texts: List[str] = []
    for chip in chips:
        value = str(chip or "").strip()
        if not value:
            continue
        if LATIN_RE.search(value) and len(value) > 4:
            value = _koreanize_cover_text(value, "핵심", 12)
        chip_texts.append(f"#{_safe_text(value, 12)}")
    chips_text = " ".join(chip_texts)[:96] or "#핵심 #브리핑"
    scene = _render_scene(theme, seed)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="Generated cover">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="58%" stop-color="{c2}"/>
      <stop offset="100%" stop-color="{c3}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  {scene}
  <rect x="56" y="56" width="1168" height="608" rx="24" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="2"/>
  <text x="84" y="146" fill="#bfdbfe" font-size="30" font-family="Arial, sans-serif" font-weight="700">{_esc(disp_label)}</text>
  <text x="84" y="230" fill="#ffffff" font-size="54" font-family="Arial, sans-serif" font-weight="700">{_esc(disp_title)}</text>
  <text x="84" y="292" fill="#dbeafe" font-size="30" font-family="Arial, sans-serif">{_esc(disp_subtitle)}</text>
  <rect x="84" y="582" width="1110" height="62" rx="31" fill="rgba(255,255,255,0.16)"/>
  <text x="116" y="622" fill="#ffffff" font-size="30" font-family="Arial, sans-serif">{_esc(chips_text)}</text>
</svg>
"""


def generate_covers_for_post(
    root: Path,
    post_id: int,
    title: str,
    subtitle: str,
    tags: List[str],
    category: str,
    variants: int = 3,
) -> Tuple[str, List[str]]:
    gen_dir = root / "images" / "generated"
    gen_dir.mkdir(parents=True, exist_ok=True)

    theme = _pick_theme(title, subtitle, tags, category)
    chips = _build_chips(title, subtitle, tags or [], theme, category)
    if not chips:
        chips = [_clean_chip(category or "BLOG")]

    cover_name = f"post-{post_id}-cover.svg"
    cover_path = gen_dir / cover_name
    cover_svg = _svg(title, subtitle, chips, "대표 이미지", f"{post_id}|cover|{title}", theme)
    cover_path.write_text(cover_svg, encoding="utf-8")

    variant_paths: List[str] = []
    for i in range(1, max(1, variants) + 1):
        name = f"post-{post_id}-v{i}.svg"
        path = gen_dir / name
        svg = _svg(title, subtitle, chips, f"본문 이미지 {i}", f"{post_id}|v{i}|{title}", theme)
        path.write_text(svg, encoding="utf-8")
        variant_paths.append(f"images/generated/{name}")

    return (f"images/generated/{cover_name}", variant_paths)
