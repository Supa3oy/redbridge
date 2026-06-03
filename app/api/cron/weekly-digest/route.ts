import { NextResponse } from "next/server";
import { Resend } from "resend";
import { anthropic } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase";
import { buildChineseCalendarContext } from "@/lib/anthropic";
import { WeeklyDigest } from "@/components/emails/WeeklyDigest";

const XHS_TIPS = [
  "First image gets 80% of clicks — invest in your cover photo above everything else.",
  "Use numbers in titles: '3 ways to…' consistently outperforms generic titles on XHS.",
  "Post within 30 minutes of peak hours (12pm, 6pm, 9pm CST) for maximum algorithm reach.",
  "Write captions that sound like genuine friend recommendations — authenticity converts on XHS.",
  "Carousels with 6–9 images outperform single images — give people a reason to swipe.",
  "Your 封面图 (cover) should be vertical (3:4 ratio) — that's how XHS displays in discovery.",
  "Use seasonal keywords — Chinese consumers browse XHS for seasonal inspiration and gifting.",
  "3 broad + 3 niche hashtags per post balances reach and relevance.",
  "Video content under 90 seconds gets the highest completion rates on XHS.",
  "Respond to comments within 2 hours of posting — the algorithm rewards early engagement.",
  "Morning 早安 content (7–9am CST) generates strong lifestyle engagement.",
  "Add 'AU$' or pricing context to attract serious buyers ready to purchase.",
];

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://redbridge-ecru.vercel.app";
  const tipOfWeek = XHS_TIPS[getWeekNumber(new Date()) % XHS_TIPS.length];

  // Fetch all subscribed users with profile data
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, email, brand_name, industry, usage_count, usage_reset_at, plan")
    .eq("email_subscribed", true)
    .not("email", "eq", "");

  if (!users?.length) {
    return NextResponse.json({ sent: 0, message: "No subscribed users" });
  }

  // Group users by industry for batch AI generation
  const byIndustry = new Map<string, typeof users>();
  for (const user of users) {
    const key = user.industry ?? "General";
    if (!byIndustry.has(key)) byIndustry.set(key, []);
    byIndustry.get(key)!.push(user);
  }

  // Generate content per industry
  const industryContent = new Map<string, {
    trends: Array<{ title: string; description: string }>;
    postIdeas: Array<{ title: string; angle: string }>;
  }>();

  for (const [industry, _] of byIndustry) {
    // Get saved trends for this industry (most recent from any user)
    const { data: trendRow } = await supabaseAdmin
      .from("saved_trends")
      .select("result")
      .eq("industry", industry)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let trends: Array<{ title: string; description: string }> = [];
    if (trendRow?.result) {
      const result = trendRow.result as { trends?: Array<{ english: string; description: string }> };
      trends = (result.trends ?? []).slice(0, 3).map((t) => ({
        title: t.english,
        description: t.description,
      }));
    }

    // Generate 3 post ideas for this industry
    let postIdeas: Array<{ title: string; angle: string }> = [];
    try {
      const trendContext = trends.length
        ? `Trending now: ${trends.map((t) => t.title).join(", ")}`
        : "";
      const prompt = `${buildChineseCalendarContext()}

Generate 3 creative XHS post ideas for an Australian ${industry} brand this week.
${trendContext}

Return only valid JSON:
{"ideas": [{"title": "Post title in English", "angle": "Content angle/hook in 1 sentence"}]}`;

      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      });
      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) postIdeas = JSON.parse(m[0]).ideas ?? [];
    } catch {
      postIdeas = [
        { title: "Behind the scenes at our studio", angle: "Show the authentic side of your brand" },
        { title: "3 ways to use our product this season", angle: "Educational lifestyle content" },
        { title: "Customer review spotlight", angle: "Social proof with a personal touch" },
      ];
    }

    industryContent.set(industry, { trends, postIdeas });
  }

  // Send emails
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const industry = user.industry ?? "General";
    const content = industryContent.get(industry) ?? { trends: [], postIdeas: [] };

    const resetAt = new Date(user.usage_reset_at);
    const daysUntilReset = Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 86_400_000));
    const usageLimit = user.plan === "agency" ? null : user.plan === "pro" ? 50 : 3;

    const unsubscribeUrl = `${appUrl}/api/unsubscribe?uid=${user.id}`;
    const userName = user.brand_name ?? user.email.split("@")[0];

    try {
      await resend.emails.send({
        from: "RedBridge <digest@redbridge.app>",
        to: user.email,
        subject: `Your RedBridge Weekly — ${new Date().toLocaleDateString("en-AU", { month: "long", day: "numeric" })}`,
        react: WeeklyDigest({
          userName,
          brandName: user.brand_name ?? "",
          industry,
          trends: content.trends,
          postIdeas: content.postIdeas,
          usageCount: user.usage_count,
          usageLimit,
          daysUntilReset,
          tipOfWeek,
          appUrl,
          unsubscribeUrl,
        }),
      });

      await supabaseAdmin.from("email_logs").insert({
        user_id: user.id,
        email_type: "weekly_digest",
      });

      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: users.length });
}
