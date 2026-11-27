import { execFileSync } from "node:child_process";
import { Client } from "pg";
import { ADMIN, INSTRUCTOR } from "./helpers";

/** Prepare known accounts on the LOCAL test database. Never point this at production. */
export default async function globalSetup() {
  const url = process.env.DATABASE_URL ?? "postgres://postgres@localhost:5432/djc";
  if (!/localhost|127\.0\.0\.1/.test(url)) throw new Error("E2E setup only runs against a local database");
  const run = (...a: string[]) => execFileSync("npx", ["tsx", "--conditions=react-server", "scripts/db.ts", ...a], { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
  run("create-user", ADMIN.email, ADMIN.password, "admin");
  run("create-user", INSTRUCTOR.email, INSTRUCTOR.password, "instructor");
  const c = new Client({ connectionString: url });
  await c.connect();
  // fresh MFA enrolment for the admin flow; clear bookings left by earlier runs
  await c.query(`update public.users set totp_enabled=false, totp_secret=null where email=$1`, [ADMIN.email]);
  await c.query(`delete from public.bookings where user_id in (select id from public.users where email like 'e2e-%@local.test')`);
  await c.end();
}
