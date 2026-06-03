import { Badge } from "@/components/ui/badge";
import type { Keyword } from "@/types/database";
import { cn } from "@/lib/utils";

interface KeywordsPanelProps {
  keywords: Keyword[];
}

function HeatBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-red-500" : score >= 50 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#1a1a1a]">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs text-[#6b7280]">{score}</span>
    </div>
  );
}

export function KeywordsPanel({ keywords }: KeywordsPanelProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-[#6b7280]">
        Keywords — {keywords.length} with heat scores
      </h2>
      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th className="px-4 py-3 text-left font-mono text-xs text-[#4a4a4a] uppercase tracking-widest">Chinese</th>
              <th className="px-4 py-3 text-left font-mono text-xs text-[#4a4a4a] uppercase tracking-widest">Pinyin</th>
              <th className="px-4 py-3 text-left font-mono text-xs text-[#4a4a4a] uppercase tracking-widest">English</th>
              <th className="px-4 py-3 text-left font-mono text-xs text-[#4a4a4a] uppercase tracking-widest">Heat</th>
              <th className="px-4 py-3 text-left font-mono text-xs text-[#4a4a4a] uppercase tracking-widest">Category</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((kw, i) => (
              <tr
                key={kw.id}
                className={cn(
                  "border-b border-[#1a1a1a] last:border-0",
                  i % 2 === 0 ? "bg-transparent" : "bg-[#0d0d0d]"
                )}
              >
                <td className="px-4 py-3 text-base">{kw.chinese}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">{kw.pinyin}</td>
                <td className="px-4 py-3">
                  <p className="text-sm text-white">{kw.english}</p>
                  {kw.seasonalRelevance && (
                    <p className="mt-0.5 text-xs text-[#4a4a4a] italic leading-snug">
                      {kw.seasonalRelevance}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3"><HeatBar score={kw.heatScore} /></td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs">{kw.category}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
