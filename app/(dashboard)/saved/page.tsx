export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SavedClient } from "@/components/saved/SavedClient";
import type { SavedCompetitorRow, SavedTrendRow } from "@/types/database";

export default async function SavedPage() {
  const { userId } = await auth();

  const [
    { data: toolkitsData },
    { data: competitorsData },
    { data: trendsData },
  ] = await Promise.all([
    supabaseAdmin
      .from("toolkits")
      .select("id, brand_name, result, created_at")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("saved_competitors")
      .select("id, user_id, competitor_name, industry, result, created_at")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("saved_trends")
      .select("id, user_id, industry, result, created_at")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <SavedClient
      initialToolkits={(toolkitsData ?? []) as Parameters<typeof SavedClient>[0]["initialToolkits"]}
      initialCompetitors={(competitorsData ?? []) as SavedCompetitorRow[]}
      initialTrends={(trendsData ?? []) as SavedTrendRow[]}
    />
  );
}
