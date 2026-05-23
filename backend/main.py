"""FastAPI entrypoint for Gov UX Analyzer."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl

from analyzer import AnalysisResult, TargetAudience, analyze_scrape
from scraper import scrape_url

app = FastAPI(
    title="Gov UX Analyzer API",
    description="市役所サイトの行政の泥（Sludge）診断API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://gov-sludge-detector.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    url: HttpUrl
    target: TargetAudience = "all"


class AnalyzeResponse(BaseModel):
    url: str
    title: str
    form_count: int
    link_count: int
    char_count: int
    sludge_score: int = Field(ge=0, le=100)
    time_tax_minutes: float
    hard_words: list[dict[str, str]]
    raw_text_highlighted: str
    b_group_proposal: str


def _to_response(url: str, title: str, meta: dict, analysis: AnalysisResult) -> AnalyzeResponse:
    return AnalyzeResponse(
        url=url,
        title=title,
        form_count=meta["form_count"],
        link_count=meta["link_count"],
        char_count=meta["char_count"],
        sludge_score=analysis.sludge_score,
        time_tax_minutes=analysis.time_tax_minutes,
        hard_words=[w.model_dump() for w in analysis.hard_words],
        raw_text_highlighted=analysis.raw_text_highlighted,
        b_group_proposal=analysis.b_group_proposal,
    )


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(body: AnalyzeRequest) -> AnalyzeResponse:
    url_str = str(body.url)
    try:
        scrape = scrape_url(url_str)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"ページの取得に失敗しました: {e}",
        ) from e

    try:
        analysis = analyze_scrape(scrape, target=body.target)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI分析に失敗しました: {e}",
        ) from e

    return _to_response(
        scrape.url,
        scrape.title,
        {
            "form_count": scrape.form_count,
            "link_count": scrape.link_count,
            "char_count": scrape.char_count,
        },
        analysis,
    )
