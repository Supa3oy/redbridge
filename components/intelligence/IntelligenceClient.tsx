"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { INDUSTRIES } from "@/lib/constants";
import {
  Sparkles, Loader2, RefreshCw, User, TrendingUp,
  ArrowRight, ChevronRight, Lightbulb, Zap,
} from "lucide-react";
import type { IntelligenceReport } from "@/types/database";

interface SavedReport {
  id: string;
  brand_name: string;
  industry: string;
  result: IntelligenceReport;
  created_at: string;
}

interface IntelligenceClientProps {
  profile: {
    brandName: string;
    industry: string;
    websiteUrl: string;
    targetAudience: string[];
    productDescription: string;
  };
  initialReport: SavedReport | null;
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 36;
  const progress = (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#1a1a1a" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="font-mono text-[9px] text-[#4a4a4a]">/100</span>
        </div>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">{label}</span>
    </div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-[#1a1a1a]" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">{label}</span>
      <div className="h-px flex-1 bg-[#1a1a1a]" />
    </div>
  );
}

export function IntelligenceClient({ profile, initialReport }: IntelligenceClientProps) {
  const [brandName, setBrandName] = useState(profile.brandName);
  const [industry, setIndustry] = useState(profile.industry);
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl);
  const [productDescription, setProductDescription] = useState(profile.productDescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<IntelligenceReport | null>(initialReport?.result ?? null);
  const [reportMeta, setReportMeta] = useState<{ brandName: string; createdAt: string } | null>(
    initialReport ? { brandName: initialReport.brand_name, createdAt: initialReport.created_at } : null
  );

  async function generate(forceNew = false) {
    if (!brandName.trim() || !industry || !productDescription.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          industry,
          websiteUrl: websiteUrl || undefined,
          productDescription: productDescription.trim(),
          forceNew,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Generation failed"); return; }
      setReport(data.result as IntelligenceReport);
      setReportMeta({ brandName: brandName.trim(), createdAt: new Date().toISOString() });
      setTimeout(() => document.getElementById("report-output")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold md:text-2xl">Intelligence Report</h1>
            <span className="rounded border border-[#ff2d55]/40 bg-[#ff2d55]/10 px-1.5 py-px font-mono text-[9px] font-bold tracking-wider text-[#ff2d55]">2.0</span>
          </div>
          <p className="text-sm text-[#6b7280]">
            Understand how Chinese consumers perceive your brand — and where the cultural gap is.
          </p>
        </div>
        <Link href="/brand-profile">
          <Button variant="outline" size="sm">
            <User size={13} /> Brand Profile
          </Button>
        </Link>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-[#ff2d55]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">Your Brand</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brandName">Brand Name</Label>
            <Input id="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Bondi Glow" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger id="industry"><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website URL <span className="font-normal text-[#4a4a4a]">(optional)</span></Label>
          <Input id="website" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourbrand.com.au" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">About Your Brand & Product <span className="text-[#ff2d55]">*</span></Label>
          <Textarea
            id="desc" rows={3} value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="Describe your brand, product, what makes it special, and who it's for…"
          />
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <Button
            onClick={() => generate(false)}
            disabled={loading || !brandName.trim() || !industry || !productDescription.trim()}
            size="lg"
            className="flex-1 sm:flex-none"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? "Generating Report…" : report ? "Regenerate Report" : "Generate Intelligence Report"}
          </Button>
          {report && (
            <p className="font-mono text-xs text-[#3a3a3a]">
              Last generated {reportMeta ? new Date(reportMeta.createdAt).toLocaleDateString("en-AU") : ""}
            </p>
          )}
        </div>
        <p className="font-mono text-xs text-[#3a3a3a]">Counts as 1 generation.</p>
      </div>

      {/* Report output */}
      {report && (
        <div id="report-output" className="space-y-6">
          {/* Score row */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5 sm:p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <ScoreRing score={report.brandPerceptionScore} label="Brand Perception" />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a] mb-1">
                  {reportMeta?.brandName ?? brandName} — {industry}
                </p>
                <p className="text-lg font-bold text-white leading-snug">
                  {report.culturalTranslationGap.headline}
                </p>
                <p className="mt-2 text-sm text-[#6b7280] leading-relaxed">
                  {report.culturalTranslationGap.description}
                </p>
              </div>
              <ScoreRing score={report.marketOpportunity.score} label="Market Opportunity" />
            </div>
          </div>

          {/* Cultural Translation Gap */}
          <div>
            <SectionHeading label="Cultural Translation Gap" />
            <div className="space-y-3">
              {report.culturalTranslationGap.gaps.map((gap, i) => (
                <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#111] overflow-hidden">
                  <div className="border-b border-[#1a1a1a] px-4 py-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff2d55]">{gap.aspect}</span>
                  </div>
                  <div className="grid grid-cols-1 divide-y divide-[#1a1a1a] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="p-4">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-[#4a4a4a] mb-1.5">Australian Brand Says</p>
                      <p className="text-sm text-[#c0c0c0] leading-snug">{gap.australian}</p>
                    </div>
                    <div className="relative p-4">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-[#4a4a4a] mb-1.5">Chinese Consumer Reads</p>
                      <p className="text-sm text-[#c0c0c0] leading-snug">{gap.chinese}</p>
                      <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#2a2a2a] hidden sm:block" />
                    </div>
                    <div className="bg-[#ff2d55]/5 border-l-2 border-[#ff2d55] sm:border-l-0 sm:border-t-0 p-4">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-[#ff2d55] mb-1.5">Recommendation</p>
                      <p className="text-sm text-white leading-snug">{gap.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Opportunity */}
          <div>
            <SectionHeading label="Market Opportunity" />
            <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5 sm:p-6 space-y-4">
              <div>
                <p className="font-semibold text-white">{report.marketOpportunity.headline}</p>
                <p className="mt-1 text-sm text-[#6b7280] leading-relaxed">{report.marketOpportunity.description}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a] mb-2">Key Segments</p>
                <div className="flex flex-wrap gap-2">
                  {report.marketOpportunity.segments.map((seg, i) => (
                    <span key={i} className="rounded-full border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-1 text-xs text-[#c0c0c0]">
                      {seg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* XHS Positioning */}
          <div>
            <SectionHeading label="XHS Positioning Strategy" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2 rounded-xl border border-[#1a1a1a] bg-[#111] p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a] mb-2">Recommended Narrative</p>
                <p className="text-sm leading-relaxed text-white">{report.xhsPositioning.recommendedNarrative}</p>
              </div>
              <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a] mb-1.5">Tone of Voice</p>
                <p className="text-sm text-[#c0c0c0]">{report.xhsPositioning.toneOfVoice}</p>
              </div>
              <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a] mb-1.5">Visual Style</p>
                <p className="text-sm text-[#c0c0c0]">{report.xhsPositioning.visualStyle}</p>
              </div>
              <div className="md:col-span-2 rounded-xl border border-[#1a1a1a] bg-[#111] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a] mb-2">Content Pillars</p>
                <div className="flex flex-wrap gap-2">
                  {report.xhsPositioning.contentPillars.map((pillar, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-lg border border-[#ff2d55]/20 bg-[#ff2d55]/5 px-3 py-1.5">
                      <div className="h-1 w-1 rounded-full bg-[#ff2d55]" />
                      <span className="text-xs text-white">{pillar}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Consumer Insights */}
          <div>
            <SectionHeading label="Consumer Insights" />
            <div className="space-y-3">
              {report.consumerInsights.map((item, i) => (
                <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 sm:p-5 flex items-start gap-4">
                  <div className="shrink-0 rounded-lg bg-[#ff2d55]/10 p-2">
                    <Lightbulb size={13} className="text-[#ff2d55]" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-snug">{item.insight}</p>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{item.implication}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Wins */}
          <div>
            <SectionHeading label="Quick Wins" />
            <div className="rounded-xl border border-[#1a1a1a] bg-[#111] divide-y divide-[#1a1a1a]">
              {report.quickWins.map((win, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4">
                  <div className="shrink-0 mt-0.5 rounded bg-emerald-500/10 p-1">
                    <Zap size={11} className="text-emerald-400" />
                  </div>
                  <p className="text-sm text-[#c0c0c0] leading-snug">{win}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA to content tools */}
          <div className="rounded-xl border border-[#ff2d55]/20 bg-[#ff2d55]/5 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white">Ready to act on these insights?</p>
              <p className="mt-0.5 text-sm text-[#6b7280]">Generate XHS content calibrated to your positioning strategy.</p>
            </div>
            <Link href="/generate">
              <Button className="shrink-0">
                Go to Content Tools <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
