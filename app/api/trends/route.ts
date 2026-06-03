import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, buildChineseCalendarContext } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAndIncrementUsage } from "@/lib/usage";
import type { Plan } from "@/lib/anthropic";
import type { TrendsResult } from "@/types/database";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  console.log("[trends/api] userId:", userId);

  const { searchParams } = new URL(req.url);
  const industry = searchParams.get("industry");
  const forceRefresh = searchParams.get("forceRefresh") === "true";

  if (!industry) {
    return NextResponse.json({ error: "Missing industry" }, { status: 400 });
  }

  // Check shared cache (skip if forceRefresh)
  if (!forceRefresh) {
    const { data: cached } = await supabaseAdmin
      .from("trends_cache")
      .select("result, updated_at")
      .eq("industry", industry)
      .single();

    if (cached) {
      const ageMs = Date.now() - new Date(cached.updated_at).getTime();
      if (ageMs < CACHE_TTL_MS) {
        const cacheAge = Math.floor(ageMs / 86_400_000);
        const result = cached.result as unknown as TrendsResult;

        // Insert into user's personal history on cache hit
        const { error: saveErr } = await supabaseAdmin.from("saved_trends").insert({
          user_id: userId,
          industry,
          result: cached.result,
          created_at: new Date().toISOString(),
        });
        if (saveErr) {
          console.error("[trends/api] saved_trends cache-hit insert error:", saveErr.code, saveErr.message);
        } else {
          console.log("[trends/api] saved_trends inserted (cache hit) for user:", userId, "industry:", industry);
        }

        return NextResponse.json({ result, cached: true, cacheAge });
      }
    }
  }

  // Quota check — only for fresh AI generation
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = ((user?.plan as Plan) ?? "free") as Plan;

  const { allowed, used, limit } = await checkAndIncrementUsage(userId, plan);
  if (!allowed) {
    return NextResponse.json(
      { error: `Monthly limit of ${limit} generations reached. Upgrade to continue.` },
      { status: 429 }
    );
  }

  const prompt = `You are an expert Xiaohongshu (小红书) trends analyst tracking what is currently popular with Chinese consumers in Australia and on XHS globally.

${buildChineseCalendarContext()}

Generate 12 trending topics and hashtags on Xiaohongshu for the "${industry}" industry, relevant to Australian brands targeting Chinese consumers. Trends must reflect the current Chinese season and any upcoming festivals listed above.

Return a JSON object with this exact structure:
{
  "trends": [array of 12 objects with:
    id (number 1-12),
    chinese (trending Chinese keyword or hashtag, 2-8 characters),
    pinyin (romanized pronunciation),
    english (English translation),
    direction (one of exactly: "rising" | "hot" | "new"),
    description (2 sentences: why this topic is trending now on XHS, and a specific way an Australian brand in this industry could create content around it),
    industry (string — "${industry}")
  ]
}

Trends should be:
- Current and active on XHS in 2024-2025
- Authentic to XHS culture and how Chinese consumers discover products
- Actionable and specific for ${industry} brands in Australia
- A mix of seasonal, lifestyle, product-discovery, and cultural angles

Return ONLY the JSON object, no explanation.`;

  let message;
  try {
    message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });
  }

  let parsed: { trends: TrendsResult["trends"] };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });
  }

  const updatedAt = new Date().toISOString();
  const result: TrendsResult = { trends: parsed.trends, updatedAt };

  const [cacheRes, savedRes] = await Promise.all([
    supabaseAdmin.from("trends_cache").upsert({
      industry,
      result: result as unknown as import("@/types/database").Json,
      updated_at: updatedAt,
    }),
    supabaseAdmin.from("saved_trends").insert({
      user_id: userId,
      industry,
      result: result as unknown as import("@/types/database").Json,
      created_at: updatedAt,
    }),
  ]);

  if (cacheRes.error) {
    console.error("[trends/api] trends_cache upsert error:", cacheRes.error.code, cacheRes.error.message);
  }
  if (savedRes.error) {
    console.error("[trends/api] saved_trends insert error:", savedRes.error.code, savedRes.error.message);
  } else {
    console.log("[trends/api] saved_trends inserted (fresh) for user:", userId, "industry:", industry);
  }

  return NextResponse.json({ result, cached: false, cacheAge: 0, used, limit });
}
