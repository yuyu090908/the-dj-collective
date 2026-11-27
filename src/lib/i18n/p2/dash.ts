import { dict } from ".";

const en = {
  progressOf: "{p}% · {a} of {b} modules",
  nextModule: "Next module",
  allDone: "All published modules completed.",
  coachUsage: "{n} of {m} messages this month",
  latestMix: "Latest analysis",
  noMix: "No analysis yet. Analyse a recorded mix to see loudness, clipping, tempo and key.",
  mixLeft: "{n} analyses left this month",
  score: "Score",
  skills: { gain_staging: "Gain staging", loudness: "Loudness consistency", beatmatching: "Tempo stability", harmonic_mixing: "Harmonic flow", flow: "Continuity" } as Record<string, string>,
  source: { analysis: "Mix Lab (rule-based)", instructor: "Instructor", self: "Self", ai: "AI" } as Record<string, string>,
};
type T = typeof en;
export const dashT = dict(en, {
  progressOf: "{p}% ・ {b}モジュール中 {a} 完了",
  nextModule: "次のモジュール",
  allDone: "公開中のモジュールをすべて完了しました。",
  coachUsage: "今月 {n} / {m} メッセージ",
  latestMix: "最新の分析",
  noMix: "まだ分析はありません。録音したMIXを分析すると、ラウドネス・クリップ・テンポ・キーが分かります。",
  mixLeft: "今月の残り分析 {n}回",
  score: "スコア",
  skills: { gain_staging: "ゲイン調整", loudness: "音量の安定", beatmatching: "テンポの安定", harmonic_mixing: "ハーモニックの流れ", flow: "途切れのなさ" },
  source: { analysis: "Mix Lab（ルールベース）", instructor: "講師", self: "自己評価", ai: "AI" },
} as T, {
  progressOf: "{p}% · เรียนจบ {a} จาก {b} โมดูล",
  nextModule: "โมดูลถัดไป",
  allDone: "เรียนจบทุกโมดูลที่เผยแพร่แล้ว",
  coachUsage: "ใช้ไป {n} จาก {m} ข้อความในเดือนนี้",
  latestMix: "การวิเคราะห์ล่าสุด",
  noMix: "ยังไม่มีการวิเคราะห์ วิเคราะห์มิกซ์ที่บันทึกไว้เพื่อดูความดัง การคลิป เทมโป และคีย์",
  mixLeft: "เหลือสิทธิ์วิเคราะห์ {n} ครั้งในเดือนนี้",
  score: "คะแนน",
  skills: { gain_staging: "การตั้งเกน", loudness: "ความสม่ำเสมอของความดัง", beatmatching: "ความนิ่งของเทมโป", harmonic_mixing: "ความต่อเนื่องของคีย์", flow: "ความต่อเนื่อง" },
  source: { analysis: "Mix Lab (ตามกฎ)", instructor: "ผู้สอน", self: "ประเมินตนเอง", ai: "AI" },
} as T);
