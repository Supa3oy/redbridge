"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendCard } from "@/components/trends/TrendCard";
import { TimeAgo } from "@/components/ui/time-ago";
import { TREND_INDUSTRIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TrendingUp, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import type { TrendsResult, SavedTrendRow } from "@/types/database";

interface TrendsGeneratorProps {
  initialHistory: SavedTrendRow[];
}

export function TrendsGenerator({ initialHistory }: TrendsGeneratorProps) {
  const [history, setHistory] = useState<SavedTrendRow[]>(initialHistory);

  const defaultItem = initialHistory[0];

  const [industry, setIndustry] = useState(defaultItem?.industry ?? TREND_INDUSTRIES[0]);
  const [result, setResult] = useState<TrendsResult | null>(
    defaultItem ? (defaultItem.result as unknown as TrendsResult) : null
  );
  const [activeIndustry, setActiveIndustry] = useState(defaultItem?.industry ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cached, setCached] = useState(!!defaultItem);
  const [cacheAge, setCacheAge] = useState(() =>
    defaultItem
      ? Math.floor((Date.now() - new Date(defaultItem.created_at).getTime()) / 86_400_000)
      : 0
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // When the selector changes, auto-load from history if available — no API call
  function handleIndustryChange(next: string) {
    setIndustry(next);
    const saved = history.find((h) => h.industry === next);
    if (saved) {
      setResult(saved.result as unknown as TrendsResult);
      setActiveIndustry(saved.industry);
      setCached(true);
      setCacheAge(Math.floor((Date.now() - new Date(saved.created_at).getTime()) / 86_400_000));
    } else {
      setResult(null);
      setActiveIndustry("");
      setCached(false);
      setCacheAge(0);
    }
    setError("");
  }

  async function fetchTrends(forceRefresh = false) {
    setLoading(true);
    setError("");
    try {
      const url = `/api/trends?industry=${encodeURIComponent(industry)}${forceRefresh ? "&forceRefresh=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load trends");
        return;
      }
      setResult(data.result as TrendsResult);
      setActiveIndustry(industry);
      setCached(data.cached);
      setCacheAge(data.cacheAge ?? 0);

      if (!data.cached) {
        window.dispatchEvent(new Event("toolkit-generated"));
      }

      // Optimistically update history (server has the real row; this shows immediately)
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.industry !== industry);
        return [
          {
            id: `local-${Date.now()}`,
            user_id: "",
            industry,
            result: data.result,
            created_at: new Date().toISOString(),
          },
          ...filtered,
        ];
      });
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  function loadHistoryItem(item: SavedTrendRow) {
    setResult(item.result as unknown as TrendsResult);
    setActiveIndustry(item.industry);
    setCached(true);
    setCacheAge(Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86_400_000));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">XHS Trends</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Weekly trending topics on Xiaohongshu — curated by industry.
        </p>
      </div>

      {/* Generator card */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[#ff2d55]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
            Trend Generator
          </span>
        </div>
        <p className="text-sm text-[#6b7280]">
          Discover what Chinese consumers on Xiaohongshu are searching this week.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Select value={industry} onValueChange={handleIndustryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TREND_INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => fetchTrends(false)} disabled={loading}>
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <TrendingUp size={14} />
            )}
            {loading ? "Generating..." : "Get This Week's Trends"}
          </Button>
        </div>
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      </div>

      {/* Empty state */}
      {!result && !loading && (
        <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#0d0d0d] p-12 text-center">
          <TrendingUp size={28} className="mx-auto mb-3 text-[#2a2a2a]" />
          <p className="text-sm text-[#4a4a4a]">
            Select an industry and click &ldquo;Get This Week&rsquo;s Trends&rdquo; to see what&rsquo;s trending now.
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border border-[#1a1a1a] bg-[#111]" />
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-white">{activeIndustry}</h2>
              {cached && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs text-amber-400">
                  <RefreshCw size={9} />
                  {cacheAge === 0 ? "Refreshed today" : `Refreshed ${cacheAge}d ago`}
                </span>
              )}
            </div>
            {cached && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTrends(true)}
                disabled={loading}
              >
                <RefreshCw size={12} />
                Refresh
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.trends.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#1a1a1a]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">
              Your Trend Reports
            </span>
            <div className="h-px flex-1 bg-[#1a1a1a]" />
          </div>
          <div className="space-y-2">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;
              const trends = (item.result as unknown as TrendsResult).trends ?? [];
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#111]"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-[#1a1a1a]"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp size={13} className="shrink-0 text-[#ff2d55]" />
                      <span className="text-sm font-medium text-white">{item.industry}</span>
                      <TimeAgo
                        dateStr={item.created_at}
                        className="font-mono text-xs text-[#4a4a4a]"
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={13} className="shrink-0 text-[#6b7280]" />
                    ) : (
                      <ChevronDown size={13} className="shrink-0 text-[#6b7280]" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-[#1a1a1a] p-5">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {trends.map((trend) => (
                          <TrendCard key={trend.id} trend={trend} />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => loadHistoryItem(item)}
                        className="mt-4 font-mono text-xs text-[#ff2d55] hover:underline"
                      >
                        Load into main view ↑
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
