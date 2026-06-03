import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUsage } from "@/lib/usage";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const usage = await getUsage(userId);
    return NextResponse.json(usage);
  } catch {
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
