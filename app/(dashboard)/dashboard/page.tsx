export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Greeting } from "@/components/dashboard/Greeting";
import { TimeAgo } from "@/components/ui/time-ago";
import { cn } from "@/lib/utils";
import { LIMITS_BY_PLAN } from "@/lib/anthropic";
import type { Plan } from "@/lib/anthropic";
import type { ToolkitResult } from "@/types/database";
import {
  Wand2,
  Hash,
  Search,
  TrendingUp,
  Bookmark,
  ArrowRight,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    href: "/generate",
    icon: Wand2,
    label: "Generate Toolkit",
    desc: "Create XHS post ideas, keywords & captions for your brand.",
    color: "#ff2d55",
  },
  {
    href: "/competitor",
    icon: Search,
    label: "Analyse Competitor",
    desc: "Uncover any brand's XHS keywords, tone, and content gaps.",
    color: "#3b82f6",
  },
  {
    href: "/trends",
    icon: TrendingUp,
    label: "View Trends",
    desc: "This week's top trending topics on Xiaohongshu by industry.",
    color: "#f59e0b",
  },
  {
    href: "/saved",
    icon: Bookmark,
    label: "Saved Library",
    desc: "Browse all your generated toolkits, analyses, and reports.",
    color: "#10b981",
  },
];

const ACTIVITY_META: Record<string, { label: string; color: string; Icon: typeof Wand2 }> = {
  toolkit: { label: "Toolkit generated", color: "#ff2d55", Icon: Wand2 },
  competitor: { label: "Competitor analysed", color: "#3b82f6", Icon: Search },
  trend: { label: "Trends report", color: "#f59e0b", Icon: TrendingUp },
};

export default async function DashboardPage() {
  const [authData, user] = await Promise.all([auth(), currentUser()]);
  const { userId } = authData;

  const [
    { data: allToolkits },
    { data: allCompetitors },
    { data: allTrends },
    { data: userData },
  ] = await Promise.all([
    supabaseAdmin
      .from("toolkits")
      .select("id, brand_name, result, created_at")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("saved_competitors")
      .select("id, competitor_name, industry, created_at")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("saved_trends")
      .select("id, industry, created_at")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("users")
      .select("plan, usage_count, usage_reset_at, onboarding_completed")
      .eq("id", userId!)
      .single(),
  ]);

  // Redirect new users to onboarding (no toolkits + not completed)
  const toolkitCount = allToolkits?.length ?? 0;
  if (!userData?.onboarding_completed && toolkitCount === 0) {
    redirect("/onboarding");
  }

  // Stats
  const keywordCount =
    allToolkits?.reduce(
      (sum, tk) => sum + ((tk.result as unknown as ToolkitResult)?.keywords?.length ?? 0),
      0
    ) ?? 0;
  const competitorCount = new Set(
    (allCompetitors ?? []).map((c) => c.competitor_name.toLowerCase())
  ).size;
  const trendCount = new Set((allTrends ?? []).map((t) => t.industry)).size;

  const stats = [
    { label: "Toolkits Generated", value: toolkitCount, Icon: Wand2, color: "#ff2d55" },
    { label: "Keywords Researched", value: keywordCount, Icon: Hash, color: "#3b82f6" },
    { label: "Competitors Analysed", value: competitorCount, Icon: Search, color: "#8b5cf6" },
    { label: "Trends Reports", value: trendCount, Icon: TrendingUp, color: "#f59e0b" },
  ];

  // Recent activity — merge + sort top 5
  const activities = [
    ...(allToolkits ?? []).map((t) => ({
      type: "toolkit",
      id: t.id,
      label: t.brand_name,
      href: `/saved/${t.id}`,
      createdAt: t.created_at,
    })),
    ...(allCompetitors ?? []).map((c) => ({
      type: "competitor",
      id: c.id,
      label: c.competitor_name,
      href: "/competitor",
      createdAt: c.created_at,
    })),
    ...(allTrends ?? []).map((t) => ({
      type: "trend",
      id: t.id,
      label: t.industry,
      href: "/trends",
      createdAt: t.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Usage
  const plan = ((userData?.plan ?? "free") as Plan);
  const used = userData?.usage_count ?? 0;
  const limit = LIMITS_BY_PLAN[plan].generations;
  const pct = limit ? Math.min(Math.round((used / limit) * 100), 100) : 0;
  const barColor =
    pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500";
  const daysUntilReset = userData?.usage_reset_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(userData.usage_reset_at).getTime() - Date.now()) / 86_400_000
        )
      )
    : 0;

  // Display name
  const displayName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "there";

  // Date string
  const dateStr = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-white md:text-2xl">
          <Greeting name={displayName} />
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">{dateStr}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5"
          >
            <div className="flex items-start justify-between">
              <p className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">
                {label}
              </p>
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums text-white">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Usage */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs uppercase tracking-widest text-[#6b7280]">
              Monthly Usage
            </span>
            <span className="rounded-full border border-[#2a2a2a] px-2 py-0.5 font-mono text-xs capitalize text-[#6b7280]">
              {plan}
            </span>
          </div>
          <span className="font-mono text-sm text-white">
            {used}
            <span className="text-[#4a4a4a]"> / {limit ?? "∞"}</span>
          </span>
        </div>
        {limit !== null && (
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
            <div
              className={cn("h-full rounded-full transition-all", barColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#4a4a4a]">
            {daysUntilReset} day{daysUntilReset !== 1 ? "s" : ""} until reset
          </span>
          {plan === "free" && (
            <Link
              href="/settings"
              className="font-mono text-[#ff2d55] hover:underline"
            >
              Upgrade →
            </Link>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">
          Recent Activity
        </h2>
        <div className="rounded-xl border border-[#1a1a1a] bg-[#111] divide-y divide-[#1a1a1a]">
          {activities.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-[#4a4a4a]">
                No activity yet — generate your first toolkit to get started.
              </p>
            </div>
          ) : (
            activities.map((item) => {
              const meta = ACTIVITY_META[item.type];
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="shrink-0 rounded-md p-2"
                      style={{ backgroundColor: `${meta.color}18` }}
                    >
                      <meta.Icon size={13} style={{ color: meta.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {item.label}
                      </p>
                      <p className="font-mono text-xs text-[#4a4a4a]">
                        {meta.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                    <TimeAgo
                      dateStr={item.createdAt}
                      className="font-mono text-xs text-[#4a4a4a]"
                    />
                    <Link
                      href={item.href}
                      className="font-mono text-xs text-[#ff2d55] hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-[#1a1a1a] bg-[#111] p-6 transition-colors hover:border-[#2a2a2a] hover:bg-[#161616]"
            >
              <div className="flex items-start justify-between">
                <div
                  className="rounded-lg p-2.5"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
                <ArrowRight
                  size={14}
                  className="text-[#2a2a2a] transition-colors group-hover:text-[#6b7280]"
                />
              </div>
              <div className="mt-4 space-y-1">
                <p className="font-semibold text-white">{label}</p>
                <p className="text-sm leading-relaxed text-[#6b7280]">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
