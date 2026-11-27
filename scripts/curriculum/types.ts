export type L = { en: string; ja: string; th: string };
export type LL = { en: string[]; ja: string[]; th: string[] };
export type Quiz = { q: L; o: LL; a: number };
/** Text lesson content stored in course_modules.content. Draft teaching material — the school can edit it. */
export type ModuleContent = { minutes: number; body: L; points: LL; practice: L; quiz: Quiz[] };
