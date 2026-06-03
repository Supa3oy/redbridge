import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { skip, brandName, websiteUrl, industry, targetAudience, sellingPoints } = body as {
    skip?: boolean;
    brandName?: string;
    websiteUrl?: string;
    industry?: string;
    targetAudience?: string[];
    sellingPoints?: string;
  };

  // Ensure the user row exists (Clerk webhook may not have fired in dev)
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!existingUser) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
    const { error: insertErr } = await supabaseAdmin.from("users").insert({
      id: userId,
      email,
      plan: "free",
      usage_count: 0,
    });
    if (insertErr) {
      console.error("[onboarding/api] user provision error:", insertErr.code, insertErr.message);
    }
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({
      onboarding_completed: true,
      ...(skip
        ? {}
        : {
            brand_name: brandName ?? null,
            website_url: websiteUrl ?? null,
            industry: industry ?? null,
            target_audience: Array.isArray(targetAudience) ? targetAudience : [],
            selling_points: sellingPoints ?? null,
          }),
    })
    .eq("id", userId);

  if (error) {
    console.error("[onboarding/api] update error:", error.code, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
