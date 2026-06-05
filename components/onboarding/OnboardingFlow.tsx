"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { INDUSTRIES } from "@/lib/constants";
import { Sparkles, ArrowLeft, Loader2, ArrowRight, ChevronRight } from "lucide-react";
import type { IntelligenceReport } from "@/types/database";

const AUDIENCES = [
  { value: "女性 25-35", sublabel: "Women 25–35" },
  { value: "男性 18-30", sublabel: "Men 18–30" },
  { value: "妈妈群体", sublabel: "Mums" },
  { value: "留学生", sublabel: "Students" },
  { value: "新移民", sublabel: "New migrants" },
  { value: "精致白领", sublabel: "Young professionals" },
];

const ANALYSIS_PHASES = [
  "Analysing your brand's cultural positioning…",
  "Identifying the cultural translation gap…",
  "Scoring market opportunity…",
  "Building your XHS strategy…",
];

interface OnboardingFlowProps {
  userId: string;
}

export function OnboardingFlow({ userId: _userId }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(true);

  const [brandName, setBrandName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [audiences, setAudiences] = useState<string[]>([]);
  const [sellingPoints, setSellingPoints] = useState("");

  const [generating, setGenerating] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [error, setError] = useState("");
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (phaseRef.current) clearInterval(phaseRef.current); }, []);

  function animateTo(next: number) {
    setVisible(false);
    setTimeout(() => { setStep(next); setError(""); setVisible(true); }, 220);
  }

  function toggleAudience(value: string) {
    setAudiences((prev) => prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]);
  }

  async function skipOnboarding() {
    try {
      await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skip: true }),
      });
    } catch { /* continue */ }
    router.push("/dashboard");
  }

  async function handleGenerate() {
    if (generating) return;
    setGenerating(true);
    setError("");
    setPhaseIdx(0);

    phaseRef.current = setInterval(() => {
      setPhaseIdx((p) => (p + 1) % ANALYSIS_PHASES.length);
    }, 3500);

    try {
      // 1. Save brand profile + mark onboarding complete
      await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName, websiteUrl: websiteUrl || undefined, industry,
          targetAudience: audiences, sellingPoints,
        }),
      });

      // 2. Generate Intelligence Report
      const res = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName, industry,
          websiteUrl: websiteUrl || undefined,
          targetAudience: audiences,
          productDescription: sellingPoints,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Generation failed — please try again."); return; }

      setReport(data.result as IntelligenceReport);
      setReportId(data.reportId ?? null);
    } catch {
      setError("Network error — please try again.");
    } finally {
      if (phaseRef.current) clearInterval(phaseRef.current);
      setGenerating(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: `translateY(${visible ? 0 : 10}px)`,
    transition: "opacity 0.22s ease, transform 0.22s ease",
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-[#0a0a0a] px-4 py-8 sm:items-center sm:py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ff2d55]">RedBridge</span>
            <span className="rounded border border-[#ff2d55]/40 bg-[#ff2d55]/10 px-1.5 py-px font-mono text-[9px] font-bold tracking-wider text-[#ff2d55]">2.0</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#4a4a4a]">Step {step} of 3</span>
            <span className="font-mono text-xs text-[#4a4a4a]">
              {step === 1 ? "Your brand" : step === 2 ? "Your business" : "Intelligence Report"}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1 flex-1 rounded-full transition-all duration-500", s <= step ? "bg-[#ff2d55]" : "bg-[#1a1a1a]")} />
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={cardStyle} className="rounded-2xl border border-[#1a1a1a] bg-[#111] p-5 shadow-2xl sm:p-8">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-7">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-[#ff2d55]" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff2d55]">Start with your Intelligence Report</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Welcome to RedBridge 2.0</h1>
                <p className="text-sm text-[#6b7280]">
                  We&apos;ll generate your Chinese Consumer Intelligence Report first — so every piece of content you create is grounded in real consumer insight.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ob-brand">Brand Name <span className="text-[#ff2d55]">*</span></Label>
                  <Input
                    id="ob-brand" value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Bondi Glow"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter" && brandName.trim()) animateTo(2); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-url" className="text-[#6b7280]">
                    Website URL <span className="font-normal text-[#4a4a4a]">(optional)</span>
                  </Label>
                  <Input id="ob-url" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourbrand.com.au" />
                </div>
              </div>

              {/* What they'll get */}
              <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">Your report will include</p>
                {["Brand perception score", "Cultural translation gap analysis", "Market opportunity score", "XHS positioning strategy", "Consumer insights + quick wins"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#6b7280]">
                    <ChevronRight size={11} className="text-[#ff2d55] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <Button size="lg" className="w-full" disabled={!brandName.trim()} onClick={() => animateTo(2)}>
                Start my Intelligence Report →
              </Button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="space-y-7">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Tell us about your business</h1>
                <p className="text-sm text-[#6b7280]">This is what the AI analyses to find your cultural translation gap.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="ob-industry">Industry <span className="text-[#ff2d55]">*</span></Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="ob-industry"><SelectValue placeholder="Select your industry" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Audience <span className="font-normal text-[#4a4a4a]">(select all that apply)</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {AUDIENCES.map(({ value, sublabel }) => (
                      <button
                        key={value} type="button" onClick={() => toggleAudience(value)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-left transition-colors",
                          audiences.includes(value)
                            ? "border-[#ff2d55] bg-[#ff2d55]/10 text-[#ff2d55]"
                            : "border-[#2a2a2a] bg-[#0d0d0d] text-[#6b7280] hover:border-[#3a3a3a] hover:text-white"
                        )}
                      >
                        <span className="block font-mono text-xs">{value}</span>
                        <span className="block text-[10px] leading-tight">{sublabel}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ob-selling">What makes you special? <span className="text-[#ff2d55]">*</span></Label>
                  <Textarea
                    id="ob-selling" value={sellingPoints} onChange={(e) => setSellingPoints(e.target.value)}
                    placeholder="Describe your product, what makes it special, and why customers love it…"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => animateTo(1)} className="inline-flex items-center gap-1.5 font-mono text-xs text-[#4a4a4a] transition-colors hover:text-white">
                  <ArrowLeft size={12} /> Back
                </button>
                <Button size="lg" disabled={!industry || !sellingPoints.trim()} onClick={() => animateTo(3)}>
                  Analyse my brand →
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="space-y-7">
              {!report ? (
                <>
                  <div className="space-y-2">
                    <h1 className="text-xl font-bold leading-snug text-white">
                      {generating ? "Generating your Intelligence Report…" : "Ready — let's analyse your brand."}
                    </h1>
                    <p className="text-sm text-[#6b7280]">
                      {generating ? "This takes about 15–20 seconds." : "Review your profile then hit generate."}
                    </p>
                  </div>

                  {/* Summary */}
                  <div className={cn("rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 transition-opacity", generating && "opacity-50")}>
                    {generating ? (
                      <div className="flex flex-col items-center gap-5 py-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ff2d55]/10">
                          <Sparkles size={24} className="animate-pulse text-[#ff2d55]" />
                        </div>
                        <div className="space-y-1.5 text-center">
                          <p className="font-medium text-white">{ANALYSIS_PHASES[phaseIdx]}</p>
                          <p className="font-mono text-xs text-[#4a4a4a]">Usually takes 15–20 seconds</p>
                        </div>
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#ff2d55]" style={{ animationDelay: `${i * 160}ms` }} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff2d55]/10">
                            <Sparkles size={14} className="text-[#ff2d55]" />
                          </div>
                          <span className="font-semibold text-white">{brandName}</span>
                        </div>
                        <div className="space-y-1.5 border-t border-[#1a1a1a] pt-3 text-sm">
                          <p className="text-[#6b7280]"><span className="text-[#4a4a4a] font-mono text-xs">Industry</span> {industry}</p>
                          {audiences.length > 0 && (
                            <p className="text-[#6b7280]"><span className="text-[#4a4a4a] font-mono text-xs">Audience</span> {audiences.join(" · ")}</p>
                          )}
                          <p className="line-clamp-2 text-[#6b7280]"><span className="text-[#4a4a4a] font-mono text-xs">About</span> {sellingPoints}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <p className="rounded-lg border border-red-900/40 bg-red-900/10 px-4 py-3 font-mono text-xs text-red-400">{error}</p>
                  )}

                  <Button size="lg" className="w-full gap-2" onClick={handleGenerate} disabled={generating}>
                    {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {generating ? "Analysing…" : "Generate My Intelligence Report"}
                  </Button>

                  {!generating && (
                    <div className="flex items-center justify-start">
                      <button type="button" onClick={() => animateTo(2)} className="inline-flex items-center gap-1.5 font-mono text-xs text-[#4a4a4a] transition-colors hover:text-white">
                        <ArrowLeft size={12} /> Back
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Report preview */
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="font-mono text-xs text-emerald-400">Report complete</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Your Intelligence Report is ready</h1>
                  </div>

                  {/* Gap preview */}
                  <div className="rounded-xl border border-[#ff2d55]/20 bg-[#ff2d55]/5 p-4 space-y-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff2d55]">Cultural Translation Gap</p>
                    <p className="font-semibold text-white">{report.culturalTranslationGap.headline}</p>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{report.culturalTranslationGap.description}</p>
                    <div className="flex items-center justify-between text-xs text-[#4a4a4a]">
                      <span>Brand Perception: <span className="text-white font-bold">{report.brandPerceptionScore}/100</span></span>
                      <span>Market Opportunity: <span className="text-white font-bold">{report.marketOpportunity.score}/100</span></span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button size="lg" className="w-full" onClick={() => router.push("/intelligence")}>
                      View Full Intelligence Report <ArrowRight size={16} />
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={() => router.push("/generate")}>
                      Now explore your content tools →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Skip */}
        {!generating && !report && (
          <div className="mt-5 text-center">
            <button type="button" onClick={skipOnboarding} className="font-mono text-xs text-[#2a2a2a] transition-colors hover:text-[#6b7280]">
              Skip onboarding →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, clamp }: { label: string; value: string; clamp?: boolean }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-16 shrink-0 font-mono text-xs text-[#4a4a4a]">{label}</span>
      <span className={cn("text-[#c0c0c0]", clamp && "line-clamp-2")}>{value}</span>
    </div>
  );
}

// Keep exported for backwards compat — not used by new flow but avoids TS warning
export { SummaryRow };
