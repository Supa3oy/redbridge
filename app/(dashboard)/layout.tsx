import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  let hasProfile = false;
  let hasReport = false;

  if (userId) {
    try {
      const [{ data: user }, { data: report }] = await Promise.all([
        supabaseAdmin
          .from("users")
          .select("brand_name")
          .eq("id", userId)
          .maybeSingle(),
        supabaseAdmin
          .from("intelligence_reports")
          .select("id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle(),
      ]);
      hasProfile = !!(user?.brand_name);
      hasReport = !!report;
    } catch {
      // Non-fatal: indicators just won't show
    }
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar hasProfile={hasProfile} hasReport={hasReport} />
        <div className="flex flex-1 flex-col min-h-0">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-4 py-4 pb-24 md:px-8 md:py-8 md:pb-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
