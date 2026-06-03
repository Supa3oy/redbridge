"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Inbox,
  Loader2,
  Copy,
  Check,
  Wand2,
  RefreshCw,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import type { InboxItem, InboxCategory, InboxPriority } from "@/types/database";

const CATEGORY_STYLES: Record<InboxCategory, string> = {
  "Price Inquiry": "border-blue-500/30 bg-blue-500/10 text-blue-400",
  "Shipping Question": "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  "Ingredient Question": "border-purple-500/30 bg-purple-500/10 text-purple-400",
  "Complaint": "border-red-500/30 bg-red-500/10 text-red-400",
  "General Praise": "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "Purchase Ready": "border-[#ff2d55]/30 bg-[#ff2d55]/10 text-[#ff2d55]",
};

const PRIORITY_CONFIG: Record<InboxPriority, { label: string; dot: string }> = {
  urgent: { label: "Urgent", dot: "bg-red-500" },
  high:   { label: "High",   dot: "bg-amber-500" },
  normal: { label: "Normal", dot: "bg-[#3a3a3a]" },
};

const ALL_CATEGORIES: InboxCategory[] = [
  "Purchase Ready",
  "Price Inquiry",
  "Shipping Question",
  "Ingredient Question",
  "Complaint",
  "General Praise",
];

function useCopyTimeout() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);
  return { copied, copy };
}

export function InboxClient() {
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState<InboxItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [replyingAll, setReplyingAll] = useState(false);
  const [filter, setFilter] = useState<InboxCategory | "All">("All");
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const { copied, copy } = useCopyTimeout();

  async function handleProcess() {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setProcessing(true);
    setError("");
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process", messages: lines }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Processing failed"); return; }
      setItems(
        (data.items ?? []).map(
          (it: Omit<InboxItem, "id" | "reply">, i: number) => ({
            ...it,
            id: `${Date.now()}-${i}`,
            reply: null,
          })
        )
      );
      setFilter("All");
    } catch {
      setError("Network error — please try again");
    } finally {
      setProcessing(false);
    }
  }

  async function handleReplyAll() {
    if (!items.length) return;
    setReplyingAll(true);
    setError("");
    try {
      // Sort by priority before sending: urgent first
      const priorityOrder: InboxPriority[] = ["urgent", "high", "normal"];
      const sorted = [...items].sort(
        (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
      );
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "replyAll", items: sorted }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Reply All failed"); return; }
      const replies: string[] = data.replies ?? [];
      // Map replies back by id
      const replyMap = new Map(sorted.map((it, i) => [it.id, replies[i] ?? null]));
      setItems((prev) => prev.map((it) => ({ ...it, reply: replyMap.get(it.id) ?? it.reply })));
    } catch {
      setError("Network error — please try again");
    } finally {
      setReplyingAll(false);
    }
  }

  const filtered = filter === "All" ? items : items.filter((it) => it.category === filter);
  const categoryCounts = ALL_CATEGORIES.reduce(
    (acc, cat) => ({ ...acc, [cat]: items.filter((it) => it.category === cat).length }),
    {} as Record<InboxCategory, number>
  );
  const urgentCount = items.filter((it) => it.priority === "urgent").length;
  const highCount = items.filter((it) => it.priority === "high").length;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Inbox Manager</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Paste bulk DMs or comments — AI categorises, translates, and generates replies.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Inbox size={13} className="text-[#ff2d55]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
            Paste Messages
          </span>
        </div>
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"Paste DMs or comments — one per line (supports 10+ at once)\n这个多少钱？\n什么时候发货？\n成分表能看看吗？\n我想买！怎么购买？"}
          rows={5}
          className="resize-none font-mono text-sm"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleProcess} disabled={!raw.trim() || processing}>
            {processing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {processing ? "Processing…" : "Categorise & Translate"}
          </Button>
          {items.length > 0 && (
            <Button variant="outline" onClick={handleReplyAll} disabled={replyingAll}>
              {replyingAll ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              {replyingAll ? "Generating replies…" : `Bulk Reply All (${items.length})`}
            </Button>
          )}
        </div>
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      </div>

      {/* Priority summary */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5">
              <AlertCircle size={12} className="text-red-400" />
              <span className="font-mono text-xs text-red-400">{urgentCount} Urgent</span>
            </div>
          )}
          {highCount > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="font-mono text-xs text-amber-400">{highCount} High priority</span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-full border border-[#2a2a2a] px-3 py-1.5">
            <span className="font-mono text-xs text-[#6b7280]">{items.length} total messages</span>
          </div>
        </div>
      )}

      {/* Category filter */}
      {items.length > 0 && (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center gap-1 border-b border-[#1a1a1a] min-w-max md:min-w-0">
            <button
              type="button"
              onClick={() => setFilter("All")}
              className={cn(
                "border-b-2 px-4 py-2.5 font-mono text-xs whitespace-nowrap transition-colors",
                filter === "All"
                  ? "border-[#ff2d55] text-white"
                  : "border-transparent text-[#6b7280] hover:text-white"
              )}
            >
              All ({items.length})
            </button>
            {ALL_CATEGORIES.filter((cat) => categoryCounts[cat] > 0).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={cn(
                  "border-b-2 px-4 py-2.5 font-mono text-xs whitespace-nowrap transition-colors",
                  filter === cat
                    ? "border-[#ff2d55] text-white"
                    : "border-transparent text-[#6b7280] hover:text-white"
                )}
              >
                {cat} ({categoryCounts[cat]})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message cards */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((item) => {
            const priority = PRIORITY_CONFIG[item.priority];
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border bg-[#111] p-4 sm:p-5 space-y-3",
                  item.priority === "urgent"
                    ? "border-red-500/20"
                    : item.priority === "high"
                    ? "border-amber-500/20"
                    : "border-[#1a1a1a]"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base leading-snug text-white">{item.original}</p>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 font-mono text-[10px]",
                        CATEGORY_STYLES[item.category]
                      )}
                    >
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
                      <span className="font-mono text-[10px] text-[#4a4a4a]">{priority.label}</span>
                    </div>
                  </div>
                </div>

                {/* Translation */}
                <p className="text-sm italic text-[#6b7280]">{item.translation}</p>

                {/* Reply */}
                {item.reply && (
                  <div className="space-y-2 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">
                        Generated Reply
                      </span>
                      <button
                        type="button"
                        onClick={() => copy(item.reply!, item.id)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-[#4a4a4a] hover:text-white transition-colors"
                      >
                        {copied === item.id ? <Check size={10} /> : <Copy size={10} />}
                        {copied === item.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed text-white">{item.reply}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <p className="font-mono text-xs text-[#3a3a3a]">
          Bulk Reply All counts as 1 generation.
        </p>
      )}

      {/* History */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
        <button
          type="button"
          onClick={() => setHistoryOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-[#111]"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">
            Saved Sessions
          </span>
          <ChevronDown
            size={13}
            className={cn("text-[#4a4a4a] transition-transform", historyOpen && "rotate-180")}
          />
        </button>
        {historyOpen && (
          <div className="border-t border-[#1a1a1a] px-5 py-4">
            <p className="text-sm text-[#4a4a4a]">
              Sessions are saved automatically after Bulk Reply All.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
