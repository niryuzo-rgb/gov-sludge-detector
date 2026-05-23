/** AI出力に含まれるHTML断片をプレーンテキストへ正規化する */
export function normalizeAiText(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** 簡易HTML（br/pのみ）なら安全にレンダリング、それ以外は正規化して表示 */
export function hasRenderableHtml(text: string): boolean {
  return /<(br|p|ul|ol|li|strong|em|b|i)\b/i.test(text);
}

export function sanitizeProposalHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}
