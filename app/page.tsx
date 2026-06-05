import Link from "next/link";

const GAP_EXAMPLES = [
  {
    aspect: "Brand Voice",
    au: '"Natural & effortless" — casual beach energy',
    cn: "Lacks prestige signal. Reads as low-effort quality.",
    fix: 'Reframe as 澳洲严选 — "Australian Premium Select"',
  },
  {
    aspect: "Hero Benefit",
    au: '"Feel good in your skin" — emotional, personal',
    cn: "Too vague. No scientific proof. Can't be trusted.",
    fix: 'Lead with 皮肤科认证 — dermatologist-validated credibility',
  },
  {
    aspect: "Lifestyle Imagery",
    au: "Beach, sun, outdoor freedom",
    cn: "Cold damage fear. Wrong season signal. Off-putting.",
    fix: "Shift to clean indoor aesthetics and morning rituals",
  },
  {
    aspect: "Price Signal",
    au: "Accessible premium — value-driven",
    cn: "Unclear luxury tier. Doesn't justify import cost.",
    fix: 'Add 澳洲直邮 (Direct from Australia) to anchor value',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ── Hero ────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-full max-w-2xl space-y-8">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#ff2d55]">RedBridge</p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Xiaohongshu toolkit for{" "}
              <span className="text-[#ff2d55]">Australian brands</span>
            </h1>
            <p className="mx-auto max-w-md text-sm text-[#6b7280] sm:text-base">
              AI-powered post ideas, keyword research, and localized captions for the Chinese social market.
              Go from brief to ready-to-post in seconds.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex h-12 w-full items-center justify-center rounded-md bg-[#ff2d55] px-6 text-sm font-medium text-white transition-colors hover:bg-[#e0274d] sm:h-11 sm:w-auto"
            >
              Get started free
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-12 w-full items-center justify-center rounded-md border border-[#2a2a2a] bg-transparent px-6 text-sm font-medium text-white transition-colors hover:bg-[#1a1a1a] sm:h-11 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* ── RedBridge 2.0 Section ────────────────────── */}
      <div className="border-t border-[#111] bg-[#0d0d0d] px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Label + heading */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ff2d55]/30 bg-[#ff2d55]/10 px-3 py-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ff2d55]">
                Introducing RedBridge 2.0
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              The Cultural Translation Gap
            </h2>
            <p className="mx-auto max-w-xl text-sm text-[#6b7280] sm:text-base leading-relaxed">
              Most Australian brands on XHS fail silently — not because the product is wrong, but because the
              message doesn&apos;t translate. RedBridge 2.0 identifies your exact gaps and tells you how to close them.
            </p>
          </div>

          {/* Sample Gap Table */}
          <div className="overflow-hidden rounded-2xl border border-[#1a1a1a]">
            {/* Table header */}
            <div className="grid grid-cols-3 border-b border-[#1a1a1a] bg-[#111]">
              {["Australian Brand Says", "Chinese Consumer Reads", "Our Recommendation"].map((h) => (
                <div key={h} className="px-3 py-3 sm:px-5">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#4a4a4a]">{h}</p>
                </div>
              ))}
            </div>

            {GAP_EXAMPLES.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 divide-x divide-[#1a1a1a] border-b border-[#1a1a1a] last:border-b-0 ${
                  i % 2 === 0 ? "bg-[#0a0a0a]" : "bg-[#0d0d0d]"
                }`}
              >
                <div className="p-3 sm:p-5 space-y-1">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#ff2d55]">{row.aspect}</p>
                  <p className="text-xs text-[#6b7280] leading-snug sm:text-sm">{row.au}</p>
                </div>
                <div className="p-3 sm:p-5">
                  <p className="text-xs text-[#6b7280] leading-snug sm:text-sm italic">{row.cn}</p>
                </div>
                <div className="p-3 sm:p-5 bg-[#ff2d55]/5 border-l-2 border-[#ff2d55]">
                  <p className="text-xs text-white leading-snug sm:text-sm font-medium">{row.fix}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Example caption */}
          <p className="text-center font-mono text-xs text-[#3a3a3a]">
            Example: Bondi Glow Skincare — Intelligence Report by RedBridge 2.0
          </p>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#ff2d55] px-8 text-sm font-medium text-white transition-colors hover:bg-[#e0274d]"
            >
              Get Your Intelligence Report →
            </Link>
            <p className="mt-3 text-xs text-[#4a4a4a]">Free during beta — no card required</p>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────── */}
      <div className="px-4 py-16 flex justify-center">
        <div className="w-full max-w-2xl">
          <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.3em] text-[#4a4a4a]">
            Content Tools
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
            {[
              { label: "Post Ideas", value: "30", unit: "per run" },
              { label: "Keywords", value: "16", unit: "with heat scores" },
              { label: "Captions", value: "5", unit: "EN + ZH side-by-side" },
            ].map(({ label, value, unit }) => (
              <div
                key={label}
                className="rounded-xl border border-[#1a1a1a] bg-[#111] p-3 sm:p-4 col-span-1 last:col-span-2 last:sm:col-span-1"
              >
                <p className="text-xl font-bold text-white sm:text-2xl">{value}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">{label}</p>
                <p className="mt-0.5 text-xs text-[#4a4a4a]">{unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
