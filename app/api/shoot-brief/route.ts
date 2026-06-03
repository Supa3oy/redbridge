import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, MODEL_BY_PLAN, buildChineseCalendarContext } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAndIncrementUsage } from "@/lib/usage";
import type { Plan } from "@/lib/anthropic";
import type { ShootBriefResult } from "@/types/database";

const TONE_GUIDE: Record<string, string> = {
  "种草": "soft-sell organic discovery — genuine friend recommendation energy",
  "干货": "educational and informative — practical, credible, tip-driven",
  "故事": "narrative storytelling — emotional, personal, draws readers in",
  "搞笑": "humorous and playful — witty, relatable, shareable",
  "高端": "aspirational luxury — premium, exclusive, desire-driven",
  "生活感": "warm everyday lifestyle — cosy, authentic, slice-of-life",
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brandName, productName, angle, tone } = await req.json();
  if (!brandName || !productName || !angle) {
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
  const toneLine = tone && TONE_GUIDE[tone] ? `\nContent Tone: ${tone} — ${TONE_GUIDE[tone]}` : "";

  const prompt = `You are an expert XHS (Xiaohongshu) visual content strategist for Australian brands.

${buildChineseCalendarContext()}

Brand: ${brandName}
Product: ${productName}
Content Angle: ${angle}${toneLine}

Create a complete, detailed photo/video shoot brief optimised for XHS performance.

Return ONLY valid JSON — no explanation, no markdown:
{
  "sceneDescription": "2-3 sentences: exact setting, location vibe, time of day, atmosphere, background details",
  "propsList": ["prop 1", "prop 2", "prop 3", "prop 4", "prop 5", "prop 6"],
  "colourPalette": [
    {"hex": "#XXXXXX", "name": "Descriptive colour name"},
    {"hex": "#XXXXXX", "name": "Descriptive colour name"},
    {"hex": "#XXXXXX", "name": "Descriptive colour name"},
    {"hex": "#XXXXXX", "name": "Descriptive colour name"}
  ],
  "modelDirection": "Specific direction for model/talent — styling, expression, pose — OR null if product-only shot",
  "cameraComposition": "Camera angle, framing technique, depth of field, composition rule to apply",
  "lightingDirection": "Lighting setup with specific details — source, direction, quality, golden hour vs studio vs natural etc",
  "captionHooks": [
    "Opening hook 1 in Chinese for XHS (use emojis, authentic XHS style)",
    "Opening hook 2 in Chinese",
    "Opening hook 3 in Chinese"
  ],
  "xhsTips": [
    "XHS-specific visual tip 1 for this content type",
    "XHS-specific visual tip 2",
    "XHS-specific visual tip 3"
  ],
  "referenceDescription": "Describe a specific, concrete XHS post that could serve as visual reference — describe the image, style, mood, what makes it perform well on XHS"
}

The colour palette must match the brand aesthetic AND the content angle — make them cohesive and beautiful. All XHS caption hooks must be in authentic Chinese social media style.`;

  let message;
  try {
    message = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });

  let result: ShootBriefResult;
  try {
    result = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });
  }

  const { data: saved } = await supabaseAdmin
    .from("shoot_briefs")
    .insert({
      user_id: userId,
      brand_name: brandName,
      product_name: productName,
      angle,
      result: result as unknown as import("@/types/database").Json,
    })
    .select("id")
    .single();

  return NextResponse.json({ result, briefId: saved?.id, used, limit });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("shoot_briefs")
    .select("id, brand_name, product_name, angle, result, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ briefs: data ?? [] });
}
