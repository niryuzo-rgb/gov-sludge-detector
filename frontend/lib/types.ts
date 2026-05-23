export type AnalyzeTarget = "senior" | "foreigner" | "native" | "all";

export interface HardWord {
  term: string;
  plain_japanese: string;
}

export interface AnalyzeResponse {
  url: string;
  title: string;
  form_count: number;
  link_count: number;
  char_count: number;
  sludge_score: number;
  time_tax_minutes: number;
  hard_words: HardWord[];
  raw_text_highlighted: string;
  b_group_proposal: string;
}

export const TARGET_OPTIONS: { value: AnalyzeTarget; label: string }[] = [
  { value: "senior", label: "高齢者・シニア層" },
  { value: "foreigner", label: "外国人・非ネイティブ" },
  { value: "native", label: "デジタルネイティブ（一般）" },
  { value: "all", label: "すべての市民（平均）" },
];
