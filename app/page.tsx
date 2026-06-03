import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#ff2d55]">
            RedBridge
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Xiaohongshu toolkit for{" "}
            <span className="text-[#ff2d55]">Australian brands</span>
          </h1>
          <p className="mx-auto max-w-md text-base text-[#6b7280]">
            AI-powered post ideas, keyword research, and localized captions for
            the Chinese social market. Go from brief to ready-to-post in seconds.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#ff2d55] px-6 text-sm font-medium text-white transition-colors hover:bg-[#e0274d]"
          >
            Get started free
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center justify-center rounded-md border border-[#2a2a2a] bg-transparent px-6 text-sm font-medium text-white transition-colors hover:bg-[#1a1a1a]"
          >
            Sign in
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-4">
          {[
            { label: "Post Ideas", value: "30", unit: "per run" },
            { label: "Keywords", value: "16", unit: "with heat scores" },
            { label: "Captions", value: "5", unit: "EN + ZH side-by-side" },
          ].map(({ label, value, unit }) => (
            <div key={label} className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">{label}</p>
              <p className="mt-0.5 text-xs text-[#4a4a4a]">{unit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
