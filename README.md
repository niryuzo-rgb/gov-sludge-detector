# Gov UX Analyzer

市役所ウェブサイトの「行政の泥（Sludge）」を自動診断する Web プロトタイプです。

## 構成

- `backend/` — FastAPI + BeautifulSoup4 + OpenAI
- `frontend/` — Next.js (App Router) + Tailwind CSS + Lucide React

## セットアップ

### 1. バックエンド

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# .env に OPENAI_API_KEY を設定
uvicorn main:app --reload --port 8000
```

### 2. フロントエンド

```powershell
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開き、市役所の手続きページ URL を入力して「診断開始」をクリックします。

## API

`POST /api/analyze`

```json
{ "url": "https://example.city.lg.jp/..." }
```

レスポンス例:

- `sludge_score` — 0〜100（高いほど泥が多い）
- `time_tax_minutes` — 予想所要時間（分）
- `hard_words` — 難解語とやさしい日本語
- `raw_text_highlighted` — ハイライト付き HTML 抜粋
- `b_group_proposal` — B群（理想 UI）の改善案

## 注意

- OpenAI API キーが必要です（`gpt-4o-mini` 推奨）
- 一部の市役所サイトはスクレイピングをブロックする場合があります
