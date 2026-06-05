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

  const { data } = await supabaseAdmin
    .from("intelligence_reports")
    .select("id, brand_name, industry, result, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ report: data ?? null });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brandName, industry, websiteUrl, targetAudience, productDescription } = await req.json();
  if (!brandName || !industry || !productDescription) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: user } = await supabaseAdmin.from("users").select("plan").eq("id", userId).single();
  const plan = ((user?.plan ?? "free") as Plan);

  const { allowed, used, limit } = await checkAndIncrementUsage(userId, plan);
  if (!allowed) {
    return NextResponse.json(
      { error: `Monthly limit of ${limit} generations reached. Upgrade to continue.` },
      { status: 429 }
    );
  }

  const model = MODEL_BY_PLAN[plan];
  const audienceLine = Array.isArray(targetAudience) && targetAudience.length
    ? `\nTarget Audience: ${targetAudience.join(", ")}`
    : "";

  const prompt = `You are a senior Chinese consumer intelligence analyst specialising in how Australian brands can succeed on Xiaohongshu (小红书).

${buildChineseCalendarContext()}

Brand: ${brandName}
Industry: ${industry}
About: ${productDescription}${websiteUrl ? `\nWebsite: ${websiteUrl}` : ""}${audienceLine}

Generate a comprehensive Chinese Consumer Intelligence Report. Be specific, data-informed, and actionable.

Return ONLY valid JSON:
{
  "brandPerceptionScore": <number 1-100 — how well the brand currently translates to Chinese consumers>,
  "culturalTranslationGap": {
    "headline": "<one punchy insight about the biggest translation gap>",
    "description": "<2 sentences explaining the core gap>",
    "gaps": [
      {
        "aspect": "<Brand Voice | Hero Benefit | Visual Language | Price Signal | etc>",
        "australian": "<how the brand currently presents this aspect>",
        "chinese": "<how Chinese XHS consumers read/interpret it>",
        "recommendation": "<specific, actionable recommendation with Chinese term if applicable>"
      }
    ]
  },
  "marketOpportunity": {
    "score": <number 1-100>,
    "headline": "<one sentence on the market opportunity>",
    "description": "<2 sentences on why there is opportunity>",
    "segments": ["<audience segment 1>", "<segment 2>", "<segment 3>"]
  },
  "xhsPositioning": {
    "recommendedNarrative": "<2-3 sentences: the core story this brand should tell on XHS>",
    "toneOfVoice": "<one sentence on how to sound on XHS>",
    "visualStyle": "<one sentence on how to look on XHS>",
    "contentPillars": ["<pillar 1>", "<pillar 2>", "<pillar 3>"]
  },
  "consumerInsights": [
    {"insight": "<specific insight about Chinese consumer behaviour in this category>", "implication": "<what this means for this brand>"},
    {"insight": "...", "implication": "..."},
    {"insight": "...", "implication": "..."}
  ],
  "quickWins": [
    "<specific, immediately actionable quick win 1>",
    "<quick win 2>",
    "<quick win 3>"
  ]
}

The culturalTranslationGap must have 4 gap rows. Be specific and brutally honest — the value is in the truth.
Return ONLY the JSON object.`;

  let message;
  try {
    message = await anthropic.messages.create({
      model,
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });

  let result: IntelligenceReport;
  try {
    result = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });
  }

  const { data: saved } = await supabaseAdmin
    .from("intelligence_reports")
    .insert({
      user_id: userId,
      brand_name: brandName,
      industry,
      result: result as unknown as import("@/types/database").Json,
    })
    .select("id")
    .single();

  return NextResponse.json({ result, reportId: saved?.id, used, limit });
}
