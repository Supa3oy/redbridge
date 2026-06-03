"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="md:hidden flex shrink-0 items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3">
      <span className="font-mono text-sm font-bold tracking-widest text-[#ff2d55] uppercase">
        RedBridge
      </span>
      <div className="flex items-center gap-3">
        <Menu size={18} className="text-[#4a4a4a]" />
        <UserButton />
      </div>
    </header>
  );
}
