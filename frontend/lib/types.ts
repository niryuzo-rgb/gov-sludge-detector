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
