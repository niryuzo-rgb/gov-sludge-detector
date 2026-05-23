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


"""OpenAI-based municipal UX / sludge analyzer."""

from __future__ import annotations

import json
import os
import re
from typing import Any, Literal

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

from scraper import ScrapeResult

load_dotenv()

ANALYSIS_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

TargetAudience = Literal["senior", "foreigner", "native", "all"]

TARGET_LABELS: dict[TargetAudience, str] = {
    "senior": "高齢者・シニア層",
    "foreigner": "外国人・非ネイティブ",
    "native": "デジタルネイティブ（一般）",
    "all": "すべての市民（平均）",
}

TARGET_FOCUS: dict[TargetAudience, str] = {
    "senior": """
【想定ユーザー: 高齢者・シニア層】
この層の視点で厳しめに評価してください。特に以下を重視し、sludge_score と time_tax_minutes に反映させてください。
- 文字サイズ・コントラスト・アクセシビリティ（小さい文字、薄い色、リンクの判別困難）
- カタカナ語・外来語・略語の多用（説明なしのデジタル用語）
- 手順の多段階化、PDF前提、窓口誘導の曖昧さ
- 操作ミスを招くUI（ボタンが小さい、専門用語だらけのフォーム）
hard_words には高齢者にとって負担の大きい用語を優先し、plain_japanese は平易な日本語で説明してください。
b_group_proposal は大きな文字・少ないステップ・電話/対面案内の明示を含めてください。
""",
    "foreigner": """
【想定ユーザー: 外国人・非ネイティブ】
この層の視点で厳しめに評価してください。特に以下を重視し、sludge_score と time_tax_minutes に反映させてください。
- 難しい漢字・熟語・お役所言葉（やさしい日本語・多言語対応の欠如）
- 日本の制度・自治体手続き特有の前提知識（住民票、マイナンバー、印鑑文化など）
- 英語/other言語情報の不足、住所・氏名表記の複雑さ
- 在留・国籍・母国との手続きの違いが説明されていない点
hard_words には翻訳・平易化が必要な語を優先し、plain_japanese は外国人にも伝わる説明にしてください。
b_group_proposal は多言語切替・図解・チャットでの段階的案内を含めてください。
""",
    "native": """
【想定ユーザー: デジタルネイティブ（一般）】
この層の視点で評価してください。スマホ前提・短時間完了を期待するため、以下を重視してください。
- 情報の冗長さ、スクロール量、PDF/別ページ遷移の多さ
- チャットボットやワンストップ申請の欠如、古いWebデザイン
- 不必要な窓口誘導、紙申請前提の記述
- 検索・フィルタ・進捗表示の不足
sludge_score は「時間の無駄」「手間の多さ」に焦点を当て、time_tax_minutes はデジタル完結時の理想との差を反映してください。
b_group_proposal はモバイルファースト・チャットUI・最短ステップを具体的に示してください。
""",
    "all": """
【想定ユーザー: すべての市民（平均）】
特定の弱い層に偏らず、一般的な市民が手続きを完了するまでの負担をバランスよく評価してください。
文字量、難解語、手順数、フォームの複雑さを総合的に見て sludge_score と time_tax_minutes を算出してください。
""",
}

JSON_SCHEMA_INSTRUCTION = """
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
- 日本語で回答
"""


def build_system_prompt(target: TargetAudience) -> str:
    label = TARGET_LABELS[target]
    return (
        "あなたは日本の市役所・行政ウェブサイトのUI/UXと「行政の泥（Sludge）」を診断する専門家です。\n"
        f"今回の診断は「{label}」を主な想定利用者としたシミュレーションです。\n"
        f"{TARGET_FOCUS[target].strip()}\n"
        f"{JSON_SCHEMA_INSTRUCTION}"
    )

def _build_user_prompt(scrape: ScrapeResult, target: TargetAudience) -> str:
    return f"""想定ターゲット: {TARGET_LABELS[target]} (target={target})
URL: {scrape.url}
タイトル: {scrape.title}
フォーム数: {scrape.form_count}
リンク数: {scrape.link_count}
文字数: {scrape.char_count}

--- ページ本文 ---
{scrape.main_text}
"""
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


def analyze_scrape(
    scrape: ScrapeResult,
    target: TargetAudience = "all",
) -> AnalysisResult:
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
            {"role": "system", "content": build_system_prompt(target)},
            {"role": "user", "content": _build_user_prompt(scrape, target)},
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
