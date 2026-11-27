import { Suspense } from "react";
import {
  LayoutDashboard, CalendarCheck, GraduationCap, Dumbbell, Bot, AudioWaveform, ListMusic, Users, Swords, Trophy,
  CalendarDays, Palette, Megaphone, UserRound, MessageSquare, Settings, CreditCard, LogOut, Clock, NotebookPen,
  ClipboardList, Star, Wallet, ShieldCheck, Presentation, Receipt, Flag, Cpu, FileImage, BookOpen,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n";
import type { SessionUser } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { L, Tag } from "../ui";
import { Logo } from "../visuals";
import { LangSwitch } from "../site/client";
import { BottomNav, MobileDrawer, Sidebar, type NavGroup, type NavItem } from "./shell-client";

export type Area = "member" | "instructor" | "admin";

export function memberNav(t: Dict): NavGroup[] {
  const i = t.app.items;
  const g = t.app.groups;
  return [
    { label: g.learn, items: [
      { href: "/app/dashboard", label: i.dashboard, icon: <LayoutDashboard /> },
      { href: "/app/my-lessons", label: i.myLessons, icon: <CalendarCheck /> },
      { href: "/app/learning", label: i.learning, icon: <GraduationCap /> },
      { href: "/app/practice", label: i.practice, icon: <Dumbbell />, phase: 4 },
    ] },
    { label: g.ai, items: [
      { href: "/app/ai-coach", label: i.aiCoach, icon: <Bot /> },
      { href: "/app/mix-lab", label: i.mixLab, icon: <AudioWaveform /> },
      { href: "/app/set-builder", label: i.setBuilder, icon: <ListMusic /> },
    ] },
    { label: g.connect, items: [
      { href: "/app/community", label: i.community, icon: <Users />, phase: 3 },
      { href: "/app/battles", label: i.battles, icon: <Swords />, phase: 3 },
      { href: "/app/ranking", label: i.ranking, icon: <Trophy />, phase: 3 },
      { href: "/events", label: i.events, icon: <CalendarDays /> },
    ] },
    { label: g.artist, items: [
      { href: "/app/artist-studio", label: i.artistStudio, icon: <Palette />, phase: 4 },
      { href: "/app/gigs", label: i.gigs, icon: <Megaphone />, phase: 4 },
      { href: "/app/profile", label: i.profile, icon: <UserRound /> },
    ] },
    { label: g.account, items: [
      { href: "/app/messages", label: i.messages, icon: <MessageSquare />, phase: 3 },
      { href: "/app/subscription", label: i.subscription, icon: <CreditCard /> },
      { href: "/app/settings", label: i.settings, icon: <Settings /> },
    ] },
  ];
}

export function memberBottom(t: Dict): NavItem[] {
  const b = t.app.bottom;
  return [
    { href: "/app/dashboard", label: b.home, icon: <LayoutDashboard /> },
    { href: "/app/my-lessons", label: b.learn, icon: <GraduationCap /> },
    { href: "/app/ai-coach", label: b.ai, icon: <Bot /> },
    { href: "/app/community", label: b.community, icon: <Users /> },
    { href: "/app/profile", label: b.profile, icon: <UserRound /> },
  ];
}

export function instructorNav(t: Dict): NavGroup[] {
  const n = t.instructor.nav;
  return [{ label: "INSTRUCTOR", items: [
    { href: "/instructor/dashboard", label: n.dashboard, icon: <LayoutDashboard /> },
    { href: "/instructor/calendar", label: n.calendar, icon: <Clock /> },
    { href: "/instructor/students", label: n.students, icon: <Users /> },
    { href: "/instructor/lessons", label: n.lessons, icon: <NotebookPen /> },
    { href: "/instructor/assignments", label: n.assignments, icon: <ClipboardList />, phase: 2 },
    { href: "/instructor/reviews", label: n.reviews, icon: <Star /> },
    { href: "/instructor/earnings", label: n.earnings, icon: <Wallet /> },
  ] }];
}

export function adminNav(t: Dict): NavGroup[] {
  const n = t.admin.nav;
  return [
    { label: "OPERATIONS", items: [
      { href: "/admin/dashboard", label: n.dashboard, icon: <LayoutDashboard /> },
      { href: "/admin/bookings", label: n.bookings, icon: <CalendarCheck /> },
      { href: "/admin/payments", label: n.payments, icon: <Receipt /> },
      { href: "/admin/users", label: n.users, icon: <Users /> },
      { href: "/admin/instructors", label: n.instructors, icon: <Presentation /> },
    ] },
    { label: "CONTENT", items: [
      { href: "/admin/courses", label: n.courses, icon: <BookOpen /> },
      { href: "/admin/content", label: n.content, icon: <FileImage /> },
      { href: "/admin/events", label: n.events, icon: <CalendarDays />, phase: 4 },
      { href: "/admin/community", label: n.community, icon: <Flag />, phase: 3 },
      { href: "/admin/battles", label: n.battles, icon: <Swords />, phase: 3 },
    ] },
    { label: "SYSTEM", items: [
      { href: "/admin/ai-usage", label: n.aiUsage, icon: <Cpu /> },
      { href: "/admin/settings", label: n.settings, icon: <ShieldCheck /> },
    ] },
  ];
}

export function AppShell({
  area, locale, t, user, children,
}: { area: Area; locale: Locale; t: Dict; user: SessionUser; children: React.ReactNode }) {
  const groups = area === "member" ? memberNav(t) : area === "instructor" ? instructorNav(t) : adminNav(t);
  const lpfx = locale === "en" ? "" : `/${locale}`;
  const areaTag = area === "admin" ? "ADMIN" : area === "instructor" ? "INSTRUCTOR" : null;
  const switcher = (
    <div className="flex flex-wrap gap-1.5 px-1 pb-2">
      {user.role !== "member" && area !== "member" && <L locale={locale} href="/app/dashboard" className="rounded-[4px] border border-line px-2 py-1 text-xs text-stone hover:text-ivory">Member</L>}
      {(user.role === "instructor" || user.role === "admin") && area !== "instructor" && <L locale={locale} href="/instructor/dashboard" className="rounded-[4px] border border-line px-2 py-1 text-xs text-stone hover:text-ivory">Instructor</L>}
      {user.role === "admin" && area !== "admin" && <L locale={locale} href="/admin/dashboard" className="rounded-[4px] border border-line px-2 py-1 text-xs text-stone hover:text-ivory">Admin</L>}
    </div>
  );
  const logout = (
    <form action={logoutAction}>
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className="flex min-h-10 w-full items-center gap-2 rounded-[6px] px-2.5 text-sm text-stone hover:text-ivory">
        <LogOut size={16} aria-hidden="true" /> {t.nav.logout}
      </button>
    </form>
  );
  return (
    <div className="flex min-h-dvh">
      <Sidebar groups={groups} localePrefix={lpfx} labels={{ collapse: t.app.collapse, expand: t.app.expand }} footer={<>{switcher}{logout}</>} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-ink/92 px-4 backdrop-blur md:px-8" style={{ paddingTop: "var(--safe-t)" }}>
          <L locale={locale} href="/" aria-label="Home" className="shrink-0"><Logo compact /></L>
          {areaTag && <Tag kind="lime">{areaTag}</Tag>}
          <div className="ml-auto flex items-center gap-2">
            <Suspense><LangSwitch locale={locale} label={t.nav.language} className="hidden sm:flex" /></Suspense>
            <span className="hidden max-w-40 truncate text-sm text-stone md:block">{user.displayName}</span>
            <MobileDrawer groups={groups} localePrefix={lpfx} title={t.nav.menu} footer={<div className="space-y-2 border-t border-line pt-3">{switcher}<Suspense><LangSwitch locale={locale} label={t.nav.language} /></Suspense>{logout}</div>} />
          </div>
        </header>
        <main id="main" className={`flex-1 px-4 py-6 md:px-8 md:py-8 ${area === "member" ? "pb-28 lg:pb-10" : "pb-16"}`}>
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
      {area === "member" && <BottomNav items={memberBottom(t)} localePrefix={lpfx} />}
    </div>
  );
}

export function PageTitle({ title, kicker, action, children }: { title: string; kicker?: string; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        {kicker && <p className="kicker mb-2">{kicker}</p>}
        <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold uppercase leading-none tracking-[-0.03em]">{title}</h1>
        {children}
      </div>
      {action}
    </div>
  );
}
