"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompetitorResultPanel } from "@/components/competitor/CompetitorResult";
import { TimeAgo } from "@/components/ui/time-ago";
import { INDUSTRIES } from "@/lib/constants";
import { Search, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import type { CompetitorResult, SavedCompetitorRow } from "@/types/database";

const EXAMPLES = [
  { name: "Aesop", industry: "Skincare & Beauty", description: "Minimalist luxury skincare" },
  { name: "Frank Body", industry: "Body Care & Wellness", description: "Playful, irreverent body care" },
  { name: "Lululemon", industry: "Fitness & Sport", description: "Premium activewear & lifestyle" },
];

interface CompetitorPageClientProps {
  initialAnalyses: SavedCompetitorRow[];
}

export function CompetitorPageClient({ initialAnalyses }: CompetitorPageClientProps) {
  // Seed from most recent saved analysis so results survive navigation
  const mostRecent = initialAnalyses[0] ?? null;

  const [analyses, setAnalyses] = useState<SavedCompetitorRow[]>(initialAnalyses);
  const [competitorName, setCompetitorName] = useState(mostRecent?.competitor_name ?? "");
  const [industry, setIndustry] = useState(mostRecent?.industry ?? "");
  const [result, setResult] = useState<CompetitorResult | null>(
    mostRecent ? (mostRecent.result as unknown as CompetitorResult) : null
  );
  const [activeCompetitor, setActiveCompetitor] = useState(mostRecent?.competitor_name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cached, setCached] = useState(!!mostRecent);
  const [cacheAge, setCacheAge] = useState(() =>
    mostRecent
      ? Math.floor((Date.now() - new Date(mostRecent.created_at).getTime()) / 86_400_000)
      : 0
  );

  async function analyse(forceRefresh = false) {
    if (!competitorName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorName: competitorName.trim(),
          industry: industry || undefined,
          forceRefresh,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResult(data.result as CompetitorResult);
      setActiveCompetitor(competitorName.trim());
      setCached(data.cached ?? false);
      setCacheAge(data.cacheAge ?? 0);

      if (!data.cached) {
        window.dispatchEvent(new Event("toolkit-generated"));
        // Optimistic history update
        setAnalyses((prev) => {
          const filtered = prev.filter(
            (a) => a.competitor_name.toLowerCase() !== competitorName.trim().toLowerCase()
          );
          return [
            {
              id: `local-${Date.now()}`,
              user_id: "",
              competitor_name: competitorName.trim(),
              industry: industry || null,
              result: data.result,
              created_at: new Date().toISOString(),
            },
            ...filtered,
          ];
        });
      }

      setTimeout(() => {
        document.getElementById("competitor-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  function loadAnalysis(item: SavedCompetitorRow) {
    setCompetitorName(item.competitor_name);
    setIndustry(item.industry ?? "");
    setResult(item.result as unknown as CompetitorResult);
    setActiveCompetitor(item.competitor_name);
    setCached(true);
    setCacheAge(Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86_400_000));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Competitor Analysis</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Analyse any brand&apos;s XHS strategy — keywords, tone, angles, and the gaps you can own.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Form */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                analyse(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="competitorName">Competitor Brand Name</Label>
                <Input
                  id="competitorName"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  placeholder="e.g. Aesop, Frank Body, Lululemon"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitorIndustry">
                  Industry{" "}
                  <span className="font-normal text-[#4a4a4a]">(optional)</span>
                </Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="competitorIndustry">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.filter((i) => i !== "Other").map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="font-mono text-xs text-red-400">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                {loading ? "Analysing..." : "Analyse Competitor"}
              </Button>
            </form>
          </div>

          {/* Example cards (shown only when no result) */}
          {!result && (
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">
                Try one of these
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.name}
                    type="button"
                    onClick={() => {
                      setCompetitorName(ex.name);
                      setIndustry(ex.industry);
                    }}
                    className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 text-left transition-colors hover:border-[#ff2d55]/40 hover:bg-[#ff2d55]/5 group"
                  >
                    <p className="font-semibold text-white group-hover:text-[#ff2d55] transition-colors">
                      {ex.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#4a4a4a]">{ex.description}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[#ff2d55] opacity-0 group-hover:opacity-100 transition-opacity">
                      Try this →
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div id="competitor-result" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-white">{activeCompetitor}</h2>
                  {cached && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs text-amber-400">
                      <RefreshCw size={9} />
                      {cacheAge === 0 ? "Analysed today" : `Analysed ${cacheAge}d ago`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {cached && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => analyse(true)}
                      disabled={loading}
                    >
                      <RotateCcw size={12} />
                      Re-analyse
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setResult(null);
                      setError("");
                    }}
                  >
                    New search
                  </Button>
                </div>
              </div>
              <CompetitorResultPanel result={result} competitorName={activeCompetitor} />
            </div>
          )}
        </div>

        {/* Past analyses sidebar */}
        <div className="space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">
            Past Analyses
          </h3>
          {analyses.length === 0 ? (
            <p className="text-sm text-[#4a4a4a]">No analyses yet.</p>
          ) : (
            <div className="space-y-2">
              {analyses.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => loadAnalysis(item)}
                  className="w-full rounded-xl border border-[#1a1a1a] bg-[#111] p-4 text-left transition-colors hover:border-[#2a2a2a] hover:bg-[#161616] group"
                >
                  <p className="text-sm font-medium text-white group-hover:text-[#ff2d55] transition-colors">
                    {item.competitor_name}
                  </p>
                  {item.industry && (
                    <p className="mt-0.5 text-xs text-[#4a4a4a]">{item.industry}</p>
                  )}
                  <TimeAgo
                    dateStr={item.created_at}
                    className="mt-1 block font-mono text-[10px] text-[#4a4a4a]"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
