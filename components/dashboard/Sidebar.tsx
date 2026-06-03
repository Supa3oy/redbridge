"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wand2, Bookmark, TrendingUp, Search, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { UsageMeter } from "./UsageMeter";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate", icon: Wand2 },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/competitor", label: "Competitor", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-60 flex-col border-r border-[#1a1a1a] bg-[#0a0a0a] px-4 py-6">
      <div className="mb-8 px-2">
        <span className="font-mono text-sm font-bold tracking-widest text-[#ff2d55] uppercase">
          RedBridge
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              pathname === href
                ? "bg-[#1a1a1a] text-white"
                : "text-[#6b7280] hover:bg-[#111] hover:text-white"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="space-y-4">
        <UsageMeter />
        <div className="flex items-center gap-3 px-2">
          <UserButton />
          <span className="font-mono text-xs text-[#4a4a4a]">Account</span>
        </div>
      </div>
    </aside>
  );
}
