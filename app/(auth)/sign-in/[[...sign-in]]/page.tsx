import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[#ff2d55]">
            RedBridge
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Welcome back</h1>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
