import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface ClerkUserEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    primary_email_address_id: string;
    deleted?: boolean;
  };
}

function getPrimaryEmail(data: ClerkUserEvent["data"]): string {
  const primary = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  );
  return primary?.email_address ?? data.email_addresses[0]?.email_address ?? "";
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();

  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let event: ClerkUserEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created") {
    const email = getPrimaryEmail(data);
    await supabaseAdmin.from("users").insert({
      id: data.id,
      email,
      plan: "free",
      usage_count: 0,
    });
  }

  if (type === "user.updated") {
    const email = getPrimaryEmail(data);
    await supabaseAdmin
      .from("users")
      .update({ email })
      .eq("id", data.id);
  }

  if (type === "user.deleted") {
    await supabaseAdmin.from("users").delete().eq("id", data.id);
  }

  return NextResponse.json({ received: true });
}
