#!/usr/bin/env python3
"""Keyword-based local SVG cover generator.

Generates deterministic self-hosted images to avoid CSP/external image issues.
"""

from __future__ import annotations

import hashlib
import re
from pathlib import Path
from typing import Iterable, List, Tuple


PALETTES = [
    ("#0f172a", "#1e3a8a", "#0b3b6a"),
    ("#111827", "#1d4ed8", "#2563eb"),
    ("#1f2937", "#065f46", "#0f766e"),
    ("#1e1b4b", "#4c1d95", "#6d28d9"),
    ("#1f2937", "#7c2d12", "#b45309"),
]


def _safe_text(text: str, max_len: int) -> str:
    text = re.sub(r"\s+", " ", str(text or "")).strip()
    if len(text) <= max_len:
        return text
    return text[: max(0, max_len - 1)] + "…"


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


def _svg(
    title: str,
    subtitle: str,
    chips: Iterable[str],
    label: str,
    seed: str,
) -> str:
    c1, c2, c3 = _pick_palette(seed)
    chips_text = " ".join(f"#{c.upper()}" for c in chips if c)[:86] or "#ARTICLE #INSIGHT"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="Generated cover">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="58%" stop-color="{c2}"/>
      <stop offset="100%" stop-color="{c3}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect x="56" y="56" width="1168" height="608" rx="24" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="2"/>
  <text x="84" y="146" fill="#bfdbfe" font-size="30" font-family="Arial, sans-serif" font-weight="700">{_esc(label)}</text>
  <text x="84" y="230" fill="#ffffff" font-size="54" font-family="Arial, sans-serif" font-weight="700">{_esc(_safe_text(title, 48))}</text>
  <text x="84" y="292" fill="#dbeafe" font-size="30" font-family="Arial, sans-serif">{_esc(_safe_text(subtitle, 74))}</text>
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

    safe_tags = [re.sub(r"[^0-9A-Za-z가-힣]+", "", t) for t in (tags or [])]
    safe_tags = [t for t in safe_tags if t][:4]
    if not safe_tags:
        safe_tags = [re.sub(r"[^0-9A-Za-z가-힣]+", "", category or "BLOG")]

    cover_name = f"post-{post_id}-cover.svg"
    cover_path = gen_dir / cover_name
    cover_svg = _svg(title, subtitle, safe_tags, "MAIN COVER", f"{post_id}|cover|{title}")
    cover_path.write_text(cover_svg, encoding="utf-8")

    variant_paths: List[str] = []
    for i in range(1, max(1, variants) + 1):
        name = f"post-{post_id}-v{i}.svg"
        path = gen_dir / name
        svg = _svg(title, subtitle, safe_tags, f"ARTICLE IMAGE {i}", f"{post_id}|v{i}|{title}")
        path.write_text(svg, encoding="utf-8")
        variant_paths.append(f"images/generated/{name}")

    return (f"images/generated/{cover_name}", variant_paths)
