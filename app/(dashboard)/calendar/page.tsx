export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { CalendarClient } from "@/components/calendar/CalendarClient";
import type { ToolkitResult } from "@/types/database";

export default async function CalendarPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: toolkit } = await supabaseAdmin
    .from("toolkits")
    .select("id, brand_name, result, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const result = toolkit?.result as unknown as ToolkitResult | null;
  const posts = result?.posts ?? [];

  return (
    <CalendarClient
      posts={posts}
      brandName={toolkit?.brand_name ?? null}
      toolkitId={toolkit?.id ?? null}
    />
  );
}
