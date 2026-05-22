"""Municipal website HTML scraper for UX analysis."""

from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

USER_AGENT = (
    "Mozilla/5.0 (compatible; GovUXAnalyzer/1.0; +https://github.com/gov-ux-analyzer)"
)
REQUEST_TIMEOUT = 30.0
MAX_TEXT_CHARS = 12_000


@dataclass
class ScrapeResult:
    url: str
    title: str
    main_text: str
    form_count: int
    link_count: int
    char_count: int


def _normalize_whitespace(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _extract_main_text(soup: BeautifulSoup) -> str:
    for tag in soup(["script", "style", "noscript", "svg", "iframe"]):
        tag.decompose()

    main = soup.find("main") or soup.find("article") or soup.find(id="content")
    if main:
        chunks = [main.get_text(separator="\n", strip=True)]
    else:
        body = soup.find("body")
        chunks = [body.get_text(separator="\n", strip=True)] if body else []

    if not chunks or not chunks[0]:
        chunks = [soup.get_text(separator="\n", strip=True)]

    text = _normalize_whitespace(chunks[0])
    if len(text) > MAX_TEXT_CHARS:
        text = text[:MAX_TEXT_CHARS] + "\n…（以降省略）"
    return text


def scrape_url(url: str) -> ScrapeResult:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("有効な http/https URL を指定してください。")

    headers = {"User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.8"}

    with httpx.Client(
        follow_redirects=True,
        timeout=REQUEST_TIMEOUT,
        headers=headers,
    ) as client:
        response = client.get(url)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    title = (soup.title.string or "").strip() if soup.title else ""
    main_text = _extract_main_text(soup)
    form_count = len(soup.find_all("form"))
    link_count = len(soup.find_all("a", href=True))

    return ScrapeResult(
        url=str(response.url),
        title=title,
        main_text=main_text,
        form_count=form_count,
        link_count=link_count,
        char_count=len(main_text),
    )
