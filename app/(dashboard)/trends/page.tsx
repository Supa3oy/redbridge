export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { TrendsGenerator } from "@/components/trends/TrendsGenerator";
import type { SavedTrendRow } from "@/types/database";

export default async function TrendsPage() {
  const { userId } = await auth();

  const { data, error } = await supabaseAdmin
    .from("saved_trends")
    .select("id, user_id, industry, result, created_at")
    .eq("user_id", userId!)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[trends/page] saved_trends fetch error:", error.code, error.message);
  }
  console.log("[trends/page] userId:", userId, "| rows:", data?.length ?? 0);

  const history = (data ?? []) as SavedTrendRow[];

  return <TrendsGenerator initialHistory={history} />;
}
