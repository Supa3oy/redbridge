import { supabaseAdmin } from "./supabase";
import crypto from "crypto";

export function buildCacheKey(industry: string, productType: string): string {
  return crypto
    .createHash("sha256")
    .update(`${industry.toLowerCase().trim()}:${productType.toLowerCase().trim()}`)
    .digest("hex");
}

export async function getCachedResult(cacheKey: string): Promise<unknown | null> {
  const { data } = await supabaseAdmin
    .from("toolkit_cache")
    .select("result, created_at")
    .eq("cache_key", cacheKey)
    .single();

  if (!data) return null;

  // Expire cache after 7 days
  const age = Date.now() - new Date(data.created_at).getTime();
  if (age > 7 * 24 * 60 * 60 * 1000) return null;

  return data.result;
}

export async function setCachedResult(
  cacheKey: string,
  result: unknown
): Promise<void> {
  await supabaseAdmin.from("toolkit_cache").upsert({
    cache_key: cacheKey,
    result: result as import("@/types/database").Json,
    created_at: new Date().toISOString(),
  });
}
