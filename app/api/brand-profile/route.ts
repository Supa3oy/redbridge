import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("users")
    .select("brand_name, industry, website_url, target_audience, selling_points")
    .eq("id", userId)
    .single();

  return NextResponse.json({ profile: data ?? null });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brand_name, industry, website_url, target_audience, selling_points } = await req.json();

  const { error } = await supabaseAdmin
    .from("users")
    .update({
      brand_name: brand_name ?? null,
      industry: industry ?? null,
      website_url: website_url ?? null,
      target_audience: target_audience ?? [],
      selling_points: selling_points ?? null,
    })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
