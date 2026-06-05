import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, MODEL_BY_PLAN, buildChineseCalendarContext } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAndIncrementUsage } from "@/lib/usage";
import type { Plan } from "@/lib/anthropic";
import type { IntelligenceReport } from "@/types/database";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data, error } = await supabaseAdmin
      .from("intelligence_reports")
      .select("id, brand_name, industry, result, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) console.error("[intelligence GET]", error);
    return NextResponse.json({ report: data ?? null });
  } catch (err) {
    console.error("[intelligence GET] exception:", err);
    return NextResponse.json({ report: null });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { brandName, industry, websiteUrl, targetAudience, productDescription } = body;

    if (!brandName || !industry || !productDescription) {
      return NextResponse.json({ error: "Missing required fields: brandName, industry, productDescription" }, { status: 400 });
    }

    // Get user plan (default free if row missing — usage fn will provision)
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("plan")
      .eq("id", userId)
      .maybeSingle();

    const plan = ((user?.plan ?? "free") as Plan);

    // Check + increment usage quota
    const { allowed, used, limit } = await checkAndIncrementUsage(userId, plan);
    if (!allowed) {
      return NextResponse.json(
        { error: `Monthly limit of ${limit} generations reached. Upgrade to continue.` },
        { status: 429 }
      );
    }

    const model = MODEL_BY_PLAN[plan];
    const audienceLine =
      Array.isArray(targetAudience) && targetAudience.length
        ? `\nTarget Audience: ${targetAudience.join(", ")}`
        : "";

    const prompt = `You are a senior Chinese consumer intelligence analyst specialising in how Australian brands can succeed on Xiaohongshu (小红书).

${buildChineseCalendarContext()}

Brand: ${brandName}
Industry: ${industry}
About: ${productDescription}${websiteUrl ? `\nWebsite: ${websiteUrl}` : ""}${audienceLine}

Generate a comprehensive Chinese Consumer Intelligence Report. Be specific, data-informed, and actionable.

Return ONLY valid JSON with no markdown, no code fences, no explanation:
{
  "brandPerceptionScore": <number 1-100>,
  "culturalTranslationGap": {
    "headline": "<one punchy sentence about the biggest translation gap>",
    "description": "<2 sentences explaining the core gap>",
    "gaps": [
      {
        "aspect": "<e.g. Brand Voice>",
        "australian": "<how the brand currently presents this>",
        "chinese": "<how Chinese XHS consumers read/interpret it>",
        "recommendation": "<specific actionable recommendation>"
      },
      { "aspect": "...", "australian": "...", "chinese": "...", "recommendation": "..." },
      { "aspect": "...", "australian": "...", "chinese": "...", "recommendation": "..." },
      { "aspect": "...", "australian": "...", "chinese": "...", "recommendation": "..." }
    ]
  },
  "marketOpportunity": {
    "score": <number 1-100>,
    "headline": "<one sentence on the market opportunity>",
    "description": "<2 sentences on why there is opportunity>",
    "segments": ["<segment 1>", "<segment 2>", "<segment 3>"]
  },
  "xhsPositioning": {
    "recommendedNarrative": "<2-3 sentences: the core story to tell on XHS>",
    "toneOfVoice": "<one sentence on how to sound on XHS>",
    "visualStyle": "<one sentence on how to look on XHS>",
    "contentPillars": ["<pillar 1>", "<pillar 2>", "<pillar 3>"]
  },
  "consumerInsights": [
    {"insight": "<specific insight about Chinese consumer behaviour>", "implication": "<what this means for this brand>"},
    {"insight": "...", "implication": "..."},
    {"insight": "...", "implication": "..."}
  ],
  "quickWins": ["<quick win 1>", "<quick win 2>", "<quick win 3>"]
}`;

    // Call Claude
    let message;
    try {
      message = await anthropic.messages.create({
        model,
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI generation failed";
      console.error("[intelligence POST] Anthropic error:", msg);
      return NextResponse.json({ error: `AI generation failed: ${msg}` }, { status: 502 });
    }

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    console.log("[intelligence POST] raw AI response length:", raw.length);

    // Strip markdown fences if present
    const stripped = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```$/m, "").trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("[intelligence POST] no JSON found in response. raw:", raw.slice(0, 500));
      return NextResponse.json({ error: "AI response did not contain valid JSON" }, { status: 500 });
    }

    let result: IntelligenceReport;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[intelligence POST] JSON parse error:", parseErr, "raw match:", jsonMatch[0].slice(0, 300));
      return NextResponse.json({ error: "AI response JSON parsing failed" }, { status: 500 });
    }

    // Validate required fields exist
    if (
      typeof result.brandPerceptionScore !== "number" ||
      !result.culturalTranslationGap ||
      !result.marketOpportunity ||
      !result.xhsPositioning
    ) {
      console.error("[intelligence POST] result missing required fields:", JSON.stringify(result).slice(0, 300));
      return NextResponse.json({ error: "AI response missing required fields" }, { status: 500 });
    }

    // Save to Supabase — don't let a table error block the response
    let reportId: string | undefined;
    try {
      const { data: saved, error: insertError } = await supabaseAdmin
        .from("intelligence_reports")
        .insert({
          user_id: userId,
          brand_name: brandName,
          industry,
          result: result as unknown as import("@/types/database").Json,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[intelligence POST] insert error:", insertError);
      } else {
        reportId = saved?.id;
      }
    } catch (insertException) {
      console.error("[intelligence POST] insert exception:", insertException);
      // Continue — don't let a save failure block returning the result
    }

    return NextResponse.json({ result, reportId, used, limit });
  } catch (err) {
    console.error("[intelligence POST] unhandled exception:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
