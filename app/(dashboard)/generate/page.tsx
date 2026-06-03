"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { InputForm } from "@/components/generate/InputForm";
import { PostsGrid } from "@/components/generate/PostsGrid";
import { KeywordsPanel } from "@/components/generate/KeywordsPanel";
import { CaptionsPanel } from "@/components/generate/CaptionsPanel";
import { cn } from "@/lib/utils";
import type { ToolkitResult } from "@/types/database";

type ResultTab = "posts" | "keywords" | "captions";

function GenerateContent() {
  const searchParams = useSearchParams();
  const initialIndustry = searchParams.get("industry") ?? "";
  const initialProductDescription = searchParams.get("description") ?? "";

  const [result, setResult] = useState<ToolkitResult | null>(null);
  const [brandName, setBrandName] = useState("");
  const [activeTab, setActiveTab] = useState<ResultTab>("posts");

  function handleResult(data: ToolkitResult, name: string) {
    setResult(data);
    setBrandName(name);
    setActiveTab("posts");
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  const tabs: { key: ResultTab; label: string; count: number }[] = result
    ? [
        { key: "posts", label: "Posts", count: result.posts.length },
        { key: "keywords", label: "Keywords", count: result.keywords.length },
        { key: "captions", label: "Captions", count: result.captions.length },
      ]
    : [];

  return (
    <div className="space-y-6 md:space-y-10">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Generate Toolkit</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Enter your brand details and get AI-powered Xiaohongshu content.
        </p>
      </div>

      <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 sm:p-6">
        <InputForm
          onResult={handleResult}
          initialIndustry={initialIndustry}
          initialProductDescription={initialProductDescription}
        />
      </div>

      {result && (
        <div id="results" className="space-y-6 md:space-y-10">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#1a1a1a]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
              {brandName} Toolkit
            </span>
            <div className="h-px flex-1 bg-[#1a1a1a]" />
          </div>

          {/* Mobile tab bar */}
          <div className="md:hidden -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-0 border-b border-[#1a1a1a] min-w-max">
              {tabs.map(({ key, label, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm whitespace-nowrap transition-colors",
                    activeTab === key
                      ? "border-[#ff2d55] text-white"
                      : "border-transparent text-[#6b7280]"
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 font-mono text-xs",
                      activeTab === key
                        ? "bg-[#ff2d55]/20 text-[#ff2d55]"
                        : "bg-[#1a1a1a] text-[#4a4a4a]"
                    )}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: single active panel */}
          <div className="md:hidden">
            {activeTab === "posts" && <PostsGrid posts={result.posts} />}
            {activeTab === "keywords" && <KeywordsPanel keywords={result.keywords} />}
            {activeTab === "captions" && <CaptionsPanel captions={result.captions} />}
          </div>

          {/* Desktop: all stacked */}
          <div className="hidden md:space-y-10 md:block">
            <PostsGrid posts={result.posts} />
            <KeywordsPanel keywords={result.keywords} />
            <CaptionsPanel captions={result.captions} />
          </div>
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
