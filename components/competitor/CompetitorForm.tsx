"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { INDUSTRIES } from "@/lib/constants";
import type { CompetitorResult } from "@/types/database";

interface CompetitorFormProps {
  onResult: (result: CompetitorResult, competitorName: string) => void;
}

export function CompetitorForm({ onResult }: CompetitorFormProps) {
  const [competitorName, setCompetitorName] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorName, industry: industry || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      onResult(data.result, competitorName);
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
        <Label htmlFor="competitorName">Competitor Brand Name</Label>
        <Input
          id="competitorName"
          value={competitorName}
          onChange={(e) => setCompetitorName(e.target.value)}
          placeholder="e.g. Aesop, Frank Body, Go-To"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="competitorIndustry">
          Industry{" "}
          <span className="font-normal text-[#4a4a4a]">(optional — improves accuracy)</span>
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
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        {loading ? "Analysing..." : "Analyse Competitor"}
      </Button>
    </form>
  );
}
