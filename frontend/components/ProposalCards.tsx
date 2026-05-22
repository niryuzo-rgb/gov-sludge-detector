"use client";

import { MessageCircle, Sparkles } from "lucide-react";

interface ProposalCardsProps {
  proposal: string;
}

function parseSections(text: string): { title: string; body: string }[] {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
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
      current = { title, body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    } else {
      current = { title: "B群 UI 提案", body: line };
    }
  }
  if (current) sections.push(current);

  return sections.length > 0
    ? sections
    : [{ title: "B群（理想UI）", body: text }];
}

export function ProposalCards({ proposal }: ProposalCardsProps) {
  const sections = parseSections(proposal);

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto">
      <div className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-md">
        <Sparkles className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-xs font-medium opacity-90">After</p>
          <p className="font-semibold">B群 — 理想のチャット風UI</p>
        </div>
      </div>

      {sections.map((section, i) => (
        <article
          key={`${section.title}-${i}`}
          className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-2 flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
              {i + 1}
            </span>
            <h3 className="font-semibold text-slate-900">{section.title}</h3>
          </div>
          <p className="whitespace-pre-wrap pl-8 text-sm leading-relaxed text-slate-600">
            {section.body}
          </p>
        </article>
      ))}

      <div className="mt-auto rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-600" />
          <div className="space-y-2 text-sm">
            <div className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
              どの手続きをしたいですか？
            </div>
            <div className="ml-6 rounded-2xl rounded-tr-sm bg-emerald-600 px-3 py-2 text-white shadow-sm">
              住民票の写しが欲しいです
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
              コンビニ交付なら最短5分。必要書類はマイナンバーカードのみです。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
