"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { InputForm } from "@/components/generate/InputForm";
import { PostsGrid } from "@/components/generate/PostsGrid";
import { KeywordsPanel } from "@/components/generate/KeywordsPanel";
import { CaptionsPanel } from "@/components/generate/CaptionsPanel";
import type { ToolkitResult } from "@/types/database";

function GenerateContent() {
  const searchParams = useSearchParams();
  const initialIndustry = searchParams.get("industry") ?? "";
  const initialProductDescription = searchParams.get("description") ?? "";

  const [result, setResult] = useState<ToolkitResult | null>(null);
  const [brandName, setBrandName] = useState("");

  function handleResult(data: ToolkitResult, name: string) {
    setResult(data);
    setBrandName(name);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Generate Toolkit</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Enter your brand details and get AI-powered Xiaohongshu content.
        </p>
      </div>

      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-6">
        <InputForm
          onResult={handleResult}
          initialIndustry={initialIndustry}
          initialProductDescription={initialProductDescription}
        />
      </div>

      {result && (
        <div id="results" className="space-y-10">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#1a1a1a]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
              {brandName} Toolkit
            </span>
            <div className="h-px flex-1 bg-[#1a1a1a]" />
          </div>
          <PostsGrid posts={result.posts} />
          <KeywordsPanel keywords={result.keywords} />
          <CaptionsPanel captions={result.captions} />
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense>
      <GenerateContent />
    </Suspense>
  );
}
