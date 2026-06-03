"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PostsGrid } from "@/components/generate/PostsGrid";
import { KeywordsPanel } from "@/components/generate/KeywordsPanel";
import { CaptionsPanel } from "@/components/generate/CaptionsPanel";
import { CompetitorResultPanel } from "@/components/competitor/CompetitorResult";
import { TrendCard } from "@/components/trends/TrendCard";
import { TimeAgo } from "@/components/ui/time-ago";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Wand2,
  Search,
  TrendingUp,
  Bookmark,
  X,
  Trash2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type {
  Json,
  ToolkitResult,
  CompetitorResult,
  TrendsResult,
  SavedCompetitorRow,
  SavedTrendRow,
} from "@/types/database";

type ToolkitItem = {
  id: string;
  brand_name: string;
  result: Json;
  created_at: string;
};

type TabKey = "toolkits" | "competitors" | "trends";

type PanelItem =
  | { type: "toolkit"; data: ToolkitItem }
  | { type: "competitor"; data: SavedCompetitorRow }
  | { type: "trend"; data: SavedTrendRow };

interface SavedClientProps {
  initialToolkits: ToolkitItem[];
  initialCompetitors: SavedCompetitorRow[];
  initialTrends: SavedTrendRow[];
}

const TAB_META: Record<TabKey, { label: string; Icon: typeof Wand2; emptyHref: string; emptyMsg: string; emptyAction: string }> = {
  toolkits: {
    label: "Toolkits",
    Icon: Wand2,
    emptyHref: "/generate",
    emptyMsg: "No toolkits generated yet.",
    emptyAction: "Generate your first toolkit",
  },
  competitors: {
    label: "Competitors",
    Icon: Search,
    emptyHref: "/competitor",
    emptyMsg: "No competitor analyses saved.",
    emptyAction: "Analyse your first competitor",
  },
  trends: {
    label: "Trends",
    Icon: TrendingUp,
    emptyHref: "/trends",
    emptyMsg: "No trends reports generated.",
    emptyAction: "View this week's trends",
  },
};

const TYPE_MAP: Record<TabKey, "toolkit" | "competitor" | "trend"> = {
  toolkits: "toolkit",
  competitors: "competitor",
  trends: "trend",
};

export function SavedClient({
  initialToolkits,
  initialCompetitors,
  initialTrends,
}: SavedClientProps) {
  const [tab, setTab] = useState<TabKey>("toolkits");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<PanelItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [toolkits, setToolkits] = useState(initialToolkits);
  const [competitors, setCompetitors] = useState(initialCompetitors);
  const [trends, setTrends] = useState(initialTrends);

  const closePanel = useCallback(() => setPanel(null), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePanel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closePanel]);

  useEffect(() => {
    document.body.style.overflow = panel ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [panel]);

  async function handleDelete(tabKey: TabKey, id: string) {
    setDeleting((prev) => new Set([...prev, id]));
    try {
      const res = await fetch(
        `/api/delete?type=${TYPE_MAP[tabKey]}&id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        if (tabKey === "toolkits") setToolkits((prev) => prev.filter((t) => t.id !== id));
        if (tabKey === "competitors") setCompetitors((prev) => prev.filter((c) => c.id !== id));
        if (tabKey === "trends") setTrends((prev) => prev.filter((t) => t.id !== id));
        if (panel && "data" in panel && panel.data.id === id) setPanel(null);
      }
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setConfirmDelete(null);
    }
  }

  const q = search.toLowerCase();
  const filteredToolkits = toolkits.filter(
    (t) => !q || t.brand_name.toLowerCase().includes(q)
  );
  const filteredCompetitors = competitors.filter(
    (c) =>
      !q ||
      c.competitor_name.toLowerCase().includes(q) ||
      (c.industry ?? "").toLowerCase().includes(q)
  );
  const filteredTrends = trends.filter(
    (t) => !q || t.industry.toLowerCase().includes(q)
  );

  const counts: Record<TabKey, number> = {
    toolkits: toolkits.length,
    competitors: competitors.length,
    trends: trends.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Library</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            All your generated toolkits, analyses, and reports.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved items…"
            className="w-full rounded-lg border border-[#1a1a1a] bg-[#111] py-2 pl-8 pr-3 text-sm text-white placeholder-[#4a4a4a] outline-none transition-colors focus:border-[#2a2a2a]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-center gap-0 border-b border-[#1a1a1a] min-w-max md:min-w-0">
          {(Object.keys(TAB_META) as TabKey[]).map((key) => {
            const { label, Icon } = TAB_META[key];
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTab(key);
                  setConfirmDelete(null);
                }}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "border-[#ff2d55] text-white"
                    : "border-transparent text-[#6b7280] hover:text-white"
                )}
              >
                <Icon size={13} />
                {label}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-xs",
                    active ? "bg-[#ff2d55]/20 text-[#ff2d55]" : "bg-[#1a1a1a] text-[#4a4a4a]"
                  )}
                >
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {tab === "toolkits" && (
        <TabContent
          isEmpty={filteredToolkits.length === 0}
          tabKey="toolkits"
          search={search}
          meta={TAB_META.toolkits}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredToolkits.map((tk) => {
              const result = tk.result as unknown as ToolkitResult;
              return (
                <div
                  key={tk.id}
                  className="flex flex-col justify-between rounded-xl border border-[#1a1a1a] bg-[#111] p-5 transition-colors hover:border-[#2a2a2a]"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-snug text-white">{tk.brand_name}</p>
                      <TimeAgo
                        dateStr={tk.created_at}
                        className="shrink-0 font-mono text-xs text-[#4a4a4a]"
                      />
                    </div>
                    <p className="font-mono text-xs text-[#4a4a4a]">
                      {result.posts?.length ?? 0} posts ·{" "}
                      {result.keywords?.length ?? 0} keywords ·{" "}
                      {result.captions?.length ?? 0} captions
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywords?.slice(0, 3).map((kw) => (
                        <span
                          key={kw.id}
                          className="inline-flex items-center rounded-md border border-[#ff2d55]/20 bg-[#ff2d55]/10 px-2 py-0.5 font-mono text-xs text-[#ff2d55]"
                        >
                          {kw.chinese}
                        </span>
                      ))}
                    </div>
                  </div>
                  <CardActions
                    id={tk.id}
                    tabKey="toolkits"
                    confirmDelete={confirmDelete}
                    deleting={deleting}
                    onView={() => setPanel({ type: "toolkit", data: tk })}
                    onConfirm={() => setConfirmDelete(tk.id)}
                    onCancel={() => setConfirmDelete(null)}
                    onDelete={() => handleDelete("toolkits", tk.id)}
                  />
                </div>
              );
            })}
          </div>
        </TabContent>
      )}

      {tab === "competitors" && (
        <TabContent
          isEmpty={filteredCompetitors.length === 0}
          tabKey="competitors"
          search={search}
          meta={TAB_META.competitors}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompetitors.map((c) => {
              const result = c.result as unknown as CompetitorResult;
              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-xl border border-[#1a1a1a] bg-[#111] p-5 transition-colors hover:border-[#2a2a2a]"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-snug text-white">
                        {c.competitor_name}
                      </p>
                      <TimeAgo
                        dateStr={c.created_at}
                        className="shrink-0 font-mono text-xs text-[#4a4a4a]"
                      />
                    </div>
                    {c.industry && (
                      <Badge variant="secondary" className="text-xs">
                        {c.industry}
                      </Badge>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywords?.slice(0, 3).map((kw) => (
                        <span
                          key={kw.id}
                          className="inline-flex items-center rounded-md border border-[#3b82f6]/20 bg-[#3b82f6]/10 px-2 py-0.5 font-mono text-xs text-[#3b82f6]"
                        >
                          {kw.chinese}
                        </span>
                      ))}
                    </div>
                    <p className="font-mono text-xs text-[#4a4a4a]">
                      {result.keywords?.length ?? 0} keywords ·{" "}
                      {result.contentAngles?.length ?? 0} angles ·{" "}
                      {result.gapOpportunities?.length ?? 0} gaps
                    </p>
                  </div>
                  <CardActions
                    id={c.id}
                    tabKey="competitors"
                    confirmDelete={confirmDelete}
                    deleting={deleting}
                    onView={() => setPanel({ type: "competitor", data: c })}
                    onConfirm={() => setConfirmDelete(c.id)}
                    onCancel={() => setConfirmDelete(null)}
                    onDelete={() => handleDelete("competitors", c.id)}
                  />
                </div>
              );
            })}
          </div>
        </TabContent>
      )}

      {tab === "trends" && (
        <TabContent
          isEmpty={filteredTrends.length === 0}
          tabKey="trends"
          search={search}
          meta={TAB_META.trends}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrends.map((t) => {
              const result = t.result as unknown as TrendsResult;
              const topTrends = result.trends?.slice(0, 3) ?? [];
              return (
                <div
                  key={t.id}
                  className="flex flex-col justify-between rounded-xl border border-[#1a1a1a] bg-[#111] p-5 transition-colors hover:border-[#2a2a2a]"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-snug text-white">{t.industry}</p>
                      <TimeAgo
                        dateStr={t.created_at}
                        className="shrink-0 font-mono text-xs text-[#4a4a4a]"
                      />
                    </div>
                    <p className="font-mono text-xs text-[#4a4a4a]">
                      {result.trends?.length ?? 0} trending topics
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {topTrends.map((tr) => (
                        <span
                          key={tr.id}
                          className="inline-flex items-center rounded-md border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-2 py-0.5 font-mono text-xs text-[#f59e0b]"
                        >
                          {tr.chinese}
                        </span>
                      ))}
                    </div>
                  </div>
                  <CardActions
                    id={t.id}
                    tabKey="trends"
                    confirmDelete={confirmDelete}
                    deleting={deleting}
                    onView={() => setPanel({ type: "trend", data: t })}
                    onConfirm={() => setConfirmDelete(t.id)}
                    onCancel={() => setConfirmDelete(null)}
                    onDelete={() => handleDelete("trends", t.id)}
                  />
                </div>
              );
            })}
          </div>
        </TabContent>
      )}

      {/* Slide-out panel */}
      {panel && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={closePanel}
          />
          <div className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 z-50 flex w-full md:max-w-2xl flex-col border-l border-[#1a1a1a] bg-[#0a0a0a] shadow-2xl transition-transform duration-300">
            {/* Panel header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#1a1a1a] px-6 py-4">
              <div className="flex items-center gap-2.5">
                {panel.type === "toolkit" && (
                  <>
                    <Wand2 size={14} className="text-[#ff2d55]" />
                    <span className="font-semibold text-white">
                      {(panel.data as ToolkitItem).brand_name}
                    </span>
                  </>
                )}
                {panel.type === "competitor" && (
                  <>
                    <Search size={14} className="text-[#3b82f6]" />
                    <span className="font-semibold text-white">
                      {(panel.data as SavedCompetitorRow).competitor_name}
                    </span>
                    {(panel.data as SavedCompetitorRow).industry && (
                      <Badge variant="secondary" className="text-xs">
                        {(panel.data as SavedCompetitorRow).industry}
                      </Badge>
                    )}
                  </>
                )}
                {panel.type === "trend" && (
                  <>
                    <TrendingUp size={14} className="text-[#f59e0b]" />
                    <span className="font-semibold text-white">
                      {(panel.data as SavedTrendRow).industry}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <TimeAgo
                  dateStr={panel.data.created_at}
                  className="font-mono text-xs text-[#4a4a4a]"
                />
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-md p-1.5 text-[#4a4a4a] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {panel.type === "toolkit" && (() => {
                const result = (panel.data as ToolkitItem).result as unknown as ToolkitResult;
                return (
                  <>
                    <PostsGrid posts={result.posts ?? []} />
                    <KeywordsPanel keywords={result.keywords ?? []} />
                    <CaptionsPanel captions={result.captions ?? []} />
                    <div className="pt-2 pb-4">
                      <Link
                        href={`/saved/${panel.data.id}`}
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-[#ff2d55] hover:underline"
                      >
                        Open full page
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  </>
                );
              })()}

              {panel.type === "competitor" && (() => {
                const data = panel.data as SavedCompetitorRow;
                const result = data.result as unknown as CompetitorResult;
                return (
                  <CompetitorResultPanel
                    result={result}
                    competitorName={data.competitor_name}
                  />
                );
              })()}

              {panel.type === "trend" && (() => {
                const result = (panel.data as SavedTrendRow).result as unknown as TrendsResult;
                return (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(result.trends ?? []).map((trend) => (
                      <TrendCard key={trend.id} trend={trend} />
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TabContent({
  isEmpty,
  tabKey,
  search,
  meta,
  children,
}: {
  isEmpty: boolean;
  tabKey: TabKey;
  search: string;
  meta: (typeof TAB_META)[TabKey];
  children: React.ReactNode;
}) {
  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#0d0d0d] p-12 text-center">
        <meta.Icon size={28} className="mx-auto mb-3 text-[#2a2a2a]" />
        <p className="text-sm text-[#4a4a4a]">
          {search ? `No ${meta.label.toLowerCase()} match "${search}".` : meta.emptyMsg}
        </p>
        {!search && (
          <Link
            href={meta.emptyHref}
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-[#ff2d55] hover:underline"
          >
            {meta.emptyAction}
            <ArrowRight size={11} />
          </Link>
        )}
      </div>
    );
  }
  return <>{children}</>;
}

function CardActions({
  id,
  tabKey,
  confirmDelete,
  deleting,
  onView,
  onConfirm,
  onCancel,
  onDelete,
}: {
  id: string;
  tabKey: TabKey;
  confirmDelete: string | null;
  deleting: Set<string>;
  onView: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const isConfirming = confirmDelete === id;
  const isDeleting = deleting.has(id);

  return (
    <div className="mt-4 border-t border-[#1a1a1a] pt-4">
      {isConfirming ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-[#6b7280]">Delete permanently?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-2.5 py-1 text-xs text-[#6b7280] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={10} className="animate-spin" /> : null}
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#ff2d55] hover:underline"
          >
            View full result
            <ArrowRight size={10} />
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md p-1.5 text-[#4a4a4a] transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
