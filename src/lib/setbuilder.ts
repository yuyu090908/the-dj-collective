import "server-only";
import { q, q1 } from "./db";
import { atLeast, getUserPlan } from "./plan";
import type { LibTrack, SetContext, SetTrack } from "./sets/logic";

export const SET_MIN_PLAN = "artist_pro";
export const LIBRARY_MAX = 10000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function canUseSetBuilder(userId: string) {
  return atLeast((await getUserPlan(userId)).code, SET_MIN_PLAN);
}

export async function listSets(userId: string) {
  return q<{ id: string; title: string; updated_at: string; context: SetContext; n: number }>(
    `select id, title, updated_at, context, jsonb_array_length(tracks) n from dj_sets where user_id=$1 order by updated_at desc limit 100`, [userId]);
}

export async function getSet(userId: string, id: string) {
  if (!UUID.test(id)) return null;
  return q1<{ id: string; title: string; context: SetContext; tracks: SetTrack[]; updated_at: string }>(
    `select id, title, context, tracks, updated_at from dj_sets where id=$1 and user_id=$2`, [id, userId]);
}

export async function listLibrary(userId: string) {
  const rows = await q<LibTrack & { bpm: string | null }>(
    `select id, title, artist, bpm, camelot, duration_sec, genre, energy, source from library_tracks where user_id=$1 order by artist, title limit $2`,
    [userId, LIBRARY_MAX]);
  return rows.map((r) => ({ ...r, bpm: r.bpm == null ? null : Number(r.bpm) })) as LibTrack[];
}
