import Anthropic from "@anthropic-ai/sdk";

// Fixed-date Chinese consumer events [month, day, label]
const FIXED_EVENTS: Array<[number, number, string]> = [
  [1,  1,  "元旦 New Year's Day"],
  [2,  14, "情人节 Valentine's Day"],
  [3,  8,  "妇女节 Women's Day / 38大促 shopping event"],
  [5,  12, "母亲节 Mother's Day (2nd Sunday of May, approx)"],
  [5,  20, "520情人节 Digital Valentine's Day"],
  [6,  18, "618购物节 618 Mid-Year Shopping Festival"],
  [10, 1,  "国庆节 National Day / Golden Week"],
  [11, 11, "双十一 Singles' Day — China's largest shopping event of the year"],
  [12, 12, "双十二 Double 12 Shopping Festival"],
  [12, 25, "圣诞节 Christmas"],
];

export function buildChineseCalendarContext(now = new Date()): string {
  const month = now.getMonth() + 1;

  const season =
    month >= 3 && month <= 5
      ? "Spring 春天 (warming, outdoors, fresh starts, spring skincare)"
      : month >= 6 && month <= 8
      ? "Summer 夏天 (heat, travel, cooling products, outdoor lifestyle)"
      : month >= 9 && month <= 11
      ? "Autumn 秋天 (cooling, harvest festivals, back-to-study, cosy living)"
      : "Winter 冬天 (cold, New Year prep, skincare protection, warming products)";

  const nowMs = now.getTime();
  const yr = now.getFullYear();
  const upcoming: string[] = [];

  for (const [m, d, label] of FIXED_EVENTS) {
    for (const y of [yr, yr + 1]) {
      const fest = new Date(y, m - 1, d);
      const days = Math.round((fest.getTime() - nowMs) / 86_400_000);
      if (days >= 0 && days <= 90) {
        const when = days === 0 ? "TODAY" : `in ${days} day${days === 1 ? "" : "s"}`;
        upcoming.push(`  - ${label} (${when})`);
        break;
      }
    }
  }

  const lines = [
    "=== CHINESE SEASONAL & CALENDAR CONTEXT ===",
    `Today's date: ${now.toISOString().slice(0, 10)}`,
    `Current season in CHINA: ${season}`,
    "",
    upcoming.length
      ? `Upcoming Chinese festivals & shopping events (next 90 days):\n${upcoming.join("\n")}`
      : "No major fixed festivals in the next 90 days.",
    "",
    "Lunar festivals (approximate Gregorian timing):",
    "  - 春节 Chinese New Year: late January / early February",
    "  - 七夕 Qixi Valentine's Day: late July / early August",
    "  - 中秋节 Mid-Autumn Festival: late September / early October",
    "",
    "⚠️  CRITICAL — Australia and China have OPPOSITE seasons.",
    "ALL seasonal content must be based on CHINESE seasons above, never Australian.",
    "Keywords must reflect what XHS users in China are actively searching RIGHT NOW.",
    "Prioritise relevance to the current Chinese season and any upcoming festivals.",
    "=== END CONTEXT ===",
  ];

  return lines.join("\n");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type Plan = "free" | "pro" | "agency";

export const MODEL_BY_PLAN: Record<Plan, string> = {
  free: "claude-haiku-4-5-20251001",
  pro: "claude-sonnet-4-6",
  agency: "claude-sonnet-4-6",
};

export const LIMITS_BY_PLAN: Record<
  Plan,
  { generations: number | null; posts: number; keywords: number; captions: number }
> = {
  free: { generations: 50, posts: 10, keywords: 8, captions: 3 },
  pro: { generations: 50, posts: 30, keywords: 16, captions: 5 },
  agency: { generations: null, posts: 30, keywords: 16, captions: 5 },
};
