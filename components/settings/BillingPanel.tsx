"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: 0,
    period: "forever",
    generations: "3 / month",
    features: [
      "3 toolkit generations",
      "10 post ideas per run",
      "8 keywords per run",
      "3 captions per run",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 19,
    period: "mo",
    generations: "50 / month",
    features: [
      "50 toolkit generations",
      "30 post ideas per run",
      "16 keywords per run",
      "5 captions per run",
      "Competitor analysis",
      "Trend insights",
    ],
  },
  {
    key: "agency",
    name: "Agency",
    price: 49,
    period: "mo",
    generations: "Unlimited",
    features: [
      "Unlimited generations",
      "Everything in Pro",
      "Priority support",
      "Multi-brand workspace",
    ],
  },
] as const;

interface BillingPanelProps {
  email: string;
  plan: "free" | "pro" | "agency";
  usageCount: number;
  usageLimit: number;
}

export function BillingPanel({ email, plan, usageCount, usageLimit }: BillingPanelProps) {
  const [waitlistPlan, setWaitlistPlan] = useState<"Pro" | "Agency" | null>(null);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Beta banner */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <span className="text-lg">🚀</span>
        <p className="text-sm text-amber-300">
          <span className="font-semibold">Beta — Billing coming soon.</span>{" "}
          Enjoy {usageLimit} free generations during beta. No card required.
        </p>
      </div>

      {/* Current plan summary */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm text-[#6b7280]">Current plan</p>
          <p className="font-semibold text-white capitalize">{plan}</p>
          <p className="font-mono text-xs text-[#4a4a4a]">{email}</p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-sm text-[#6b7280]">Usage this month</p>
          <p className="font-mono text-sm text-white">
            {usageCount} / {usageLimit}
          </p>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#1a1a1a]">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                usageCount / usageLimit >= 0.9 ? "bg-red-500" :
                usageCount / usageLimit >= 0.6 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${Math.min((usageCount / usageLimit) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = plan === p.key;
          const isPaid = p.key !== "free";

          return (
            <div
              key={p.key}
              className={cn(
                "rounded-xl border p-5 flex flex-col gap-5",
                isCurrent
                  ? "border-[#ff2d55]/40 bg-[#ff2d55]/5"
                  : "border-[#1a1a1a] bg-[#111]"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{p.name}</p>
                  {isCurrent && (
                    <Badge variant="outline" className="border-[#ff2d55]/50 text-[#ff2d55] text-[10px]">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">${p.price}</span>
                  <span className="text-sm text-[#6b7280]">/ {p.period}</span>
                </div>
                <p className="font-mono text-xs text-[#4a4a4a]">{p.generations} generations</p>
              </div>

              <ul className="flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[#6b7280]">
                    <Check size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <div>
                {isCurrent ? (
                  <p className="text-center font-mono text-xs text-[#4a4a4a]">
                    Your current plan
                  </p>
                ) : isPaid ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setWaitlistPlan(p.name as "Pro" | "Agency")}
                  >
                    Join Waitlist
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Waitlist modal */}
      {waitlistPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setWaitlistPlan(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-[#2a2a2a] bg-[#111] p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="text-2xl">🎉</div>
              <button
                onClick={() => setWaitlistPlan(null)}
                className="text-[#4a4a4a] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-white">You&apos;re on the list!</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Thanks! We&apos;ll notify you at{" "}
                <span className="text-white">{email}</span> when{" "}
                <span className="text-[#ff2d55]">{waitlistPlan}</span> launches.
              </p>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={() => setWaitlistPlan(null)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
