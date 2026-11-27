import "server-only";
import { q } from "./db";
import { clientIp } from "./guards";

export async function audit(actorId: string | null, action: string, targetType?: string, targetId?: string, diff?: unknown) {
  await q(`insert into audit_logs (actor_id, action, target_type, target_id, diff, ip) values ($1,$2,$3,$4,$5,$6)`, [
    actorId,
    action,
    targetType ?? null,
    targetId ?? null,
    diff === undefined ? null : JSON.stringify(diff),
    await clientIp().catch(() => null),
  ]);
}
