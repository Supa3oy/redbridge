import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { anthropic, MODEL_BY_PLAN, LIMITS_BY_PLAN, buildChineseCalendarContext } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAndIncrementUsage } from "@/lib/usage";
import { buildCacheKey, getCachedResult, setCachedResult } from "@/lib/cache";
import type { Plan } from "@/lib/anthropic";
import type { ToolkitResult } from "@/types/database";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brandName, industry, audiences, tone, productDescription, websiteUrl } = await req.json();
  if (!brandName || !industry || !productDescription) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Get user plan
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = ((user?.plan as Plan) ?? "free") as Plan;

  // Check quota
  const { allowed, used, limit } = await checkAndIncrementUsage(userId, plan);
  if (!allowed) {
    return NextResponse.json(
      { error: `Monthly limit of ${limit} generations reached. Upgrade to continue.` },
      { status: 429 }
    );
  }

  // Check cache
  const cacheKey = buildCacheKey(industry, productDescription.slice(0, 100));
  const cached = await getCachedResult(cacheKey);
  if (cached) {
    const { data: savedTk } = await supabaseAdmin
      .from("toolkits")
      .insert({
        user_id: userId,
        brand_name: brandName,
        result: cached as unknown as import("@/types/database").Json,
      })
      .select("id")
      .single();
    revalidatePath("/saved");
    revalidatePath("/dashboard");
    return NextResponse.json({ result: cached, cached: true, used, limit, toolkitId: savedTk?.id });
  }

  const limits = LIMITS_BY_PLAN[plan];
  const model = MODEL_BY_PLAN[plan];

  const toneGuide: Record<string, string> = {
    "种草": "soft-sell organic discovery — write like a genuine friend recommendation, let the product fit naturally into life, never hard sell",
    "干货": "educational and informative — share tips, how-tos, and real value; posts should feel like useful guides readers bookmark",
    "故事": "narrative storytelling — open with a personal or relatable scenario, draw the reader in emotionally before introducing the product",
    "搞笑": "humorous and playful — use wit, relatable jokes, and a light-hearted tone; make content fun and shareable",
    "高端": "aspirational luxury — premium vocabulary, sophisticated tone, emphasise exclusivity and craftsmanship, evoke desire and status",
    "生活感": "warm everyday lifestyle — cozy, authentic, slice-of-life; make the product feel like a natural part of a beautiful daily routine",
  };

  const audienceLine = Array.isArray(audiences) && audiences.length > 0
    ? `\nTarget Audience: ${audiences.join(", ")}`
    : "";
  const toneLine = tone && toneGuide[tone]
    ? `\nContent Tone: ${tone} — ${toneGuide[tone]}`
    : "";

  const prompt = `You are an expert Xiaohongshu (小红书) content strategist for Australian brands entering the Chinese market.

${buildChineseCalendarContext()}

Brand: ${brandName}
Industry: ${industry}
Product: ${productDescription}${websiteUrl ? `\nWebsite: ${websiteUrl}` : ""}${audienceLine}${toneLine}

Generate a complete XHS content toolkit in valid JSON matching this exact structure:
{
  "posts": [array of ${limits.posts} objects with: id (number), title (string), hook (string, engaging opening line), format (one of: "图文" | "视频" | "合集"), tags (array of 3-5 English strings)],
  "keywords": [array of ${limits.keywords} objects with: id (number), chinese (Chinese characters), pinyin (romanized), english (translation), heatScore (number 1-100 representing current XHS search popularity), category (string), seasonalRelevance (string — one sentence explaining why Chinese consumers are searching this RIGHT NOW, referencing the current Chinese season or a specific upcoming festival if applicable)],
  "captions": [array of ${limits.captions} objects with: id (number), english (natural English caption), chinese (XHS-native Chinese caption with emojis and hashtags), context (string describing the use case)]
}

Make the Chinese captions authentic XHS style — conversational, emoji-rich, with 小红书-style hashtags. The English captions should be the Australian brand's voice. Heat scores should reflect realistic XHS search volume relative to each other.${toneLine ? " Apply the specified tone consistently across all posts and captions." : ""}

Return ONLY the JSON object, no explanation.`;

  let message;
  try {
    message = await anthropic.messages.create({
      model,
      max_tokens: 4096,
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

  let result: ToolkitResult;
  try {
    result = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });
  }

  // Save to cache and database
  const [, { data: savedTk }] = await Promise.all([
    setCachedResult(cacheKey, result),
    supabaseAdmin
      .from("toolkits")
      .insert({
        user_id: userId,
        brand_name: brandName,
        result: result as unknown as import("@/types/database").Json,
      })
      .select("id")
      .single(),
  ]);
  revalidatePath("/saved");
  revalidatePath("/dashboard");

  return NextResponse.json({ result, cached: false, used, limit, toolkitId: savedTk?.id });
}
