"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const ANALYSIS_STEPS = [
  "🔍 対象サイトから行政文書（テキスト）を抽出中...",
  "⚙️ お役所言葉・専門用語の特定アルゴリズムを実行中...",
  "🧠 OpenAI LLMモデルによる認知的負荷（Administrative Burden）の計算中...",
  "⏳ リンク構造の複雑さから、市民から奪われる時間（Time Tax）を算出中...",
  "📝 摩擦をゼロにするための「B群（理想のチャットUI）」のプロトタイプを自動生成中...",
] as const;

const STEP_INTERVAL_MS = 2800;
const FADE_MS = 400;

interface AnalysisLoadingPanelProps {
  active: boolean;
}

export function AnalysisLoadingPanel({ active }: AnalysisLoadingPanelProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      setFadeIn(true);
      return;
    }

    const interval = window.setInterval(() => {
      setFadeIn(false);
      window.setTimeout(() => {
        setStepIndex((i) => (i + 1) % ANALYSIS_STEPS.length);
        setFadeIn(true);
      }, FADE_MS);
    }, STEP_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-white via-slate-50/90 to-blue-50/40 px-6 py-10 shadow-inner">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
      >
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(148 163 184 / 0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(148 163 184 / 0.12) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600/90">
            Structural Dynamic Translation Model
          </p>
          <p className="mt-1 text-xs text-slate-500">
            構造的動的翻訳モデルによる多層解析パイプライン
          </p>
        </div>

        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/20" />
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-dashed border-blue-300/60" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-md ring-1 ring-blue-100">
            <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="flex gap-1">
            {ANALYSIS_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= stepIndex
                    ? "bg-blue-500 shadow-sm shadow-blue-200"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div className="min-h-[4.5rem] text-center">
            <p
              className={`text-sm font-medium leading-relaxed text-slate-800 transition-all duration-400 ease-out ${
                fadeIn
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDuration: `${FADE_MS}ms` }}
            >
              {ANALYSIS_STEPS[stepIndex]}
            </p>
            <p className="mt-2 text-[11px] tabular-nums text-slate-400">
              ステップ {stepIndex + 1} / {ANALYSIS_STEPS.length}
            </p>
          </div>
        </div>

        <p className="max-w-md text-center text-[10px] leading-relaxed text-slate-400">
          行政UXの認知科学・行動経済学に基づく評価指標を、リアルタイム推論エンジンで合成しています
        </p>
      </div>
    </div>
  );
}
