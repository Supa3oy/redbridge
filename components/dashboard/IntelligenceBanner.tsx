"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

const STORAGE_KEY = "rb-2-banner-dismissed";

export function IntelligenceBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage not available
    }
  }, []);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-[#ff2d55]/25 bg-gradient-to-r from-[#ff2d55]/10 via-[#0a0a0a] to-[#ff2d55]/5 p-4 sm:p-5">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute -top-8 -left-8 h-32 w-32 rounded-full bg-[#ff2d55]/10 blur-2xl" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 shrink-0 rounded-lg border border-[#ff2d55]/30 bg-[#ff2d55]/10 p-2">
            <Sparkles size={14} className="text-[#ff2d55]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-white">RedBridge 2.0 is here</p>
              <span className="rounded border border-[#ff2d55]/40 bg-[#ff2d55]/10 px-1.5 py-px font-mono text-[9px] font-bold tracking-wider text-[#ff2d55]">
                NEW
              </span>
            </div>
            <p className="mt-0.5 text-sm text-[#6b7280] leading-snug max-w-lg">
              Get your Chinese Consumer Intelligence Report — understand exactly how Chinese consumers perceive your brand and where the cultural gap is.
            </p>
            <Link
              href="/intelligence"
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#ff2d55] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#e0274d]"
            >
              Generate Intelligence Report →
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-[#4a4a4a] transition-colors hover:bg-[#1a1a1a] hover:text-white"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
