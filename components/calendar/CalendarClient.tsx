"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Shuffle, Download, X, Clock, CalendarDays, Wand2 } from "lucide-react";
import type { PostIdea } from "@/types/database";

interface CalendarDay {
  dayNum: number;
  date: Date;
  post: PostIdea | null;
  time: string;
}

const BEST_TIMES = ["12:00 CST", "18:00 CST", "21:00 CST"];
const FORMAT_COLORS: Record<string, string> = {
  "图文": "border-blue-500/30 bg-blue-500/10 text-blue-400",
  "视频": "border-purple-500/30 bg-purple-500/10 text-purple-400",
  "合集": "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

function buildCalendar(posts: PostIdea[], order: number[]): CalendarDay[] {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i + 1);
    const postIdx = order[i];
    return {
      dayNum: i + 1,
      date,
      post: postIdx !== undefined && posts[postIdx] ? posts[postIdx] : null,
      time: BEST_TIMES[i % BEST_TIMES.length],
    };
  });
}

function buildOrder(len: number, posts: number): number[] {
  // distribute posts evenly across 30 days
  const result: Array<number | undefined> = new Array(30).fill(undefined);
  if (posts === 0) return result as number[];
  const step = Math.max(1, Math.floor(30 / posts));
  for (let i = 0; i < Math.min(posts, 30); i++) {
    result[i * step] = i;
  }
  return result.map((v) => (v === undefined ? -1 : v));
}

function shuffleArray(len: number, posts: number): number[] {
  const positions = Array.from({ length: 30 }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  const result = new Array(30).fill(-1);
  for (let i = 0; i < Math.min(posts, 30); i++) {
    result[positions[i]] = i;
  }
  return result;
}

interface CalendarClientProps {
  posts: PostIdea[];
  brandName: string | null;
  toolkitId: string | null;
}

export function CalendarClient({ posts, brandName, toolkitId }: CalendarClientProps) {
  const [order, setOrder] = useState<number[]>(() => buildOrder(30, posts.length));
  const [expanded, setExpanded] = useState<number | null>(null);

  const days = useMemo(() => buildCalendar(posts, order), [posts, order]);

  const handleShuffle = useCallback(() => {
    setOrder(shuffleArray(30, posts.length));
    setExpanded(null);
  }, [posts.length]);

  function handleExportCSV() {
    const header = "Day,Date,Weekday,Best Time (CST),Post Title,Content Angle,Format,Hashtags";
    const rows = days.map((d) => {
      const dateStr = d.date.toLocaleDateString("en-AU", { year: "numeric", month: "2-digit", day: "2-digit" });
      const weekday = d.date.toLocaleDateString("en-AU", { weekday: "long" });
      if (!d.post) return `${d.dayNum},${dateStr},${weekday},${d.time},,,,`;
      const tags = (d.post.tags ?? []).map((t) => `#${t}`).join(" ");
      const title = `"${d.post.title.replace(/"/g, '""')}"`;
      const hook = `"${(d.post.hook ?? "").replace(/"/g, '""')}"`;
      return `${d.dayNum},${dateStr},${weekday},${d.time},${title},${hook},${d.post.format},"${tags}"`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `redbridge-calendar-${brandName ?? "posts"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Content Calendar</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Plan your 30-day XHS posting schedule.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#0d0d0d] p-12 text-center">
          <CalendarDays size={28} className="mx-auto mb-3 text-[#2a2a2a]" />
          <p className="text-sm text-[#4a4a4a]">No toolkit found. Generate one first to populate your calendar.</p>
          <Link
            href="/generate"
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-[#ff2d55] hover:underline"
          >
            <Wand2 size={11} /> Generate a Toolkit
          </Link>
        </div>
      </div>
    );
  }

  const scheduledCount = days.filter((d) => d.post).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Content Calendar</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            {brandName ? `${brandName} — ` : ""}{scheduledCount} posts scheduled across 30 days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShuffle}>
            <Shuffle size={13} /> Shuffle
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </Button>
          {toolkitId && (
            <Link href="/generate">
              <Button variant="outline" size="sm">
                <Wand2 size={13} /> New Toolkit
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#4a4a4a]">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-[#ff2d55]" />
          <span>Best times: 12:00, 18:00, 21:00 CST (peak XHS hours)</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
        {days.map((day) => {
          const isExpanded = expanded === day.dayNum;
          const dateLabel = day.date.toLocaleDateString("en-AU", { month: "short", day: "numeric" });
          const weekday = day.date.toLocaleDateString("en-AU", { weekday: "short" });

          return (
            <div
              key={day.dayNum}
              className={cn(
                "relative rounded-xl border transition-colors",
                day.post
                  ? "cursor-pointer border-[#1a1a1a] bg-[#111] hover:border-[#2a2a2a]"
                  : "border-dashed border-[#0f0f0f] bg-[#0a0a0a]",
                isExpanded && "border-[#ff2d55]/40"
              )}
              onClick={() => day.post && setExpanded(isExpanded ? null : day.dayNum)}
            >
              <div className="p-2.5 sm:p-3">
                {/* Date header */}
                <div className="mb-2 flex items-center justify-between gap-1">
                  <div>
                    <p className="font-mono text-[10px] text-[#4a4a4a]">{weekday}</p>
                    <p className="text-xs font-medium text-[#6b7280]">{dateLabel}</p>
                  </div>
                  <span className="font-mono text-[10px] text-[#ff2d55]">{day.time}</span>
                </div>

                {day.post ? (
                  <>
                    <p className="line-clamp-2 text-xs font-medium leading-snug text-white">
                      {day.post.title}
                    </p>
                    <div className="mt-1.5">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 font-mono text-[9px]",
                          FORMAT_COLORS[day.post.format] ?? "border-[#2a2a2a] bg-[#1a1a1a] text-[#6b7280]"
                        )}
                      >
                        {day.post.format}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-[#2a2a2a]">No post</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded day panel */}
      {expanded !== null && (() => {
        const day = days.find((d) => d.dayNum === expanded);
        if (!day?.post) return null;
        const dateLabel = day.date.toLocaleDateString("en-AU", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        });
        return (
          <div className="rounded-xl border border-[#ff2d55]/30 bg-[#111] p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
                  Day {day.dayNum} — {dateLabel}
                </p>
                <h3 className="mt-1 text-lg font-bold text-white">{day.post.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(null)}
                className="rounded-md p-1.5 text-[#4a4a4a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-[#ff2d55]" />
              <span className="font-mono text-xs text-[#6b7280]">Best time: {day.time}</span>
              <Badge variant="outline" className="text-xs">{day.post.format}</Badge>
            </div>
            <p className="text-sm leading-relaxed text-[#c0c0c0]">{day.post.hook}</p>
            <div className="flex flex-wrap gap-1.5">
              {(day.post.tags ?? []).map((tag) => (
                <span key={tag} className="font-mono text-xs text-[#ff2d55]">#{tag}</span>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
