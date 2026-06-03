"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

interface EmailPreferencesPanelProps {
  initialSubscribed: boolean;
}

export function EmailPreferencesPanel({ initialSubscribed }: EmailPreferencesPanelProps) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function toggle() {
    setSaving(true);
    const next = !subscribed;
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_subscribed: next }),
      });
      if (res.ok) {
        setSubscribed(next);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white">Email Preferences</h2>
        <p className="mt-0.5 text-sm text-[#6b7280]">Control what RedBridge sends to your inbox.</p>
      </div>

      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg p-2" style={{ backgroundColor: "#ff2d5518" }}>
              <Mail size={14} className="text-[#ff2d55]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Weekly XHS Digest</p>
              <p className="mt-0.5 text-xs text-[#6b7280] leading-relaxed max-w-sm">
                Every Monday 8am AEST — top trends, 3 post ideas for your brand, usage summary, and a quick XHS marketing tip.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggle}
            disabled={saving}
            className="relative shrink-0"
            aria-label={subscribed ? "Unsubscribe" : "Subscribe"}
          >
            <div
              className="flex h-6 w-11 items-center rounded-full border transition-colors"
              style={{
                backgroundColor: subscribed ? "#ff2d5530" : "#1a1a1a",
                borderColor: subscribed ? "#ff2d55" : "#2a2a2a",
              }}
            >
              <div
                className="h-4 w-4 rounded-full transition-all"
                style={{
                  backgroundColor: subscribed ? "#ff2d55" : "#4a4a4a",
                  transform: `translateX(${subscribed ? "24px" : "4px"})`,
                }}
              />
            </div>
            {saving && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={12} className="animate-spin text-[#ff2d55]" />
              </span>
            )}
          </button>
        </div>

        {saved && (
          <p className="mt-3 flex items-center gap-1.5 font-mono text-xs text-emerald-400">
            <Check size={11} /> Preference saved
          </p>
        )}
      </div>
    </div>
  );
}
