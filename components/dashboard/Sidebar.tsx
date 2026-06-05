"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wand2,
  Bookmark,
  TrendingUp,
  Search,
  Settings,
  MessageSquare,
  CalendarDays,
  Inbox,
  BarChart3,
  Camera,
  FileText,
  User,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { UsageMeter } from "./UsageMeter";

interface SidebarProps {
  hasProfile?: boolean;
  hasReport?: boolean;
}

export function Sidebar({ hasProfile = false, hasReport = false }: SidebarProps) {
  const pathname = usePathname();

  // Routes that get a green dot when the corresponding data exists
  const dots: Record<string, boolean> = {
    "/intelligence": hasReport,
    "/brand-profile": hasProfile,
  };

  const link = (href: string, label: string, Icon: React.ElementType) => (
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
      <Icon size={15} />
      <span className="flex-1">{label}</span>
      {dots[href] && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
      )}
    </Link>
  );

  return (
    <aside className="hidden md:flex h-screen w-60 flex-col border-r border-[#1a1a1a] bg-[#0a0a0a] px-4 py-6">
      {/* Logo */}
      <div className="mb-5 px-2">
        <span className="font-mono text-sm font-bold tracking-widest text-[#ff2d55] uppercase">
          RedBridge
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1">

        {/* ── INTELLIGENCE 2.0 ─────────────────────── */}
        <div className="pb-2">
          <div className="mb-1.5 flex items-center gap-2 px-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">
              Intelligence
            </p>
            <span className="rounded px-1 py-px font-mono text-[9px] font-bold tracking-wider text-[#ff2d55] border border-[#ff2d55]/40 bg-[#ff2d55]/10">
              2.0
            </span>
          </div>
          <div className="space-y-0.5">
            {link("/intelligence", "Intelligence Report", FileText)}
            {link("/brand-profile", "Brand Profile", User)}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#111] my-2" />

        {/* ── CONTENT TOOLS ────────────────────────── */}
        <div className="pb-2">
          <p className="mb-1.5 px-3 font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">
            Content Tools
          </p>
          <div className="space-y-0.5">
            {link("/generate", "Generate Campaign", Wand2)}
            {link("/trends", "Trends", TrendingUp)}
            {link("/competitor", "Competitor", Search)}
            {link("/calendar", "Calendar", CalendarDays)}
            {link("/comments", "Comments", MessageSquare)}
            {link("/inbox", "Inbox", Inbox)}
            {link("/shoot-brief", "Shoot Brief", Camera)}
            {link("/performance", "Performance", BarChart3)}
            {link("/saved", "Saved", Bookmark)}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#111] my-2" />

        <div className="space-y-0.5">
          {link("/settings", "Settings", Settings)}
        </div>

      </nav>

      <div className="space-y-4 pt-4">
        <UsageMeter />
        <div className="flex items-center gap-3 px-2">
          <UserButton />
          <span className="font-mono text-xs text-[#4a4a4a]">Account</span>
        </div>
      </div>
    </aside>
  );
}
