export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { BrandProfileClient } from "@/components/intelligence/BrandProfileClient";

export default async function BrandProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("brand_name, industry, website_url, target_audience, selling_points")
    .eq("id", userId)
    .single();

  return (
    <BrandProfileClient
      initialProfile={{
        brand_name: user?.brand_name ?? "",
        industry: user?.industry ?? "",
        website_url: user?.website_url ?? "",
        target_audience: (user?.target_audience as string[]) ?? [],
        selling_points: user?.selling_points ?? "",
      }}
    />
  );
}
