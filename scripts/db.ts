/* Database tooling.
 *   npx tsx scripts/db.ts migrate        apply supabase/migrations/*.sql (tracked)
 *   npx tsx scripts/db.ts seed           insert catalogue + clearly-marked placeholders
 *   npx tsx scripts/db.ts create-user <email> <password> <member|instructor|admin>   (local auth only)
 *   npx tsx scripts/db.ts reset          LOCAL ONLY: drop & recreate everything
 * Uses DATABASE_URL. Set LOCAL_AUTH_STUB=1 to install the local auth stub (plain Postgres).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { scryptSync, randomBytes } from "node:crypto";
import pg from "pg";
import { plans, courses, lessons } from "./seed-data";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const client = new pg.Client({ connectionString: url });

async function migrate() {
  if (process.env.LOCAL_AUTH_STUB === "1") {
    await client.query(readFileSync(join("supabase/local/00_auth_stub.sql"), "utf8"));
  }
  await client.query(`create table if not exists public._migrations (name text primary key, applied_at timestamptz default now())`);
  const files = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const { rowCount } = await client.query("select 1 from public._migrations where name=$1", [f]);
    if (rowCount) continue;
    await client.query("begin");
    await client.query(readFileSync(join("supabase/migrations", f), "utf8"));
    await client.query("insert into public._migrations(name) values ($1)", [f]);
    await client.query("commit");
    console.log("applied", f);
  }
  // _migrations is bookkeeping only; keep it away from API roles too
  await client.query("alter table public._migrations enable row level security");
}

async function seed() {
  for (const p of plans) {
    await client.query(
      `insert into plans (code,name,price_satang,features,quotas,sort_order) values ($1,$2,$3,$4,$5,$6)
       on conflict (code) do nothing`,
      [p.code, p.name, p.price, p.features, p.quotas, p.sort],
    );
  }
  for (const c of courses) {
    const { rows } = await client.query(
      `insert into courses (level,slug,title,description,min_plan) values ($1,$2,$3,$4,$5)
       on conflict (level) do update set slug=excluded.slug returning id`,
      [c.level, c.slug, c.title, c.description, c.level <= 1 ? "free" : "member"],
    );
    const courseId = rows[0].id;
    const { rowCount } = await client.query("select 1 from course_modules where course_id=$1", [courseId]);
    if (!rowCount) {
      for (const [i, m] of c.modules.entries()) {
        await client.query(
          `insert into course_modules (course_id, sort_order, title, kinds, is_published) values ($1,$2,$3,$4,true)`,
          [courseId, i, m, ["video", "text", "practice", "quiz", "practical", "instructor_review", "ai_review"]],
        );
      }
    }
  }
  for (const l of lessons) {
    await client.query(
      `insert into lessons (slug,mode,title,description,duration_min,price_satang,sort_order,is_provisional)
       values ($1,$2,$3,$4,$5,$6,$7,true) on conflict (slug) do nothing`,
      [l.slug, l.mode, l.title, l.description, l.duration, l.price, l.sort],
    );
  }
  const studio = await client.query(`select id from studios limit 1`);
  let studioId = studio.rows[0]?.id;
  if (!studioId) {
    const r = await client.query(
      `insert into studios (name, city, equipment, is_placeholder, access_notes)
       values ('Bangkok Studio','Bangkok','{}',true,$1) returning id`,
      [{ en: "Studio address will be published once confirmed.", ja: "スタジオ住所は確定後に掲載します。", th: "จะประกาศที่อยู่สตูดิโอเมื่อยืนยันแล้ว" }],
    );
    studioId = r.rows[0].id;
  }
  const inst = await client.query(`select id from instructors limit 1`);
  if (!inst.rowCount) {
    const r = await client.query(
      `insert into instructors (slug, dj_name, base_city, bio, genres, languages, is_published, is_placeholder)
       values ('lead-instructor','LEAD INSTRUCTOR','Bangkok',$1,$2,'{}',true,true) returning id`,
      [
        {
          en: "Working DJ based in Bangkok. Full verified profile, photos and credits will be added by the school.",
          ja: "バンコクを拠点に活動する現役DJ。確認済みのプロフィール・写真・実績はスクールが登録します。",
          th: "ดีเจมืออาชีพในกรุงเทพฯ โปรไฟล์ รูปภาพ และผลงานที่ยืนยันแล้วจะถูกเพิ่มโดยสคูล",
        },
        ["House", "Tech House", "Techno", "Melodic Techno", "EDM", "Hip Hop", "R&B", "Afro House"],
      ],
    );
    // PROVISIONAL weekly availability (Tue–Sat 13:00–21:00 Bangkok). Edit in /instructor/calendar.
    for (const wd of [2, 3, 4, 5, 6]) {
      await client.query(
        `insert into instructor_availability (instructor_id, weekday, start_time, end_time, mode, studio_id)
         values ($1,$2,'13:00','21:00','both',$3)`,
        [r.rows[0].id, wd, studioId],
      );
    }
  }
  console.log("seeded");
}

function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

async function createUser(email: string, password: string, role: string) {
  const r = await client.query(
    `insert into auth.users (email, encrypted_password, raw_user_meta_data) values ($1,$2,$3)
     on conflict (email) do update set encrypted_password = excluded.encrypted_password returning id`,
    [email.toLowerCase(), hashPassword(password), { locale: "en" }],
  );
  await client.query(`update public.users set role=$2 where id=$1`, [r.rows[0].id, role]);
  if (role === "instructor") {
    // link to the first unlinked instructor record (placeholder) for local testing
    await client.query(
      `update instructors set user_id=$1 where id = (select id from instructors where user_id is null order by sort_order limit 1)`,
      [r.rows[0].id],
    );
  }
  console.log("user", email, role, r.rows[0].id);
}

async function reset() {
  if (!/localhost|127\.0\.0\.1/.test(url!)) throw new Error("reset is only allowed on a local database");
  await client.query("drop schema if exists public cascade; create schema public; drop schema if exists auth cascade;");
  await client.query("grant all on schema public to public");
}

(async () => {
  await client.connect();
  const [cmd, ...args] = process.argv.slice(2);
  try {
    if (cmd === "migrate") await migrate();
    else if (cmd === "seed") await seed();
    else if (cmd === "create-user") await createUser(args[0], args[1], args[2] ?? "member");
    else if (cmd === "reset") await reset();
    else throw new Error("unknown command " + cmd);
  } finally {
    await client.end();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
