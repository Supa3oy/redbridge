import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
            RedBridge
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Get started</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Xiaohongshu content toolkit for Australian brands
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
