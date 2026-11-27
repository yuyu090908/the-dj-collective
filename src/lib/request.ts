import "server-only";
import { headers } from "next/headers";

/** Client IP from proxy headers. Kept free of next/navigation so webhook code can import it. */
export async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  } catch {
    return "unknown"; // outside a request scope (scripts, tests)
  }
}
