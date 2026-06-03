import { KeywordsPanel } from "@/components/generate/KeywordsPanel";
import type { CompetitorResult } from "@/types/database";

interface CompetitorResultProps {
  result: CompetitorResult;
  competitorName: string;
}

export function CompetitorResultPanel({ result, competitorName }: CompetitorResultProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#1a1a1a]" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
          {competitorName} Analysis
        </span>
        <div className="h-px flex-1 bg-[#1a1a1a]" />
      </div>

      {/* Keywords */}
      <section className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5 space-y-4">
        <SectionLabel>Keywords they target</SectionLabel>
        <KeywordsPanel keywords={result.keywords} />
      </section>

      {/* Content Tone */}
      <section className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5 space-y-4">
        <SectionLabel>Content tone &amp; style</SectionLabel>
        <div className="space-y-3">
          <p className="font-mono text-sm font-semibold text-[#ff2d55]">
            {result.contentTone.style}
          </p>
          <p className="text-sm leading-relaxed text-[#c0c0c0]">
            {result.contentTone.description}
          </p>
          <div className="space-y-2 pt-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">
              Example post concepts
            </p>
            <ol className="space-y-1.5">
              {result.contentTone.examples.map((ex, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[#6b7280]">
                  <span className="shrink-0 font-mono text-[#ff2d55]">{i + 1}.</span>
                  {ex}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Content Angles */}
      <section className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5 space-y-4">
        <SectionLabel>Content angles they use</SectionLabel>
        <ol className="space-y-3">
          {result.contentAngles.map((angle) => (
            <li key={angle.id} className="flex gap-3">
              <span className="shrink-0 w-5 font-mono text-sm font-bold text-[#ff2d55]">
                {angle.id}.
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-white">{angle.title}</p>
                <p className="text-sm leading-relaxed text-[#6b7280]">{angle.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Gap Opportunities */}
      <section className="rounded-xl border border-[#ff2d55]/15 bg-[#ff2d55]/5 p-5 space-y-4">
        <SectionLabel accent>Gap opportunities — what they&apos;re missing</SectionLabel>
        <ol className="space-y-4">
          {result.gapOpportunities.map((gap) => (
            <li key={gap.id} className="flex gap-3">
              <span className="shrink-0 w-5 font-mono text-sm font-bold text-[#ff2d55]">
                {gap.id}.
              </span>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-white">{gap.title}</p>
                <p className="text-sm leading-relaxed text-[#6b7280]">{gap.description}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff2d55]">
                    Your angle:
                  </span>
                  <span className="text-xs text-[#c0c0c0]">{gap.angle}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function SectionLabel({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <h3
      className={`font-mono text-xs uppercase tracking-widest ${
        accent ? "text-[#ff2d55]" : "text-[#6b7280]"
      }`}
    >
      {children}
    </h3>
  );
}
