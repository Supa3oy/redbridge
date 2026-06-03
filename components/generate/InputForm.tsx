"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Wand2, Loader2 } from "lucide-react";
import { INDUSTRIES } from "@/lib/constants";
import type { ToolkitResult } from "@/types/database";

const AUDIENCES = [
  { value: "女性 25-35", sublabel: "Women 25-35" },
  { value: "男性 18-30", sublabel: "Men 18-30" },
  { value: "妈妈群体", sublabel: "Mums" },
  { value: "留学生", sublabel: "Students" },
  { value: "新移民", sublabel: "New migrants" },
  { value: "精致白领", sublabel: "Young professionals" },
];

const TONES = [
  { value: "种草", sublabel: "Soft Sell" },
  { value: "干货", sublabel: "Educational" },
  { value: "故事", sublabel: "Storytelling" },
  { value: "搞笑", sublabel: "Funny" },
  { value: "高端", sublabel: "Luxury" },
  { value: "生活感", sublabel: "Lifestyle" },
];

interface InputFormProps {
  onResult: (result: ToolkitResult, brandName: string) => void;
  initialIndustry?: string;
  initialProductDescription?: string;
}

export function InputForm({ onResult, initialIndustry = "", initialProductDescription = "" }: InputFormProps) {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState(initialIndustry);
  const [customIndustry, setCustomIndustry] = useState("");
  const [audiences, setAudiences] = useState<string[]>([]);
  const [tone, setTone] = useState("");
  const [productDescription, setProductDescription] = useState(initialProductDescription);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleAudience(value: string) {
    setAudiences((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          industry: industry === "Other" ? customIndustry.trim() : industry,
          audiences,
          tone,
          productDescription,
          websiteUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      onResult(data.result, brandName);
      window.dispatchEvent(new Event("toolkit-generated"));
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="brandName">Brand Name</Label>
        <Input
          id="brandName"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="e.g. Bondi Glow"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Select value={industry} onValueChange={setIndustry} required>
          <SelectTrigger id="industry">
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {industry === "Other" && (
          <Input
            value={customIndustry}
            onChange={(e) => setCustomIndustry(e.target.value)}
            placeholder="Describe your industry"
            required
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>
          Target Audience{" "}
          <span className="font-normal text-[#4a4a4a]">(optional — select all that apply)</span>
        </Label>
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
                  : "border-[#2a2a2a] bg-[#111] text-[#6b7280] hover:border-[#3a3a3a] hover:text-white"
              )}
            >
              <span className="block font-mono text-xs">{value}</span>
              <span className="block text-[10px] leading-tight">{sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Content Tone{" "}
          <span className="font-normal text-[#4a4a4a]">(optional)</span>
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {TONES.map(({ value, sublabel }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTone((prev) => (prev === value ? "" : value))}
              className={cn(
                "rounded-full border px-3 py-1.5 text-left transition-colors",
                tone === value
                  ? "border-[#ff2d55] bg-[#ff2d55]/10 text-[#ff2d55]"
                  : "border-[#2a2a2a] bg-[#111] text-[#6b7280] hover:border-[#3a3a3a] hover:text-white"
              )}
            >
              <span className="block font-mono text-xs">{value}</span>
              <span className="block text-[10px] leading-tight">{sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="productDescription">Product Description</Label>
        <Textarea
          id="productDescription"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Describe your product, target customer, and key benefits..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="websiteUrl">
          Website URL{" "}
          <span className="font-normal text-[#4a4a4a]">(optional)</span>
        </Label>
        <Input
          id="websiteUrl"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourbrand.com.au"
        />
      </div>

      {error && (
        <p className="font-mono text-xs text-red-400">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Wand2 size={16} />
        )}
        {loading ? "Generating..." : "Generate Toolkit"}
      </Button>
    </form>
  );
}
