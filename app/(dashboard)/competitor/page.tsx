export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { CompetitorPageClient } from "@/components/competitor/CompetitorPageClient";
import type { SavedCompetitorRow } from "@/types/database";

export default async function CompetitorPage() {
  const { userId } = await auth();

  const { data, error } = await supabaseAdmin
    .from("saved_competitors")
    .select("id, user_id, competitor_name, industry, result, created_at")
    .eq("user_id", userId!)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[competitor/page] saved_competitors fetch error:", error.code, error.message);
  }
  console.log("[competitor/page] userId:", userId, "| rows:", data?.length ?? 0);

  const analyses = (data ?? []) as SavedCompetitorRow[];

  return <CompetitorPageClient initialAnalyses={analyses} />;
}
