import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, MODEL_BY_PLAN } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAndIncrementUsage } from "@/lib/usage";
import type { Plan } from "@/lib/anthropic";
import type { InboxItem } from "@/types/database";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // ── Process messages: free ───────────────────────────────────────
  if (action === "process") {
    const { messages } = body as { messages: string[] };
    if (!messages?.length) return NextResponse.json({ error: "No messages provided" }, { status: 400 });

    const prompt = `Translate these Chinese DMs/comments to English, classify the category, and assign priority.

Messages:
${messages.map((m, i) => `${i + 1}. ${m}`).join("\n")}

For each message:
- Category: exactly one of: Price Inquiry, Shipping Question, Ingredient Question, Complaint, General Praise, Purchase Ready
- Priority: Purchase Ready = urgent, Complaint = high, everything else = normal

Return only valid JSON:
{"items": [{"original": "...", "translation": "...", "category": "...", "priority": "..."}]}`;

    try {
      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      });
      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return NextResponse.json({ error: "Parse failed" }, { status: 500 });
      return NextResponse.json(JSON.parse(m[0]));
    } catch {
      return NextResponse.json({ error: "Processing failed" }, { status: 502 });
    }
  }

  // ── Reply All: 1 usage ───────────────────────────────────────────
  if (action === "replyAll") {
    const { items } = body as { items: InboxItem[] };
    if (!items?.length) return NextResponse.json({ error: "No items provided" }, { status: 400 });

    const { data: user } = await supabaseAdmin.from("users").select("plan").eq("id", userId).single();
    const plan = ((user?.plan ?? "free") as Plan);
    const { allowed, used, limit } = await checkAndIncrementUsage(userId, plan);
    if (!allowed) {
      return NextResponse.json({ error: `Monthly limit of ${limit} generations reached.` }, { status: 429 });
    }

    const model = MODEL_BY_PLAN[plan];
    const prompt = `You are a skilled Xiaohongshu community manager for an Australian brand.

Generate culturally appropriate Chinese replies for each customer message below. Prioritise urgent/high priority messages with the most thorough responses.

${items
  .map(
    (item, i) =>
      `Message ${i + 1} [${item.priority.toUpperCase()}] [${item.category}]:\n${item.original}\nTranslation: ${item.translation}`
  )
  .join("\n\n")}

Guidelines:
- For Price Inquiry: provide helpful pricing context, encourage direct contact or WeChat
- For Shipping Question: reassure about delivery, provide estimated timeframes
- For Ingredient Question: be thorough and transparent, highlight key ingredients
- For Complaint: empathise, apologise sincerely, offer resolution
- For General Praise: thank warmly, encourage sharing/tagging
- For Purchase Ready: warm enthusiasm, guide to purchase, create urgency gently

Natural XHS Chinese tone. Keep each reply concise (1–4 sentences).

Return only valid JSON:
{"replies": ["reply1", "reply2"]}`;

    try {
      const msg = await anthropic.messages.create({
        model,
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      });
      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return NextResponse.json({ error: "Parse failed" }, { status: 500 });
      const result = JSON.parse(m[0]) as { replies: string[] };

      await supabaseAdmin.from("saved_inbox").insert({
        user_id: userId,
        messages: items as unknown as import("@/types/database").Json,
        replies: result.replies as unknown as import("@/types/database").Json,
      });

      return NextResponse.json({ ...result, used, limit });
    } catch {
      return NextResponse.json({ error: "Reply generation failed" }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
