import Link from "next/link";
import { ArrowUpRight, Flame, Sparkles } from "lucide-react";
import type { TrendItem } from "@/types/database";

const DIRECTION_CONFIG = {
  hot: { label: "Hot", icon: Flame, color: "text-red-400 bg-red-400/10 border-red-400/20" },
  rising: { label: "Rising", icon: ArrowUpRight, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  new: { label: "New", icon: Sparkles, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
};

interface TrendCardProps {
  trend: TrendItem;
}

export function TrendCard({ trend }: TrendCardProps) {
  const config = DIRECTION_CONFIG[trend.direction] ?? DIRECTION_CONFIG.rising;
  const Icon = config.icon;

  const generateHref = `/generate?industry=${encodeURIComponent(trend.industry)}&description=${encodeURIComponent(
    `Trending on Xiaohongshu: ${trend.chinese} (${trend.english})\n\n${trend.description}`
  )}`;

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-2xl font-bold leading-none">{trend.chinese}</p>
          <p className="font-mono text-xs text-[#6b7280]">{trend.pinyin}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-xs shrink-0 ${config.color}`}>
          <Icon size={10} />
          {config.label}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{trend.english}</p>
        <p className="text-xs text-[#6b7280] leading-relaxed">{trend.description}</p>
      </div>

      <Link
        href={generateHref}
        className="mt-auto inline-flex items-center gap-1.5 rounded-md border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 font-mono text-xs text-[#6b7280] transition-colors hover:border-[#ff2d55] hover:text-[#ff2d55]"
      >
        Use this trend
        <ArrowUpRight size={11} />
      </Link>
    </div>
  );
}
