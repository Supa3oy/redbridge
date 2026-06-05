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
import { User, Check, Loader2, FileText } from "lucide-react";

const AUDIENCES = [
  { value: "女性 25-35", sublabel: "Women 25–35" },
  { value: "男性 18-30", sublabel: "Men 18–30" },
  { value: "妈妈群体", sublabel: "Mums" },
  { value: "留学生", sublabel: "Students" },
  { value: "新移民", sublabel: "New migrants" },
  { value: "精致白领", sublabel: "Young professionals" },
];

interface BrandProfileClientProps {
  initialProfile: {
    brand_name: string;
    industry: string;
    website_url: string;
    target_audience: string[];
    selling_points: string;
  };
}

export function BrandProfileClient({ initialProfile }: BrandProfileClientProps) {
  const [brandName, setBrandName] = useState(initialProfile.brand_name);
  const [industry, setIndustry] = useState(initialProfile.industry);
  const [websiteUrl, setWebsiteUrl] = useState(initialProfile.website_url);
  const [audiences, setAudiences] = useState<string[]>(initialProfile.target_audience);
  const [sellingPoints, setSellingPoints] = useState(initialProfile.selling_points);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function toggleAudience(value: string) {
    setAudiences((prev) => prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/brand-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: brandName,
          industry,
          website_url: websiteUrl || null,
          target_audience: audiences,
          selling_points: sellingPoints,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? `Save failed (${res.status})`);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Brand Profile</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Your brand profile powers the Intelligence Report and all content generation.
          </p>
        </div>
        <Link href="/intelligence">
          <Button variant="outline" size="sm">
            <FileText size={13} /> View Intelligence Report
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <User size={13} className="text-[#ff2d55]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">Brand Details</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandName">Brand Name</Label>
          <Input id="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Bondi Glow" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger id="industry"><SelectValue placeholder="Select your industry" /></SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website URL <span className="font-normal text-[#4a4a4a]">(optional)</span></Label>
          <Input id="website" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourbrand.com.au" />
        </div>

        <div className="space-y-2">
          <Label>Target Audience <span className="font-normal text-[#4a4a4a]">(select all that apply)</span></Label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map(({ value, sublabel }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleAudience(value)}
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
          <Label htmlFor="sellingPoints">What makes your brand special? <span className="text-[#ff2d55]">*</span></Label>
          <Textarea
            id="sellingPoints"
            value={sellingPoints}
            onChange={(e) => setSellingPoints(e.target.value)}
            placeholder="Describe your product, what it does, who it's for, and why customers love it…"
            rows={4}
          />
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving || !brandName.trim() || !sellingPoints.trim()}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Profile"}
          </Button>
          {saved && (
            <Link href="/intelligence">
              <Button variant="outline" size="sm">
                Regenerate Intelligence Report →
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-[#ff2d55]/15 bg-[#ff2d55]/5 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff2d55] mb-2">How it&apos;s used</p>
        <ul className="space-y-1.5 text-sm text-[#6b7280]">
          <li className="flex items-start gap-2"><span className="text-[#ff2d55] mt-0.5">→</span> Intelligence Report — your full Chinese consumer analysis</li>
          <li className="flex items-start gap-2"><span className="text-[#ff2d55] mt-0.5">→</span> Generate Campaign — pre-filled brand context for faster content</li>
          <li className="flex items-start gap-2"><span className="text-[#ff2d55] mt-0.5">→</span> Weekly Digest — personalised email recommendations</li>
        </ul>
      </div>
    </div>
  );
}
