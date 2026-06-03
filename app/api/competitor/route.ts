import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, MODEL_BY_PLAN, buildChineseCalendarContext } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAndIncrementUsage } from "@/lib/usage";
import type { Plan } from "@/lib/anthropic";
import type { CompetitorResult } from "@/types/database";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  console.log("[competitor/api] userId:", userId);

  const { competitorName, industry, forceRefresh } = await req.json();
  if (!competitorName) {
    return NextResponse.json({ error: "Missing competitor name" }, { status: 400 });
  }

  const normalised = competitorName.trim();

  // Check user's own saved analysis (skip if forceRefresh)
  if (!forceRefresh) {
    const sevenDaysAgo = new Date(Date.now() - CACHE_TTL_MS).toISOString();
    const { data: prior, error: lookupErr } = await supabaseAdmin
      .from("saved_competitors")
      .select("result, created_at")
      .eq("user_id", userId)
      .ilike("competitor_name", normalised)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupErr) {
      console.error("[competitor/api] saved_competitors lookup error:", lookupErr.code, lookupErr.message);
    } else {
      console.log("[competitor/api] cache lookup for", normalised, "→", prior ? "HIT" : "MISS");
    }

    if (prior) {
      const cacheAge = Math.floor(
        (Date.now() - new Date(prior.created_at).getTime()) / 86_400_000
      );
      return NextResponse.json({
        result: prior.result,
        cached: true,
        cacheAge,
      });
    }
  }

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

  const model = MODEL_BY_PLAN[plan];

  const prompt = `You are an expert Xiaohongshu (小红书) content strategist with deep knowledge of how brands market to Chinese consumers in Australia and China.

${buildChineseCalendarContext()}

Analyse "${normalised}" as a competitor for an Australian brand on Xiaohongshu.${industry ? ` Industry: ${industry}.` : ""}

Return a JSON object with this exact structure:
{
  "keywords": [array of 12 objects with: id (number), chinese (Chinese keyword they likely target), pinyin (romanized), english (English translation), heatScore (number 1-100 representing current XHS search popularity), category (string), seasonalRelevance (string — one sentence on why Chinese consumers are searching this RIGHT NOW, referencing current Chinese season or upcoming festival)],
  "contentTone": {
    "style": (string — brief label describing their overall voice, e.g. "Minimalist Luxury" or "Approachable Wellness"),
    "description": (2-3 sentences describing their XHS voice, visual style, and content approach),
    "examples": [array of 3 strings — specific post concepts that match their style]
  },
  "contentAngles": [array of 5 objects with: id (number), title (string), description (string — how they use this angle on XHS)],
  "gapOpportunities": [array of 3 objects with: id (number), title (string), description (string — what they are missing or underserving), angle (string — specific content angle a competitor could own)]
}

Base your analysis on known characteristics of this brand's marketing, aesthetic, and customer positioning. Gap opportunities should be specific and actionable — real topics or angles this brand underserves on XHS that a competitor could own.

Return ONLY the JSON object, no explanation.`;

  let message;
  try {
    message = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI analysis failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });
  }

  let result: CompetitorResult;
  try {
    result = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });
  }

  const { error: saveErr } = await supabaseAdmin.from("saved_competitors").insert({
    user_id: userId,
    competitor_name: normalised,
    industry: industry ?? null,
    result: result as unknown as import("@/types/database").Json,
    created_at: new Date().toISOString(),
  });

  if (saveErr) {
    console.error("[competitor/api] saved_competitors insert error:", saveErr.code, saveErr.message);
  } else {
    console.log("[competitor/api] saved_competitors inserted for user:", userId, "competitor:", normalised);
  }

  return NextResponse.json({ result, cached: false, used, limit });
}
