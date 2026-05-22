"""OpenAI-based municipal UX / sludge analyzer."""

from __future__ import annotations

import json
import os
import re
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

from scraper import ScrapeResult

load_dotenv()

ANALYSIS_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


class HardWord(BaseModel):
    term: str
    plain_japanese: str


class AnalysisResult(BaseModel):
    sludge_score: int = Field(ge=0, le=100)
    time_tax_minutes: float = Field(ge=0)
    hard_words: list[HardWord]
    raw_text_highlighted: str
    b_group_proposal: str


SYSTEM_PROMPT = """あなたは日本の市役所・行政ウェブサイトのUI/UXと「行政の泥（Sludge）」を診断する専門家です。
与えられたページテキストを分析し、必ず次のJSONオブジェクトのみを返してください（Markdownや説明文は不要）。

{
  "sludge_score": 0-100の整数（文字数・難解語・手続きの複雑さから総合評価。高いほど泥が多い）,
  "time_tax_minutes": 手続き完了までに市民が奪われる予想時間（分、小数可）,
  "hard_words": [{"term": "難解な行政用語", "plain_japanese": "やさしい日本語での説明"}, ...],
  "raw_text_highlighted": "元テキストの抜粋（最大800文字）。hard_wordsの各termを初出箇所で <span class=\\"bg-red-200\\" title=\\"やさしい訳\\">用語</span> で囲む。HTMLエスケープ済みの安全な断片のみ",
  "b_group_proposal": "B群（理想UI）：チャット風・ステップ型の改善ワイヤーフレーム案。見出し・ステップ・CTAをテキストで具体的に"
}

ルール:
- hard_wordsは3〜8件
- raw_text_highlightedは実際の本文抜粋をベースにし、ハイライトはspanのみ使用
- 日本語で回答"""


def _build_user_prompt(scrape: ScrapeResult) -> str:
    return f"""URL: {scrape.url}
タイトル: {scrape.title}
フォーム数: {scrape.form_count}
リンク数: {scrape.link_count}
文字数: {scrape.char_count}

--- ページ本文 ---
{scrape.main_text}
"""


def _parse_json_response(content: str) -> dict[str, Any]:
    text = content.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence:
        text = fence.group(1).strip()
    return json.loads(text)


def _fallback_highlight(text: str, hard_words: list[HardWord]) -> str:
    excerpt = text[:800]
    for hw in sorted(hard_words, key=lambda x: -len(x.term)):
        if hw.term in excerpt:
            replacement = (
                f'<span class="bg-red-200" title="{hw.plain_japanese}">'
                f"{hw.term}</span>"
            )
            excerpt = excerpt.replace(hw.term, replacement, 1)
    return excerpt


def analyze_scrape(scrape: ScrapeResult) -> AnalysisResult:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY が設定されていません。backend/.env を作成してください。"
        )

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=ANALYSIS_MODEL,
        temperature=0.4,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(scrape)},
        ],
    )

    raw = response.choices[0].message.content or "{}"
    data = _parse_json_response(raw)

    hard_words = [HardWord(**w) for w in data.get("hard_words", [])]
    highlighted = data.get("raw_text_highlighted") or ""
    if not highlighted.strip():
        highlighted = _fallback_highlight(scrape.main_text, hard_words)

    return AnalysisResult(
        sludge_score=int(data.get("sludge_score", 50)),
        time_tax_minutes=float(data.get("time_tax_minutes", 15)),
        hard_words=hard_words,
        raw_text_highlighted=highlighted,
        b_group_proposal=data.get("b_group_proposal", ""),
    )
