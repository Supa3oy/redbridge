"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "@/lib/date";

export function TimeAgo({ dateStr, className }: { dateStr: string; className?: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(formatDistanceToNow(dateStr));
  }, [dateStr]);

  return (
    <span className={className} suppressHydrationWarning>
      {label}
    </span>
  );
}
