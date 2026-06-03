"use client";

export function Greeting({ name }: { name: string }) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <span suppressHydrationWarning>
      {part}, {name}
    </span>
  );
}
