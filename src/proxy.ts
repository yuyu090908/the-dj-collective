import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LOCALES = ["ja", "th"]; // "en" is the unprefixed default
const PROTECTED = /^\/(app|instructor|admin)(\/|$)/;

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // /en/... -> canonical unprefixed URL
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const m = pathname.match(/^\/(ja|th)(?=\/|$)/);
  const locale = m ? m[1] : "en";
  const rest = m ? pathname.slice(m[0].length) || "/" : pathname;

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-pathname", rest);
  reqHeaders.set("x-search", search);
  reqHeaders.set("x-locale", locale);

  const res = m
    ? NextResponse.next({ request: { headers: reqHeaders } })
    : NextResponse.rewrite(new URL(`/en${pathname === "/" ? "" : pathname}${search}`, req.url), {
        request: { headers: reqHeaders },
      });

  // Supabase: refresh the auth session cookie on every request
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let signedIn = Boolean(req.cookies.get("djc_session"));
  if (sbUrl && sbKey) {
    const sb = createServerClient(sbUrl, sbKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    });
    const { data } = await sb.auth.getUser();
    signedIn = Boolean(data.user);
  }

  // Fast path only — real authorization happens server-side in each layout/action.
  if (PROTECTED.test(rest) && !signedIn) {
    const url = req.nextUrl.clone();
    url.pathname = `${locale === "en" ? "" : `/${locale}`}/login`;
    url.search = `?next=${encodeURIComponent(rest + search)}`;
    return NextResponse.redirect(url);
  }

  void LOCALES;
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*|sitemap.xml|robots.txt|manifest.webmanifest).*)"],
};
