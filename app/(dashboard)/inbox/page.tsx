export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InboxClient } from "@/components/inbox/InboxClient";

export default async function InboxPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <InboxClient />;
}
