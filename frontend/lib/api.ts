import { API_URL } from "./config";
import type { AnalyzeResponse, AnalyzeTarget } from "./types";

export async function analyzeUrl(
  url: string,
  target: AnalyzeTarget = "all",
): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, target }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : "診断に失敗しました。URLとAPIキーを確認してください。";
    throw new Error(detail);
  }

  return data as AnalyzeResponse;
}
