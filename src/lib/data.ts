import "server-only";
import { cache } from "react";
import { q, q1 } from "./db";
import { env } from "./env";
import type { Localized } from "./i18n/config";

export type Instructor = {
  id: string; user_id: string | null; slug: string; dj_name: string; photo_url: string | null; base_city: string | null;
  bio: Localized; genres: string[]; languages: string[]; achievements: { title: string; venue?: string; year?: string; verified?: boolean }[];
  equipment: string[]; mix_urls: string[]; social: Record<string, string>; intro_video_url: string | null; timezone: string;
  is_published: boolean; is_placeholder: boolean; sort_order: number;
};
export type Lesson = {
  id: string; slug: string; mode: "in_person" | "online"; title: Localized; description: Localized; duration_min: number;
  price_satang: number; currency: string; levels: string[]; is_provisional: boolean; is_active: boolean; sort_order: number;
};
export type Plan = {
  code: string; name: string; price_satang: number; currency: string; features: Record<string, string[]>;
  quotas: Record<string, number>; is_active: boolean; sort_order: number;
};
export type Studio = {
  id: string; name: string; address: string | null; city: string; map_query: string | null; access_notes: Localized;
  equipment: string[]; is_placeholder: boolean; is_active: boolean;
};
export type Course = { id: string; level: number; slug: string; title: Localized; description: Localized; min_plan: string; modules: { id: string; title: Localized; kinds: string[]; published: boolean; minutes: number | null }[] };

const dbReady = () => Boolean(env.databaseUrl);

export const getPublishedInstructors = cache(async (): Promise<Instructor[]> => {
  if (!dbReady()) return [];
  return q<Instructor>(`select * from instructors where is_published order by sort_order, created_at`);
});

export const getInstructorBySlug = cache(async (slug: string) =>
  dbReady() ? q1<Instructor>(`select * from instructors where slug=$1 and is_published`, [slug]) : null,
);

export const getLessons = cache(async (mode?: "in_person" | "online"): Promise<Lesson[]> => {
  if (!dbReady()) return [];
  return mode
    ? q<Lesson>(`select * from lessons where is_active and mode=$1 order by sort_order`, [mode])
    : q<Lesson>(`select * from lessons where is_active order by sort_order`);
});

export const getPlans = cache(async (): Promise<Plan[]> =>
  dbReady() ? q<Plan>(`select * from plans where is_active order by sort_order`) : [],
);

export const getStudio = cache(async (): Promise<Studio | null> =>
  dbReady() ? q1<Studio>(`select * from studios where is_active order by created_at limit 1`) : null,
);

export const getCourses = cache(async (): Promise<Course[]> => {
  if (!dbReady()) return [];
  return q<Course>(
    `select c.id, c.level, c.slug, c.title, c.description, c.min_plan,
            coalesce(json_agg(json_build_object('id', m.id, 'title', m.title, 'kinds', m.kinds, 'published', m.is_published, 'minutes', (m.content->>'minutes')::int) order by m.sort_order)
                     filter (where m.id is not null), '[]') modules
       from courses c left join course_modules m on m.course_id=c.id
      where c.is_published group by c.id order by c.level`,
  );
});

export type SiteMedia = {
  heroVideo: string; heroVideoMobile: string; heroPoster: string;
  quick: Record<string, string>;
  social: Record<string, string>;
  contactEmail: string;
};

export const getSiteMedia = cache(async (): Promise<SiteMedia> => {
  const base: SiteMedia = { heroVideo: "", heroVideoMobile: "", heroPoster: "", quick: {}, social: {}, contactEmail: "" };
  if (!dbReady()) return base;
  const rows = await q<{ key: string; value: Record<string, string> }>(`select key, value from site_content where locale='*'`);
  const get = (k: string) => rows.find((r) => r.key === k)?.value ?? {};
  const hero = get("home.hero");
  return {
    heroVideo: hero.video_url ?? "",
    heroVideoMobile: hero.video_mobile_url ?? "",
    heroPoster: hero.poster_url ?? "",
    quick: get("home.quick_images"),
    social: Object.fromEntries(Object.entries(get("site.social")).filter(([, v]) => v)),
    contactEmail: get("site.contact").email ?? "",
  };
});
