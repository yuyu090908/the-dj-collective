/** Set Builder logic shared by client and server. Pure functions, no DOM except parseRekordbox (browser). */
import { camelotCompatible } from "../audio/analyze";

export type Track = { title: string; artist: string; bpm: number | null; camelot: string | null; duration_sec: number | null; genre: string; energy: number | null };
export type LibTrack = Track & { id: string; source: string };
export type SetTrack = Track & { libId?: string };
export type Slot = "opening" | "warmup" | "peak" | "closing";
export type SetContext = { minutes: number; slot: Slot; genre: string };

const MAJ = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const MAJ_CAM = [8, 3, 10, 5, 12, 7, 2, 9, 4, 11, 6, 1];
const ENH: Record<string, string> = { "C#": "Db", "D#": "Eb", Gb: "F#", "G#": "Ab", "A#": "Bb", Cb: "B", "E#": "F", Fb: "E", "B#": "C" };

/** Accepts Camelot ("8A"), Open Key ("1m"/"1d") or musical keys ("Am", "F#m", "Dbmaj", "C major", "A minor"). */
export function toCamelot(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim();
  let m = s.match(/^(1[0-2]|0?[1-9])\s*([ABab])$/);
  if (m) return `${Number(m[1])}${m[2].toUpperCase()}`;
  m = s.match(/^(1[0-2]|0?[1-9])\s*([mdMD])$/); // Open Key: 1d = C = 8B, 1m = Am = 8A
  if (m) return `${((Number(m[1]) + 6) % 12) + 1}${m[2].toLowerCase() === "m" ? "A" : "B"}`;
  m = s.match(/^([A-Ga-g])\s*([#♯b♭]?)\s*(m|min|minor|maj|major|M)?$/);
  if (!m) return null;
  let root = m[1].toUpperCase() + (m[2] === "♯" ? "#" : m[2] === "♭" ? "b" : m[2]);
  root = ENH[root] ?? root;
  const minor = m[3] ? /^m(in(or)?)?$/.test(m[3]) && m[3] !== "M" : false;
  const idx = MAJ.indexOf(root);
  if (idx < 0) return null;
  if (!minor) return `${MAJ_CAM[idx]}B`;
  const rel = (idx + 3) % 12; // relative major of the minor key shares the Camelot number
  return `${MAJ_CAM[rel]}A`;
}

export const relation = (a: string | null, b: string | null) => (a && b ? camelotCompatible(a, b) : null);
export const bpmDelta = (a: number | null, b: number | null) => {
  if (!a || !b) return null;
  // compare with half/double time when closer
  const cands = [b, b * 2, b / 2].map((x) => ((x - a) / a) * 100);
  return Math.round(cands.reduce((p, c) => (Math.abs(c) < Math.abs(p) ? c : p)) * 10) / 10;
};

/** Energy targets (1–10) for start and end of a slot. A guide for planning, not a rule. */
export const SLOT_CURVE: Record<Slot, [number, number, number]> = {
  opening: [3, 4, 5],
  warmup: [4, 5.5, 6.5],
  peak: [7, 8.5, 9],
  closing: [8, 6.5, 5],
};
export function targetEnergy(slot: Slot, i: number, n: number) {
  const [a, b, c] = SLOT_CURVE[slot];
  const x = n <= 1 ? 0 : i / (n - 1);
  return x < 0.5 ? a + (b - a) * (x / 0.5) : b + (c - b) * ((x - 0.5) / 0.5);
}

export function parseDuration(v: string | undefined): number | null {
  if (!v) return null;
  const s = v.trim();
  const p = s.split(":").map(Number);
  if (p.some((x) => !Number.isFinite(x))) return null;
  const sec = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0];
  return sec > 0 && sec < 6 * 3600 ? Math.round(sec) : null;
}

function num(v: string | null | undefined, lo: number, hi: number) {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null;
}

export function cleanTrack(t: Partial<Record<keyof Track, unknown>>): Track | null {
  const title = String(t.title ?? "").trim().slice(0, 200);
  if (!title) return null;
  const bpm = num(t.bpm as string, 40, 250);
  const energy = num(t.energy as string, 1, 10);
  return {
    title,
    artist: String(t.artist ?? "").trim().slice(0, 200),
    bpm: bpm == null ? null : Math.round(bpm * 100) / 100,
    camelot: toCamelot(t.camelot as string),
    duration_sec: typeof t.duration_sec === "number" ? (t.duration_sec > 0 && t.duration_sec < 21600 ? Math.round(t.duration_sec) : null) : parseDuration(t.duration_sec as string),
    genre: String(t.genre ?? "").trim().slice(0, 60),
    energy: energy == null ? null : Math.round(energy),
  };
}

/** RFC-4180-ish CSV with a header row. Recognised columns: title/name/track, artist, bpm/tempo, key/camelot, duration/time/length, genre, energy. */
export function parseCsv(text: string): Track[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  const src = text.replace(/^﻿/, "");
  const delim = (src.split("\n")[0].match(/;/g)?.length ?? 0) > (src.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : src.split("\n")[0].includes("\t") ? "\t" : ",";
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (q) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  if (rows.length < 2) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (...names: string[]) => head.findIndex((h) => names.includes(h));
  const c = { title: col("title", "name", "track", "track title"), artist: col("artist", "artists"), bpm: col("bpm", "tempo"), key: col("key", "camelot", "tonality", "musical key"),
    dur: col("duration", "time", "length"), genre: col("genre"), energy: col("energy") };
  if (c.title < 0) return [];
  return rows.slice(1).map((r) => cleanTrack({
    title: r[c.title], artist: c.artist >= 0 ? r[c.artist] : "", bpm: c.bpm >= 0 ? r[c.bpm] : null, camelot: c.key >= 0 ? r[c.key] : null,
    duration_sec: c.dur >= 0 ? r[c.dur] : undefined, genre: c.genre >= 0 ? r[c.genre] : "", energy: c.energy >= 0 ? r[c.energy] : null,
  })).filter((t): t is Track => t !== null);
}

/** rekordbox "Export Collection in xml format". Browser only (DOMParser). */
export function parseRekordbox(xml: string): Track[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) return [];
  return [...doc.querySelectorAll("COLLECTION > TRACK")].map((el) => cleanTrack({
    title: el.getAttribute("Name"), artist: el.getAttribute("Artist"), bpm: el.getAttribute("AverageBpm"), camelot: el.getAttribute("Tonality"),
    duration_sec: Number(el.getAttribute("TotalTime")) || undefined, genre: el.getAttribute("Genre") ?? "",
  })).filter((t): t is Track => t !== null);
}

export function setStats(tracks: SetTrack[]) {
  const total = tracks.reduce((s, t) => s + (t.duration_sec ?? 0), 0);
  const missing = tracks.filter((t) => !t.duration_sec).length;
  let clashes = 0, bigJumps = 0;
  for (let i = 1; i < tracks.length; i++) {
    if (relation(tracks[i - 1].camelot, tracks[i].camelot) === "clash") clashes++;
    const d = bpmDelta(tracks[i - 1].bpm, tracks[i].bpm);
    if (d != null && Math.abs(d) > 6) bigJumps++;
  }
  return { total, missing, clashes, bigJumps };
}
