import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PostsGrid } from "@/components/generate/PostsGrid";
import { KeywordsPanel } from "@/components/generate/KeywordsPanel";
import { CaptionsPanel } from "@/components/generate/CaptionsPanel";
import { ArrowLeft } from "lucide-react";
import { TimeAgo } from "@/components/ui/time-ago";
import type { ToolkitResult } from "@/types/database";

export default async function SavedToolkitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  const { data: toolkit } = await supabaseAdmin
    .from("toolkits")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId!)
    .single();

  if (!toolkit) notFound();

  const result = toolkit.result as unknown as ToolkitResult;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Link
          href="/saved"
          className="flex items-center gap-1.5 font-mono text-xs text-[#6b7280] hover:text-white transition-colors"
        >
          <ArrowLeft size={12} />
          Saved
        </Link>
        <div className="h-px flex-1 bg-[#1a1a1a]" />
      </div>

      <div>
        <h1 className="text-2xl font-bold">{toolkit.brand_name}</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Generated <TimeAgo dateStr={toolkit.created_at} />
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#1a1a1a]" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
          {toolkit.brand_name} Toolkit
        </span>
        <div className="h-px flex-1 bg-[#1a1a1a]" />
      </div>

      <PostsGrid posts={result.posts} />
      <KeywordsPanel keywords={result.keywords} />
      <CaptionsPanel captions={result.captions} />
    </div>
  );
}
