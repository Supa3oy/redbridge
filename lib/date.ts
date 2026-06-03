// Supabase returns timestamptz without a timezone suffix (e.g. "2026-06-03T10:00:00").
// JavaScript treats bare ISO datetimes as *local* time, not UTC, which produces an
// offset equal to the user's UTC offset (e.g. 10 h wrong in AEST).
// Appending "Z" forces UTC parsing and gives the correct elapsed time.
function parseUtc(dateStr: string): number {
  if (
    dateStr.includes("T") &&
    !dateStr.endsWith("Z") &&
    !/[+-]\d{2}:\d{2}$/.test(dateStr)
  ) {
    return new Date(dateStr + "Z").getTime();
  }
  return new Date(dateStr).getTime();
}

export function formatDistanceToNow(dateStr: string): string {
  const secs = Math.floor((Date.now() - parseUtc(dateStr)) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs === 1) return "1 hour ago";
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
