"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Plus,
  Loader2,
  Trash2,
  Sparkles,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";
import type { PostMetric, PerformanceInsights } from "@/types/database";

interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function MetricBar({ label, value, max, color }: MetricBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="w-5 shrink-0 font-mono text-xs text-[#4a4a4a]">{label}</span>
      <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-[#1a1a1a]">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right font-mono text-xs text-[#6b7280]">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function engagementScore(m: PostMetric) {
  return m.likes + m.comments * 2 + m.shares * 3 + m.saves * 4;
}

interface PerformanceClientProps {
  initialMetrics: PostMetric[];
}

export function PerformanceClient({ initialMetrics }: PerformanceClientProps) {
  const [metrics, setMetrics] = useState<PostMetric[]>(initialMetrics);
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [form, setForm] = useState({
    post_title: "",
    likes: "",
    comments: "",
    shares: "",
    saves: "",
    posted_at: "",
  });

  function setField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const formValid = form.post_title.trim() && form.posted_at;

  async function handleSave() {
    if (!formValid) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          post_title: form.post_title.trim(),
          likes: Number(form.likes) || 0,
          comments: Number(form.comments) || 0,
          shares: Number(form.shares) || 0,
          saves: Number(form.saves) || 0,
          posted_at: form.posted_at,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed"); return; }
      setMetrics((prev) => [data.metric as PostMetric, ...prev]);
      setForm({ post_title: "", likes: "", comments: "", shares: "", saves: "", posted_at: "" });
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/performance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) setMetrics((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleInsights() {
    if (metrics.length < 2) return;
    setGeneratingInsights(true);
    setError("");
    try {
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "insights", metrics }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Insights failed"); return; }
      setInsights(data.insights as PerformanceInsights);
    } catch {
      setError("Network error — please try again");
    } finally {
      setGeneratingInsights(false);
    }
  }

  // Chart data
  const maxLikes = Math.max(...metrics.map((m) => m.likes), 1);
  const maxComments = Math.max(...metrics.map((m) => m.comments), 1);
  const maxShares = Math.max(...metrics.map((m) => m.shares), 1);
  const maxSaves = Math.max(...metrics.map((m) => m.saves), 1);
  const maxEngagement = Math.max(...metrics.map(engagementScore), 1);

  const topPost = metrics.length
    ? metrics.reduce((a, b) => (engagementScore(a) >= engagementScore(b) ? a : b))
    : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Performance Tracker</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Track your XHS post metrics and get AI-powered insights on what&apos;s working.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Add metric form */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 sm:p-5 space-y-4 sticky top-4">
            <div className="flex items-center gap-2">
              <Plus size={13} className="text-[#ff2d55]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
                Add Post
              </span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="post_title">Post Title</Label>
                <Input
                  id="post_title"
                  value={form.post_title}
                  onChange={(e) => setField("post_title", e.target.value)}
                  placeholder="e.g. Winter skincare routine"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="posted_at">Date Posted</Label>
                <Input
                  id="posted_at"
                  type="date"
                  value={form.posted_at}
                  onChange={(e) => setField("posted_at", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["likes", "comments", "shares", "saves"] as const).map((field) => (
                  <div key={field} className="space-y-1.5">
                    <Label htmlFor={field} className="capitalize">{field}</Label>
                    <Input
                      id={field}
                      type="number"
                      min="0"
                      value={form[field]}
                      onChange={(e) => setField(field, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="font-mono text-xs text-red-400">{error}</p>}
            <Button onClick={handleSave} disabled={!formValid || saving} className="w-full">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {saving ? "Saving…" : "Add Post"}
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {metrics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#0d0d0d] p-12 text-center">
              <BarChart3 size={28} className="mx-auto mb-3 text-[#2a2a2a]" />
              <p className="text-sm text-[#4a4a4a]">
                Add your first post to start tracking performance.
              </p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Posts", value: metrics.length, icon: BarChart3, color: "#ff2d55" },
                  { label: "Total Likes", value: metrics.reduce((a, m) => a + m.likes, 0), icon: Heart, color: "#f43f5e" },
                  { label: "Total Saves", value: metrics.reduce((a, m) => a + m.saves, 0), icon: Bookmark, color: "#10b981" },
                  { label: "Total Shares", value: metrics.reduce((a, m) => a + m.shares, 0), icon: Share2, color: "#3b82f6" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-[#1a1a1a] bg-[#111] p-3 sm:p-4">
                    <div className="flex items-start justify-between">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">{label}</p>
                      <div className="rounded p-1.5" style={{ backgroundColor: `${color}18` }}>
                        <Icon size={11} style={{ color }} />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-white">
                      {value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Engagement chart */}
              <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className="text-[#ff2d55]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
                    Engagement by Post
                  </span>
                </div>
                <div className="space-y-3">
                  {[...metrics]
                    .sort((a, b) => engagementScore(b) - engagementScore(a))
                    .slice(0, 10)
                    .map((m) => (
                      <div key={m.id} className="space-y-1.5">
                        <p className="truncate text-xs font-medium text-white">{m.post_title}</p>
                        <div className="space-y-1">
                          <MetricBar label="♥" value={m.likes} max={maxLikes} color="bg-rose-500" />
                          <MetricBar label="💬" value={m.comments} max={maxComments} color="bg-blue-500" />
                          <MetricBar label="→" value={m.shares} max={maxShares} color="bg-violet-500" />
                          <MetricBar label="🔖" value={m.saves} max={maxSaves} color="bg-emerald-500" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={13} className="text-[#ff2d55]" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
                      AI Insights
                    </span>
                  </div>
                  {metrics.length >= 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleInsights}
                      disabled={generatingInsights}
                    >
                      {generatingInsights ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Sparkles size={12} />
                      )}
                      {insights ? "Refresh" : "Generate"} Insights
                    </Button>
                  )}
                </div>

                {metrics.length < 2 ? (
                  <p className="text-sm text-[#4a4a4a]">
                    Add at least 2 posts to generate AI insights.
                  </p>
                ) : insights ? (
                  <div className="space-y-4">
                    {/* Top insight */}
                    <div className="rounded-lg border border-[#ff2d55]/20 bg-[#ff2d55]/5 p-4">
                      <p className="text-sm leading-relaxed text-white">{insights.topInsight}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">Best Content Type</p>
                        <p className="text-sm text-white">{insights.bestContentType}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">Best Posting Day</p>
                        <p className="text-sm text-white">{insights.bestPostingDay}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">Recommendations</p>
                      <ul className="space-y-2">
                        {insights.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#c0c0c0]">
                            <span className="mt-0.5 font-mono text-[#ff2d55]">→</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#4a4a4a]">
                    Click &ldquo;Generate Insights&rdquo; to get AI analysis of your performance data.
                    Counts as 1 generation.
                  </p>
                )}
              </div>

              {/* Posts list */}
              <div className="space-y-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">
                  All Posts
                </h2>
                <div className="rounded-xl border border-[#1a1a1a] bg-[#111] divide-y divide-[#1a1a1a]">
                  {[...metrics]
                    .sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())
                    .map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{m.post_title}</p>
                          <p className="font-mono text-xs text-[#4a4a4a]">
                            {new Date(m.posted_at).toLocaleDateString("en-AU")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="hidden sm:flex items-center gap-3 font-mono text-xs text-[#6b7280]">
                            <span className="flex items-center gap-1">
                              <Heart size={10} className="text-rose-400" />{m.likes.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle size={10} className="text-blue-400" />{m.comments.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 size={10} className="text-violet-400" />{m.shares.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bookmark size={10} className="text-emerald-400" />{m.saves.toLocaleString()}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            className="rounded-md p-1.5 text-[#4a4a4a] transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
