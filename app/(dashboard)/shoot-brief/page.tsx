export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { ShootBriefClient } from "@/components/shoot-brief/ShootBriefClient";
import type { SavedShootBrief, ShootBriefResult } from "@/types/database";

export default async function ShootBriefPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data } = await supabaseAdmin
    .from("shoot_briefs")
    .select("id, brand_name, product_name, angle, result, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const briefs = (data ?? []).map((row) => ({
    ...row,
    result: row.result as unknown as ShootBriefResult,
  })) as SavedShootBrief[];

  return <ShootBriefClient initialBriefs={briefs} />;
}
