export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { IntelligenceClient } from "@/components/intelligence/IntelligenceClient";
import type { IntelligenceReport } from "@/types/database";

export default async function IntelligencePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [{ data: user }, { data: report }] = await Promise.all([
    supabaseAdmin
      .from("users")
      .select("brand_name, industry, website_url, target_audience, selling_points")
      .eq("id", userId)
      .single(),
    supabaseAdmin
      .from("intelligence_reports")
      .select("id, brand_name, industry, result, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <IntelligenceClient
      profile={{
        brandName: user?.brand_name ?? "",
        industry: user?.industry ?? "",
        websiteUrl: user?.website_url ?? "",
        targetAudience: (user?.target_audience as string[]) ?? [],
        productDescription: user?.selling_points ?? "",
      }}
      initialReport={
        report
          ? {
              id: report.id,
              brand_name: report.brand_name,
              industry: report.industry,
              result: report.result as unknown as IntelligenceReport,
              created_at: report.created_at,
            }
          : null
      }
    />
  );
}
