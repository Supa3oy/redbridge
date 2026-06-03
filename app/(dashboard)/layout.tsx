import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
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
