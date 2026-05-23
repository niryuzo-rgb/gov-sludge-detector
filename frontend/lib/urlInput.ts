const SCHEME_RE = /^https?:\/\//i;

/** ユーザーが http / https を入力途中かどうか */
export function isTypingScheme(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  if (SCHEME_RE.test(v)) return true;
  const partial = ["h", "ht", "htt", "http", "http:", "http:/", "https", "https:", "https:/"];
  return partial.includes(v);
}

/** 入力中: 先頭にスキームがなければ https:// を補完（http 入力途中は妨げない） */
export function normalizeUrlOnInput(previous: string, next: string): string {
  if (next === "") return "";

  const trimmed = next.trim();
  if (!trimmed) return next;

  if (SCHEME_RE.test(trimmed) || isTypingScheme(trimmed)) {
    return next;
  }

  const wasEmpty = !previous.trim();
  const looksLikeDomain =
    wasEmpty || /^[\w.-]/.test(trimmed) || trimmed.startsWith("www.");

  if (looksLikeDomain) {
    const leading = next.match(/^\s*/)?.[0] ?? "";
    return `${leading}https://${trimmed}`;
  }

  return next;
}

/** 診断開始時: 前後空白を除去し、必要なら https:// を付与 */
export function normalizeUrlForSubmit(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (SCHEME_RE.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
