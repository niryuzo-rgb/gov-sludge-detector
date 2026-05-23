"use client";

import { MessageCircle, Sparkles } from "lucide-react";

import {
  hasRenderableHtml,
  normalizeAiText,
  sanitizeProposalHtml,
} from "@/lib/formatText";

interface ProposalCardsProps {
  proposal: string;
}

function parseSections(text: string): { title: string; body: string }[] {
  const normalized = normalizeAiText(text);
  const lines = normalized.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return [{ title: "改善提案", body: "提案テキストがありません。" }];
  }

  const sections: { title: string; body: string }[] = [];
  let current: { title: string; body: string } | null = null;

  for (const line of lines) {
    const isHeading =
      /^#{1,3}\s/.test(line) ||
      /^[【\[].+[】\]]/.test(line) ||
      /^(ステップ|Step|■|●|\d+[\.\)、])/.test(line) ||
      (line.length < 40 && line.endsWith("："));

    if (isHeading) {
      if (current) sections.push(current);
      const title = line.replace(/^#{1,3}\s*/, "").replace(/：$/, "");
      current = { title: normalizeAiText(title), body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    } else {
      current = { title: "B群 UI 提案", body: line };
    }
  }
  if (current) sections.push(current);

  return sections.length > 0
    ? sections
    : [{ title: "B群（理想UI）", body: normalized }];
}

function ProposalBody({ body }: { body: string }) {
  const raw = body.trim();
  if (!raw) return null;

  if (hasRenderableHtml(raw)) {
    const html = sanitizeProposalHtml(raw);
    return (
      <div
        className="prose prose-sm max-w-none pl-7 text-xs leading-relaxed text-slate-600 [&_br]:block [&_li]:my-0.5 [&_p]:my-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <p className="whitespace-pre-wrap pl-7 text-xs leading-relaxed text-slate-600">
      {normalizeAiText(raw)}
    </p>
  );
}

export function ProposalCards({ proposal }: ProposalCardsProps) {
  const sections = parseSections(proposal);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-white shadow-sm">
        <Sparkles className="h-4 w-4 shrink-0" />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide opacity-90">
            After
          </p>
          <p className="text-sm font-semibold">B群 — 理想のチャット風UI</p>
        </div>
      </div>

      {sections.map((section, i) => (
        <article
          key={`${section.title}-${i}`}
          className="shrink-0 rounded-lg border border-emerald-100 bg-white p-3 shadow-sm"
        >
          <div className="mb-1.5 flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
              {i + 1}
            </span>
            <h3 className="text-sm font-semibold text-slate-900">
              {normalizeAiText(section.title)}
            </h3>
          </div>
          <ProposalBody body={section.body} />
        </article>
      ))}

      <div className="shrink-0 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 p-3">
        <div className="flex gap-2">
          <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <div className="space-y-1.5 text-xs">
            <div className="rounded-xl rounded-tl-sm bg-white px-2.5 py-1.5 shadow-sm">
              どの手続きをしたいですか？
            </div>
            <div className="ml-4 rounded-xl rounded-tr-sm bg-emerald-600 px-2.5 py-1.5 text-white shadow-sm">
              住民票の写しが欲しいです
            </div>
            <div className="rounded-xl rounded-tl-sm bg-white px-2.5 py-1.5 shadow-sm">
              コンビニ交付なら最短5分。必要書類はマイナンバーカードのみです。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
