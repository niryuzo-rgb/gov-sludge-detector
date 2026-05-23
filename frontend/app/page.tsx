"use client";

import { FormEvent, ReactNode, useState } from "react";
import {
  AlertCircle,
  Clock,
  FileText,
  Link2,
  Loader2,
  Search,
  ShieldAlert,
} from "lucide-react";

import { AnalysisLoadingPanel } from "@/components/AnalysisLoadingPanel";
import { HardWordHeatmap } from "@/components/HardWordHeatmap";
import { ProposalCards } from "@/components/ProposalCards";
import { SludgeGauge } from "@/components/SludgeGauge";
import { analyzeUrl } from "@/lib/api";
import {
  normalizeUrlForSubmit,
  normalizeUrlOnInput,
} from "@/lib/urlInput";
import type { AnalyzeResponse, AnalyzeTarget } from "@/lib/types";
import { TARGET_OPTIONS } from "@/lib/types";

const SAMPLE_URL = "https://www.city.shinagawa.tokyo.jp/";

function PanelCard({
  label,
  labelClass,
  title,
  subtitle,
  children,
  className = "",
}: {
  label: string;
  labelClass: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-white shadow-sm ${className}`}
    >
      <div className="shrink-0 border-b border-slate-100 px-3 py-2">
        <p className={`text-[10px] font-semibold uppercase tracking-wide ${labelClass}`}>
          {label}
        </p>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{subtitle}</p>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
    </section>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [target, setTarget] = useState<AnalyzeTarget>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  async function runAnalyze(
    targetUrl: string,
    audience: AnalyzeTarget = target,
  ) {
    if (loading) return;

    const normalized = normalizeUrlForSubmit(targetUrl);
    if (!normalized) {
      setError("URLを入力してください");
      setResult(null);
      return;
    }

    setUrl(normalized);
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeUrl(normalized, audience);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  function handleUrlChange(next: string) {
    setError((prev) =>
      prev === "URLを入力してください" ? null : prev,
    );
    setUrl((prev) => normalizeUrlOnInput(prev, next));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await runAnalyze(url);
  }

  function handleSampleDemo() {
    void runAnalyze(SAMPLE_URL);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <header className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-3 py-2 sm:px-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                Gov UX Analyzer
              </h1>
              <p className="text-[11px] text-slate-500">
                市役所サイトの「行政の泥（Sludge）」を自動診断
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onBlur={() => {
                    if (url.trim()) {
                      setUrl(normalizeUrlForSubmit(url));
                    }
                  }}
                  placeholder="www.city.example.lg.jp"
                  aria-label="市役所サイトのURL"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div className="w-full shrink-0 lg:w-52">
                <label
                  htmlFor="target-audience"
                  className="mb-1 block text-[10px] font-medium text-slate-500"
                >
                  想定されるユーザー層
                </label>
                <select
                  id="target-audience"
                  value={target}
                  onChange={(e) => setTarget(e.target.value as AnalyzeTarget)}
                  disabled={loading}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 disabled:opacity-60"
                >
                  {TARGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 lg:mb-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    診断中…
                  </>
                ) : (
                  "診断開始"
                )}
              </button>
            </div>
          </form>

          <div className="flex justify-start sm:pl-0.5">
            <button
              type="button"
              onClick={handleSampleDemo}
              disabled={loading}
              className="text-[11px] font-normal text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              まずはデモを体験：
              <span className="font-medium text-slate-600 hover:text-blue-600">
                品川区役所（サンプル）の解析結果
              </span>
            </button>
          </div>

          {result && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600">
              <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                {TARGET_OPTIONS.find((o) => o.value === target)?.label}
              </span>
              <span className="max-w-full truncate font-medium text-slate-800">
                {result.title || result.url}
              </span>
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {result.char_count.toLocaleString()} 文字
              </span>
              <span className="inline-flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                リンク {result.link_count}
              </span>
              <span>フォーム {result.form_count}</span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden px-3 py-2 sm:px-4">
        {error && (
          <div
            className={`mb-2 flex shrink-0 items-start gap-2 rounded-lg border px-3 py-2 ${
              error === "URLを入力してください"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs">{error}</p>
          </div>
        )}

        {loading && <AnalysisLoadingPanel active={loading} />}

        {!loading && result && (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-12">
            <PanelCard
              label="Dashboard"
              labelClass="text-slate-500"
              title="ダッシュボード"
              className="border-slate-200 lg:col-span-3"
            >
              <div className="flex flex-col items-center gap-3">
                <SludgeGauge score={result.sludge_score} />
                <div className="w-full rounded-lg bg-slate-900 p-3 text-white">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="h-4 w-4" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Time Tax
                    </span>
                  </div>
                  <p className="mt-1 text-3xl font-bold tabular-nums">
                    {result.time_tax_minutes}
                    <span className="ml-1 text-base font-medium text-slate-400">分</span>
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-400">
                    手続き完了までに市民から奪われる予想時間
                  </p>
                </div>
              </div>
            </PanelCard>

            <PanelCard
              label="Before"
              labelClass="text-red-600"
              title="お役所言葉ヒートマップ"
              subtitle="赤い用語にカーソルを合わせると、やさしい日本語が表示されます"
              className="border-red-100 lg:col-span-5"
            >
              <HardWordHeatmap
                html={result.raw_text_highlighted}
                hardWords={result.hard_words}
              />
            </PanelCard>

            <PanelCard
              label="After"
              labelClass="text-emerald-600"
              title="B群 UI提案"
              subtitle="理想のチャット風・ステップ型UI"
              className="border-emerald-100 lg:col-span-4"
            >
              <ProposalCards proposal={result.b_group_proposal} />
            </PanelCard>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              市役所の手続きページURLを入力して診断を開始してください
            </p>
            <p className="mt-1 text-xs text-slate-500">
              例: 住民票・転入届・ごみ出しなどの案内ページ
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
