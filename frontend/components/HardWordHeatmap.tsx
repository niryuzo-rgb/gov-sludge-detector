"use client";

import type { HardWord } from "@/lib/types";

interface HardWordHeatmapProps {
  html: string;
  hardWords: HardWord[];
}

export function HardWordHeatmap({ html, hardWords }: HardWordHeatmapProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div
        className="prose prose-sm max-w-none flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 [&_.bg-red-200]:cursor-help [&_.bg-red-200]:rounded [&_.bg-red-200]:px-0.5 [&_.bg-red-200]:font-semibold [&_.bg-red-200]:text-red-900"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {hardWords.length > 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
            やさしい日本語（一覧）
          </p>
          <ul className="flex flex-wrap gap-2">
            {hardWords.map((w) => (
              <li
                key={w.term}
                className="group relative rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                <span className="font-medium text-red-800">{w.term}</span>
                <span className="mx-1 text-slate-400">→</span>
                <span className="text-slate-700">{w.plain_japanese}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
