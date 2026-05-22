"use client";

import { FormEvent, useState } from "react";
import {
  AlertCircle,
  Clock,
  FileText,
  Link2,
  Loader2,
  Search,
  ShieldAlert,
} from "lucide-react";

import { HardWordHeatmap } from "@/components/HardWordHeatmap";
import { ProposalCards } from "@/components/ProposalCards";
import { SludgeGauge } from "@/components/SludgeGauge";
import { analyzeUrl } from "@/lib/api";
import type { AnalyzeResponse } from "@/lib/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeUrl(url.trim());
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Gov UX Analyzer
              </h1>
              <p className="text-sm text-slate-500">
                市役所サイトの「行政の泥（Sludge）」を自動診断
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.city.example.lg.jp/..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  診断中…
                </>
              ) : (
                "診断開始"
              )}
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-12">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800">ページを解析しています</p>
              <p className="mt-1 text-sm text-slate-500">
                スクレイピング → AI診断 → 改善案生成
              </p>
            </div>
          </div>
        )}

        {!loading && result && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                診断対象
              </p>
              <p className="mt-1 font-semibold text-slate-900">{result.title || result.url}</p>
              <p className="mt-1 truncate text-sm text-blue-600">{result.url}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {result.char_count.toLocaleString()} 文字
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Link2 className="h-4 w-4" />
                  リンク {result.link_count}
                </span>
                <span>フォーム {result.form_count}</span>
              </div>
            </div>

            <div className="grid min-h-[560px] grid-cols-1 gap-4 xl:grid-cols-12">
              <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  ダッシュボード
                </h2>
                <SludgeGauge score={result.sludge_score} />

                <div className="rounded-2xl bg-slate-900 p-5 text-white">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-5 w-5" />
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Time Tax
                    </span>
                  </div>
                  <p className="mt-2 text-4xl font-bold tabular-nums">
                    {result.time_tax_minutes}
                    <span className="ml-1 text-lg font-medium text-slate-400">分</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    手続き完了までに市民から奪われる予想時間
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-red-100 bg-gradient-to-b from-red-50/50 to-white p-6 shadow-sm xl:col-span-5">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                    Before
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">
                    お役所言葉ヒートマップ
                  </h2>
                  <p className="text-sm text-slate-500">
                    赤くハイライトされた用語にカーソルを合わせると、やさしい日本語が表示されます
                  </p>
                </div>
                <HardWordHeatmap
                  html={result.raw_text_highlighted}
                  hardWords={result.hard_words}
                />
              </section>

              <section className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white p-6 shadow-sm xl:col-span-4">
                <ProposalCards proposal={result.b_group_proposal} />
              </section>
            </div>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
            <p className="text-lg font-medium text-slate-700">
              市役所の手続きページURLを入力して診断を開始してください
            </p>
            <p className="mt-2 text-sm text-slate-500">
              例: 住民票・転入届・ごみ出しなどの案内ページ
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
