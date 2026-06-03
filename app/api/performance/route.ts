import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, MODEL_BY_PLAN } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAndIncrementUsage } from "@/lib/usage";
import type { Plan } from "@/lib/anthropic";
import type { PostMetric } from "@/types/database";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("post_metrics")
    .select("*")
    .eq("user_id", userId)
    .order("posted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ metrics: data ?? [] });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // ── Save a new metric: free ───────────────────────────────────────
  if (action === "save") {
    const { post_title, likes, comments, shares, saves, posted_at } = body;
    if (!post_title || posted_at === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("post_metrics")
      .insert({
        user_id: userId,
        post_title,
        likes: Number(likes) || 0,
        comments: Number(comments) || 0,
        shares: Number(shares) || 0,
        saves: Number(saves) || 0,
        posted_at,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ metric: data });
  }

  // ── Delete a metric: free ─────────────────────────────────────────
  if (action === "delete") {
    const { id } = body;
    const { error } = await supabaseAdmin
      .from("post_metrics")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // ── Generate insights: 1 usage ────────────────────────────────────
  if (action === "insights") {
    const { metrics } = body as { metrics: PostMetric[] };
    if (!metrics?.length) return NextResponse.json({ error: "No metrics provided" }, { status: 400 });

    const { data: user } = await supabaseAdmin.from("users").select("plan").eq("id", userId).single();
    const plan = ((user?.plan ?? "free") as Plan);
    const { allowed, used, limit } = await checkAndIncrementUsage(userId, plan);
    if (!allowed) {
      return NextResponse.json({ error: `Monthly limit of ${limit} generations reached.` }, { status: 429 });
    }

    const model = MODEL_BY_PLAN[plan];
    const metricsText = metrics
      .map(
        (m) =>
          `Post: "${m.post_title}" | Date: ${m.posted_at} | Likes: ${m.likes} | Comments: ${m.comments} | Shares: ${m.shares} | Saves: ${m.saves}`
      )
      .join("\n");

    const prompt = `Analyze these Xiaohongshu post performance metrics for an Australian brand:

${metricsText}

Provide data-driven insights as JSON:
{
  "topInsight": "One key finding about what is driving performance (cite specific numbers)",
  "bestContentType": "Description of what type of content performs best based on titles and metrics",
  "bestPostingDay": "Best day of week to post based on the data patterns",
  "recommendations": [
    "Specific recommendation 1 based on the data",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ]
}

Be specific — reference actual post titles and numbers from the data. Keep each recommendation actionable and XHS-focused.
Return only valid JSON.`;

    try {
      const msg = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return NextResponse.json({ error: "Parse failed" }, { status: 500 });
      return NextResponse.json({ insights: JSON.parse(m[0]), used, limit });
    } catch {
      return NextResponse.json({ error: "Insights generation failed" }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
