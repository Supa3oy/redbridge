export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { PerformanceClient } from "@/components/performance/PerformanceClient";
import type { PostMetric } from "@/types/database";

export default async function PerformancePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data } = await supabaseAdmin
    .from("post_metrics")
    .select("*")
    .eq("user_id", userId)
    .order("posted_at", { ascending: false });

  const metrics = (data ?? []) as unknown as PostMetric[];

  return <PerformanceClient initialMetrics={metrics} />;
}
