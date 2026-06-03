import { supabaseAdmin } from "./supabase";
import type { Plan } from "./anthropic";
import { LIMITS_BY_PLAN } from "./anthropic";

export async function checkAndIncrementUsage(
  userId: string,
  plan: Plan
): Promise<{ allowed: boolean; used: number; limit: number | null }> {
  const limit = LIMITS_BY_PLAN[plan].generations;

  let { data: user } = await supabaseAdmin
    .from("users")
    .select("usage_count, usage_reset_at")
    .eq("id", userId)
    .single();

  // Auto-provision row if webhook hasn't fired yet
  if (!user) {
    const { data: created } = await supabaseAdmin
      .from("users")
      .insert({ id: userId, email: "", plan: "free", usage_count: 0 })
      .select("usage_count, usage_reset_at")
      .single();
    user = created;
  }

  if (!user) throw new Error("Failed to provision user");

  // Reset on 1st of month
  const resetAt = new Date(user.usage_reset_at);
  const now = new Date();
  const shouldReset =
    now.getFullYear() > resetAt.getFullYear() ||
    now.getMonth() > resetAt.getMonth();

  let usageCount = shouldReset ? 0 : user.usage_count;

  if (limit !== null && usageCount >= limit) {
    return { allowed: false, used: usageCount, limit };
  }

  const nextReset = shouldReset
    ? new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
    : user.usage_reset_at;

  await supabaseAdmin
    .from("users")
    .update({ usage_count: usageCount + 1, usage_reset_at: nextReset })
    .eq("id", userId);

  return { allowed: true, used: usageCount + 1, limit };
}

export async function getUsage(
  userId: string
): Promise<{ used: number; limit: number | null; plan: Plan }> {
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("usage_count, plan")
    .eq("id", userId)
    .single();

  // Return free defaults if row doesn't exist yet (webhook lag)
  const plan = ((user?.plan ?? "free") as Plan);
  const limit = LIMITS_BY_PLAN[plan].generations;
  return { used: user?.usage_count ?? 0, limit, plan };
}
