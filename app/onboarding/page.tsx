export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  // Already onboarded — send them to the dashboard
  if (userData?.onboarding_completed === true) {
    redirect("/dashboard");
  }

  return <OnboardingFlow userId={userId} />;
}
