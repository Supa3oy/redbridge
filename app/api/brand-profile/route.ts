import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("brand_name, industry, website_url, target_audience, selling_points")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[brand-profile GET]", error);
  }

  return NextResponse.json({ profile: data ?? null });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { brand_name, industry, website_url, target_audience, selling_points } = body;

  // Upsert so the call works whether or not a row exists yet
  const { error } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        id: userId,
        email: "", // ignored on conflict, but satisfies not-null on insert
        brand_name: (brand_name as string) ?? null,
        industry: (industry as string) ?? null,
        website_url: (website_url as string) ?? null,
        target_audience: (target_audience as unknown[]) ?? [],
        selling_points: (selling_points as string) ?? null,
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("[brand-profile PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
