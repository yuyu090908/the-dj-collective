import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { env } from "../env";

function secret(): string {
  if (env.authSecret.length >= 32) return env.authSecret;
  if (env.isProd) throw new Error("AUTH_SECRET (>= 32 chars) is required in production");
  return "dev-only-insecure-secret-change-me-0000000000";
}

const b64u = (b: Buffer) => b.toString("base64url");

export function sign(payload: object): string {
  const body = b64u(Buffer.from(JSON.stringify(payload)));
  const mac = b64u(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${mac}`;
}

export function verify<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret()).update(body).digest();
  const given = Buffer.from(mac, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as T & { exp?: number };
    if (data.exp && data.exp < Date.now() / 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64);
  return ["scrypt", salt.toString("base64"), hash.toString("base64")].join("$");
}

export function verifyPassword(pw: string, stored: string | null | undefined): boolean {
  if (!stored?.startsWith("scrypt$")) return false;
  const [, s, h] = stored.split("$");
  const expected = Buffer.from(h, "base64");
  const actual = scryptSync(pw, Buffer.from(s, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}
