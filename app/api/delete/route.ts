import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const TABLE_MAP = {
  toolkit: "toolkits",
  competitor: "saved_competitors",
  trend: "saved_trends",
} as const;

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as keyof typeof TABLE_MAP | null;
  const id = searchParams.get("id");

  if (!type || !id || !(type in TABLE_MAP)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from(TABLE_MAP[type])
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[delete/api] error:", error.code, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
