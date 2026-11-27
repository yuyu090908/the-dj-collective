import "server-only";
import { q, q1 } from "./db";
import type { Analysis } from "./audio/analyze";
import type { Advice, Scores } from "./audio/scores";

/** Browser analysis can hold about this much audio in memory; longer files need the (not yet connected) server worker. */
export const BROWSER_MAX_MINUTES = 120;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type MixRow = {
  id: string; title: string; created_at: string; filename: string; duration_sec: number; size_bytes: number; sha256: string;
  analyzer: string; shared_with_instructor: boolean; user_id: string;
  measured: Analysis["measured"] & { sampleRate: number; channels: number };
  estimated: Analysis["estimated"];
  scores: Scores; advice: Advice[];
};

export async function listMixes(userId: string, limit = 50) {
  return q<{ id: string; title: string; created_at: string; duration_sec: number; overall: number | null; bpm: number | null; camelot: string | null; lufs: number | null }>(
    `select r.id, r.title, r.created_at, u.duration_sec, (r.scores->>'overall')::int overall,
            (r.estimated->'bpm'->>'value')::numeric bpm, r.estimated->'key'->>'camelot' camelot, (r.measured->>'integratedLufs')::numeric lufs
       from mix_analysis_results r join mix_analysis_jobs j on j.id=r.job_id join audio_uploads u on u.id=j.upload_id
      where r.user_id=$1 order by r.created_at desc limit $2`,
    [userId, limit],
  );
}

/** Owner, or an instructor the owner shared it with (any instructor who has taught the student). */
export async function getMix(id: string, viewer: { id: string; role: string }) {
  if (!UUID.test(id)) return null;
  const row = await q1<MixRow>(
    `select r.id, r.title, r.created_at, r.measured, r.estimated, r.scores, r.advice, r.analyzer, r.shared_with_instructor, r.user_id,
            u.filename, u.duration_sec, u.size_bytes, u.sha256
       from mix_analysis_results r join mix_analysis_jobs j on j.id=r.job_id join audio_uploads u on u.id=j.upload_id where r.id=$1`,
    [id],
  );
  if (!row) return null;
  if (row.user_id === viewer.id || viewer.role === "admin") return row;
  if (viewer.role === "instructor" && row.shared_with_instructor && (await canReview(viewer.id, row.user_id))) return row;
  return null;
}

/** An instructor may review a student's shared analysis if they have a booking together. */
export async function canReview(instructorUserId: string, studentId: string) {
  const r = await q1(
    `select 1 from bookings b join instructors i on i.id=b.instructor_id
      where i.user_id=$1 and b.user_id=$2 and b.status in ('confirmed','completed') limit 1`,
    [instructorUserId, studentId],
  );
  return !!r;
}

export async function reviewsFor(resultId: string) {
  return q<{ id: string; comment: string; created_at: string; name: string }>(
    `select a.id, a.comment, a.created_at, i.dj_name name
       from analysis_reviews a join instructors i on i.id=a.instructor_id where a.result_id=$1 order by a.created_at`,
    [resultId],
  );
}

/** Shared analyses of this instructor's students, newest first. */
export async function sharedWithInstructor(instructorUserId: string) {
  return q<{ id: string; title: string; created_at: string; student: string; overall: number | null; reviewed: boolean }>(
    `select r.id, r.title, r.created_at, coalesce(nullif(sp.display_name,''), split_part(su.email,'@',1)) student, (r.scores->>'overall')::int overall,
            exists(select 1 from analysis_reviews a join instructors i on i.id=a.instructor_id where a.result_id=r.id and i.user_id=$1) reviewed
       from mix_analysis_results r join users su on su.id=r.user_id left join profiles sp on sp.user_id=r.user_id
      where r.shared_with_instructor and exists (
        select 1 from bookings b join instructors i on i.id=b.instructor_id
         where i.user_id=$1 and b.user_id=r.user_id and b.status in ('confirmed','completed'))
      order by r.created_at desc limit 50`,
    [instructorUserId],
  );
}

/** Published curriculum modules keyed by "level.order", for advice links. */
export async function moduleRefs() {
  const rows = await q<{ id: string; level: number; sort_order: number; title: Record<string, string> }>(
    `select m.id, c.level, m.sort_order, m.title from course_modules m join courses c on c.id=m.course_id where m.is_published`,
  );
  return new Map(rows.map((r) => [`${r.level}.${r.sort_order}`, r]));
}
