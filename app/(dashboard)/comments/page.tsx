export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CommentsClient } from "@/components/comments/CommentsClient";

export default async function CommentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <CommentsClient />;
}
