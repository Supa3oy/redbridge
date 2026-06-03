import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 py-12">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#ff2d55]">
            RedBridge
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Xiaohongshu toolkit for{" "}
            <span className="text-[#ff2d55]">Australian brands</span>
          </h1>
          <p className="mx-auto max-w-md text-sm text-[#6b7280] sm:text-base">
            AI-powered post ideas, keyword research, and localized captions for
            the Chinese social market. Go from brief to ready-to-post in seconds.
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

        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3 sm:gap-6">
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
  );
}
