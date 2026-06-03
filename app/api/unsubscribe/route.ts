import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return new Response("Missing user ID", { status: 400 });
  }

  await supabaseAdmin.from("users").update({ email_subscribed: false }).eq("id", uid);

  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title>
    <style>body{background:#0a0a0a;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .card{text-align:center;padding:40px;max-width:400px}
    h1{color:#ff2d55;font-size:1.5rem;margin-bottom:12px}
    p{color:#6b7280;font-size:0.875rem;line-height:1.6}
    a{color:#ff2d55;text-decoration:none}</style></head>
    <body><div class="card">
    <h1>Unsubscribed ✓</h1>
    <p>You've been removed from RedBridge weekly emails.<br>
    You can re-enable them anytime in <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Settings</a>.</p>
    </div></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
