import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, MODEL_BY_PLAN } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAndIncrementUsage } from "@/lib/usage";
import type { Plan } from "@/lib/anthropic";
import type { CommentItem } from "@/types/database";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // ── Translate: free, uses haiku ──────────────────────────────────
  if (action === "translate") {
    const { comments } = body as { comments: string[] };
    if (!comments?.length) return NextResponse.json({ error: "No comments provided" }, { status: 400 });

    const prompt = `Translate these Chinese social media comments to English and classify the sentiment of each.

Comments:
${comments.map((c, i) => `${i + 1}. ${c}`).join("\n")}

For each comment classify sentiment as exactly one of: Question, Compliment, Complaint, Purchase Intent

Return only valid JSON — no explanation:
{"items": [{"original": "...", "translation": "...", "sentiment": "..."}]}`;

    try {
      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });
      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return NextResponse.json({ error: "Parse failed" }, { status: 500 });
      return NextResponse.json(JSON.parse(m[0]));
    } catch {
      return NextResponse.json({ error: "Translation failed" }, { status: 502 });
    }
  }

  // ── Single reply: free ───────────────────────────────────────────
  if (action === "reply") {
    const { comment, translation, sentiment } = body;
    if (!comment) return NextResponse.json({ error: "No comment provided" }, { status: 400 });

    const prompt = `You are a skilled Xiaohongshu community manager for an Australian brand.

Generate a warm, culturally appropriate Chinese reply to this customer comment.

Comment: ${comment}
Translation: ${translation}
Sentiment: ${sentiment}

Guidelines:
- Warm, friendly, professional — authentic XHS brand voice
- Directly address the sentiment (answer questions, thank compliments, resolve complaints empathetically)
- For Purchase Intent: subtly encourage without being pushy
- Use natural XHS Chinese tone with fitting emojis
- Keep it concise (1–3 sentences)

Return only the Chinese reply text.`;

    try {
      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        messages: [{ role: "user", content: prompt }],
      });
      const reply = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
      return NextResponse.json({ reply });
    } catch {
      return NextResponse.json({ error: "Reply generation failed" }, { status: 502 });
    }
  }

  // ── Reply All: 1 usage ───────────────────────────────────────────
  if (action === "replyAll") {
    const { items } = body as { items: CommentItem[] };
    if (!items?.length) return NextResponse.json({ error: "No items provided" }, { status: 400 });

    const { data: user } = await supabaseAdmin.from("users").select("plan").eq("id", userId).single();
    const plan = ((user?.plan ?? "free") as Plan);
    const { allowed, used, limit } = await checkAndIncrementUsage(userId, plan);
    if (!allowed) {
      return NextResponse.json({ error: `Monthly limit of ${limit} generations reached.` }, { status: 429 });
    }

    const model = MODEL_BY_PLAN[plan];
    const prompt = `You are a skilled Xiaohongshu community manager for an Australian brand.

Generate culturally appropriate Chinese replies for each customer comment below.

${items
  .map(
    (item, i) =>
      `Comment ${i + 1}: ${item.original}\nTranslation: ${item.translation}\nSentiment: ${item.sentiment}`
  )
  .join("\n\n")}

Guidelines for all replies:
- Warm, friendly, professional — authentic XHS brand voice
- Directly address each sentiment
- For Purchase Intent: subtly encourage without being pushy
- Natural XHS Chinese tone with fitting emojis
- Each reply concise (1–3 sentences)

Return only valid JSON:
{"replies": ["reply1", "reply2"]}`;

    try {
      const msg = await anthropic.messages.create({
        model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });
      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return NextResponse.json({ error: "Parse failed" }, { status: 500 });
      const result = JSON.parse(m[0]) as { replies: string[] };

      await supabaseAdmin.from("saved_comments").insert({
        user_id: userId,
        comments: items as unknown as import("@/types/database").Json,
        replies: result.replies as unknown as import("@/types/database").Json,
      });

      return NextResponse.json({ ...result, used, limit });
    } catch {
      return NextResponse.json({ error: "Reply generation failed" }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
