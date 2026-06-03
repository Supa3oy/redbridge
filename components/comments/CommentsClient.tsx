"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Wand2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import type { CommentItem, CommentSentiment } from "@/types/database";

const SENTIMENT_STYLES: Record<CommentSentiment, string> = {
  Question: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  Compliment: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Complaint: "border-red-500/30 bg-red-500/10 text-red-400",
  "Purchase Intent": "border-[#ff2d55]/30 bg-[#ff2d55]/10 text-[#ff2d55]",
};

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

export function CommentsClient() {
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState<CommentItem[]>([]);
  const [translating, setTranslating] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyingAll, setReplyingAll] = useState(false);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const { copied, copy } = useCopyTimeout();

  async function handleTranslate() {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setTranslating(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "translate", comments: lines }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Translation failed"); return; }
      setItems(
        (data.items ?? []).map((it: Omit<CommentItem, "id" | "reply">, i: number) => ({
          ...it,
          id: `${Date.now()}-${i}`,
          reply: null,
        }))
      );
    } catch {
      setError("Network error — please try again");
    } finally {
      setTranslating(false);
    }
  }

  async function handleReply(item: CommentItem) {
    setReplyingId(item.id);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          comment: item.original,
          translation: item.translation,
          sentiment: item.sentiment,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Reply failed"); return; }
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, reply: data.reply } : it))
      );
    } catch {
      setError("Network error — please try again");
    } finally {
      setReplyingId(null);
    }
  }

  async function handleReplyAll() {
    if (!items.length) return;
    setReplyingAll(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "replyAll", items }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Reply All failed"); return; }
      const replies: string[] = data.replies ?? [];
      setItems((prev) => prev.map((it, i) => ({ ...it, reply: replies[i] ?? it.reply })));
    } catch {
      setError("Network error — please try again");
    } finally {
      setReplyingAll(false);
    }
  }

  const hasReplies = items.some((it) => it.reply);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Comment Manager</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Paste Chinese comments or DMs — AI translates and generates replies instantly.
        </p>
      </div>

      {/* Input area */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={13} className="text-[#ff2d55]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
            Paste Comments
          </span>
        </div>
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"Paste Chinese comments here — one per line\n这个产品真的太好用了！\n这个多少钱？\n发货快吗？"}
          rows={5}
          className="resize-none font-mono text-sm"
        />
        <div className="flex items-center gap-3">
          <Button onClick={handleTranslate} disabled={!raw.trim() || translating}>
            {translating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {translating ? "Translating…" : "Translate All"}
          </Button>
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={handleReplyAll}
              disabled={replyingAll}
            >
              {replyingAll ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              {replyingAll ? "Generating…" : `Reply All (${items.length})`}
            </Button>
          )}
        </div>
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      </div>

      {/* Comment cards */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">
              {items.length} Comment{items.length !== 1 ? "s" : ""}
            </h2>
            {hasReplies && (
              <button
                type="button"
                onClick={() => {
                  const all = items.map((it) => it.reply ?? "").join("\n\n");
                  copy(all, "all");
                }}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[#ff2d55] hover:underline"
              >
                {copied === "all" ? <Check size={11} /> : <Copy size={11} />}
                Copy all replies
              </button>
            )}
          </div>

          {items.map((item) => {
            const isReplying = replyingId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 sm:p-5 space-y-3"
              >
                {/* Original + sentiment */}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base leading-snug text-white">{item.original}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-xs",
                      SENTIMENT_STYLES[item.sentiment]
                    )}
                  >
                    {item.sentiment}
                  </span>
                </div>

                {/* Translation */}
                <p className="text-sm text-[#6b7280] italic">{item.translation}</p>

                {/* Reply area */}
                {item.reply ? (
                  <div className="space-y-2 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">
                        Generated Reply
                      </span>
                      <button
                        type="button"
                        onClick={() => copy(item.reply!, item.id)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-[#4a4a4a] transition-colors hover:text-white"
                      >
                        {copied === item.id ? <Check size={10} /> : <Copy size={10} />}
                        {copied === item.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed text-white">{item.reply}</p>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReply(item)}
                    disabled={isReplying || replyingAll}
                  >
                    {isReplying ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Wand2 size={12} />
                    )}
                    {item.reply ? "Regenerate Reply" : "Generate Reply"}
                  </Button>
                  {item.reply && (
                    <button
                      type="button"
                      onClick={() => copy(item.reply!, item.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#2a2a2a] px-2.5 py-1 font-mono text-xs text-[#6b7280] transition-colors hover:border-[#3a3a3a] hover:text-white"
                    >
                      {copied === item.id ? <Check size={11} /> : <Copy size={11} />}
                      {copied === item.id ? "Copied" : "Copy Reply"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Usage note */}
      {items.length > 0 && (
        <p className="font-mono text-xs text-[#3a3a3a]">
          Individual replies are free. &ldquo;Reply All&rdquo; counts as 1 generation.
        </p>
      )}

      {/* History accordion */}
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
              Sessions are saved automatically when you use Reply All.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
