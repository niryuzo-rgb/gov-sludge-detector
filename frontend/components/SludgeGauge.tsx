"use client";

interface SludgeGaugeProps {
  score: number;
}

function scoreLabel(score: number): string {
  if (score >= 75) return "深刻な泥";
  if (score >= 50) return "要注意";
  if (score >= 25) return "やや重い";
  return "比較的軽い";
}

function scoreColor(score: number): string {
  if (score >= 75) return "#dc2626";
  if (score >= 50) return "#ea580c";
  if (score >= 25) return "#ca8a04";
  return "#16a34a";
}

export function SludgeGauge({ score }: SludgeGaugeProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums text-slate-900">
            {score}
          </span>
          <span className="text-[10px] font-medium text-slate-500">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-700">Sludgeスコア</p>
        <p className="text-[10px] text-slate-500">{scoreLabel(score)}</p>
      </div>
    </div>
  );
}
