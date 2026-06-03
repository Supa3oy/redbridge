"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UsageData {
  used: number;
  limit: number | null;
  plan: "free" | "pro" | "agency";
}

export function UsageMeter() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    const fetchUsage = () => {
      fetch("/api/usage")
        .then((r) => r.json())
        .then(setUsage)
        .catch(() => null);
    };
    fetchUsage();
    window.addEventListener("toolkit-generated", fetchUsage);
    return () => window.removeEventListener("toolkit-generated", fetchUsage);
  }, []);

  if (!usage) return null;

  const { used, limit, plan } = usage;
  const pct = limit === null ? 0 : Math.min((used / limit) * 100, 100);
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#111] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6b7280]">
          Usage
        </span>
        <span className="font-mono text-xs text-white">
          {limit === null ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      {limit !== null && (
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
          <div
            className={cn("h-full rounded-full transition-all", color)}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {plan === "free" && (
        <Link href="/settings">
          <Button variant="outline" size="sm" className="w-full text-xs mt-1">
            Upgrade Plan
          </Button>
        </Link>
      )}
    </div>
  );
}
