export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { LIMITS_BY_PLAN } from "@/lib/anthropic";
import { BillingPanel } from "@/components/settings/BillingPanel";
import { EmailPreferencesPanel } from "@/components/settings/EmailPreferencesPanel";
import type { Plan } from "@/lib/anthropic";

export default async function SettingsPage() {
  const { userId } = await auth();

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("email, plan, usage_count, email_subscribed")
    .eq("id", userId!)
    .single();

  const plan = ((user?.plan ?? "free") as Plan);
  const usageLimit = LIMITS_BY_PLAN[plan].generations ?? Infinity;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-[#6b7280]">Plan, billing, and account preferences</p>
      </div>

      <BillingPanel
        email={user?.email ?? ""}
        plan={plan}
        usageCount={user?.usage_count ?? 0}
        usageLimit={usageLimit === Infinity ? 9999 : usageLimit}
      />

      <EmailPreferencesPanel
        initialSubscribed={user?.email_subscribed ?? true}
      />
    </div>
  );
}
