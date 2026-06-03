"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wand2, Bookmark, TrendingUp, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate", icon: Wand2 },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/competitor", label: "Competitor", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-[#1a1a1a] bg-[#0a0a0a]">
      <div className="flex items-stretch justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 px-0.5 transition-colors min-w-0",
                active ? "text-white" : "text-[#4a4a4a]"
              )}
            >
              <Icon size={20} className={cn(active && "text-[#ff2d55]")} />
              <span className="text-[9px] leading-tight truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
